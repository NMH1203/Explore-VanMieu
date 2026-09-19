"""Check account persistence, password verification, and per-user progress."""

import json
import tempfile
import unittest
from pathlib import Path

from backend.src.repositories.user_repository import UserRepository


class UserRepositoryTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.path = Path(self.directory.name) / "users.json"
        self.path.write_text("[]", encoding="utf-8")
        self.repository = UserRepository(self.path)

    def test_register_and_authenticate(self):
        created = self.repository.register("Demo User", "Demo@Example.com", "password123")
        authenticated = self.repository.authenticate("demo@example.com", "password123")
        self.assertEqual(created["id"], authenticated["id"])
        self.assertIsNone(self.repository.authenticate("demo@example.com", "wrong-password"))

    def test_duplicate_email_is_rejected(self):
        self.repository.register("First", "demo@example.com", "password123")
        with self.assertRaises(ValueError):
            self.repository.register("Second", "DEMO@example.com", "password456")

    def test_progress_is_isolated_between_accounts(self):
        first = self.repository.register("First", "first@example.com", "password123")
        second = self.repository.register("Second", "second@example.com", "password123")
        self.repository.unlock(first["id"], "interpret")
        self.assertEqual(self.repository.get(first["id"])["unlocked_location_ids"], ["interpret"])
        self.assertEqual(self.repository.get(second["id"])["unlocked_location_ids"], [])

    def test_password_is_not_stored_as_plain_text(self):
        self.repository.register("Demo", "demo@example.com", "password123")
        saved = json.loads(self.path.read_text(encoding="utf-8"))[0]
        self.assertNotIn("password", saved)
        self.assertNotEqual(saved["password_hash"], "password123")


if __name__ == "__main__":
    unittest.main()
