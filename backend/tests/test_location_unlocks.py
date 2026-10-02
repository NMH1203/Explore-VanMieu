"""HTTP/database regressions for the ten seeded sites and persisted unlocks.

Real routes, SQLModel tables, and transactions are exercised through TestClient.
Only identity selection and the paid vision provider are replaced. See
docs/UNLOCK_FLOW.md for the matching frontend and backend file sequence.
"""

import unittest
from contextlib import ExitStack, redirect_stdout
from io import StringIO
from unittest.mock import AsyncMock, patch

from backend.tests import support  # Must precede imports that read configuration.
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import event
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine, select

from backend.src.dependencies.auth import get_current_user
from backend.src.models.checkin_log import CheckinLog
from backend.src.models.heritage_location import HeritageLocation
from backend.src.models.user import User
from backend.src.models.user_history import UserHistory
from backend.src.routes import checkins, locations, progress
from backend.src.services.vision import VisionResult
from database.seeds import seed_locations


class LocationUnlockTests(unittest.TestCase):
    # Setup context stack and initialize test database with foreign keys enabled.
    def setUp(self):
        self.stack = ExitStack()
        self.addCleanup(self.stack.close)
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        self.addCleanup(self.engine.dispose)
        event.listen(self.engine, "connect", lambda connection, _: connection.execute("PRAGMA foreign_keys=ON"))
        SQLModel.metadata.create_all(self.engine)

        # Patch database engine across route modules and seed initial site locations.
        for module in (checkins, locations, progress, seed_locations):
            self.stack.enter_context(patch.object(module, "engine", self.engine))
        self.stack.enter_context(patch.dict("os.environ", {"YESCALE_MIN_CONFIDENCE": "0.70"}))
        with redirect_stdout(StringIO()):
            seed_locations.seed_locations()

        # Seed users into database and initialize FastAPI TestClient instance with auth dependencies overridden.
        self.user = User(user_id="alice", email="alice@example.test", password_hash="unused")
        self.other = User(user_id="bob", email="bob@example.test", password_hash="unused")
        with Session(self.engine) as session:
            session.add(self.user)
            session.add(self.other)
            session.commit()
            session.refresh(self.user)
            session.refresh(self.other)
        self.app = FastAPI()
        self.app.include_router(checkins.router)
        self.app.include_router(locations.create_location_router())
        self.app.include_router(progress.router)
        self.app.dependency_overrides[get_current_user] = lambda: self.user
        self.client = self.stack.enter_context(TestClient(self.app))

    def verify(self, site, *, latitude=None, longitude=None, confidence=0.95, label=None):
        # Helper method for dispatching image check-in requests with mocked vision output.
        # The provider output is deterministic; HTTP parsing, GPS checks, and
        # persistence still run through routes/checkins.py without shortcuts.
        recognize = AsyncMock(return_value=VisionResult(label or site["yolo_label"], confidence, "test"))
        with patch.object(checkins, "recognize_heritage_image", recognize):
            response = self.client.post("/api/checkins/verify", data={
                "latitude": site["latitude"] if latitude is None else latitude,
                "longitude": site["longitude"] if longitude is None else longitude,
            }, files={"image": ("photo.jpg", b"mock-provider-image", "image/jpeg")})
        self.assertEqual(response.status_code, 200, response.text)
        return response.json()

    def test_all_ten_sites_unlock_and_restore_in_a_new_client(self):
        # Validates that all 10 heritage sites can be sequentially unlocked and restored from DB state.
        initial = self.client.get("/api/locations").json()
        self.assertEqual(len(initial), 10)
        self.assertFalse(any(row["unlocked"] for row in initial))
        for site in seed_locations.LOCATIONS:
            with self.subTest(site=site["location_id"]):
                result = self.verify(site)
                self.assertTrue(result["verified"])
                self.assertEqual(result["location_id"], site["location_id"])
        # A new client has no frontend state: the ten stamps must come from DB.
        # Ensure progress persists across stateless client reconnections.
        with TestClient(self.app) as reloaded:
            saved = reloaded.get("/api/progress").json()
            self.assertEqual({row["location_id"] for row in saved}, {site["location_id"] for site in seed_locations.LOCATIONS})
            self.assertTrue(all(row["unlocked"] for row in reloaded.get("/api/locations").json()))

    def test_overlapping_geofences_unlock_the_recognized_site_only(self):
        # Ensures that vision AI output dictates which site unlocks when coordinates overlap geographically.
        hall = next(site for site in seed_locations.LOCATIONS if site["yolo_label"] == "thai_hoc_house")
        tower = next(site for site in seed_locations.LOCATIONS if site["yolo_label"] == "bell_drum_tower")
        result = self.verify(hall, latitude=tower["latitude"], longitude=tower["longitude"])
        self.assertTrue(result["verified"])
        self.assertEqual(result["location_id"], hall["location_id"])
        self.assertGreater(result["distance_meters"], 0)
        self.assertEqual([row["location_id"] for row in self.client.get("/api/progress").json()], [hall["location_id"]])

    def test_far_low_confidence_and_unknown_images_do_not_unlock(self):
        # Validates rejection on invalid GPS, low model confidence, or unknown labels.
        site = seed_locations.LOCATIONS[0]
        for options in ({"latitude": 20.0}, {"confidence": 0.2}, {"label": "unknown"}):
            with self.subTest(options=options):
                self.assertFalse(self.verify(site, **options)["verified"])
        self.assertEqual(self.client.get("/api/progress").json(), [])
        with Session(self.engine) as session:
            logs = session.exec(select(CheckinLog)).all()
            self.assertEqual(len(logs), 3)
            self.assertTrue(all(log.verification_status != "verified" for log in logs))

    def test_repeated_scan_preserves_first_unlock_timestamp(self):
        # Ensures repeating a scan does not overwrite the initial unlock timestamp.
        site = seed_locations.LOCATIONS[0]
        self.verify(site)
        first = self.client.get("/api/progress").json()
        self.verify(site)
        self.assertEqual(self.client.get("/api/progress").json(), first)
        with Session(self.engine) as session:
            self.assertEqual(len(session.exec(select(CheckinLog)).all()), 2)

    def test_another_users_evidence_cannot_unlock_or_leak_progress(self):
        # Verifies strict multi-tenant isolation across distinct user accounts.
        site = seed_locations.LOCATIONS[0]
        self.verify(site)
        self.app.dependency_overrides[get_current_user] = lambda: self.other
        self.assertEqual(self.client.get("/api/progress").json(), [])
        self.assertFalse(any(row["unlocked"] for row in self.client.get("/api/locations").json()))
        self.assertEqual(self.client.put(f'/api/locations/{site["location_id"]}/unlock').status_code, 409)

    def test_manual_unlock_requires_verified_evidence_for_the_exact_site(self):
        # Tests that manual unlock endpoints enforce valid prior verification logs.
        site = seed_locations.LOCATIONS[0]
        self.verify(site, confidence=0.2)
        self.assertEqual(self.client.put(f'/api/locations/{site["location_id"]}/unlock').status_code, 409)
        self.assertEqual(self.client.put('/api/locations/missing/unlock').status_code, 404)
        self.verify(site)
        other_id = seed_locations.LOCATIONS[1]["location_id"]
        self.assertEqual(self.client.put(f'/api/locations/{other_id}/unlock').status_code, 409)

    def test_verified_evidence_can_restore_a_missing_stamp_idempotently(self):
        # Confirms manual unlock endpoint can restore missing history rows idempotently.
        site = seed_locations.LOCATIONS[0]
        self.verify(site)
        with Session(self.engine) as session:
            session.delete(session.get(UserHistory, (self.user.user_id, site["location_id"])))
            session.commit()
        url = f'/api/locations/{site["location_id"]}/unlock'
        self.assertEqual(self.client.put(url).status_code, 200)
        restored = self.client.get("/api/progress").json()
        self.assertEqual(self.client.put(url).status_code, 200)
        self.assertEqual(self.client.get("/api/progress").json(), restored)

    def test_false_history_rows_and_legacy_json_do_not_grant_access(self):
        # Asserts legacy JSON flags or unverified history records do not bypass verification checks.
        site = seed_locations.LOCATIONS[0]
        with Session(self.engine) as session:
            user = session.get(User, self.user.user_id)
            user.unlocked_location_ids = [row["location_id"] for row in seed_locations.LOCATIONS]
            session.add(user)
            session.add(UserHistory(user_id=user.user_id, location_id=site["location_id"], status=False))
            session.commit()
        self.assertEqual(self.client.get("/api/progress").json(), [])
        self.assertFalse(any(row["unlocked"] for row in self.client.get("/api/locations").json()))
        self.assertTrue(self.verify(site)["verified"])
        self.assertEqual(len(self.client.get("/api/progress").json()), 1)

    def test_reseeding_preserves_existing_unlocks_and_ten_sites(self):
        # Ensures executing database seed functions re-enforces 10 sites without wiping user unlock states.
        self.verify(seed_locations.LOCATIONS[0])
        before = self.client.get("/api/progress").json()
        with redirect_stdout(StringIO()):
            seed_locations.seed_locations()
        self.assertEqual(self.client.get("/api/progress").json(), before)
        self.assertEqual(len(self.client.get("/api/locations").json()), 10)

    def test_missing_session_cannot_read_or_write_unlocks(self):
        # Verifies 401 Unauthorized responses on protected routes when authentication is absent.
        self.app.dependency_overrides.clear()
        for url in ("/api/progress", "/api/locations"):
            self.assertEqual(self.client.get(url).status_code, 401)
        self.assertEqual(self.client.put('/api/locations/interpret/unlock').status_code, 401)
        response = self.client.post('/api/checkins/verify', data={"latitude": 21, "longitude": 105}, files={"image": ("image.jpg", b"test", "image/jpeg")})
        self.assertEqual(response.status_code, 401)

    def test_failed_commit_rolls_back_both_audit_log_and_unlock(self):
        # Confirms atomic rollback of both CheckinLog and UserHistory records upon commit failures.
        with patch.object(Session, "commit", side_effect=RuntimeError("Simulated database failure")):
            with self.assertRaisesRegex(RuntimeError, "Simulated database failure"):
                self.verify(seed_locations.LOCATIONS[0])
        with Session(self.engine) as session:
            self.assertEqual(session.exec(select(UserHistory)).all(), [])
            self.assertEqual(session.exec(select(CheckinLog)).all(), [])
