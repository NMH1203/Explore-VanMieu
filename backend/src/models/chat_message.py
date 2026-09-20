from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Column, Text
from sqlmodel import Field, SQLModel


class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"

    message_id: str = Field(
        default_factory=lambda: uuid4().hex,
        primary_key=True,
        max_length=32,
    )
    user_id: str = Field(
        foreign_key="users.user_id",
        index=True,
        max_length=32,
    )
    location_id: str = Field(
        foreign_key="heritage_locations.location_id",
        index=True,
        max_length=32,
    )

    user_question: str = Field(
        sa_column=Column(Text, nullable=False),
    )
    gemini_answer: str = Field(
        sa_column=Column(Text, nullable=False),
    )

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
    )