from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from backend.src.config.db import engine
from backend.src.dependencies.auth import get_current_user
from backend.src.models.user import User
from backend.src.models.user_history import UserHistory
from backend.src.models.checkin_log import CheckinLog
from backend.src.models.reward import RewardClaim, RewardJourney
from backend.src.models.heritage_location import HeritageLocation
from random import SystemRandom

router = APIRouter(prefix="/api/rewards", tags=["Rewards"])


def reward_status(session, user):
    journey = session.get(RewardJourney, user.user_id)
    if journey is None:
        ids = list(session.exec(select(HeritageLocation.location_id)).all())
        if len(ids) < 5:
            raise HTTPException(503, "At least five locations are required.")
        journey = RewardJourney(user_id=user.user_id, target_ids=SystemRandom().sample(ids, 5))
        session.add(journey)
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
        journey = session.get(RewardJourney, user.user_id)
        if journey is None:
            raise HTTPException(503, "Unable to assign journey.")
    verified = set(session.exec(select(CheckinLog.target_location_id).where(
        CheckinLog.user_id == user.user_id,
        CheckinLog.verification_status == "verified",
    )).all())
    completed_ids = [target for target in journey.target_ids
        if target in verified and (history := session.get(UserHistory, (user.user_id, target))) and history.status]
    claim = session.get(RewardClaim, user.user_id)
    completed = len(completed_ids) == 5
    return {
        "target_ids": journey.target_ids,
        "completed_ids": completed_ids,
        "completed": completed,
        "claimed": claim is not None,
        "claimed_at": claim.claimed_at if claim else None,
        "theme": "vermilion" if completed or claim else "default",
    }


@router.get("")
def get_rewards(current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        return reward_status(session, session.get(User, current_user.user_id))


@router.post("/claim")
def claim_reward(current_user: User = Depends(get_current_user)):
    with Session(engine) as session:
        user = session.get(User, current_user.user_id)
        status = reward_status(session, user)
        if status["claimed"]:
            return status
        if not status["completed"]:
            raise HTTPException(409, "Complete your target with a verified check-in before claiming the reward.")
        session.add(RewardClaim(user_id=user.user_id, location_id=status['target_ids'][0]))
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            if session.get(RewardClaim, user.user_id) is None:
                raise
        return reward_status(session, user)
