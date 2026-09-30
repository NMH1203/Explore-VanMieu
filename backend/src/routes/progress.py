"""Read the same persisted unlocks written by services/unlocks.py.

frontend/src/services/passport-service/index.js calls this endpoint; its response
flows through hooks/useLocationProgress.js to App.jsx and the ten-site pages.
Only active rows linked to existing database locations are returned.
"""

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from backend.src.config.db import engine
from backend.src.dependencies.auth import get_current_user
from backend.src.models.progress import ProgressResponse
from backend.src.models.user import User
from backend.src.models.user_history import UserHistory
from backend.src.models.heritage_location import HeritageLocation


router = APIRouter(prefix="/api/progress", tags=["Progress"])


@router.get("", response_model=list[ProgressResponse])
def list_progress(current_user: User = Depends(get_current_user)):
    """Return unlocked locations belonging to the signed-in user."""
    with Session(engine) as session:
        statement = (
            select(UserHistory)
            .join(HeritageLocation, UserHistory.location_id == HeritageLocation.location_id)
            .where(
                UserHistory.user_id == current_user.user_id,
                UserHistory.status.is_(True),
            )
            .order_by(UserHistory.unlocked_at)
        )
        return session.exec(statement).all()
