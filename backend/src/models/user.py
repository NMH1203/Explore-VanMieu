from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from src.config.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, default="Du khách Văn Miếu")
    created_at = Column(DateTime, default=datetime.utcnow)
