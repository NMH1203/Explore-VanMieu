import math

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Tính khoảng cách giữa 2 tọa độ GPS (Kinh độ, Vĩ độ) theo mét.
    Sử dụng công thức toán học Haversine.
    """
    # Bán kính Trái Đất tính bằng mét
    R = 6371000.0

    # Chuyển đổi từ Độ (Degrees) sang Radian
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    # Áp dụng công thức Haversine
    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
        
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    # Khoảng cách thực tế (mét)
    distance = R * c
    return distance
