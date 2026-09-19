from sqlmodel import SQLModel

from backend.src.config.db import engine
from backend.src.models.user import User

SQLModel.metadata.create_all(engine)
print("Đã tạo bảng users")