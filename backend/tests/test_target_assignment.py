import unittest
from unittest.mock import patch

from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from backend.src.models.heritage_location import HeritageLocation
from backend.src.models.user import User
from backend.src.services.targets import assign_target_location


class TargetAssignmentTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        SQLModel.metadata.create_all(self.engine)
        with Session(self.engine) as session:
            session.add_all([
                HeritageLocation(
                    location_id="site-1",
                    yolo_label="site_1",
                    name="Site 1",
                    sequence_order=1,
                    latitude=21.0,
                    longitude=105.0,
                    geofence_radius=30,
                    story_summary="Story 1",
                    deep_history="History 1",
                ),
                HeritageLocation(
                    location_id="site-2",
                    yolo_label="site_2",
                    name="Site 2",
                    sequence_order=2,
                    latitude=21.1,
                    longitude=105.1,
                    geofence_radius=30,
                    story_summary="Story 2",
                    deep_history="History 2",
                ),
            ])
            session.commit()

    def test_target_is_assigned_once_and_remains_stable(self):
        with Session(self.engine) as session:
            user = User(email="target@example.com", password_hash="unused")
            session.add(user)
            session.commit()
            session.refresh(user)

            with patch("backend.src.services.targets.choice", return_value="site-2"):
                first = assign_target_location(session, user)
            with patch("backend.src.services.targets.choice", return_value="site-1"):
                second = assign_target_location(session, user)

            self.assertEqual(first, "site-2")
            self.assertEqual(second, "site-2")


if __name__ == "__main__":
    unittest.main()
