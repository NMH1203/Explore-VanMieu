from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.middleware.auth_bearer import get_current_user
from src.models.user import User
from src.models.heritage import Location  # Import Model địa điểm thật
from src.utils.geo import calculate_haversine_distance

router = APIRouter(
    prefix="/checkin",
    tags=["Check-in & AI (Xác thực di sản)"]
)


@router.post("/verify-gps")
def verify_gps(
    lat: float = Form(...), 
    lng: float = Form(...), 
    location_id: int = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)  # Bơm session database vào
):
    """Bước 1: Kiểm tra xem khoảng cách GPS thực tế của du khách có hợp lệ với dữ liệu DATABASE không"""
    
    # 1. Truy vấn lấy tọa độ chuẩn của địa điểm từ cơ sở dữ liệu thật
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=400, detail="Mã địa điểm di tích không tồn tại trong hệ thống!")
        
    # 2. Tính khoảng cách mét thực tế từ vị trí du khách đến di tích thật trong DB
    distance_meters = calculate_haversine_distance(
        lat1=lat, 
        lon1=lng, 
        lat2=location.latitude, 
        lon2=location.longitude
    )
    
    # 3. Định biên bán kính cho phép (Ví dụ: tối đa 50 mét xung quanh di tích)
    ALLOWED_RADIUS_METERS = 50.0
    
    if distance_meters <= ALLOWED_RADIUS_METERS:
        return {
            "status": "success",
            "in_range": True,
            "distance_meters": round(distance_meters, 2),
            "message": f"Hợp lệ! Bạn đang đứng cách {location.name} {round(distance_meters, 1)} mét. Hãy chụp ảnh hiện vật để hoàn tất check-in!"
        }
    else:
        return {
            "status": "error",
            "in_range": False,
            "distance_meters": round(distance_meters, 2),
            "message": f"Bạn đang ở quá xa! Bạn đang cách {location.name} {round(distance_meters, 1)} mét (Giới hạn cho phép: {ALLOWED_RADIUS_METERS}m)."
        }


@router.post("/verify-artifact")
async def verify_artifact(
    location_id: int = Form(...), 
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Bước 2: Nhận diện ảnh và sinh thuyết minh AI (Sẽ cấu hình tích hợp mô hình ở bước sau)"""
    artifact_detected = "Khuê Văn Các" 
    ai_narration = (
        f"Chúc mừng {current_user.full_name} đã check-in thành công tại {artifact_detected}! "
        "Khuê Văn Các được xây dựng vào năm 1805 dưới triều nhà Nguyễn. "
        "Công trình mang kiến trúc lầu vuông tám mái, là biểu tượng tinh hoa học vấn."
    )
    return {
        "status": "success",
        "detected": artifact_detected,
        "passport_stamped": True,
        "narration": ai_narration
    }
