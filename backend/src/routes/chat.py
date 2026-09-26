from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from backend.src.config.db import engine
from backend.src.dependencies.auth import get_current_user
from backend.src.models.chat import ChatRequest, ChatResponse
from backend.src.models.chat_message import ChatMessage
from backend.src.models.heritage_location import HeritageLocation
from backend.src.models.user import User
from backend.src.models.user_history import UserHistory
from backend.src.services.chat import (
    ChatConfigurationError,
    ChatProviderError,
    answer_heritage_question,
)

router = APIRouter(prefix="/api/chat", tags=["chat"])

FIGURE_CONTEXTS = {
    "figure-ly-thanh-tong": {
        "name": "Ly Thanh Tong",
        "summary": "The king who founded the Temple of Literature in Thang Long in 1070.",
        "history": "His foundation established a lasting place for honoring Confucius, learning, and Vietnamese scholarly tradition.",
    },
    "figure-ly-nhan-tong": {
        "name": "Ly Nhan Tong",
        "summary": "The king who established the Imperial Academy in 1076 after the first royal examination of 1075.",
        "history": "His educational policies helped form an institution for cultivating talented people for the country.",
    },
    "figure-le-thanh-tong": {
        "name": "Le Thanh Tong",
        "summary": "A reforming king who promoted examinations and the recognition of talented scholars.",
        "history": "In 1484 he ordered the first doctoral steles to honor successful candidates and encourage learning.",
    },
    "figure-chu-van-an": {
        "name": "Chu Van An",
        "summary": "A celebrated teacher and rector of the Imperial Academy, remembered for integrity and moral courage.",
        "history": "His life became an enduring Vietnamese model of the principled teacher devoted to education and public ethics.",
    },
    "figure-confucius": {
        "name": "Confucius",
        "summary": "The influential thinker and teacher honored at the Temple of Literature.",
        "history": "His teachings on learning, ethical conduct, and social responsibility shaped Confucian education across East Asia.",
    },
    "figure-four-sages": {
        "name": "The Four Sages",
        "summary": "Yan Hui, Zengzi, Zisi, and Mencius are honored alongside Confucius.",
        "history": "They represent successive generations that transmitted and developed the Confucian intellectual tradition.",
    },
}


def to_response(message: ChatMessage) -> ChatResponse:
    return ChatResponse(
        message_id=message.message_id,
        location_id=message.location_id,
        question=message.user_question,
        answer=message.gemini_answer,
        created_at=message.created_at,
    )


def require_unlocked_location(
    session: Session,
    user_id: str,
    location_id: str,
) -> HeritageLocation:
    location = session.get(HeritageLocation, location_id)
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found.")

    history = session.get(UserHistory, (user_id, location_id))
    if history is None or not history.status:
        raise HTTPException(
            status_code=403,
            detail="Unlock this location before using the AI guide.",
        )
    return location


@router.get("/{location_id}", response_model=list[ChatResponse])
def list_chat_history(
    location_id: str,
    current_user: User = Depends(get_current_user),
):
    if location_id in FIGURE_CONTEXTS:
        return []
    with Session(engine) as session:
        require_unlocked_location(
            session,
            current_user.user_id,
            location_id,
        )
        messages = session.exec(
            select(ChatMessage)
            .where(ChatMessage.user_id == current_user.user_id)
            .where(ChatMessage.location_id == location_id)
            .order_by(ChatMessage.created_at.desc())
            .limit(50)
        ).all()
        return [to_response(message) for message in reversed(messages)]


@router.post("", response_model=ChatResponse)
async def ask_heritage_guide(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    figure = FIGURE_CONTEXTS.get(data.location_id)
    if figure:
        location_name = figure["name"]
        story_summary = figure["summary"]
        deep_history = figure["history"]
    else:
        with Session(engine) as session:
            location = require_unlocked_location(
                session,
                current_user.user_id,
                data.location_id,
            )

            location_name = location.name
            story_summary = location.story_summary
            deep_history = location.deep_history

    try:
        answer = await answer_heritage_question(
            location_name=location_name,
            story_summary=story_summary,
            deep_history=deep_history,
            question=data.question,
        )
    except ChatConfigurationError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    except ChatProviderError as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    if figure:
        return ChatResponse(
            message_id=uuid4().hex,
            location_id=data.location_id,
            question=data.question,
            answer=answer,
            created_at=datetime.now(timezone.utc),
        )

    with Session(engine) as session:
        message = ChatMessage(
            user_id=current_user.user_id,
            location_id=data.location_id,
            user_question=data.question,
            gemini_answer=answer,
        )
        session.add(message)
        session.commit()
        session.refresh(message)
        return to_response(message)
