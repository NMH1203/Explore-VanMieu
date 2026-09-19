from fastapi import FastAPI, HTTPException, status, Response, Cookie
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from backend.src.config.db import engine
from backend.src.models.auth import (
    RegisterRequest,
    UserResponse,
    LoginRequest,
    )
from backend.src.models.user import User
from backend.src.services.passwords import hash_password, verify_password
from backend.src.services.tokens import create_access_token,get_user_id_from_token
app = FastAPI()

@app.post(
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
            raise HTTPException(status_code=409, detail="Email đã được sử dụng")

        user = User(
            email=email,
            username=data.username,
            password_hash=hash_password(data.password),
        )
        session.add(user)

        try:
            session.commit()
        except IntegrityError:
            session.rollback()
            raise HTTPException(status_code=409, detail="Email đã được sử dụng")

        session.refresh(user)
        return user

@app.post("/auth/login", response_model=UserResponse)
def login(data: LoginRequest, response: Response):
    email = str(data.email).strip().lower()

    with Session(engine) as session:
        user = session.exec(
            select(User).where(User.email == email)
        ).first()

        if user is None or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=401,
                detail="Email hoặc mật khẩu không đúng",
            )

        token = create_access_token(user.user_id)
        response.set_cookie(
            key="session",
            value=token,
            httponly=True,
            secure=False,  # Chỉ cho lúc học trên localhost dùng HTTP
            samesite="lax",
            max_age=1800,
            path="/",
        )
        return user

@app.get("/auth/me", response_model=UserResponse)
def read_me(
    session_token: str | None = Cookie(default=None, alias="session"),
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
            raise HTTPException(status_code=401, detail="Tài khoản không tồn tại")

        return user
@app.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(key="session", path="/")
    return {"message": "Đã đăng xuất"}