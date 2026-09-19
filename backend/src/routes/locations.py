"""HTTP endpoints for reading progress and manually unlocking locations."""

from fastapi import APIRouter, HTTPException

from backend.src.models.location import LocationStatus
from backend.src.repositories.location_repository import LocationRepository


def create_location_router(repository: LocationRepository) -> APIRouter:
    """Bind both endpoints to the same repository and its write lock."""
    router = APIRouter(prefix="/api/locations", tags=["Locations"])

    @router.get("", response_model=list[LocationStatus])
    def list_locations():
        """Return persisted unlock flags for every known location."""
        return repository.list_locations()

    @router.put("/{location_id}/unlock", response_model=LocationStatus)
    def unlock_location(location_id: str):
        """Unlock directly for now; GPS and image verification are deferred."""
        try:
            return repository.unlock(location_id)
        except KeyError as error:
            raise HTTPException(status_code=404, detail="Location not found.") from error

    return router
