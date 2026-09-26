"""Application entry point for the Explore Van Mieu API.

This file assembles the route modules under ``backend/src/routes``. Database
sessions come from ``backend/src/config/db.py`` and route behavior is
implemented in the corresponding route and service modules.
"""

from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from backend.src.config.db import engine
from backend.src.dependencies.auth import get_current_user
from backend.src.models.auth import LoginRequest, RegisterRequest, UserResponse
from backend.src.models.user import User
from backend.src.routes.locations import create_location_router
from backend.src.routes.chat import router as chat_router
from backend.src.routes.checkins import router as checkins_router
from backend.src.routes.progress import router as progress_router
from backend.src.services.passwords import hash_password, verify_password
from backend.src.services.tokens import create_access_token


def create_app() -> FastAPI:
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

    @application.post(
        "/api/auth/register",
        response_model=UserResponse,
        status_code=status.HTTP_201_CREATED,
    )
    def register(data: RegisterRequest):
        email = str(data.email).strip().lower()

        with Session(engine) as session:
            existing_user = session.exec(
                select(User).where(User.email == email)
            ).first()

            if existing_user:
                raise HTTPException(
                    status_code=409,
                    detail="Email is already registered.",
                )

            user = User(
                email=email,
                username=data.username,
                password_hash=hash_password(data.password),
            )
            session.add(user)

            try:
                session.commit()
            except IntegrityError as error:
                session.rollback()
                raise HTTPException(
                    status_code=409,
                    detail="Email is already registered.",
                ) from error

            session.refresh(user)
            return user

    @application.post("/api/auth/login", response_model=UserResponse)
    def login(data: LoginRequest, request: Request, response: Response):
        email = str(data.email).strip().lower()

        with Session(engine) as session:
            user = session.exec(
                select(User).where(User.email == email)
            ).first()

            if user is None or not verify_password(
                data.password,
                user.password_hash,
            ):
                raise HTTPException(
                    status_code=401,
                    detail="The email or password is incorrect.",
                )

            token = create_access_token(user.user_id)
            response.set_cookie(
                key="session",
                value=token,
                httponly=True,
                # Browsers send Secure cookies only over HTTPS. Keep HTTP localhost
                # development usable while protecting sessions on HTTPS deployments.
                secure=request.url.scheme == "https",
                samesite="lax",
                max_age=24*60*60,
                path="/",
            )
            return user

    @application.get("/api/auth/me", response_model=UserResponse)
    def read_me(current_user: User = Depends(get_current_user)):
        return current_user

    @application.post("/api/auth/logout")
    def logout(response: Response):
        response.delete_cookie(key="session", path="/")
        return {"message": "Signed out successfully."}

    return application


app = create_app()
