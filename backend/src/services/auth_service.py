"""Small signed-token service for the local prototype."""

import base64
import hashlib
import hmac
import json
import os
import time

TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7
TOKEN_SECRET = os.environ.get("EXPLORE_VAN_MIEU_TOKEN_SECRET", "local-development-secret").encode()


def create_token(user_id: str) -> str:
    payload = {"sub": user_id, "exp": int(time.time()) + TOKEN_TTL_SECONDS}
    encoded = base64.urlsafe_b64encode(json.dumps(payload).encode()).rstrip(b"=")
    signature = hmac.new(TOKEN_SECRET, encoded, hashlib.sha256).digest()
    return f"{encoded.decode()}.{base64.urlsafe_b64encode(signature).rstrip(b'=').decode()}"


def read_token(token: str) -> str | None:
    try:
        encoded, supplied_signature = token.split(".", 1)
        encoded_bytes = encoded.encode()
        expected = hmac.new(TOKEN_SECRET, encoded_bytes, hashlib.sha256).digest()
        padding = "=" * (-len(supplied_signature) % 4)
        actual = base64.urlsafe_b64decode(supplied_signature + padding)
        if not hmac.compare_digest(expected, actual):
            return None
        payload_padding = "=" * (-len(encoded) % 4)
        payload = json.loads(base64.urlsafe_b64decode(encoded + payload_padding))
        if payload.get("exp", 0) < time.time():
            return None
        return payload.get("sub")
    except (ValueError, TypeError, json.JSONDecodeError):
        return None
