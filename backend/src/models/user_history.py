from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class UserHistory(SQLModel, table=True):
    __tablename__ = "user_history"

    user_id: str = Field(
        foreign_key="users.user_id",
        primary_key=True,
        max_length=32,
    )
    location_id: str = Field(
        foreign_key="heritage_locations.location_id",
        primary_key=True,
        max_length=32,
    )

    unlocked_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    status: bool = Field(default=True)