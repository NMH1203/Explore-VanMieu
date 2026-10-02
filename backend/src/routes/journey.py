"""Compatibility endpoint sharing the account's authoritative reward journey."""

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from backend.src.config.db import engine
from backend.src.dependencies.auth import get_current_user
from backend.src.models.user import User
from backend.src.models.heritage_location import HeritageLocation
from backend.src.routes.rewards import reward_status

# Router for user journey history query by user ID (/api/journey)
router = APIRouter(prefix="/api/journey", tags=["Journey"])


# GET /api/journey/{user_id}: Return assigned locations, completion status, and total targets for user
@router.get("/{user_id}")
def get_user_journey(user_id: str, current_user: User = Depends(get_current_user)):

    if user_id != current_user.user_id:
        raise HTTPException(403, "You can only view your own journey.")
    with Session(engine) as session:
        status = reward_status(session, session.get(User, user_id))
        return {
            "user_id": user_id,
            "locations": [session.get(HeritageLocation, target) for target in status["target_ids"]],
            "completed": status["completed"],
            "total": len(status["target_ids"]),
        }
