"""Data models received from and returned by authentication APIs."""

from pydantic import EmailStr
from sqlmodel import Field, SQLModel

class RegisterRequest(SQLModel):
    email: EmailStr
    password: str = Field(min_length=8)
    username: str | None = None


class UserResponse(SQLModel):
    user_id: str
    email: str
    username: str | None
    target_location_id: str | None = None

class LoginRequest(SQLModel):
    email: EmailStr
    password: str
