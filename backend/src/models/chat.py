from datetime import datetime
from pydantic import BaseModel, Field, field_validator


# Request schema for submitting a question to the AI Heritage Guide
class ChatRequest(BaseModel):
    location_id: str = Field(min_length=1, max_length=32)
    question: str = Field(min_length=2, max_length=500)

    # Clean whitespace and validate question length
    @field_validator("question")
    @classmethod
    def normalize_question(cls, value: str) -> str:
        normalized = " ".join(value.split())
        if len(normalized) < 2:
            raise ValueError("The question must contain at least 2 characters.")
        return normalized


# Response schema returning the AI guide's generated answer and message metadata
class ChatResponse(BaseModel):
    message_id: str
    location_id: str
    question: str
    answer: str
    created_at: datetime

