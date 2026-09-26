import { useState } from 'react'
import { MapPin, ChevronDown, Check } from 'lucide-react'
import { MAP_LOCATIONS } from '../../map/mapData.js'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { getLocationTranslationKey } from '../../../i18n/locationKeys.js'

export default function LocationBanner({
  targetLocation,
  setTargetLocation,
  distanceMeters,
  gpsAccuracy,
  isNearEnough,
}) {
  const { t } = useLanguage()
  const [showSelector, setShowSelector] = useState(false)

  return (
    <div className="camera-location-wrap">
      <div className="camera-location">
        <span className={`location-dot ${isNearEnough ? 'valid' : 'warning'}`}>●</span>
        <div className="location-info">
          <small>{t("camera.locationLabel")}</small>
          <div className="location-name-row" onClick={() => setShowSelector(!showSelector)}>
            <strong>{targetLocation?.name || t("camera.temple")}</strong>
            <span className="location-selector-trigger" title={t("camera.changeLocation")}>
              <ChevronDown size={14} />
            </span>
          </div>
          <span>
            {t("camera.accuracy", { accuracy: gpsAccuracy ?? "—", distance: distanceMeters ?? "—" })}
          </span>
        </div>

        <div className={`distance-pill ${isNearEnough ? 'green' : 'amber'}`}>
          {isNearEnough ? t("camera.valid") : t("camera.distance", { distance: distanceMeters ?? "—" })}
        </div>
      </div>

      {/* Select a different heritage site */}
      {showSelector && (
        <div className="location-dropdown-menu">
          <div className="dropdown-header">
            <span>{t("camera.chooseLocation")}</span>
            <button type="button" onClick={() => setShowSelector(false)}>✕</button>
          </div>
          <div className="dropdown-list">
            {MAP_LOCATIONS.map((loc) => {
              const nameKey = getLocationTranslationKey(loc.id)
              const locationName = t('locations.names.' + nameKey)
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
                  <img src={loc.image} alt={locationName} className="item-thumb" />
                  <div className="item-info">
                    <span className="item-name">#{loc.order} {locationName}</span>
                    <span className="item-desc">{t("locations.descriptions." + nameKey)}</span>
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
