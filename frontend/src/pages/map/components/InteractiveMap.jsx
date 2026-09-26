import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { VAN_MIEU_BOUNDS } from '../mapData.js'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'

export default function InteractiveMap({
  locations,
  unlockedLocations,
  selectedLocation,
  onSelectLocation,
}) {
  const { t } = useLanguage()
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})

  // Initialize the Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return

    // Avoid initializing the map more than once
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

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // Add zoom controls in the bottom right corner
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Update markers when locations or unlock status change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Remove existing markers
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

  // Pan to the selected location
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

      {/* Status legend */}
      <div className="map-overlay-legend">
        <span>
          <i className="dot jade"></i> {t("common.unlocked")}
        </span>
        <span>
          <i className="dot stone"></i> {t("common.locked")}
        </span>
      </div>

      {/* Map controls */}
      <div className="map-overlay-controls">
        <button
          type="button"
          className="map-control-btn"
          title={t("map.overviewTitle")}
          onClick={handleResetView}
        >
          ⌖ {t("map.overview")}
        </button>
      </div>
    </div>
  )
}
