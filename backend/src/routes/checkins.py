"""Verify visitor check-ins and record successful location unlocks.

This route connects the API request to the check-in response and log models,
the heritage-location catalog, authenticated users, user progress history, and
the image-recognition service. Related behavior is covered by
``backend/tests/test_checkin_routes.py``.
"""

import math
import os
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlmodel import Session, select

from backend.src.config.db import engine
from backend.src.dependencies.auth import get_current_user
from backend.src.models.checkin import CheckinVerificationResponse
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

router = APIRouter(prefix="/api/checkins", tags=["checkins"])
MAX_IMAGE_BYTES = 5 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


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


@router.post("/verify", response_model=CheckinVerificationResponse)
async def verify_checkin(
    location_id: str = Form(...),
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
        location = session.get(HeritageLocation, location_id)
        if location is None:
            raise HTTPException(status_code=404, detail="Location not found.")

        distance = calculate_distance_meters(
            latitude,
            longitude,
            location.latitude,
            location.longitude,
        )
        checkin_log = CheckinLog(
            user_id=current_user.user_id,
            target_location_id=location.location_id,
            submitted_lat=latitude,
            submitted_lon=longitude,
            distance_meters=round(distance, 2),
        )

        if distance > location.geofence_radius:
            checkin_log.verification_status = "rejected_gps"
            session.add(checkin_log)
            session.commit()
            return CheckinVerificationResponse(
                verified=False,
                location_id=location.location_id,
                distance_meters=round(distance, 2),
                message=(
                    f"You are {round(distance)} m away from this location, "
                    "outside the check-in area."
                ),
            )

        labels = list(session.exec(select(HeritageLocation.yolo_label)).all())
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

        checkin_log.yolo_detected_label = result.label
        checkin_log.yolo_confidence = result.confidence
        minimum_confidence = float(os.getenv("YESCALE_MIN_CONFIDENCE", "0.70"))
        verified = (
            result.label == location.yolo_label
            and result.confidence >= minimum_confidence
        )
        checkin_log.verification_status = "verified" if verified else "rejected_image"
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
        message = (
            f"{location.name} has been verified and its heritage stamp saved."
            if verified
            else "The image does not match the selected location. "
            "Capture a clear image of the site and try again."
        )
        return CheckinVerificationResponse(
            verified=verified,
            location_id=location.location_id,
            detected_label=result.label,
            confidence=result.confidence,
            distance_meters=round(distance, 2),
            message=message,
        )
