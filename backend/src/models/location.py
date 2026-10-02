"""Data contracts shared by JSON storage and the HTTP API."""

from pydantic import BaseModel, ConfigDict


# Response model returning a location's ID and boolean unlock status for API consumers
class LocationStatus(BaseModel):
    """Keep the existing frontend identifier and an explicit unlock flag."""

    model_config = ConfigDict(strict=True, extra="forbid")

    id: str
    unlocked: bool

