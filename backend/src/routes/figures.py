from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from src.config.database import get_db
from src.models.figure import HistoricalFigure

router = APIRouter(
    prefix="/figures",
    tags=["Historical Figures (Danh nhân khoa bảng)"]
)

@router.get("/")
def get_all_figures(db: Session = Depends(get_db)):
    """API lấy danh sách tất cả các danh nhân khoa bảng được thờ tại Văn Miếu"""
    figures = db.query(HistoricalFigure).all()
    return {"status": "success", "data": figures}

@router.get("/{figure_id}")
def get_figure_detail(figure_id: int, db: Session = Depends(get_db)):
    """API lấy thông tin tiểu sử chi tiết của một danh nhân theo ID"""
    figure = db.query(HistoricalFigure).filter(HistoricalFigure.id == figure_id).first()
    if not figure:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin danh nhân này!")
    return {"status": "success", "data": figure}
