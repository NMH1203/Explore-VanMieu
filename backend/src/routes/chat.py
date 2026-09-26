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
