import JourneyCard from '../../components/journey-card/JourneyCard.jsx'
import { useLanguage } from '../../i18n/LanguageContext.jsx'

const stampKeys = { interpret: 'khueVanCac', 'location-van-mieu-gate': 'vanMieuGate', 'location-dai-trung-gate': 'daiTrungGate', 'location-dai-thanh-gate': 'daiThanhGate', 'location-dien-dai-thanh': 'dienDaiThanh', 'location-thai-hoc-gate': 'thaiHocGate', 'location-thai-hoc-house': 'thaiHocHouse', 'location-bell-drum-tower': 'bellDrum', 'location-octagonal-house': 'octagonalHouse', 'location-phuong-dinh': 'phuongDinh' }
const stamps = [
  ['interpret', 'Khue Van Pavilion', 'khue-van-cac.jpg'],
  ['location-van-mieu-gate', 'Temple of Literature Gate', 'cong-van-mieu.jpg'],
  ['location-dai-trung-gate', 'Dai Trung Gate', 'cong-dai-trung.jpg'],
  ['location-dai-thanh-gate', 'Dai Thanh Gate', 'cong-dai-thanh.jpg'],
  ['location-dien-dai-thanh', 'Dai Thanh Hall', 'dien-dai-thanh.jpg'],
  ['location-thai-hoc-gate', 'Thai Hoc Gate', 'cong-thai-hoc.jpg'],
  ['location-thai-hoc-house', 'Thai Hoc Hall', 'nha-thai-hoc.jpg'],
  ['location-bell-drum-tower', 'Bell and Drum Towers', 'lau-chuong-lau-trong.jpg'],
  ['location-octagonal-house', 'Octagonal Pavilion', 'nha-bat-giac.jpg'],
  ['location-phuong-dinh', 'Phuong Dinh Pavilion', 'phuong-dinh.jpg'],
]

const milestones = [
  { threshold: 1, titleKey: 'passport.first', rewardKey: 'passport.firstReward', image: 'first-steps.png' },
  { threshold: 3, titleKey: 'passport.seeker', rewardKey: 'passport.seekerReward', image: 'heritage-seeker.png' },
  { threshold: 5, titleKey: 'passport.complete', rewardKey: 'passport.completeReward', image: 'journey-complete.png' },
  { threshold: 10, titleKey: 'passport.scholar', rewardKey: 'passport.scholarReward', image: 'dedicated-scholar.png' },
]

function PassportPage({ userId, unlockedLocations }) {
  const { t } = useLanguage()
  const unlockedCount = stamps.filter(([id]) => unlockedLocations.has(id)).length

  const milestone =
    unlockedCount >= 10
      ? 'platinum'
      : unlockedCount >= 5
        ? 'gold'
        : unlockedCount >= 3
          ? 'silver'
          : unlockedCount >= 1
            ? 'bronze'
            : 'locked'

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
                  <div className={`stamp art-stamp${unlocked ? ` collected ${milestone}` : ''}`}>
                    <img src={`/images/passport/${image}`} alt={t("passport.stampAlt", { name: t("locations.names." + stampKeys[id]) })} />
                  </div>
                  <span>{t("locations.names." + stampKeys[id])}</span>
                </div>
              )
            })}
          </div>
        </section>
        <section className="section" aria-label={t("passport.today")}>
          <JourneyCard
            userId={userId}
            unlockedLocations={unlockedLocations}
          />
        </section>
        <section className="section">
          <h2>{t("passport.milestones")}</h2>
          <br />
          <div className="milestones">
            {milestones.map(({ threshold, titleKey, rewardKey, image }) => {
              const achieved = unlockedCount >= threshold
              const title = t(titleKey)
              return (
                <article className={`milestone ${achieved ? 'achieved' : ''}`} key={threshold}>
                  <div className="milestone-icon">
                    <img
                      src={`/images/milestones/${image}`}
                      alt={t('passport.milestoneArtAlt', { name: title })}
                    />
                  </div>
                  <div>
                    <h3>{title}</h3>
                    <p>{t(rewardKey, { count: Math.min(unlockedCount, threshold) })}</p>
                  </div>
                </article>
              )
            })}
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
