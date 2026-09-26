"""Application entry point for the Explore Van Mieu API.

This file assembles the route modules under ``backend/src/routes``. Database
sessions come from ``backend/src/config/db.py`` and route behavior is
implemented in the corresponding route and service modules.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from backend.src.routes.auth import router as auth_router
from backend.src.routes.locations import create_location_router
from backend.src.routes.chat import router as chat_router
from backend.src.routes.checkins import router as checkins_router
from backend.src.routes.progress import router as progress_router
from backend.src.routes.target import router as target_router
from backend.src.services.targets import assign_targets_to_existing_users
from backend.src.routes.rewards import router as rewards_router
from backend.src.models.reward import RewardClaim, RewardJourney
from backend.src.config.db import engine


def create_app() -> FastAPI:
    assign_targets_to_existing_users()
    RewardClaim.__table__.create(engine, checkfirst=True)
    RewardJourney.__table__.create(engine, checkfirst=True)
    application = FastAPI(title="Explore Van Mieu Backend")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://localhost:5173",
            "https://127.0.0.1:5173",
        ],
        allow_methods=["GET", "POST", "PUT"],
        allow_headers=["Content-Type"],
        allow_credentials=True,
    )

    @application.middleware("http")
    async def disable_progress_cache(request: Request, call_next):
        response = await call_next(request)
        if request.url.path == "/api" or request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store"
        return response

    # Register the SQLite-backed location API implemented in routes/locations.py.
    application.include_router(create_location_router())
    application.include_router(progress_router)
    application.include_router(checkins_router)
    application.include_router(chat_router)
    application.include_router(target_router)
    application.include_router(rewards_router)
    application.include_router(auth_router)

    return application


app = create_app()
