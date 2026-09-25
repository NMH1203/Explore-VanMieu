import JourneyCard from '../../components/JourneyCard.jsx'
import { useLanguage } from '../../i18n/LanguageContext.jsx'

const stampKeys = { interpret: 'khueVanCac', 'location-van-mieu-gate': 'vanMieuGate', 'location-dai-trung-gate': 'daiTrungGate', 'location-dai-thanh-gate': 'daiThanhGate', 'location-dien-dai-thanh': 'dienDaiThanh', 'location-thai-hoc-gate': 'thaiHocGate', 'location-thai-hoc-house': 'thaiHocHouse', 'location-bell-drum-tower': 'bellDrum', 'location-octagonal-house': 'octagonalHouse', 'location-phuong-dinh': 'phuongDinh' }
const stamps = [
  ['interpret', 'Khuê Văn Các', 'khue-van-cac.jpg'],
  ['location-van-mieu-gate', 'Cổng Văn Miếu', 'cong-van-mieu.jpg'],
  ['location-dai-trung-gate', 'Cổng Đại Trung', 'cong-dai-trung.jpg'],
  ['location-dai-thanh-gate', 'Cổng Đại Thành', 'cong-dai-thanh.jpg'],
  ['location-dien-dai-thanh', 'Điện Đại Thành', 'dien-dai-thanh.jpg'],
  ['location-thai-hoc-gate', 'Cổng Thái Học', 'cong-thai-hoc.jpg'],
  ['location-thai-hoc-house', 'Nhà Thái Học', 'nha-thai-hoc.jpg'],
  ['location-bell-drum-tower', 'Lầu Chuông – Lầu Trống', 'lau-chuong-lau-trong.jpg'],
  ['location-octagonal-house', 'Nhà Bát Giác', 'nha-bat-giac.jpg'],
  ['location-phuong-dinh', 'Phương Đình', 'phuong-dinh.jpg'],
]

function PassportPage({ unlockedLocations }) {
  const { t } = useLanguage()
  const unlockedCount = stamps.filter(([id]) => unlockedLocations.has(id)).length

  return (
    <section className="screen" id="passport">
      <header className="topbar">
        <div className="inner">
          <div className="eyebrow">{t("passport.eyebrow")}</div>
          <h1>{t("passport.title")}</h1>
          <p>{t("passport.explored", { count: unlockedCount })}</p>
        </div>
      </header>
      <div className="container passport-page">
        <section className="section">
          <div className="section-head">
            <div>
              <h2>{t("passport.stamps")}</h2>
              <p>{t("passport.stampDescription")}</p>
            </div>
            <strong>{unlockedCount}/10</strong>
          </div>
          <div className="stamp-grid">
            {stamps.map(([id, name, image]) => {
              const unlocked = unlockedLocations.has(id)
              return (
                <div className="stamp-wrap" key={id}>
                  <div className={`stamp art-stamp${unlocked ? ' collected' : ''}`}>
                    <img src={`/images/passport/${image}`} alt={t("passport.stampAlt", { name: t("locations.names." + stampKeys[id]) })} />
                  </div>
                  <span>{t("locations.names." + stampKeys[id])}</span>
                </div>
              )
            })}
          </div>
        </section>
        <section className="section" aria-label={t("passport.today")}>
          <JourneyCard unlockedLocations={unlockedLocations} />
        </section>
        <section className="section">
          <h2>{t("passport.milestones")}</h2>
          <br />
          <div className="milestones">
            <article className="milestone current">
              <div className="milestone-icon">★</div>
              <div>
                <h3>{t("passport.first")}</h3>
                <p>{t("passport.firstReward", { count: Math.min(unlockedCount, 1) })}</p>
              </div>
            </article>
            <article className="milestone">
              <div className="milestone-icon">○</div>
              <div>
                <h3>{t("passport.seeker")}</h3>
                <p>{t("passport.seekerReward", { count: Math.min(unlockedCount, 3) })}</p>
              </div>
            </article>
            <article className="milestone">
              <div className="milestone-icon">○</div>
              <div>
                <h3>{t("passport.complete")}</h3>
                <p>{t("passport.completeReward", { count: Math.min(unlockedCount, 5) })}</p>
              </div>
            </article>
            <article className="milestone">
              <div className="milestone-icon">○</div>
              <div>
                <h3>{t("passport.scholar")}</h3>
                <p>{t("passport.scholarReward", { count: unlockedCount })}</p>
              </div>
            </article>
          </div>
        </section>
        <a className="btn btn-primary btn-block" href="/Explore">
          {t("passport.continue")}
        </a>
      </div>
    </section>
  )
}

export default PassportPage
