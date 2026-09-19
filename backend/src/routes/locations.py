"""Location progress endpoints backed by the authenticated SQL user."""

from fastapi import APIRouter, Cookie, HTTPException
from sqlmodel import Session

from backend.src.config.db import engine
from backend.src.models.location import LocationStatus
from backend.src.models.user import User
from backend.src.repositories.location_repository import LocationRepository
from backend.src.services.tokens import get_user_id_from_token


def create_location_router(repository: LocationRepository) -> APIRouter:
    router = APIRouter(prefix="/api/locations", tags=["Locations"])

    def current_user(session_token: str | None) -> User | None:
        user_id = get_user_id_from_token(session_token) if session_token else None
        if user_id is None:
            return None
        with Session(engine) as database:
            return database.get(User, user_id)

    @router.get("", response_model=list[LocationStatus])
    def list_locations(session_token: str | None = Cookie(default=None, alias="session")):
        """Guests see all locations locked; signed-in users receive their own progress."""
        locations = repository.list_locations()
        user = current_user(session_token)
        unlocked_ids = set(user.unlocked_location_ids) if user else set()
        return [item.model_copy(update={"unlocked": item.id in unlocked_ids}) for item in locations]

    @router.put("/{location_id}/unlock", response_model=LocationStatus)
    def unlock_location(
        location_id: str,
        session_token: str | None = Cookie(default=None, alias="session"),
    ):
        """Persist an unlock for the authenticated account."""
        user_id = get_user_id_from_token(session_token) if session_token else None
        if user_id is None:
            raise HTTPException(status_code=401, detail="Authentication required.")
        locations = repository.list_locations()
        location = next((item for item in locations if item.id == location_id), None)
        if location is None:
            raise HTTPException(status_code=404, detail="Location not found.")
        with Session(engine) as database:
            user = database.get(User, user_id)
            if user is None:
                raise HTTPException(status_code=401, detail="Authentication required.")
            unlocked_ids = list(user.unlocked_location_ids or [])
            if location_id not in unlocked_ids:
                unlocked_ids.append(location_id)
                user.unlocked_location_ids = unlocked_ids
                database.add(user)
                database.commit()
        return location.model_copy(update={"unlocked": True})

    return router
