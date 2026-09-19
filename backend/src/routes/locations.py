"""HTTP endpoints for reading progress and manually unlocking locations."""

from fastapi import APIRouter, Header, HTTPException

from backend.src.models.location import LocationStatus
from backend.src.repositories.location_repository import LocationRepository
from backend.src.repositories.user_repository import UserRepository
from backend.src.routes.auth import bearer_user_id


def create_location_router(repository: LocationRepository, users: UserRepository) -> APIRouter:
    """Bind both endpoints to the same repository and its write lock."""
    router = APIRouter(prefix="/api/locations", tags=["Locations"])

    @router.get("", response_model=list[LocationStatus])
    def list_locations(authorization: str | None = Header(default=None)):
        """Guests see all locations locked; signed-in users receive their own progress."""
        locations = repository.list_locations()
        user_id = bearer_user_id(authorization)
        user = users.get(user_id) if user_id else None
        unlocked_ids = set(user["unlocked_location_ids"]) if user else set()
        return [item.model_copy(update={"unlocked": item.id in unlocked_ids}) for item in locations]

    @router.put("/{location_id}/unlock", response_model=LocationStatus)
    def unlock_location(location_id: str, authorization: str | None = Header(default=None)):
        """Persist an unlock for the authenticated account."""
        user_id = bearer_user_id(authorization)
        if user_id is None or users.get(user_id) is None:
            raise HTTPException(status_code=401, detail="Authentication required.")
        locations = repository.list_locations()
        location = next((item for item in locations if item.id == location_id), None)
        if location is None:
            raise HTTPException(status_code=404, detail="Location not found.")
        users.unlock(user_id, location_id)
        return location.model_copy(update={"unlocked": True})

    return router
