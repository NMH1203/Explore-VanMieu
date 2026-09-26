from datetime import datetime, timezone
from uuid import uuid4
from sqlalchemy import Column, JSON
from sqlmodel import Field, SQLModel

class User(SQLModel, table=True):
    __tablename__="users"
    user_id: str = Field(
        default_factory=lambda: uuid4().hex,
        primary_key=True,
        max_length=32,
    )
    email: str = Field(max_length=255, unique=True, index=True)
    password_hash: str = Field(max_length= 255)
    username: str | None = Field(default=None, max_length= 64)
    target_location_id: str | None = Field(default=None, max_length=32, index=True)
    unlocked_location_ids: list[str] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False),
    )
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
