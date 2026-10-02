"""Authentication dependencies shared by protected API routes."""

from fastapi import Cookie, HTTPException, status
from sqlmodel import Session
from backend.src.config.db import engine
from backend.src.models.user import User
from backend.src.services.tokens import get_user_id_from_token


# FastAPI dependency: extracts and verifies the JWT session cookie, then retrieves the user from DB
def get_current_user(
    session_token: str | None = Cookie(default=None, alias="session"),
) -> User:
    """Return the user identified by the JWT stored in the session cookie."""
    user_id = get_user_id_from_token(session_token) if session_token else None

    # Raise 401 if token is missing, invalid, or expired
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="The token is invalid or has expired.",
        )

    # Fetch user model from database
    with Session(engine) as session:
        user = session.get(User, user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="The user account does not exist.",
            )
        return user

