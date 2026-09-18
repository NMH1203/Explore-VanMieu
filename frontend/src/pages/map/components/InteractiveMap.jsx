import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { VAN_MIEU_BOUNDS } from '../mapData.js'

export default function InteractiveMap({
  locations,
  unlockedLocations,
  selectedLocation,
  onSelectLocation,
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})

  // Khởi tạo Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Tránh khởi tạo nhiều lần
    if (mapInstanceRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: VAN_MIEU_BOUNDS.center,
      zoom: VAN_MIEU_BOUNDS.defaultZoom,
      minZoom: VAN_MIEU_BOUNDS.minZoom,
      maxZoom: VAN_MIEU_BOUNDS.maxZoom,
      maxBounds: VAN_MIEU_BOUNDS.maxBounds,
      maxBoundsViscosity: 0.8,
      zoomControl: false,
    })

    // Thêm tile layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // Thêm nút zoom ở góc phải dưới
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Cập nhật các Marker khi locations hoặc trạng thái mở khóa thay đổi
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Xóa các marker cũ nếu có
    Object.values(markersRef.current).forEach((marker) => marker.remove())
    markersRef.current = {}

    locations.forEach((loc) => {
      const isUnlocked = unlockedLocations.has(loc.id)
      const isSelected = selectedLocation?.id === loc.id

      const iconHtml = `
        <div class="custom-map-pin ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}">
          <span class="pin-badge">${isUnlocked ? '✓' : loc.order}</span>
          <span class="pin-tip"></span>
        </div>
      `

      const customIcon = L.divIcon({
        className: 'van-mieu-marker-wrapper',
        html: iconHtml,
        iconSize: [36, 44],
        iconAnchor: [18, 42],
      })

      const marker = L.marker([loc.lat, loc.lng], {
        icon: customIcon,
        title: loc.name,
      }).addTo(map)

      marker.on('click', () => {
        onSelectLocation(loc)
      })

      markersRef.current[loc.id] = marker
    })
  }, [locations, unlockedLocations, selectedLocation, onSelectLocation])

  // Khi selectedLocation thay đổi, lia bản đồ đến vị trí đó
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedLocation) return

    map.panTo([selectedLocation.lat, selectedLocation.lng], {
      animate: true,
      duration: 0.6,
    })
  }, [selectedLocation])

  function handleResetView() {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(VAN_MIEU_BOUNDS.center, VAN_MIEU_BOUNDS.defaultZoom, {
        animate: true,
      })
    }
  }

  return (
    <div className="interactive-map-wrapper">
      <div ref={mapContainerRef} className="interactive-map-canvas" />

      {/* Bảng chú giải trạng thái */}
      <div className="map-overlay-legend">
        <span>
          <i className="dot jade"></i> Đã mở khóa
        </span>
        <span>
          <i className="dot stone"></i> Chưa mở khóa
        </span>
      </div>

      {/* Phím bấm tiện ích trên bản đồ */}
      <div className="map-overlay-controls">
        <button
          type="button"
          className="map-control-btn"
          title="Xem toàn cảnh Văn Miếu"
          onClick={handleResetView}
        >
          ⌖ Toàn cảnh
        </button>
      </div>
    </div>
  )
}
