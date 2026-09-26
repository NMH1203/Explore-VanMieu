from sqlmodel import SQLModel


class TargetLocationResponse(SQLModel):
    location_id: str
    name: str
    story_summary: str
