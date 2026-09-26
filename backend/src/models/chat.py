from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    location_id: str = Field(min_length=1, max_length=32)
    question: str = Field(min_length=2, max_length=500)

    @field_validator("question")
    @classmethod
    def normalize_question(cls, value: str) -> str:
        normalized = " ".join(value.split())
        if len(normalized) < 2:
            raise ValueError("The question must contain at least 2 characters.")
        return normalized


class ChatResponse(BaseModel):
    message_id: str
    location_id: str
    question: str
    answer: str
    created_at: datetime
