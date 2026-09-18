from sqlalchemy.orm import Session
from src.models.heritage import Location, Artifact

def seed_heritage_data(db: Session):
    """Hàm nạp dữ liệu mồi tự động cho Văn Miếu Quốc Tử Giám"""
    # Kiểm tra nếu đã có dữ liệu di tích thì bỏ qua không nạp trùng
    if db.query(Location).first() is not None:
        return

    # 1. Thêm dữ liệu Khuê Văn Các
    khue_van_cac = Location(
        name="Khuê Văn Các",
        latitude=21.0285,
        longitude=105.8355,
        description="Lầu vuông tám mái mang biểu tượng học thuật sâu sắc."
    )
    db.add(khue_van_cac)
    db.flush() # Lấy ID tạm thời của địa điểm cha

    # Thêm hiện vật trực thuộc Khuê Văn Các
    artifact_kvc = Artifact(
        name="Bảng hoành phi Khuê Văn Các",
        ai_label="khue_van_cac_sign",
        description="Bức đại tự chữ Hán khắc tên công trình.",
        location_id=khue_van_cac.id
    )
    db.add(artifact_kvc)

    # 2. Thêm dữ liệu Nhà Bia Tiến Sĩ
    nha_bia = Location(
        name="Nhà Bia Tiến Sĩ",
        latitude=21.0290,
        longitude=105.8360,
        description="Nơi lưu giữ các tấm bia đá khắc tên các bậc hiền tài."
    )
    db.add(nha_bia)
    db.flush()

    artifact_bia = Artifact(
        name="Bia Tiến Sĩ khoa Nhâm Tuất 1442",
        ai_label="stela_1442",
        description="Tấm bia tiến sĩ đầu tiên được dựng tại Văn Miếu.",
        location_id=nha_bia.id
    )
    db.add(artifact_bia)

    # Lưu toàn bộ xuống Database thật
    db.commit()
    print("=== ĐÃ NẠP THÀNH CÔNG DỮ LIỆU DI TÍCH MẪU ===")
