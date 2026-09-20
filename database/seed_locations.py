from sqlmodel import Session

from backend.src.config.db import engine
from backend.src.models.heritage_location import HeritageLocation


LOCATIONS = [
    {
        "location_id": "location-van-mieu-gate",
        "yolo_label": "van_mieu_gate",
        "name": "Cổng Văn Miếu",
        "sequence_order": 1,
        "latitude": 21.02758,
        "longitude": 105.83551,
        "geofence_radius": 30.0,
        "story_summary": (
            "Lối vào đầu tiên mở ra trục kiến trúc "
            "và không gian đạo học của quần thể."
        ),
    },
    {
        "location_id": "location-dai-trung-gate",
        "yolo_label": "dai_trung_gate",
        "name": "Cổng Đại Trung",
        "sequence_order": 2,
        "latitude": 21.02817,
        "longitude": 105.83574,
        "geofence_radius": 30.0,
        "story_summary": (
            "Cánh cổng dẫn vào không gian trung tâm, "
            "rèn đức luyện tài."
        ),
    },
    {
        "location_id": "interpret",
        "yolo_label": "khue_van_cac",
        "name": "Khuê Văn Các",
        "sequence_order": 3,
        "latitude": 21.02868,
        "longitude": 105.83592,
        "geofence_radius": 30.0,
        "story_summary": (
            "Biểu tượng của văn chương, trí tuệ "
            "và Thủ đô Hà Nội ngàn năm văn hiến."
        ),
    },
        {
        "location_id": "location-dai-thanh-gate",
        "yolo_label": "dai_thanh_gate",
        "name": "Cổng Đại Thành",
        "sequence_order": 4,
        "latitude": 21.02908,
        "longitude": 105.83608,
        "geofence_radius": 30.0,
        "story_summary": (
            "Cánh cổng đánh dấu lối vào khu điện thờ "
            "trang nghiêm và sân Đại Bái."
        ),
    },
    {
        "location_id": "location-dien-dai-thanh",
        "yolo_label": "dien_dai_thanh",
        "name": "Điện Đại Thành",
        "sequence_order": 5,
        "latitude": 21.02935,
        "longitude": 105.83619,
        "geofence_radius": 30.0,
        "story_summary": (
            "Không gian thờ Khổng Tử và các bậc hiền triết "
            "Nho học trong cấu trúc sơn son."
        ),
    },
    {
        "location_id": "location-thai-hoc-gate",
        "yolo_label": "thai_hoc_gate",
        "name": "Cổng Thái Học",
        "sequence_order": 6,
        "latitude": 21.02951,
        "longitude": 105.83626,
        "geofence_radius": 30.0,
        "story_summary": (
            "Lối chuyển tiếp vào khu vực tưởng niệm "
            "truyền thống giáo dục Quốc học."
        ),
    },
        {
        "location_id": "location-thai-hoc-house",
        "yolo_label": "thai_hoc_house",
        "name": "Nhà Thái Học",
        "sequence_order": 7,
        "latitude": 21.02998,
        "longitude": 105.83643,
        "geofence_radius": 30.0,
        "story_summary": (
            "Công trình tôn vinh Quốc Tử Giám và những "
            "người thầy tiêu biểu của dân tộc."
        ),
    },
    {
        "location_id": "location-bell-drum-tower",
        "yolo_label": "bell_drum_tower",
        "name": "Lầu Chuông – Lầu Trống",
        "sequence_order": 8,
        "latitude": 21.02996,
        "longitude": 105.83631,
        "geofence_radius": 30.0,
        "story_summary": (
            "Cặp công trình đăng đối hai bên sân Thái Học, "
            "tạo nhịp nghi lễ trang nghiêm."
        ),
    },
    {
        "location_id": "location-octagonal-house",
        "yolo_label": "octagonal_house",
        "name": "Nhà Bát Giác",
        "sequence_order": 9,
        "latitude": 21.02891,
        "longitude": 105.83533,
        "geofence_radius": 30.0,
        "story_summary": (
            "Không gian kiến trúc tám cạnh giàu biểu tượng "
            "giữa cảnh quan cây xanh."
        ),
    },
    {
        "location_id": "location-phuong-dinh",
        "yolo_label": "phuong_dinh",
        "name": "Phương Đình (Hồ Văn)",
        "sequence_order": 10,
        "latitude": 21.02672,
        "longitude": 105.83630,
        "geofence_radius": 30.0,
        "story_summary": (
            "Điểm dừng chân kết nối cảnh quan mặt nước "
            "Hồ Văn và trục chính di tích."
        ),
    },
]
def seed_locations():
    inserted = 0
    updated = 0

    with Session(engine) as session:
        for location_data in LOCATIONS:
            location_id = location_data["location_id"]
            location = session.get(
                HeritageLocation,
                location_id,
            )

            if location is None:
                session.add(
                    HeritageLocation(**location_data)
                )
                inserted += 1
                continue

            for field_name, value in location_data.items():
                setattr(location, field_name, value)

            session.add(location)
            updated += 1

        session.commit()

    print(
        f"Location seed complete: "
        f"{inserted} inserted, {updated} updated"
    )


if __name__ == "__main__":
    seed_locations()