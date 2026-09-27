from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session

from backend.src.config.db import engine
from backend.src.dependencies.auth import get_current_user
from backend.src.models.heritage_location import HeritageLocation
from backend.src.models.target import TargetLocationResponse
from backend.src.models.user import User
from backend.src.services.targets import assign_target_location


router = APIRouter(prefix="/api/target", tags=["Target"])


@router.get("", response_model=TargetLocationResponse)
def get_account_target(current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        user = session.get(User, current_user.user_id)
        if user is None:
            raise HTTPException(status_code=404, detail="User not found.")

        location_id = assign_target_location(session, user)
        if location_id is None:
            raise HTTPException(status_code=503, detail="No heritage locations are available.")

        location = session.get(HeritageLocation, location_id)
        if location is None:
            raise HTTPException(status_code=404, detail="Target location not found.")
        return TargetLocationResponse(
            location_id=location.location_id,
            name=location.name,
            story_summary=location.story_summary,
        )
