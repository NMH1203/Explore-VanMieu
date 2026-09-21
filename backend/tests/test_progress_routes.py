"""Tests for per-user progress stored in SQLite."""

import unittest
from unittest.mock import patch

from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from backend.src.models.heritage_location import HeritageLocation
from backend.src.models.user import User
from backend.src.models.user_history import UserHistory
from backend.src.routes.progress import list_progress


class ProgressRouteTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        self.addCleanup(self.engine.dispose)
        SQLModel.metadata.create_all(self.engine)

        user = User(
            email="visitor@example.com",
            password_hash="not-used-in-this-test",
            username="Visitor",
        )
        other_user = User(
            email="other@example.com",
            password_hash="not-used-in-this-test",
            username="Other",
        )
        self.location_id = "van-mieu-gate"
        location = HeritageLocation(
            location_id=self.location_id,
            yolo_label="van_mieu_gate",
            name="Cổng Văn Miếu",
            sequence_order=1,
            latitude=21.027,
            longitude=105.835,
            geofence_radius=30,
            story_summary="Test location",
        )

        with Session(self.engine) as session:
            session.add(user)
            session.add(other_user)
            session.add(location)
            session.commit()
            session.refresh(user)
            session.refresh(other_user)
            self.user_id = user.user_id
            self.other_user_id = other_user.user_id

        self.user = User(
            user_id=self.user_id,
            email="visitor@example.com",
            password_hash="unused",
        )
        self.other_user = User(
            user_id=self.other_user_id,
            email="other@example.com",
            password_hash="unused",
        )

        self.engine_patch = patch(
            "backend.src.routes.progress.engine",
            self.engine,
        )
        self.engine_patch.start()
        self.addCleanup(self.engine_patch.stop)

    def add_progress(self, user_id):
        with Session(self.engine) as session:
            session.add(UserHistory(user_id=user_id, location_id=self.location_id))
            session.commit()

    def test_saved_progress_is_returned_for_current_user(self):
        self.add_progress(self.user_id)
        progress = list_progress(self.user)
        self.assertEqual(len(progress), 1)
        self.assertEqual(progress[0].user_id, self.user_id)

    def test_progress_is_isolated_between_users(self):
        self.add_progress(self.user_id)

        self.assertEqual(list_progress(self.other_user), [])

    def test_new_user_has_no_progress(self):
        self.assertEqual(list_progress(self.user), [])


if __name__ == "__main__":
    unittest.main()
