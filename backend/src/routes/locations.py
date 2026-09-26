"""Read database locations and expose only verified user unlocks.

This router is registered by ``backend/src/app/main.py``. Location data comes
from ``backend/src/models/heritage_location.py`` and user unlock state comes
from ``backend/src/models/user_history.py``. Verified evidence is written by
``backend/src/routes/checkins.py`` to ``backend/src/models/checkin_log.py``.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from backend.src.config.db import engine
from backend.src.dependencies.auth import get_current_user
from backend.src.models.checkin_log import CheckinLog
from backend.src.models.heritage_location import HeritageLocation
from backend.src.models.location import LocationStatus
from backend.src.models.user import User
from backend.src.models.user_history import UserHistory


def create_location_router() -> APIRouter:
    """Build location endpoints backed by SQLite and the signed-in user's history."""
    router = APIRouter(prefix="/api/locations", tags=["Locations"])

    @router.get("", response_model=list[LocationStatus])
    def list_locations(current_user: User = Depends(get_current_user)):
        """Return the seeded locations with unlock flags from user_history."""
        with Session(engine) as session:
            locations = session.exec(
                select(HeritageLocation).order_by(HeritageLocation.sequence_order)
            ).all()
            unlocked_ids = set(session.exec(
                select(UserHistory.location_id).where(
                    UserHistory.user_id == current_user.user_id,
                    UserHistory.status.is_(True),
                )
            ).all())
            return [
                LocationStatus(id=item.location_id, unlocked=item.location_id in unlocked_ids)
                for item in locations
            ]

    @router.put("/{location_id}/unlock", response_model=LocationStatus)
    def unlock_location(
        location_id: str,
        current_user: User = Depends(get_current_user),
    ):
        """Synchronize a verified check-in into user_history; never grant by request alone."""
        with Session(engine) as session:
            location = session.get(HeritageLocation, location_id)
            if location is None:
                raise HTTPException(status_code=404, detail="Location not found.")

            verified_checkin = session.exec(
                select(CheckinLog.log_id).where(
                    CheckinLog.user_id == current_user.user_id,
                    CheckinLog.target_location_id == location_id,
                    CheckinLog.verification_status == "verified",
                ).limit(1)
            ).first()
            if verified_checkin is None:
                raise HTTPException(
                    status_code=409,
                    detail="A verified GPS and image check-in is required to unlock this location.",
                )

            history = session.get(UserHistory, (current_user.user_id, location_id))
            if history is None:
                session.add(UserHistory(user_id=current_user.user_id, location_id=location_id))
                session.commit()
            elif not history.status:
                history.status = True
                session.add(history)
                session.commit()
            return LocationStatus(id=location_id, unlocked=True)

    return router
