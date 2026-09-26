import { LockKeyhole } from 'lucide-react'
import { detailPaths, paths } from '../../routes.js'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import { LOCATION_TRANSLATION_KEYS } from '../../i18n/locationKeys.js'

const locations = [
  {
    id: 'location-van-mieu-gate',
    name: 'Temple of Literature Gate',
    image: 'van-mieu-gate.webp',
    description: 'The first entrance opens onto the architectural axis and scholarly grounds.',
    distance: '280 m',
  },
  {
    id: 'location-dai-trung-gate',
    name: 'Dai Trung Gate',
    image: 'dai-trung-gate.webp',
    description: 'The gate leads into the heart of the complex.',
    distance: '46 m',
  },
  {
    id: 'interpret',
    name: 'Khue Van Pavilion',
    image: 'khue-van-cac.webp',
    description: 'A symbol of literature, wisdom, and the capital Hanoi.',
    distance: '32 m',
  },
  {
    id: 'location-dai-thanh-gate',
    name: 'Dai Thanh Gate',
    image: 'dai-thanh-gate.webp',
    description: 'The gate marks the entrance to the solemn sanctuary.',
    distance: '95 m',
  },
  {
    id: 'location-dien-dai-thanh',
    name: 'Dai Thanh Hall',
    image: 'dien-dai-thanh.webp',
    description: 'A sanctuary honoring Confucius and the sages of Confucian learning.',
    distance: '120 m',
  },
  {
    id: 'location-thai-hoc-gate',
    name: 'Thai Hoc Gate',
    image: 'thai-hoc-gate.webp',
    description: 'The passage into an area commemorating Vietnam\'s educational tradition.',
    distance: '185 m',
  },
  {
    id: 'location-thai-hoc-house',
    name: 'Thai Hoc Hall',
    image: 'thai-hoc-building.webp',
    description: 'A monument honoring the Imperial Academy and its notable teachers.',
    distance: '210 m',
  },
  {
    id: 'location-bell-drum-tower',
    name: 'Bell and Drum Towers',
    image: 'bell-drum-tower.webp',
    description: 'A pair of buildings lending balance to the Thai Hoc precinct.',
    distance: '235 m',
  },
  {
    id: 'location-octagonal-house',
    name: 'Octagonal Pavilion',
    image: 'octagonal-house.webp',
    description: 'An octagonal architectural space rich in symbolism.',
    distance: '260 m',
  },
  {
    id: 'location-phuong-dinh',
    name: 'Phuong Dinh Pavilion',
    image: 'phuong-dinh.webp',
    description: 'A resting point linking the landscape to the visitor route.',
    distance: '175 m',
  },
]

function LocationCard({ location, unlocked, t }) {
  return (
    <article className={`location-card${unlocked ? '' : ' locked'}`}>
      <div className="location-image">
        <img
          className="shape-art heritage-photo"
          src={`/images/heritage/${location.image}`}
          alt={t('locations.names.' + LOCATION_TRANSLATION_KEYS[location.id])}
          loading="lazy"
        />
        <span className={`badge${unlocked ? ' done' : ''}`}>
          {unlocked ? '✓ ' + t('common.unlocked') : t('common.locked')}
        </span>
      </div>
      <div className="location-body">
        <h3>
          {unlocked ? <a href={detailPaths[location.id]}>{t('locations.names.' + LOCATION_TRANSLATION_KEYS[location.id])}</a> : t('locations.names.' + LOCATION_TRANSLATION_KEYS[location.id])}
        </h3>
        <p>{t('locations.descriptions.' + LOCATION_TRANSLATION_KEYS[location.id])}</p>
        <div className="meta">
          <span>⌖ {location.distance}</span>
        </div>
        {unlocked ? (
          <a className="btn btn-outline btn-block" href={detailPaths[location.id]}>
            {t('common.readStory')}
          </a>
        ) : (
          <button className="btn btn-outline btn-block locked-action" type="button" disabled>
            <LockKeyhole size={16} aria-hidden="true" />
            {t('common.locked')}
          </button>
        )}
      </div>
    </article>
  )
}

function LocationsPage({ unlockedLocations }) {
  const { t } = useLanguage()
  const unlockedCount = locations.filter((location) => unlockedLocations.has(location.id)).length

  return (
    <section className="screen" id="all-locations">
      <header className="topbar">
        <div className="inner">
          <div className="catalog-back">
            <a className="btn btn-light" href={paths.explore}>
              ← {t('common.back')}
            </a>
          </div>
          <div className="eyebrow">{t('locations.eyebrow')}</div>
          <h1>{t('locations.title')}</h1>
          <p>{t('locations.description')}</p>
        </div>
      </header>
      <div className="container">
        <div className="catalog-summary">
          <span>{t('locations.total')}</span>
          <span>{t('locations.unlockedCount', { count: unlockedCount })}</span>
          <span>{t('locations.lockedCount', { count: locations.length - unlockedCount })}</span>
        </div>
        <div className="cards all-cards">
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              unlocked={unlockedLocations.has(location.id)}
              t={t}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default LocationsPage
