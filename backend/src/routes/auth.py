from fastapi import APIRouter, HTTPException, status, Form, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
import hashlib
import os

from src.config.database import get_db
from src.models.user import User

router = APIRouter(
    prefix="/auth",
    tags=["Authentication (Xác thực người dùng)"]
)

SECRET_KEY = "thay_the_bang_mot_chuoi_bi_mat_va_sieu_dai_cua_ban_o_day"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  

# Hàm bổ trợ: Băm mật khẩu sử dụng SHA-256 kèm theo Salt muối ngẫu nhiên
def get_password_hash(password: str) -> str:
    salt = os.urandom(16).hex()
    hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return f"{salt}:{hashed}"

# Hàm bổ trợ: Xác minh mật khẩu
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        salt, original_hash = hashed_password.split(":")
        current_hash = hashlib.sha256((plain_password + salt).encode('utf-8')).hexdigest()
        return current_hash == original_hash
    except Exception:
        return False

# Hàm bổ trợ: Tạo chuỗi JWT Token
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/register")
def register_user(
    username: str = Form(...), 
    email: str = Form(...), 
    password: str = Form(...),
    db: Session = Depends(get_db)  # Bơm phiên làm việc Database vào hàm
):
    """API Đăng ký tài khoản lưu trực tiếp vào DATABASE thật"""
    username_str = str(username).strip()
    email_str = str(email).strip()
    
    # 1. Kiểm tra xem username đã tồn tại trong DB chưa
    db_user_by_username = db.query(User).filter(User.username == username_str).first()
    if db_user_by_username:
        raise HTTPException(status_code=400, detail="Tên đăng nhập đã tồn tại trên hệ thống!")
        
    # 2. Kiểm tra xem email đã tồn tại trong DB chưa
    db_user_by_email = db.query(User).filter(User.email == email_str).first()
    if db_user_by_email:
        raise HTTPException(status_code=400, detail="Email này đã được đăng ký tài khoản!")
    
    # 3. Mã hóa mật khẩu và tạo bản ghi Người dùng mới
    hashed_pwd = get_password_hash(str(password))
    new_user = User(username=username_str, email=email_str, hashed_password=hashed_pwd)
    
    # 4. Lưu dữ liệu xuống file database thực tế
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {"status": "success", "message": "Đăng ký tài khoản thành công!", "user_id": new_user.id}


@router.post("/login")
def login_user(
    username: str = Form(...), 
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """API Đăng nhập: Kiểm tra dữ liệu từ DATABASE thật và cấp Access Token"""
    username_str = str(username).strip()
    
    # Tìm kiếm người dùng trong Database theo tên đăng nhập
    user = db.query(User).filter(User.username == username_str).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không chính xác!"
        )
    
    if not verify_password(str(password), user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không chính xác!"
        )
    
    access_token = create_access_token(data={"sub": user.username, "email": user.email})
    
    return {
        "status": "success",
        "access_token": access_token,
        "token_type": "bearer",
        "message": "Đăng nhập thành công!"
    }
