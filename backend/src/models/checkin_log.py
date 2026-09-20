from datetime import datetime, timezone
from uuid import uuid4

from sqlmodel import Field, SQLModel


class CheckinLog(SQLModel, table=True):
    __tablename__ = "checkin_logs"

    log_id: str = Field(
        default_factory=lambda: uuid4().hex,
        primary_key=True,
        max_length=32,
    )
    user_id: str = Field(
        foreign_key="users.user_id",
        index=True,
        max_length=32,
    )
    target_location_id: str = Field(
        foreign_key="heritage_locations.location_id",
        index=True,
        max_length=32,
    )

    submitted_lat: float
    submitted_lon: float
    distance_meters: float

    yolo_detected_label: str | None = Field(
        default=None,
        max_length=64,
    )
    yolo_confidence: float | None = Field(default=None)

    verification_status: str = Field(
        default="pending",
        index=True,
        max_length=32,
    )
    logged_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )