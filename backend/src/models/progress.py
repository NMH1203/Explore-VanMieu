"""API response models for a user's heritage progress."""

from datetime import datetime
from sqlmodel import SQLModel


# API response schema returning individual unlocked location progress with timestamp
class ProgressResponse(SQLModel):
    location_id: str
    unlocked_at: datetime
    status: bool

