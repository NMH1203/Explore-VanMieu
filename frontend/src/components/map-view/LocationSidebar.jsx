import { useEffect, useRef } from 'react'
import { Check, LockKeyhole, ArrowRight, Camera } from 'lucide-react'
import { useLanguage } from '../../i18n/LanguageContext.jsx'

// Sidebar component displaying a scrollable list of all 10 heritage locations next to the map
export default function LocationSidebar({
  locations,
  unlockedLocations,
  selectedLocation,
  onSelectLocation,
}) {
  const { t } = useLanguage()
  const itemRefs = useRef({})

  // Auto-scroll to the corresponding card in the list when a marker is clicked on the map
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
      {/* Header showing total unlocked locations counter */}
      <div className="sidebar-header">
        <div>
          <h3>{t("map.sites")}</h3>
          <p>{t("map.selectHint")}</p>
        </div>
        <span className="unlocked-counter">
          {locations.filter((l) => unlockedLocations.has(l.id)).length}/10
        </span>
      </div>

      {/* List of location cards */}
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
              {/* Thumbnail image and checkmark/order badge */}
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

              {/* Title, tagline, and contextual action buttons */}
              <div className="card-content">
                <div className="card-top-row">
                  <h4 className="card-title">{loc.name}</h4>
                </div>
                <p className="card-tagline">{loc.tagline}</p>

                {isSelected && (
                  <div className="card-actions-row" onClick={(e) => e.stopPropagation()}>
                    {isUnlocked ? (
                      <a href={loc.detailPath} className="btn-card-action primary">
                        {t("map.story")} <ArrowRight size={14} />
                      </a>
                    ) : (
                      <a href="/Explore/Camera" className="btn-card-action gold">
                        <Camera size={14} /> {t("camera.start")}
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

