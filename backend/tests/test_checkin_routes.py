import unittest
from backend.tests import support  # Configure test-only secrets before route imports.
from datetime import datetime, timedelta, timezone
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
from backend.src.routes.checkins import list_checkin_history, verify_checkin
from backend.src.services.vision import VisionResult


class CheckinRouteTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        # Create an in-memory SQLite database engine isolated for each test execution.
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        # Register automatic database engine cleanup upon test completion.
        self.addCleanup(self.engine.dispose)
        # Initialize schema tables in the in-memory database.
        SQLModel.metadata.create_all(self.engine)

        # Instantiate user models and a test heritage location entity.
        user = User(email="visitor@example.com", password_hash="unused")
        other_user = User(email="other-visitor@example.com", password_hash="unused")
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

        # Seed test instances into the database session.
        with Session(self.engine) as session:
            session.add(user)
            session.add(other_user)
            session.add(location)
            session.commit()
            session.refresh(user)
            session.refresh(other_user)
            self.user_id = user.user_id
            self.other_user_id = other_user.user_id

        # Retain user reference instances for route parameter passing.
        self.user = User(
            user_id=self.user_id,
            email="visitor@example.com",
            password_hash="unused",
        )
        # Patch the checkins route engine to use the isolated test database instance.
        self.other_user = User(
            user_id=self.other_user_id,
            email="other-visitor@example.com",
            password_hash="unused",
        )
        self.engine_patch = patch("backend.src.routes.checkins.engine", self.engine)
        self.engine_patch.start()
        self.addCleanup(self.engine_patch.stop)

    @staticmethod
    def image_upload():
        # Helper function to construct a dummy file upload object.
        return UploadFile(
            filename="checkin.jpg",
            file=BytesIO(b"fake-jpeg-content"),
            headers=Headers({"content-type": "image/jpeg"}),
        )

    async def test_matching_image_unlocks_location_and_writes_log(self):
        # Test verifying check-in with matching image labels and GPS coordinates.
        ai_result = VisionResult("khue_van_cac", 0.93, "matched")
        with patch(
            "backend.src.routes.checkins.recognize_heritage_image",
            new=AsyncMock(return_value=ai_result),
        ):
            result = await verify_checkin(
                latitude=21.02868,
                longitude=105.83592,
                image=self.image_upload(),
                current_user=self.user,
            )

        # Assert successful verification and ensure user history & logs are persisted.
        self.assertTrue(result.verified)
        with Session(self.engine) as session:
            history = session.get(UserHistory, (self.user_id, "interpret"))
            logs = session.exec(select(CheckinLog)).all()
        self.assertTrue(history.status)
        self.assertEqual(logs[0].verification_status, "verified")

    async def test_far_location_is_rejected_and_logged(self):
        # Test GPS geofence rejection when coordinates are beyond threshold.
        recognize = AsyncMock(return_value=VisionResult("khue_van_cac", 0.93, "matched"))
        with patch(
            "backend.src.routes.checkins.recognize_heritage_image",
            new=recognize,
        ):
            result = await verify_checkin(
                latitude=20.0,
                longitude=105.0,
                image=self.image_upload(),
                current_user=self.user,
            )

        # Assert rejection status and verify log records rejection reason.
        self.assertFalse(result.verified)
        recognize.assert_awaited_once()
        with Session(self.engine) as session:
            self.assertIsNone(session.get(UserHistory, (self.user_id, "interpret")))
            logs = session.exec(select(CheckinLog)).all()
        self.assertEqual(logs[0].verification_status, "rejected_gps")

    async def test_history_is_scoped_to_user_and_newest_first(self):
        # Test that history querying is filtered by user ID and correctly ordered by time.
        now = datetime.now(timezone.utc)
        with Session(self.engine) as session:
            session.add(
                CheckinLog(
                    user_id=self.user_id,
                    target_location_id="interpret",
                    submitted_lat=21.0,
                    submitted_lon=105.0,
                    distance_meters=25,
                    verification_status="rejected_image",
                    logged_at=now - timedelta(minutes=5),
                )
            )
            session.add(
                CheckinLog(
                    user_id=self.user_id,
                    target_location_id="interpret",
                    submitted_lat=21.02868,
                    submitted_lon=105.83592,
                    distance_meters=0,
                    yolo_detected_label="khue_van_cac",
                    yolo_confidence=0.94,
                    verification_status="verified",
                    logged_at=now,
                )
            )
            session.add(
                CheckinLog(
                    user_id=self.other_user_id,
                    target_location_id="interpret",
                    submitted_lat=21.02868,
                    submitted_lon=105.83592,
                    distance_meters=0,
                    verification_status="verified",
                    logged_at=now + timedelta(minutes=1),
                )
            )
            session.commit()
        # Execute target function and verify returning results belong only to caller in reverse-chronological order.
        history = list_checkin_history(limit=20, current_user=self.user)
        self.assertEqual(len(history), 2)
        self.assertEqual(history[0].verification_status, "verified")
        self.assertEqual(history[0].location_name, "Khuê Văn Các")
        self.assertEqual(history[1].verification_status, "rejected_image")


if __name__ == "__main__":
    unittest.main()
