"""Authentication endpoints for account creation and cookie sessions."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from backend.src.config.db import engine
from backend.src.dependencies.auth import get_current_user
from backend.src.models.auth import LoginRequest, RegisterRequest, UserResponse
from backend.src.models.user import User
from backend.src.services.passwords import hash_password, verify_password
from backend.src.services.targets import assign_target_location
from backend.src.services.tokens import create_access_token


router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(data: RegisterRequest):
    email = str(data.email).strip().lower()

    with Session(engine) as session:
        existing_user = session.exec(select(User).where(User.email == email)).first()
        if existing_user:
            raise HTTPException(status_code=409, detail="Email is already registered.")

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
        assign_target_location(session, user)
        return user


@router.post("/login", response_model=UserResponse)
def login(data: LoginRequest, request: Request, response: Response):
    email = str(data.email).strip().lower()

    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == email)).first()
        if user is None or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=401,
                detail="The email or password is incorrect.",
            )

        assign_target_location(session, user)
        token = create_access_token(user.user_id)
        response.set_cookie(
            key="session",
            value=token,
            httponly=True,
            secure=request.url.scheme == "https",
            samesite="lax",
            max_age=24 * 60 * 60,
            path="/",
        )
        return user


@router.get("/me", response_model=UserResponse)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="session", path="/")
    return {"message": "Signed out successfully."}
