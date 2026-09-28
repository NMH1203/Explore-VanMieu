from pydantic import BaseModel


class CheckinVerificationResponse(BaseModel):
    verified: bool
    location_id: str | None = None
    detected_label: str | None = None
    confidence: float | None = None
    distance_meters: float | None = None
    message: str
