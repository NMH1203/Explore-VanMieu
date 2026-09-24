import { LockKeyhole } from 'lucide-react'
import { detailPaths, paths } from '../../routes.js'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import { LOCATION_TRANSLATION_KEYS } from '../../i18n/locationKeys.js'

const locations = [
  {
    id: 'location-van-mieu-gate',
    name: 'Cổng Văn Miếu',
    image: 'van-mieu-gate.webp',
    description: 'Lối vào đầu tiên mở ra trục kiến trúc và không gian đạo học.',
    distance: '280 m',
  },
  {
    id: 'location-dai-trung-gate',
    name: 'Cổng Đại Trung',
    image: 'dai-trung-gate.webp',
    description: 'Cánh cổng dẫn vào không gian trung tâm của quần thể.',
    distance: '46 m',
  },
  {
    id: 'interpret',
    name: 'Khuê Văn Các',
    image: 'khue-van-cac.webp',
    description: 'Biểu tượng của văn chương, trí tuệ và Thủ đô Hà Nội.',
    distance: '32 m',
  },
  {
    id: 'location-dai-thanh-gate',
    name: 'Cổng Đại Thành',
    image: 'dai-thanh-gate.webp',
    description: 'Cánh cổng đánh dấu lối vào khu điện thờ trang nghiêm.',
    distance: '95 m',
  },
  {
    id: 'location-dien-dai-thanh',
    name: 'Điện Đại Thành',
    image: 'dien-dai-thanh.webp',
    description: 'Không gian thờ Khổng Tử và các bậc hiền triết Nho học.',
    distance: '120 m',
  },
  {
    id: 'location-thai-hoc-gate',
    name: 'Cổng Thái Học',
    image: 'thai-hoc-gate.webp',
    description: 'Lối chuyển tiếp vào khu vực tưởng niệm truyền thống giáo dục.',
    distance: '185 m',
  },
  {
    id: 'location-thai-hoc-house',
    name: 'Nhà Thái Học',
    image: 'thai-hoc-building.webp',
    description: 'Công trình tôn vinh Quốc Tử Giám và những người thầy tiêu biểu.',
    distance: '210 m',
  },
  {
    id: 'location-bell-drum-tower',
    name: 'Lầu Chuông – Lầu Trống',
    image: 'bell-drum-tower.webp',
    description: 'Cặp công trình tạo nhịp điệu cân xứng cho khu Thái Học.',
    distance: '235 m',
  },
  {
    id: 'location-octagonal-house',
    name: 'Nhà Bát Giác',
    image: 'octagonal-house.webp',
    description: 'Không gian kiến trúc tám cạnh giàu tính biểu tượng.',
    distance: '260 m',
  },
  {
    id: 'location-phuong-dinh',
    name: 'Phương Đình',
    image: 'phuong-dinh.webp',
    description: 'Điểm dừng chân nối kết cảnh quan và trục tham quan.',
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
