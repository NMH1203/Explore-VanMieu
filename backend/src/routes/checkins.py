"""Verify visitor check-ins and record successful location unlocks."""

import math
import os
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlmodel import Session, select
from backend.src.config.db import engine
from backend.src.dependencies.auth import get_current_user
from backend.src.models.checkin import (
    CheckinHistoryResponse,
    CheckinVerificationResponse,
)
from backend.src.models.checkin_log import CheckinLog
from backend.src.models.heritage_location import HeritageLocation
from backend.src.models.user import User
from backend.src.models.user_history import UserHistory
from backend.src.services.image_processing import InvalidImageError
from backend.src.services.vision import (
    VisionConfigurationError,
    VisionProviderError,
    recognize_heritage_image,
)

# Router for check-in verification (/api/checkins)
router = APIRouter(prefix="/api/checkins", tags=["checkins"])
MAX_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


@router.get("/history", response_model=list[CheckinHistoryResponse])
def list_checkin_history(
    limit: int = Query(default=50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    with Session(engine) as session:
        rows = session.exec(
            select(CheckinLog, HeritageLocation.name)
            .join(
                HeritageLocation,
                CheckinLog.target_location_id == HeritageLocation.location_id,
            )
            .where(CheckinLog.user_id == current_user.user_id)
            .order_by(CheckinLog.logged_at.desc())
            .limit(limit)
        ).all()

        return [
            CheckinHistoryResponse(
                log_id=log.log_id,
                location_id=log.target_location_id,
                location_name=location_name,
                submitted_lat=log.submitted_lat,
                submitted_lon=log.submitted_lon,
                distance_meters=log.distance_meters,
                detected_label=log.yolo_detected_label,
                confidence=log.yolo_confidence,
                verification_status=log.verification_status,
                logged_at=log.logged_at,
            )
            for log, location_name in rows
        ]
# Calculate distance in meters between two GPS coordinates using the Haversine formula
def calculate_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return the great-circle distance between two latitude/longitude pairs."""
    earth_radius = 6_371_000
    latitude_delta = math.radians(lat2 - lat1)
    longitude_delta = math.radians(lon2 - lon1)
    value = (
        math.sin(latitude_delta / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(longitude_delta / 2) ** 2
    )
    return earth_radius * 2 * math.atan2(math.sqrt(value), math.sqrt(1 - value))


# POST /api/checkins/verify: Validates GPS proximity + image recognition, and updates user progress history
@router.post("/verify", response_model=CheckinVerificationResponse)

async def verify_checkin(
    latitude: float = Form(...),
    longitude: float = Form(...),
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Validate the upload and location, recognize the image, and save its result."""
    if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
        raise HTTPException(status_code=422, detail="Invalid GPS coordinates.")

    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Only JPEG, PNG, or WebP images are accepted.",
        )

    image_bytes = await image.read(MAX_IMAGE_BYTES + 1)
    if not image_bytes:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    if len(image_bytes) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="The image exceeds the 5 MB limit.")

    with Session(engine) as session:
        locations = list(
            session.exec(
                select(HeritageLocation).order_by(HeritageLocation.sequence_order)
            ).all()
        )
        if not locations:
            raise HTTPException(status_code=503, detail="No heritage locations are configured.")

        distances = [
            (
                location,
                calculate_distance_meters(
                    latitude,
                    longitude,
                    location.latitude,
                    location.longitude,
                ),
            )
            for location in locations
        ]
        location, distance = min(distances, key=lambda item: item[1])

        labels = [location.yolo_label for location in locations]
        try:
            result = await recognize_heritage_image(
                image_bytes,
                image.content_type,
                labels,
            )
        except InvalidImageError as error:
            raise HTTPException(status_code=422, detail=str(error)) from error
        except VisionConfigurationError as error:
            raise HTTPException(status_code=503, detail=str(error)) from error
        except VisionProviderError as error:
            raise HTTPException(status_code=502, detail=str(error)) from error

        detected_location = next(
            (
                candidate
                for candidate in locations
                if candidate.yolo_label == result.label
            ),
            None,
        )

        try:
            minimum_confidence = float(os.getenv("YESCALE_MIN_CONFIDENCE", "0.70"))
        except ValueError as error:
            raise HTTPException(
                status_code=503,
                detail="YESCALE_MIN_CONFIDENCE must be a number between 0 and 1.",
            ) from error
        if not math.isfinite(minimum_confidence) or not 0 <= minimum_confidence <= 1:
            raise HTTPException(
                status_code=503,
                detail="YESCALE_MIN_CONFIDENCE must be a number between 0 and 1.",
            )

        label_matches = result.label == location.yolo_label
        image_matches = label_matches and result.confidence >= minimum_confidence
        gps_matches = distance <= location.geofence_radius
        verified = image_matches and gps_matches

        checkin_log = CheckinLog(
            user_id=current_user.user_id,
            target_location_id=location.location_id,
            submitted_lat=latitude,
            submitted_lon=longitude,
            distance_meters=round(distance, 2),
            yolo_detected_label=result.label,
            yolo_confidence=result.confidence,
            verification_status=(
                "verified"
                if verified
                else "rejected_image"
                if not image_matches
                else "rejected_gps"
            ),
        )
        session.add(checkin_log)

        if verified:
            history = session.get(
                UserHistory,
                (current_user.user_id, location.location_id),
            )
            if history is None:
                history = UserHistory(
                    user_id=current_user.user_id,
                    location_id=location.location_id,
                )
            history.status = True
            history.unlocked_at = datetime.now(timezone.utc)
            session.add(history)

        session.commit()
        if verified:
            message = f"{location.name} has been verified and its heritage stamp saved."
        elif not label_matches:
            detected_name = detected_location.name if detected_location else "an unknown site"
            message = (
                f"GPS places you nearest to {location.name}, but the image was recognized as "
                f"{detected_name}. Capture a clear view of the nearest site and try again."
            )
        elif not image_matches:
            message = (
                f"The image may show {location.name}, but the recognition confidence is too low. "
                "Capture a clear, unobstructed view and try again."
            )
        else:
            message = (
                f"{location.name} is the nearest site, but you are {round(distance)} m away from "
                "it, outside the check-in area."
            )
        return CheckinVerificationResponse(
            verified=verified,
            location_id=location.location_id,
            detected_label=result.label,
            confidence=result.confidence,
            distance_meters=round(distance, 2),
            message=message,
        )
