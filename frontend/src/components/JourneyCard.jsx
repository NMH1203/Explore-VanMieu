import { paths } from '../routes.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

const journeyLocations = [
  ['interpret', 'locations.names.khueVanCac'],
  ['location-dai-trung-gate', 'locations.names.daiTrungGate'],
  ['location-dien-dai-thanh', 'locations.names.dienDaiThanh'],
  ['location-thai-hoc-house', 'locations.names.thaiHocHouse'],
  ['location-phuong-dinh', 'locations.names.phuongDinh'],
]

function JourneyCard({ unlockedLocations }) {
  const { t } = useLanguage()
  const journeyCount = journeyLocations.filter(([id]) => unlockedLocations.has(id)).length

  return (
    <div className="journey-card">
      <div className="journey-copy">
        <span className="eyebrow">{t("passport.today")}</span>
        <h2>{t("journey.title")}</h2>
        <p>
          Hệ thống đã chọn 5 địa điểm không trùng lặp. Hoàn thành xác minh GPS và camera để đánh
          thức từng lớp di sản.
        </p>
        <div className="progress-label">
          <span>{t("journey.progress")}</span>
          <strong>{t("journey.count", { count: journeyCount })}</strong>
        </div>
        <div className="progress">
          <i style={{ width: `${journeyCount * 20}%` }}></i>
        </div>
        <br />
        <a className="btn btn-gold" href={paths.map}>
          {t("journey.continue")}
        </a>
      </div>
      <div className="journey-list">
        {journeyLocations.map(([id, name], index) => (
          <div className="journey-stop" key={id}>
            <span className="stop-no">{unlockedLocations.has(id) ? '✓' : index + 1}</span>
            {t(name)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default JourneyCard
