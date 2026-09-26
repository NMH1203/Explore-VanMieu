import json
import random

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from backend.src.config.db import engine
from backend.src.models.user import User
from backend.src.models.user_journey import UserJourney
from backend.src.models.heritage_location import HeritageLocation


router = APIRouter(prefix="/api/journey", tags=["Journey"])


def get_session():
    with Session(engine) as session:
        yield session


@router.get("/{user_id}")
def get_user_journey(
    user_id: str,
    session: Session = Depends(get_session),
):
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    journey = session.exec(
        select(UserJourney).where(UserJourney.user_id == user_id)
    ).first()

    if journey:
        location_ids = json.loads(journey.location_ids)
    else:
        locations = session.exec(
            select(HeritageLocation)
            .order_by(HeritageLocation.sequence_order)
        ).all()

        print("HERITAGE LOCATIONS COUNT:", len(locations))

        if len(locations) < 5:
            raise HTTPException(
                status_code=400,
                detail="Not enough locations"
            )

        selected_locations = random.sample(locations, 5)

        location_ids = [
            location.location_id
            for location in selected_locations
        ]

        journey = UserJourney(
            user_id=user_id,
            location_ids=json.dumps(location_ids),
            completed=False,
        )

        session.add(journey)
        session.commit()
        session.refresh(journey)

    locations = session.exec(
        select(HeritageLocation)
        .where(HeritageLocation.location_id.in_(location_ids))
        .order_by(HeritageLocation.sequence_order)
    ).all()

    return {
        "user_id": user_id,
        "locations": locations,
        "completed": journey.completed,
        "total": len(location_ids),
    }