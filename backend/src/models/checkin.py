from pydantic import BaseModel


class CheckinVerificationResponse(BaseModel):
    verified: bool
    location_id: str
    detected_label: str | None = None
    confidence: float | None = None
    distance_meters: float
    message: str
