"""JSON-backed user accounts with password hashing and per-user progress."""

import base64
import hashlib
import hmac
import json
import os
import tempfile
import uuid
from pathlib import Path
from threading import RLock


class UserRepository:
    def __init__(self, path: Path):
        self.path = path
        self._lock = RLock()
        self.path.parent.mkdir(parents=True, exist_ok=True)
        if not self.path.exists():
            self.path.write_text("[]\n", encoding="utf-8")

    def register(self, name: str, email: str, password: str) -> dict:
        with self._lock:
            users = self._read()
            normalized_email = email.strip().lower()
            if any(user["email"] == normalized_email for user in users):
                raise ValueError("Account already exists.")
            salt = os.urandom(16)
            user = {
                "id": str(uuid.uuid4()),
                "name": name.strip(),
                "email": normalized_email,
                "password_salt": base64.b64encode(salt).decode("ascii"),
                "password_hash": self._hash_password(password, salt),
                "unlocked_location_ids": [],
            }
            users.append(user)
            self._save(users)
            return user

    def authenticate(self, email: str, password: str) -> dict | None:
        with self._lock:
            normalized_email = email.strip().lower()
            user = next((item for item in self._read() if item["email"] == normalized_email), None)
            if user is None:
                return None
            salt = base64.b64decode(user["password_salt"])
            candidate = self._hash_password(password, salt)
            return user if hmac.compare_digest(candidate, user["password_hash"]) else None

    def get(self, user_id: str) -> dict | None:
        with self._lock:
            return next((item for item in self._read() if item["id"] == user_id), None)

    def unlock(self, user_id: str, location_id: str) -> dict:
        with self._lock:
            users = self._read()
            user = next((item for item in users if item["id"] == user_id), None)
            if user is None:
                raise KeyError(user_id)
            if location_id not in user["unlocked_location_ids"]:
                user["unlocked_location_ids"].append(location_id)
                self._save(users)
            return user

    def _read(self) -> list[dict]:
        data = json.loads(self.path.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            raise ValueError("User storage must contain a JSON array.")
        return data

    def _save(self, users: list[dict]) -> None:
        temporary_path = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w", encoding="utf-8", dir=self.path.parent, suffix=".tmp", delete=False,
            ) as temporary:
                temporary_path = Path(temporary.name)
                json.dump(users, temporary, ensure_ascii=False, indent=2)
                temporary.write("\n")
                temporary.flush()
                os.fsync(temporary.fileno())
            os.replace(temporary_path, self.path)
        finally:
            if temporary_path is not None:
                temporary_path.unlink(missing_ok=True)

    @staticmethod
    def _hash_password(password: str, salt: bytes) -> str:
        digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200_000)
        return base64.b64encode(digest).decode("ascii")
