"""Application entry point for the Explore Van Mieu API."""

import logging
from pathlib import Path

from fastapi import Cookie, FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from backend.src.config.db import engine
from backend.src.models.auth import LoginRequest, RegisterRequest, UserResponse
from backend.src.models.user import User
from backend.src.repositories.location_repository import LocationRepository
from backend.src.routes.locations import create_location_router
from backend.src.services.passwords import hash_password, verify_password
from backend.src.services.tokens import create_access_token, get_user_id_from_token

DEFAULT_DATA_PATH = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "location_statuses.json"
)

logger = logging.getLogger(__name__)


def create_app(data_path: Path = DEFAULT_DATA_PATH) -> FastAPI:
    application = FastAPI(title="Explore Van Mieu Backend")

    application.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_methods=["GET", "POST", "PUT"],
        allow_headers=["Content-Type"],
        allow_credentials=True,
    )

    @application.middleware("http")
    async def disable_progress_cache(request: Request, call_next):
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        return response

    application.include_router(
        create_location_router(LocationRepository(data_path))
    )

    @application.post(
        "/auth/register",
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
                    detail="Email đã được sử dụng",
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
                    detail="Email đã được sử dụng",
                ) from error

            session.refresh(user)
            return user

    @application.post("/auth/login", response_model=UserResponse)
    def login(data: LoginRequest, response: Response):
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
                    detail="Email hoặc mật khẩu không đúng",
                )

            token = create_access_token(user.user_id)
            response.set_cookie(
                key="session",
                value=token,
                httponly=True,
                secure=False,
                samesite="lax",
                max_age=1800,
                path="/",
            )
            return user

    @application.get("/auth/me", response_model=UserResponse)
    def read_me(
        session_token: str | None = Cookie(
            default=None,
            alias="session",
        ),
    ):
        user_id = (
            get_user_id_from_token(session_token)
            if session_token
            else None
        )

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Token không hợp lệ hoặc đã hết hạn",
            )

        with Session(engine) as session:
            user = session.get(User, user_id)

            if user is None:
                raise HTTPException(
                    status_code=401,
                    detail="Tài khoản không tồn tại",
                )

            return user

    @application.post("/auth/logout")
    def logout(response: Response):
        response.delete_cookie(key="session", path="/")
        return {"message": "Đã đăng xuất"}

    async def storage_error_handler(
        request: Request,
        error: Exception,
    ):
        logger.error("Location storage failed: %s", error)
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Location storage is unavailable.",
            },
        )

    application.add_exception_handler(
        OSError,
        storage_error_handler,
    )
    application.add_exception_handler(
        ValueError,
        storage_error_handler,
    )

    return application


app = create_app()
