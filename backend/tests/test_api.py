"""End-to-end API checks for authentication and account-scoped progress."""

import json
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from backend.src.app.main import create_app


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        root = Path(self.directory.name)
        self.locations_path = root / "locations.json"
        self.users_path = root / "users.json"
        self.locations_path.write_text(json.dumps([
            {"id": "interpret", "unlocked": False},
            {"id": "second", "unlocked": False},
        ]), encoding="utf-8")
        self.users_path.write_text("[]", encoding="utf-8")
        self.client = TestClient(create_app(self.locations_path, self.users_path))

    def register(self, email: str = "demo@example.com") -> str:
        response = self.client.post("/api/auth/register", json={
            "name": "Demo User", "email": email, "password": "password123",
        })
        self.assertEqual(response.status_code, 201)
        return response.json()["token"]

    def test_guest_is_locked_and_cannot_unlock(self):
        locations = self.client.get("/api/locations").json()
        self.assertFalse(any(item["unlocked"] for item in locations))
        self.assertEqual(self.client.put("/api/locations/interpret/unlock").status_code, 401)

    def test_account_status_and_unlock_are_scoped(self):
        first_token = self.register()
        second_token = self.register("second@example.com")
        first_headers = {"Authorization": f"Bearer {first_token}"}
        second_headers = {"Authorization": f"Bearer {second_token}"}

        status = self.client.get("/api/auth/status", headers=first_headers).json()
        self.assertTrue(status["authenticated"])
        self.assertEqual(status["email"], "demo@example.com")

        response = self.client.put(
            "/api/locations/interpret/unlock", headers=first_headers,
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["unlocked"])

        first_locations = self.client.get("/api/locations", headers=first_headers).json()
        second_locations = self.client.get("/api/locations", headers=second_headers).json()
        self.assertTrue(first_locations[0]["unlocked"])
        self.assertFalse(second_locations[0]["unlocked"])


if __name__ == "__main__":
    unittest.main()
