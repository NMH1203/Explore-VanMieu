from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt
from sqlalchemy.orm import Session

from src.config.database import get_db
from src.models.user import User

# Sử dụng chuẩn bảo mật Bearer Token của FastAPI
security = HTTPBearer()

SECRET_KEY = "thay_the_bang_mot_chuoi_bi_mat_va_sieu_dai_cua_ban_o_day"
ALGORITHM = "HS256"

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency kiểm tra JWT Token. 
    Nếu Token hợp lệ, trả về thông tin đối tượng User từ Database thật.
    Nếu không hợp lệ hoặc hết hạn, chặn lại và trả về lỗi 401.
    """
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Mã xác thực (Token) không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại!",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Giải mã chuỗi Token bằng Secret Key đã thiết lập
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
            
    except Exception:
        raise credentials_exception
        
    # Truy vấn kiểm tra xem tài khoản trong token có thực sự tồn tại trong DB không
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
        
    return user  # Trả về thông tin người dùng hiện tại đang thao tác
