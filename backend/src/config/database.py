from sqlalchemy import  create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Đường dẫn lưu file database ngay trong thư mục dự án
SQLALCHEMY_DATABASE_URL = "sqlite:///./explore_vanmieu.db"

# Khởi tạo Engine kết nối (đối với SQLite cần thêm check_same_thread=False)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Tạo Session để đảm bảo mỗi request sẽ có một phiên làm việc riêng với DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Lớp nền tảng (Base) để các bảng (Models) kế thừa
Base = declarative_base()

# Hàm Dependency bổ trợ: Cấp phát và tự động đóng phiên kết nối sau khi dùng xong API
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
