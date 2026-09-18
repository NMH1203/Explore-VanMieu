from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Import cấu hình database và model để kích hoạt tạo bảng
from src.config.database import engine, Base, SessionLocal
from src.config.seed import seed_heritage_data
from src.models import user, heritage, passport, figure
from src.routes import locations, checkin, auth, passport,figures

# Lệnh quét tất cả các Models và tạo bảng trong Database thật nếu chưa tồn tại
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    seed_heritage_data(db)
finally:
    db.close()


app = FastAPI(
    title="Explore Van Mieu API",
    description="Backend API cho ứng dụng khám phá di sản Văn Miếu Quốc Tử Giám",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(locations.router, prefix="/api/v1")
app.include_router(checkin.router, prefix="/api/v1")
app.include_router(passport.router, prefix="/api/v1")
app.include_router(figures.router, prefix="/api/v1")
@app.get("/")
def read_root():
    return {"message": "Chào mừng đến với hệ thống Explore Van Mieu API!"}
