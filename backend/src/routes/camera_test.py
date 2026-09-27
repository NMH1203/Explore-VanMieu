from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from backend.src.config.db import engine
from backend.src.dependencies.auth import get_current_user
from backend.src.models.user import User
from backend.src.models.heritage_location import HeritageLocation
from backend.src.models.user_history import UserHistory
from backend.src.models.checkin_log import CheckinLog
from backend.src.services.camera_test import camera_test_allowed

router = APIRouter(prefix='/api/camera-test', tags=['Development camera'])

class TestCapture(BaseModel):
    location_id: str

@router.get('')
def capability(user: User = Depends(get_current_user)):
    return {'enabled': camera_test_allowed(user)}

@router.post('/capture')
def capture(data: TestCapture, user: User = Depends(get_current_user)):
    if not camera_test_allowed(user):
        raise HTTPException(403, 'Camera test is disabled or not allowed for this account.')
    with Session(engine) as session:
        location = session.get(HeritageLocation, data.location_id)
        if location is None:
            raise HTTPException(404, 'Location not found.')
        history = session.get(UserHistory, (user.user_id, location.location_id))
        if history is None:
            history = UserHistory(user_id=user.user_id, location_id=location.location_id)
        history.status = True
        history.unlocked_at = datetime.now(timezone.utc)
        session.add(history)
        existing = session.exec(select(CheckinLog).where(
            CheckinLog.user_id == user.user_id,
            CheckinLog.target_location_id == location.location_id,
            CheckinLog.verification_status == 'test_verified',
        )).first()
        if existing is None:
            session.add(CheckinLog(user_id=user.user_id, target_location_id=location.location_id,
                submitted_lat=location.latitude, submitted_lon=location.longitude,
                distance_meters=0, verification_status='test_verified'))
        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            raise HTTPException(409, 'Another capture is being saved. Please retry.')
        return {'verified': True, 'location_id': location.location_id, 'simulated': True}
