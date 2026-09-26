import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
from dotenv import load_dotenv

project_root = Path(__file__).resolve().parents[3]
load_dotenv(project_root / ".env")

secret_key = os.getenv("JWT_SECRET_KEY")
if not secret_key:
    raise RuntimeError("JWT_SECRET_KEY is missing from the .env file.")


def create_access_token(user_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "iat": now,
        "exp": now + timedelta(hours=24),
    }
    return jwt.encode(payload, secret_key, algorithm="HS256")

def get_user_id_from_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        user_id = payload.get("sub")
        return user_id if isinstance(user_id, str) else None
    except jwt.InvalidTokenError:
        return None
