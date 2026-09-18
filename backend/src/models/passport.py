from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from src.config.database import Base

class UserPassport(Base):
    __tablename__ = "user_passports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    stamped = Column(Boolean, default=True) # Trạng thái đã đóng dấu
    created_at = Column(DateTime, default=datetime.utcnow) # Thời gian đóng dấu

    # Thiết lập liên kết ngược để truy vấn tên địa điểm dễ dàng hơn
    location = relationship("Location")
