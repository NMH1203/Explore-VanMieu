from datetime import datetime, timezone

from sqlalchemy import Column, Text
from sqlmodel import Field, SQLModel


class HeritageLocation(SQLModel, table=True):
    __tablename__ = "heritage_locations"

    location_id: str = Field(
        primary_key=True,
        max_length=32,
    )
    yolo_label: str = Field(
        unique=True,
        index=True,
        max_length=64,
    )
    name: str = Field(max_length=128)
    sequence_order: int = Field(index=True)

    latitude: float
    longitude: float
    geofence_radius: float

    story_summary: str = Field(
        sa_column=Column(Text, nullable=False),
    )
    deep_history: str | None = Field(
        default=None,
        sa_column=Column(Text, nullable=True),
    )
    audio_url: str | None = Field(
        default=None,
        max_length=255,
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )