from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.middleware.auth_bearer import get_current_user
from src.models.user import User
from src.models.heritage import Location
from src.models.passport import UserPassport # Import thêm model hộ chiếu
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
    db: Session = Depends(get_db)
):
    """Bước 1: So khớp khoảng cách GPS và TỰ ĐỘNG ĐÓNG DẤU vào Hộ chiếu số thật trong DB"""
    
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=400, detail="Mã địa điểm di tích không tồn tại trong hệ thống!")
        
    distance_meters = calculate_haversine_distance(
        lat1=lat, lon1=lng, 
        lat2=location.latitude, lon2=location.longitude
    )
    
    ALLOWED_RADIUS_METERS = 50.0
    
    if distance_meters <= ALLOWED_RADIUS_METERS:
        # LOGIC ĐÓNG DẤU HỘ CHIẾU: Kiểm tra xem du khách này đã có con dấu tại địa điểm này chưa
        existing_stamp = db.query(UserPassport).filter(
            UserPassport.user_id == current_user.id,
            UserPassport.location_id == location_id
        ).first()
        
        # Nếu chưa từng đóng dấu, tiến hành tạo mới bản ghi đóng dấu vào database
        if not existing_stamp:
            new_stamp = UserPassport(user_id=current_user.id, location_id=location_id)
            db.add(new_stamp)
            db.commit()
            message_stamp = "Chúc mừng bạn đã thu thập thêm 1 con dấu mới vào Hộ chiếu di sản số!"
        else:
            message_stamp = "Bạn đã có con dấu của địa điểm này trong hộ chiếu từ trước."

        return {
            "status": "success",
            "in_range": True,
            "distance_meters": round(distance_meters, 2),
            "passport_stamped": True,
            "message": f"Hợp lệ! Bạn đang ở {location.name}. {message_stamp}"
        }
    else:
        return {
            "status": "error",
            "in_range": False,
            "distance_meters": round(distance_meters, 2),
            "passport_stamped": False,
            "message": f"Bạn đang ở quá xa vị trí {location.name} (Khoảng cách: {round(distance_meters, 1)}m)."
        }


@router.post("/verify-artifact")
async def verify_artifact(
    location_id: int = Form(...), 
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Bước 2: Nhận diện ảnh và sinh thuyết minh (Giữ cấu hình mẫu, sẽ làm ở phần AI sau)"""
    artifact_detected = "Khuê Văn Các" 
    ai_narration = (
        f"Chúc mừng {current_user.full_name} đã check-in thành công tại {artifact_detected}! "
        "Khuê Văn Các được xây dựng vào năm 1805 dưới triều nhà Nguyễn."
    )
    return {
        "status": "success",
        "detected": artifact_detected,
        "narration": ai_narration
    }
