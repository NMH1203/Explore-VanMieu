from sqlmodel import SQLModel


# API response schema for /api/target returning the user's assigned single destination
class TargetLocationResponse(SQLModel):
    location_id: str
    name: str
    story_summary: str

