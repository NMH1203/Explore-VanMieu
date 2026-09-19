"""Registration, login, and account-status endpoints."""

from fastapi import APIRouter, Header, HTTPException

from backend.src.models.account import AccountStatus, AuthResponse, Credentials, Registration
from backend.src.repositories.user_repository import UserRepository
from backend.src.services.auth_service import create_token, read_token


def account_status(user: dict | None) -> AccountStatus:
    if user is None:
        return AccountStatus(authenticated=False)
    return AccountStatus(
        authenticated=True, id=user["id"], name=user["name"], email=user["email"],
    )


def bearer_user_id(authorization: str | None) -> str | None:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    return read_token(authorization.removeprefix("Bearer ").strip())


def create_auth_router(users: UserRepository) -> APIRouter:
    router = APIRouter(prefix="/api/auth", tags=["Authentication"])

    @router.post("/register", response_model=AuthResponse, status_code=201)
    def register(payload: Registration):
        try:
            user = users.register(payload.name, payload.email, payload.password)
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error
        return AuthResponse(token=create_token(user["id"]), account=account_status(user))

    @router.post("/login", response_model=AuthResponse)
    def login(payload: Credentials):
        user = users.authenticate(payload.email, payload.password)
        if user is None:
            raise HTTPException(status_code=401, detail="Email or password is incorrect.")
        return AuthResponse(token=create_token(user["id"]), account=account_status(user))

    @router.get("/status", response_model=AccountStatus)
    def status(authorization: str | None = Header(default=None)):
        user_id = bearer_user_id(authorization)
        return account_status(users.get(user_id) if user_id else None)

    return router
