"""Test progress-route behavior using an isolated in-memory SQLite database.

The route under test is ``backend/src/routes/progress.py``. Its response is
built from the user and history models and is expected to include progress for
all ten catalog locations while remaining isolated between users.
"""

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
        # Seed ten distinct locations so the route is checked across the full
        # visit sequence instead of relying on a single-location fixture.
        self.location_ids = [f"test-location-{index}" for index in range(1, 11)]
        locations = [
            HeritageLocation(
                location_id=location_id,
                yolo_label=f"test_label_{index}",
                name=f"Test Location {index}",
                sequence_order=index,
                latitude=21.027,
                longitude=105.835,
                geofence_radius=30,
                story_summary=f"Test location {index}",
            )
            for index, location_id in enumerate(self.location_ids, start=1)
        ]

        with Session(self.engine) as session:
            session.add(user)
            session.add(other_user)
            session.add_all(locations)
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

    def add_progress(self, user_id, location_id):
        with Session(self.engine) as session:
            session.add(UserHistory(user_id=user_id, location_id=location_id))
            session.commit()

    def test_saved_progress_is_returned_for_all_ten_locations(self):
        # Iterate over every seeded location to verify that each saved unlock
        # is returned for the signed-in user.
        for location_id in self.location_ids:
            with self.subTest(location_id=location_id):
                self.add_progress(self.user_id, location_id)

        progress = list_progress(self.user)
        self.assertEqual(len(progress), 10)
        self.assertEqual({item.location_id for item in progress}, set(self.location_ids))
        self.assertTrue(all(item.user_id == self.user_id for item in progress))

    def test_progress_is_isolated_between_users(self):
        for location_id in self.location_ids:
            with self.subTest(location_id=location_id):
                self.add_progress(self.user_id, location_id)

        self.assertEqual(list_progress(self.other_user), [])

    def test_new_user_has_no_progress(self):
        self.assertEqual(list_progress(self.user), [])


if __name__ == "__main__":
    unittest.main()
