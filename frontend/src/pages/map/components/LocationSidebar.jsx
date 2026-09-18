import { useEffect, useRef } from 'react'
import { Check, LockKeyhole, ArrowRight, Camera } from 'lucide-react'

export default function LocationSidebar({
  locations,
  unlockedLocations,
  selectedLocation,
  onSelectLocation,
}) {
  const itemRefs = useRef({})

  // Tự động cuộn đến thẻ tương ứng khi người dùng click vào Marker trên bản đồ
  useEffect(() => {
    if (selectedLocation && itemRefs.current[selectedLocation.id]) {
      itemRefs.current[selectedLocation.id].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }, [selectedLocation])

  return (
    <aside className="map-locations-sidebar">
      <div className="sidebar-header">
        <div>
          <h3>10 Công trình di tích</h3>
          <p>Nhấp vào một địa điểm để định vị trên bản đồ</p>
        </div>
        <span className="unlocked-counter">
          {locations.filter((l) => unlockedLocations.has(l.id)).length}/10
        </span>
      </div>

      <div className="sidebar-items-list">
        {locations.map((loc) => {
          const isUnlocked = unlockedLocations.has(loc.id)
          const isSelected = selectedLocation?.id === loc.id

          return (
            <article
              key={loc.id}
              ref={(el) => {
                itemRefs.current[loc.id] = el
              }}
              className={`sidebar-location-card ${isUnlocked ? 'unlocked' : 'locked'} ${
                isSelected ? 'active' : ''
              }`}
              onClick={() => onSelectLocation(loc)}
            >
              <div className="card-thumb-wrapper">
                <img
                  src={loc.image}
                  alt={loc.name}
                  className="card-thumb-img"
                  loading="lazy"
                />
                <span className={`order-badge ${isUnlocked ? 'badge-unlocked' : 'badge-locked'}`}>
                  {isUnlocked ? <Check size={13} strokeWidth={3} /> : loc.order}
                </span>
              </div>

              <div className="card-content">
                <div className="card-top-row">
                  <h4 className="card-title">{loc.name}</h4>
                  <span className="card-distance">⌖ {loc.distanceEst}</span>
                </div>
                <p className="card-tagline">{loc.tagline}</p>

                {isSelected && (
                  <div className="card-actions-row" onClick={(e) => e.stopPropagation()}>
                    {isUnlocked ? (
                      <a href={loc.detailPath} className="btn-card-action primary">
                        Xem câu chuyện di sản <ArrowRight size={14} />
                      </a>
                    ) : (
                      <a href="/Explore/Camera" className="btn-card-action gold">
                        <Camera size={14} /> Quét để mở khóa
                      </a>
                    )}
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </aside>
  )
}
