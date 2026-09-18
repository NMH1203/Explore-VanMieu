import { useState } from 'react'
import { useUnlockedLocations } from '../../state/heritageProgress.js'
import { MAP_LOCATIONS } from './mapData.js'
import InteractiveMap from './components/InteractiveMap.jsx'
import LocationSidebar from './components/LocationSidebar.jsx'
import './map.css'

function MapPage() {
  const unlockedLocations = useUnlockedLocations()
  // Mặc định chọn địa điểm đầu tiên hoặc Khuê Văn Các
  const [selectedLocation, setSelectedLocation] = useState(MAP_LOCATIONS[0])

  const unlockedCount = MAP_LOCATIONS.filter((loc) => unlockedLocations.has(loc.id)).length

  return (
    <section className="screen" id="map">
      <header className="topbar">
        <div className="inner">
          <div className="eyebrow">All locations</div>
          <h1>Bản đồ Văn Miếu</h1>
          <p>
            Theo dõi 10 công trình trọng điểm theo trục không gian di sản · Đã mở khóa {unlockedCount}/10 điểm
          </p>
        </div>
      </header>

      <div className="container">
        <div className="map-page-grid">
          {/* Cột Bản đồ tương tác */}
          <div className="map-main-column">
            <InteractiveMap
              locations={MAP_LOCATIONS}
              unlockedLocations={unlockedLocations}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
            />

            {/* Card thông tin nhanh địa điểm đang chọn */}
            {selectedLocation && (
              <div className="map-selected-card">
                <img
                  src={selectedLocation.image}
                  alt={selectedLocation.name}
                  className="selected-card-thumb"
                />
                <div className="selected-card-body">
                  <div className="selected-card-header">
                    <span className="selected-badge">
                      #{selectedLocation.order} · {unlockedLocations.has(selectedLocation.id) ? '✓ Đã mở khóa' : 'Chưa mở khóa'}
                    </span>
                    <span className="selected-coords">
                      {selectedLocation.lat.toFixed(5)}°B, {selectedLocation.lng.toFixed(5)}°Đ
                    </span>
                  </div>
                  <h3>{selectedLocation.name}</h3>
                  <p>{selectedLocation.description}</p>
                  <div className="selected-card-actions">
                    {unlockedLocations.has(selectedLocation.id) ? (
                      <a className="btn btn-gold" href={selectedLocation.detailPath}>
                        Xem chi tiết di sản →
                      </a>
                    ) : (
                      <a className="btn btn-primary" href="/Explore/Camera">
                        Mở camera xác minh (Cách {selectedLocation.distanceEst})
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cột Danh sách 10 địa danh đồng bộ tương tác */}
          <div className="map-sidebar-column">
            <LocationSidebar
              locations={MAP_LOCATIONS}
              unlockedLocations={unlockedLocations}
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default MapPage
