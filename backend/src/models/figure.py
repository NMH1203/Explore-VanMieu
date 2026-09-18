from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from src.config.database import Base

class HistoricalFigure(Base):
    __tablename__ = "historical_figures"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False) # Tên danh nhân
    title = Column(String, nullable=True)             # Chức danh/Vai trò (Vua, Tư nghiệp...)
    dynasty = Column(String, nullable=True)           # Triều đại (Nhà Lý, Nhà Trần, Nhà Lê...)
    short_bio = Column(String, nullable=True)         # Tóm tắt tiểu sử ngắn
    full_story = Column(Text, nullable=True)          # Chi tiết cuộc đời và đóng góp cho Văn Miếu
    avatar_url = Column(String, nullable=True)         # Đường dẫn ảnh đại diện
    created_at = Column(DateTime, default=datetime.utcnow)
