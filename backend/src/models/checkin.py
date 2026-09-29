from datetime import datetime

from pydantic import BaseModel


class CheckinVerificationResponse(BaseModel):
    verified: bool
    location_id: str | None = None
    detected_label: str | None = None
    confidence: float | None = None
    distance_meters: float | None = None
    message: str


class CheckinHistoryResponse(BaseModel):
    log_id: str
    location_id: str
    location_name: str
    submitted_lat: float
    submitted_lon: float
    distance_meters: float
    detected_label: str | None = None
    confidence: float | None = None
    verification_status: str
    logged_at: datetime
