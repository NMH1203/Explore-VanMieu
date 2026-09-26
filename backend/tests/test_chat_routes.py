import unittest
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from backend.src.models.chat import ChatRequest
from backend.src.models.chat_message import ChatMessage
from backend.src.models.heritage_location import HeritageLocation
from backend.src.models.user import User
from backend.src.models.user_history import UserHistory
from backend.src.routes.chat import ask_heritage_guide, list_chat_history


class ChatRouteTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        self.addCleanup(self.engine.dispose)
        SQLModel.metadata.create_all(self.engine)

        user = User(email="chat@example.com", password_hash="unused")
        other_user = User(email="other-chat@example.com", password_hash="unused")
        location = HeritageLocation(
            location_id="interpret",
            yolo_label="khue_van_cac",
            name="Khuê Văn Các",
            sequence_order=3,
            latitude=21.02868,
            longitude=105.83592,
            geofence_radius=30,
            story_summary="Biểu tượng của văn chương và ánh sáng tri thức.",
            deep_history="Khuê Văn Các được xây dựng vào đầu thế kỷ XIX.",
        )
        with Session(self.engine) as session:
            session.add(user)
            session.add(other_user)
            session.add(location)
            session.commit()
            session.refresh(user)
            session.refresh(other_user)
            self.user_id = user.user_id
            self.other_user_id = other_user.user_id
            session.add(
                UserHistory(
                    user_id=self.user_id,
                    location_id="interpret",
                )
            )
            session.commit()

        self.user = User(
            user_id=self.user_id,
            email="chat@example.com",
            password_hash="unused",
        )
        self.other_user = User(
            user_id=self.other_user_id,
            email="other-chat@example.com",
            password_hash="unused",
        )
        self.engine_patch = patch("backend.src.routes.chat.engine", self.engine)
        self.engine_patch.start()
        self.addCleanup(self.engine_patch.stop)

    async def test_answer_is_saved_and_returned_in_history(self):
        with patch(
            "backend.src.routes.chat.answer_heritage_question",
            new=AsyncMock(return_value="Đây là biểu tượng của văn chương."),
        ):
            response = await ask_heritage_guide(
                ChatRequest(
                    location_id="interpret",
                    question="Công trình này có ý nghĩa gì?",
                ),
                self.user,
            )

        self.assertEqual(response.answer, "Đây là biểu tượng của văn chương.")
        history = list_chat_history("interpret", self.user)
        self.assertEqual(len(history), 1)
        self.assertEqual(history[0].question, "Công trình này có ý nghĩa gì?")

    async def test_history_is_isolated_between_users(self):
        with Session(self.engine) as session:
            session.add(
                UserHistory(
                    user_id=self.other_user_id,
                    location_id="interpret",
                )
            )
            session.add(
                ChatMessage(
                    user_id=self.user_id,
                    location_id="interpret",
                    user_question="Câu hỏi riêng",
                    gemini_answer="Câu trả lời riêng",
                )
            )
            session.commit()

        self.assertEqual(list_chat_history("interpret", self.other_user), [])

    async def test_unknown_location_does_not_call_ai(self):
        answer_mock = AsyncMock()
        with patch(
            "backend.src.routes.chat.answer_heritage_question",
            new=answer_mock,
        ):
            with self.assertRaises(HTTPException) as caught:
                await ask_heritage_guide(
                    ChatRequest(
                        location_id="missing",
                        question="Đây là đâu?",
                    ),
                    self.user,
                )

        self.assertEqual(caught.exception.status_code, 404)
        answer_mock.assert_not_awaited()

    async def test_locked_location_does_not_call_ai(self):
        answer_mock = AsyncMock()
        with patch(
            "backend.src.routes.chat.answer_heritage_question",
            new=answer_mock,
        ):
            with self.assertRaises(HTTPException) as caught:
                await ask_heritage_guide(
                    ChatRequest(
                        location_id="interpret",
                        question="Công trình này có ý nghĩa gì?",
                    ),
                    self.other_user,
                )

        self.assertEqual(caught.exception.status_code, 403)
        answer_mock.assert_not_awaited()


if __name__ == "__main__":
    unittest.main()
