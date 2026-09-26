import tempfile
import unittest
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import patch
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine, select
from backend.src.routes.rewards import router, reward_status, claim_reward
from backend.src.models.reward import RewardClaim
from backend.src.models.user import User
from backend.src.models.heritage_location import HeritageLocation
from backend.src.models.user_history import UserHistory
from backend.src.models.checkin_log import CheckinLog


class RewardTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.engine = create_engine('sqlite:///' + str(Path(self.temp.name) / 'test.db'), connect_args={'check_same_thread': False})
        SQLModel.metadata.create_all(self.engine)
        self.patch = patch('backend.src.routes.rewards.engine', self.engine)
        self.patch.start()
        with Session(self.engine) as s:
            for i in range(10):
                s.add(HeritageLocation(location_id=str(i), name=str(i), yolo_label=str(i), sequence_order=i, latitude=0, longitude=0, geofence_radius=30, story_summary='test'))
            self.user = User(user_id='a', email='a@example.com', password_hash='unused')
            s.add(self.user)
            s.add(User(user_id='b', email='b@example.com', password_hash='unused'))
            s.commit()
            s.refresh(self.user)
            s.expunge(self.user)

    def tearDown(self):
        self.patch.stop()
        self.engine.dispose()
        self.temp.cleanup()

    def status(self, uid='a'):
        with Session(self.engine) as s:
            return reward_status(s, s.get(User, uid))

    def verify(self, ids, logs=True):
        with Session(self.engine) as s:
            for target in ids:
                if not s.get(UserHistory, ('a', target)):
                    s.add(UserHistory(user_id='a', location_id=target, status=True))
                if logs:
                    s.add(CheckinLog(user_id='a', target_location_id=target, submitted_lat=0, submitted_lon=0, distance_meters=0, verification_status='verified'))
            s.commit()

    def test_five_unique_persistent_targets_and_concurrent_assignment(self):
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(lambda _: self.status(), range(4)))
        self.assertEqual(len(set(results[0]['target_ids'])), 5)
        self.assertTrue(all(r['target_ids'] == results[0]['target_ids'] for r in results))

    def test_incomplete_and_unverified_progress_cannot_claim(self):
        ids = self.status()['target_ids']
        self.verify(ids, logs=False)
        self.assertFalse(self.status()['completed'])
        from fastapi import HTTPException
        with self.assertRaises(HTTPException) as caught:
            claim_reward(self.user)
        self.assertEqual(caught.exception.status_code, 409)
        self.verify(ids[:4])
        self.assertFalse(self.status()['completed'])

    def test_complete_theme_and_concurrent_idempotent_claim_isolated_by_account(self):
        self.verify(self.status()['target_ids'])
        self.assertEqual(self.status()['theme'], 'vermilion')
        self.assertFalse(self.status('b')['completed'])
        with ThreadPoolExecutor(max_workers=4) as pool:
            results = list(pool.map(lambda _: claim_reward(self.user), range(4)))
        self.assertTrue(all(r['claimed'] for r in results))
        self.assertEqual(len({r['claimed_at'] for r in results}), 1)
        with Session(self.engine) as s:
            self.assertEqual(len(s.exec(select(RewardClaim)).all()), 1)

    def test_unauthenticated_claim_rejected(self):
        app = FastAPI()
        app.include_router(router)
        with TestClient(app) as client:
            self.assertEqual(client.post('/api/rewards/claim').status_code, 401)
