"""Protected endpoints for progress stored per user in SQLite."""

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from backend.src.config.db import engine
from backend.src.dependencies.auth import get_current_user
from backend.src.models.progress import ProgressResponse
from backend.src.models.user import User
from backend.src.models.user_history import UserHistory


router = APIRouter(prefix="/api/progress", tags=["Progress"])


@router.get("", response_model=list[ProgressResponse])
def list_progress(current_user: User = Depends(get_current_user)):
    """Return unlocked locations belonging to the signed-in user."""
    with Session(engine) as session:
        statement = (
            select(UserHistory)
            .where(UserHistory.user_id == current_user.user_id)
            .order_by(UserHistory.unlocked_at)
        )
        return session.exec(statement).all()
