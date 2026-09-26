from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class UserJourney(SQLModel, table=True):
    __tablename__ = "user_journeys"

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: str = Field(
        foreign_key="users.user_id",
        index=True,
        max_length=32,
    )

    location_ids: str

    completed: bool = Field(default=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )