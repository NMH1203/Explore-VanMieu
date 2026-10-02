"""Verify visitor check-ins and record successful location unlocks.

This route connects the API request to the check-in response and log models,
the heritage-location catalog, authenticated users, user progress history, and
the image-recognition service.

Caller: frontend/src/services/check-in-service/index.js. Site IDs, labels, and
geofences originate in database/seeds/seed_locations.py. services/unlocks.py
persists successful stamps; routes/progress.py restores them after a reload.
"""

import math
import os

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
from backend.src.services.unlocks import save_verified_unlock
from backend.src.services.image_processing import InvalidImageError
from backend.src.services.vision import (
    VisionConfigurationError,
    VisionProviderError,
    recognize_heritage_image,
)

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


@router.post(
    "/verify",
    response_model=CheckinVerificationResponse,
    summary="Verify a check-in photo",
    description=(
        "Requires a valid signed-in session. In `/docs`, first call "
        "POST `/api/auth/login` using this same browser and host. If this "
        "returns 401, sign in again; the session cookie is missing or expired."
    ),
    responses={401: {"description": "Sign in first, or sign in again if the session expired."}},
)
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
        nearest_location, nearest_distance = min(distances, key=lambda item: item[1])

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

        # The seeded sites can have overlapping geofences. Match GPS against the
        # site recognized by services/vision.py, not whichever neighbour happens
        # to be nearest. An unknown label uses the nearest site only for logging
        # a rejected attempt; it can never grant an unlock.
        location = detected_location or nearest_location
        distance = (
            calculate_distance_meters(latitude, longitude, location.latitude, location.longitude)
            if detected_location else nearest_distance
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

        image_matches = detected_location is not None and result.confidence >= minimum_confidence
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
            # services/unlocks.py writes user_history in this same transaction.
            # GET /api/progress then restores these stamps in frontend/src/App.jsx.
            save_verified_unlock(session, current_user.user_id, location.location_id)

        session.commit()
        if verified:
            message = f"{location.name} has been verified and its heritage stamp saved."
        elif detected_location is None:
            message = (
                "The image was not recognized as a supported heritage site. "
                "Capture a clear view of the site and try again."
            )
        elif not image_matches:
            message = (
                f"The image may show {location.name}, but the recognition confidence is too low. "
                "Capture a clear, unobstructed view and try again."
            )
        else:
            message = (
                f"The image shows {location.name}, but you are {round(distance)} m away from "
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
