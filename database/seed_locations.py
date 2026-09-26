from sqlmodel import Session

from backend.src.config.db import engine
from backend.src.models.heritage_location import HeritageLocation


LOCATIONS = [
    {
        "location_id": "location-van-mieu-gate",
        "yolo_label": "van_mieu_gate",
        "name": "Temple of Literature Gate",
        "sequence_order": 1,
        "latitude": 21.02758,
        "longitude": 105.83551,
        "geofence_radius": 30.0,
        "story_summary": "The main entrance begins a journey through the complex\u2019s five courtyards. Its three-part gate marks a solemn boundary between the city and the heritage grounds.",
    },
    {
        "location_id": "location-dai-trung-gate",
        "yolo_label": "dai_trung_gate",
        "name": "Dai Trung Gate",
        "sequence_order": 2,
        "latitude": 21.02817,
        "longitude": 105.83574,
        "geofence_radius": 30.0,
        "story_summary": "Dai Trung Gate marks the transition into the inner grounds. The smaller Thanh Duc and Dat Tai gates evoke the cultivation of virtue and talent.",
    },
    {
        "location_id": "interpret",
        "yolo_label": "khue_van_cac",
        "name": "Khue Van Pavilion",
        "sequence_order": 3,
        "latitude": 21.02868,
        "longitude": 105.83592,
        "geofence_radius": 30.0,
        "story_summary": "Built in the early 19th century, the pavilion is known for its square tower, eight roofs, and four round windows. Its name refers to the star Khue, associated with literature.",
    },
        {
        "location_id": "location-dai-thanh-gate",
        "yolo_label": "dai_thanh_gate",
        "name": "Dai Thanh Gate",
        "sequence_order": 4,
        "latitude": 21.02908,
        "longitude": 105.83608,
        "geofence_radius": 30.0,
        "story_summary": "Dai Thanh Gate leads to the sanctuary of Confucius and other sages. Its name evokes great achievement in learning and virtue.",
    },
    {
        "location_id": "location-dien-dai-thanh",
        "yolo_label": "dien_dai_thanh",
        "name": "Dai Thanh Hall",
        "sequence_order": 5,
        "latitude": 21.02935,
        "longitude": 105.83619,
        "geofence_radius": 30.0,
        "story_summary": "Dai Thanh Hall is the central sanctuary, honoring Confucius and Confucian sages in a solemn lacquered timber setting.",
    },
    {
        "location_id": "location-thai-hoc-gate",
        "yolo_label": "thai_hoc_gate",
        "name": "Thai Hoc Gate",
        "sequence_order": 6,
        "latitude": 21.02951,
        "longitude": 105.83626,
        "geofence_radius": 30.0,
        "story_summary": "The gate links the Dai Thanh and Thai Hoc precincts. Its three bays, traditional tiled roof, and broad courtyard extend the visitor\u2019s view along the site axis.",
    },
        {
        "location_id": "location-thai-hoc-house",
        "yolo_label": "thai_hoc_house",
        "name": "Thai Hoc Hall",
        "sequence_order": 7,
        "latitude": 21.02998,
        "longitude": 105.83643,
        "geofence_radius": 30.0,
        "story_summary": "Built on the grounds of the former Imperial Academy, the Thai Hoc precinct presents the history of education and commemorates those who advanced learning.",
    },
    {
        "location_id": "location-bell-drum-tower",
        "yolo_label": "bell_drum_tower",
        "name": "Bell and Drum Towers",
        "sequence_order": 8,
        "latitude": 21.02996,
        "longitude": 105.83631,
        "geofence_radius": 30.0,
        "story_summary": "Standing on either side of the Thai Hoc precinct, the towers create a balanced composition and recall the rhythms of ceremony and daily life at a traditional academy.",
    },
    {
        "location_id": "location-octagonal-house",
        "yolo_label": "octagonal_house",
        "name": "Octagonal Pavilion",
        "sequence_order": 9,
        "latitude": 21.02891,
        "longitude": 105.83533,
        "geofence_radius": 30.0,
        "story_summary": "Its eight-sided plan and graceful roof make this pavilion a harmonious pause among the greenery and visitor paths.",
    },
    {
        "location_id": "location-phuong-dinh",
        "yolo_label": "phuong_dinh",
        "name": "Phuong Dinh Pavilion (Literature Lake)",
        "sequence_order": 10,
        "latitude": 21.02672,
        "longitude": 105.83630,
        "geofence_radius": 30.0,
        "story_summary": "The square pavilion links the landscape of Van Lake with the historic complex, offering a place to rest and take in the visitor route.",
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