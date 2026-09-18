from sqlalchemy.orm import Session
from src.models.heritage import Location, Artifact
from src.models.figure import HistoricalFigure  # Khắc phục lỗi thiếu import danh nhân

def seed_heritage_data(db: Session):
    """Hàm nạp dữ liệu mồi tự động cho Văn Miếu Quốc Tử Giám"""
    
    # -------------------------------------------------------------
    # 1. NẠP DỮ LIỆU ĐỊA ĐIỂM VÀ HIỆN VẬT DI TÍCH (NẾU CHƯA CÓ)
    # -------------------------------------------------------------
    if db.query(Location).first() is None:
        # Thêm dữ liệu Khuê Văn Các
        khue_van_cac = Location(
            name="Khuê Văn Các",
            latitude=21.0285,
            longitude=105.8355,
            description="Lầu vuông tám mái mang biểu tượng học thuật sâu sắc."
        )
        db.add(khue_van_cac)
        db.flush()  # Lấy ID tạm thời của địa điểm cha để gắn cho hiện vật con

        # Thêm hiện vật trực thuộc Khuê Văn Các
        artifact_kvc = Artifact(
            name="Bảng hoành phi Khuê Văn Các",
            ai_label="khue_van_cac_sign",
            description="Bức đại tự chữ Hán khắc tên công trình.",
            location_id=khue_van_cac.id
        )
        db.add(artifact_kvc)

        # Thêm dữ liệu Nhà Bia Tiến Sĩ
        nha_bia = Location(
            name="Nhà Bia Tiến Sĩ",
            latitude=21.0290,
            longitude=105.8360,
            description="Nơi lưu giữ các tấm bia đá khắc tên các bậc hiền tài."
        )
        db.add(nha_bia)
        db.flush()

        # Thêm hiện vật trực thuộc Nhà Bia Tiến Sĩ
        artifact_bia = Artifact(
            name="Bia Tiến Sĩ khoa Nhâm Tuất 1442",
            ai_label="stela_1442",
            description="Tấm bia tiến sĩ đầu tiên được dựng tại Văn Miếu.",
            location_id=nha_bia.id
        )
        db.add(artifact_bia)
        print("-> Đã khởi tạo dữ liệu Địa điểm và Hiện vật di tích mẫu.")

    # -------------------------------------------------------------
    # 2. NẠP DỮ LIỆU DANH NHÂN KHOA BẢNG (NẾU CHƯA CÓ)
    # -------------------------------------------------------------
    if db.query(HistoricalFigure).first() is None:
        # Danh nhân Chu Văn An
        chu_van_an = HistoricalFigure(
            name="Chu Văn An",
            title="Tư nghiệp Quốc Tử Giám",
            dynasty="Nhà Trần",
            short_bio="Người thầy mẫu mực muôn đời của nền giáo dục Việt Nam.",
            full_story="Chu Văn An (1292–1370) là một nhà giáo, thầy thuốc, đại quan nhà Trần. Ông được vua Trần Minh Tông mời làm Tư nghiệp Quốc Tử Giám, dạy dỗ các thái tử và học trò. Ông nổi tiếng với tính cách cương trực, từng dâng 'Thất trảm sớ' xin chém 7 nịnh thần.",
            avatar_url="/images/heritage/chu-van-an.jpg"  # Đường dẫn ảnh tương thích với Frontend
        )
        db.add(chu_van_an)

        # Vua Lý Thánh Tông
        ly_thanh_tong = HistoricalFigure(
            name="Lý Thánh Tông",
            title="Hoàng đế triều Lý",
            dynasty="Nhà Lý",
            short_bio="Vị vua có công sáng lập Văn Miếu vào năm 1070.",
            full_story="Lý Thánh Tông (1023–1072) là vị hoàng đế thứ ba của nhà Lý. Mùa thu năm 1070, ông đã cho xây dựng Văn Miếu để thờ các bậc Thánh hiền và là nơi cho các Thái tử đến học tập, đặt nền móng đầu tiên cho nền giáo dục đại học.",
            avatar_url="/images/heritage/ly-thanh-tong.jpg"
        )
        db.add(ly_thanh_tong)
        print("-> Đã khởi tạo dữ liệu Danh nhân khoa bảng mẫu.")

    # Lưu vĩnh viễn toàn bộ các bản ghi mồi xuống Database thực tế (.db)
    db.commit()
    print("=== ĐÃ NẠP THÀNH CÔNG DỮ LIỆU DI TÍCH MẪU ===")
