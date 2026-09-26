export default function LocationBanner({
  targetLocation,
  distanceMeters,
  gpsAccuracy,
  isNearEnough,
}) {
  return (
    <div className="camera-location-wrap">
      <div className="camera-location">
        <span className={`location-dot ${isNearEnough ? 'valid' : 'warning'}`}>●</span>
        <div className="location-info">
          <small>Vị trí di tích đối chiếu</small>
          <strong>{targetLocation?.name || 'Văn Miếu – Quốc Tử Giám'}</strong>
          <span>
            Chính xác ±{gpsAccuracy} m · Cách công trình {distanceMeters} m
          </span>
        </div>

        <div className={`distance-pill ${isNearEnough ? 'green' : 'amber'}`}>
          {isNearEnough ? '⌖ Vị trí hợp lệ' : `Khoảng cách ${distanceMeters}m`}
        </div>
      </div>
    </div>
  )
}
