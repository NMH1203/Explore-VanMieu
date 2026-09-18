from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.models.heritage import Location

router = APIRouter(
    prefix="/locations",
    tags=["Locations (Địa điểm di tích)"]
)

@router.get("/")
def get_all_locations(db: Session = Depends(get_db)):
    """Lấy danh sách tất cả địa điểm di tích thực tế từ DATABASE thật"""
    locations = db.query(Location).all()
    return {"status": "success", "data": locations}

@router.get("/{location_id}")
def get_location_detail(location_id: int, db: Session = Depends(get_db)):
    """Lấy thông tin chi tiết kèm danh sách hiện vật trực thuộc địa điểm"""
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Không tìm thấy địa điểm di tích!")
        
    return {
        "status": "success",
        "data": {
            "id": location.id,
            "name": location.name,
            "latitude": location.latitude,
            "longitude": location.longitude,
            "description": location.description,
            "artifacts": [{"id": art.id, "name": art.name} for art in location.artifacts] # Trả về list hiện vật con
        }
    }
