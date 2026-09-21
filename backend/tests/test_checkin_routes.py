import unittest
from io import BytesIO
from unittest.mock import AsyncMock, patch

from fastapi import UploadFile
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine, select
from starlette.datastructures import Headers

from backend.src.models.checkin_log import CheckinLog
from backend.src.models.heritage_location import HeritageLocation
from backend.src.models.user import User
from backend.src.models.user_history import UserHistory
from backend.src.routes.checkins import verify_checkin
from backend.src.services.vision import VisionResult


class CheckinRouteTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        self.addCleanup(self.engine.dispose)
        SQLModel.metadata.create_all(self.engine)

        user = User(email="visitor@example.com", password_hash="unused")
        location = HeritageLocation(
            location_id="interpret",
            yolo_label="khue_van_cac",
            name="Khuê Văn Các",
            sequence_order=3,
            latitude=21.02868,
            longitude=105.83592,
            geofence_radius=30,
            story_summary="Test location",
        )
        with Session(self.engine) as session:
            session.add(user)
            session.add(location)
            session.commit()
            session.refresh(user)
            self.user_id = user.user_id

        self.user = User(
            user_id=self.user_id,
            email="visitor@example.com",
            password_hash="unused",
        )
        self.engine_patch = patch("backend.src.routes.checkins.engine", self.engine)
        self.engine_patch.start()
        self.addCleanup(self.engine_patch.stop)

    @staticmethod
    def image_upload():
        return UploadFile(
            filename="checkin.jpg",
            file=BytesIO(b"fake-jpeg-content"),
            headers=Headers({"content-type": "image/jpeg"}),
        )

    async def test_matching_image_unlocks_location_and_writes_log(self):
        ai_result = VisionResult("khue_van_cac", 0.93, "matched")
        with patch(
            "backend.src.routes.checkins.recognize_heritage_image",
            new=AsyncMock(return_value=ai_result),
        ):
            result = await verify_checkin(
                location_id="interpret",
                latitude=21.02868,
                longitude=105.83592,
                image=self.image_upload(),
                current_user=self.user,
            )

        self.assertTrue(result.verified)
        with Session(self.engine) as session:
            history = session.get(UserHistory, (self.user_id, "interpret"))
            logs = session.exec(select(CheckinLog)).all()
        self.assertTrue(history.status)
        self.assertEqual(logs[0].verification_status, "verified")

    async def test_far_location_is_rejected_before_ai_call(self):
        recognize = AsyncMock()
        with patch(
            "backend.src.routes.checkins.recognize_heritage_image",
            new=recognize,
        ):
            result = await verify_checkin(
                location_id="interpret",
                latitude=20.0,
                longitude=105.0,
                image=self.image_upload(),
                current_user=self.user,
            )

        self.assertFalse(result.verified)
        recognize.assert_not_awaited()
        with Session(self.engine) as session:
            self.assertIsNone(session.get(UserHistory, (self.user_id, "interpret")))


if __name__ == "__main__":
    unittest.main()
