from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.middleware.auth_bearer import get_current_user
from src.models.user import User
from src.models.passport import UserPassport
from src.models.heritage import Location

router = APIRouter(
    prefix="/passport",
    tags=["Digital Passport (Hộ chiếu di sản số)"]
)

@router.get("/stamps")
def get_my_passport_stamps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """API lấy danh sách toàn bộ các di tích và trạng thái con dấu của du khách hiện tại"""
    
    # 1. Lấy tất cả các địa điểm hiện có trong Văn Miếu từ Database
    all_locations = db.query(Location).all()
    
    # 2. Lấy danh sách các địa điểm mà du khách này ĐÃ check-in và đóng dấu thành công
    my_stamps = db.query(UserPassport).filter(UserPassport.user_id == current_user.id).all()
    stamped_location_ids = {stamp.location_id for stamp in my_stamps}
    
    # 3. Tổng hợp lại cấu trúc dữ liệu gửi về cho Frontend hiển thị danh sách (đồ họa sáng/tối)
    passport_data = []
    for loc in all_locations:
        is_stamped = loc.id in stamped_location_ids
        passport_data.append({
            "location_id": loc.id,
            "location_name": loc.name,
            "description": loc.description,
            "is_stamped": is_stamped, # True: Hiện dấu màu sắc, False: Hiện dấu mờ (chưa đi)
            "stamped_at": next((stamp.created_at for stamp in my_stamps if stamp.location_id == loc.id), None)
        })
        
    return {
        "status": "success",
        "username": current_user.username,
        "total_stamps_collected": len(stamped_location_ids),
        "total_locations": len(all_locations),
        "passport": passport_data
    }
