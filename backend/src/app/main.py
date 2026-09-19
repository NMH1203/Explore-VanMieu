"""Application entry point for the JSON-backed location progress API."""

import logging
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.src.repositories.location_repository import LocationRepository
from backend.src.repositories.user_repository import UserRepository
from backend.src.routes.auth import create_auth_router
from backend.src.routes.locations import create_location_router

DEFAULT_DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "location_statuses.json"
DEFAULT_USERS_PATH = Path(__file__).resolve().parents[2] / "data" / "users.json"
logger = logging.getLogger(__name__)


def create_app(data_path: Path = DEFAULT_DATA_PATH, users_path: Path = DEFAULT_USERS_PATH) -> FastAPI:
    """Allow isolated data files in tests without changing the real progress file."""
    application = FastAPI(title="Explore Van Mieu Backend")
    # Allow the local Vite frontend to call this API on a different port.
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
        allow_methods=["GET", "POST", "PUT"],
        allow_headers=["Content-Type", "Authorization"],
    )

    @application.middleware("http")
    async def disable_progress_cache(request: Request, call_next):
        """Make clients fetch fresh progress after manual JSON edits."""
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        return response

    users = UserRepository(users_path)
    application.include_router(create_auth_router(users))
    application.include_router(create_location_router(LocationRepository(data_path), users))

    async def storage_error_handler(request: Request, error: Exception):
        # Log diagnostic details on the server without exposing filesystem paths.
        logger.error("Location storage failed: %s", error)
        return JSONResponse(status_code=500, content={"detail": "Location storage is unavailable."})

    application.add_exception_handler(OSError, storage_error_handler)
    application.add_exception_handler(ValueError, storage_error_handler)
    return application


app = create_app()
