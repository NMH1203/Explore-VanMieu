import { useMemo, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import { getLocationTranslationKey } from '../../i18n/locationKeys.js'
import { MAP_LOCATIONS } from '../../data/mapLocations.js'
import InteractiveMap from '../../components/map-view/InteractiveMap.jsx'
import LocationSidebar from '../../components/map-view/LocationSidebar.jsx'
import './map.css'

function MapPage({ unlockedLocations }) {
  const { t } = useLanguage()
  const [selectedLocationId, setSelectedLocationId] = useState(MAP_LOCATIONS[0].id)
  const locations = useMemo(() => MAP_LOCATIONS.map((location) => {
    const key = getLocationTranslationKey(location.id)
    return { ...location, name: t('locations.names.' + key), description: t('locations.descriptions.' + key), tagline: t('locations.descriptions.' + key) }
  }), [t])
  const selectedLocation = locations.find(({ id }) => id === selectedLocationId)
  const unlockedCount = locations.filter(({ id }) => unlockedLocations.has(id)).length

  return (
    <section className="screen" id="map">
      <header className="topbar"><div className="inner">
        <div className="eyebrow">{t('map.eyebrow')}</div>
        <h1>{t('map.title')}</h1>
        <p>{t('map.description', { count: unlockedCount })}</p>
      </div></header>
      <div className="container"><div className="map-page-grid">
        <div className="map-main-column">
          <InteractiveMap locations={locations} unlockedLocations={unlockedLocations} selectedLocation={selectedLocation} onSelectLocation={(location) => setSelectedLocationId(location.id)} />
          {selectedLocation && <div className="map-selected-card">
            <img src={selectedLocation.image} alt={selectedLocation.name} className="selected-card-thumb" />
            <div className="selected-card-body">
              <div className="selected-card-header">
                <span className="selected-badge">#{selectedLocation.order} · {unlockedLocations.has(selectedLocation.id) ? '✓ ' + t('map.valid') : t('map.locked')}</span>
                <span className="selected-coords">{selectedLocation.lat.toFixed(5)}°N, {selectedLocation.lng.toFixed(5)}°E</span>
              </div>
              <h3>{selectedLocation.name}</h3><p>{selectedLocation.description}</p>
              <div className="selected-card-actions">
                {unlockedLocations.has(selectedLocation.id)
                  ? <a className="btn btn-gold" href={selectedLocation.detailPath}>{t('map.story')} →</a>
                  : <a className="btn btn-primary" href="/Explore/Camera">{t('map.verifySite')}</a>}
              </div>
            </div>
          </div>}
        </div>
        <div className="map-sidebar-column">
          <LocationSidebar locations={locations} unlockedLocations={unlockedLocations} selectedLocation={selectedLocation} onSelectLocation={(location) => setSelectedLocationId(location.id)} />
        </div>
      </div></div>
    </section>
  )
}

export default MapPage
