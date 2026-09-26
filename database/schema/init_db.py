from sqlmodel import SQLModel
from backend.src.models.reward import RewardClaim, RewardJourney

from backend.src.config.db import engine
from backend.src.models.chat_message import ChatMessage
from backend.src.models.checkin_log import CheckinLog
from backend.src.models.heritage_location import HeritageLocation
from backend.src.models.user import User
from backend.src.models.user_history import UserHistory


def create_database_and_tables():
    SQLModel.metadata.create_all(engine)


if __name__ == "__main__":
    create_database_and_tables()
    print("Database tables created.")
