import { useState } from 'react'
import { MapPin, ChevronDown, Check } from 'lucide-react'
import { MAP_LOCATIONS } from '../../map/mapData.js'

export default function LocationBanner({
  targetLocation,
  setTargetLocation,
  distanceMeters,
  gpsAccuracy,
  isNearEnough,
}) {
  const [showSelector, setShowSelector] = useState(false)

  return (
    <div className="camera-location-wrap">
      <div className="camera-location">
        <span className={`location-dot ${isNearEnough ? 'valid' : 'warning'}`}>●</span>
        <div className="location-info">
          <small>Vị trí di tích đối chiếu</small>
          <div className="location-name-row" onClick={() => setShowSelector(!showSelector)}>
            <strong>{targetLocation?.name || 'Văn Miếu'}</strong>
            <span className="location-selector-trigger" title="Đổi địa điểm">
              <ChevronDown size={14} />
            </span>
          </div>
          <span>
            Chính xác ±{gpsAccuracy} m · Cách công trình {distanceMeters} m
          </span>
        </div>

        <div className={`distance-pill ${isNearEnough ? 'green' : 'amber'}`}>
          {isNearEnough ? '⌖ Vị trí hợp lệ' : `Khoảng cách ${distanceMeters}m`}
        </div>
      </div>

      {/* Menu chọn địa điểm mô phỏng nhanh nếu du khách muốn kiểm tra các công trình khác */}
      {showSelector && (
        <div className="location-dropdown-menu">
          <div className="dropdown-header">
            <span>Chọn công trình bạn đang đứng:</span>
            <button type="button" onClick={() => setShowSelector(false)}>✕</button>
          </div>
          <div className="dropdown-list">
            {MAP_LOCATIONS.map((loc) => {
              const isCurrent = loc.id === targetLocation?.id
              return (
                <div
                  key={loc.id}
                  className={`dropdown-item ${isCurrent ? 'selected' : ''}`}
                  onClick={() => {
                    setTargetLocation(loc)
                    setShowSelector(false)
                  }}
                >
                  <img src={loc.image} alt={loc.name} className="item-thumb" />
                  <div className="item-info">
                    <span className="item-name">#{loc.order} {loc.name}</span>
                    <span className="item-desc">{loc.tagline}</span>
                  </div>
                  {isCurrent && <Check size={16} className="item-check" />}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
