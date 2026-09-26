import { Award, Check, LockKeyhole } from 'lucide-react'
import { paths } from '../../routes.js'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import HeritageMessageBox from './components/HeritageMessageBox.jsx'

const items = [
  [
    'location-van-mieu-gate',
    'Site',
    'Temple of Literature Gate',
    'van-mieu-gate.webp',
    'Beginning of the scholarly axis',
    'The main entrance begins a journey through the complex’s five courtyards. Its three-part gate marks a solemn boundary between the city and the heritage grounds.',
  ],
  [
    'location-dai-trung-gate',
    'Site',
    'Dai Trung Gate',
    'dai-trung-gate.webp',
    'Gateway to the heart of the complex',
    'Dai Trung Gate marks the transition into the inner grounds. The smaller Thanh Duc and Dat Tai gates evoke the cultivation of virtue and talent.',
  ],
  [
    'interpret',
    'Awakened heritage',
    'Khue Van Pavilion',
    'khue-van-cac.webp',
    'A symbol of literature and the light of knowledge',
    'Built in the early 19th century, the pavilion is known for its square tower, eight roofs, and four round windows. Its name refers to the star Khue, associated with literature.',
  ],
  [
    'location-dai-thanh-gate',
    'Site',
    'Dai Thanh Gate',
    'dai-thanh-gate.webp',
    'Entrance to the sanctuary',
    'Dai Thanh Gate leads to the sanctuary of Confucius and other sages. Its name evokes great achievement in learning and virtue.',
  ],
  [
    'location-dien-dai-thanh',
    'Site',
    'Dai Thanh Hall',
    'dien-dai-thanh.webp',
    'The Temple of Literature’s main sanctuary',
    'Dai Thanh Hall is the central sanctuary, honoring Confucius and Confucian sages in a solemn lacquered timber setting.',
  ],
  [
    'location-thai-hoc-gate',
    'Site',
    'Thai Hoc Gate',
    'thai-hoc-gate.webp',
    'Gateway to the Imperial Academy precinct',
    'The gate links the Dai Thanh and Thai Hoc precincts. Its three bays, traditional tiled roof, and broad courtyard extend the visitor’s view along the site axis.',
  ],
  [
    'location-thai-hoc-house',
    'Site',
    'Thai Hoc Hall',
    'thai-hoc-building.webp',
    'Continuing the national education tradition',
    'Built on the grounds of the former Imperial Academy, the Thai Hoc precinct presents the history of education and commemorates those who advanced learning.',
  ],
  [
    'location-bell-drum-tower',
    'Site',
    'Bell and Drum Towers',
    'bell-drum-tower.webp',
    'A balanced pair of buildings',
    'Standing on either side of the Thai Hoc precinct, the towers create a balanced composition and recall the rhythms of ceremony and daily life at a traditional academy.',
  ],
  [
    'location-octagonal-house',
    'Site',
    'Octagonal Pavilion',
    'octagonal-house.webp',
    'An octagonal space rich in symbolism',
    'Its eight-sided plan and graceful roof make this pavilion a harmonious pause among the greenery and visitor paths.',
  ],
  [
    'location-phuong-dinh',
    'Site',
    'Phuong Dinh Pavilion',
    'phuong-dinh.webp',
    'A resting place by Van Lake',
    'The square pavilion links the landscape of Van Lake with the historic complex, offering a place to rest and take in the visitor route.',
  ],
  [
    'figure-ly-thanh-tong',
    'Historical figure',
    'Ly Thanh Tong',
    'ly-thanh-tong.jpg',
    'The king who founded the Temple of Literature',
    'In 1070, Ly Thanh Tong founded the Temple of Literature in Thang Long, beginning a tradition of honoring learning and the sages of the past.',
  ],
  [
    'figure-ly-nhan-tong',
    'Historical figure',
    'Ly Nhan Tong',
    'ly-nhan-tong.jpg',
    'Founder of the Imperial Academy',
    'He held the first royal examination in 1075 and established the Imperial Academy in 1076 to educate the country’s talent.',
  ],
  [
    'figure-le-thanh-tong',
    'Historical figure',
    'Le Thanh Tong',
    'le-thanh-tong.jpg',
    'A king who championed talent and examinations',
    'In 1484, the king commissioned the first doctoral steles to honor distinguished scholars and encourage learning.',
  ],
  [
    'figure-chu-van-an',
    'Historical figure',
    'Chu Van An',
    'chu-van-an.jpg',
    'A teacher for the ages',
    'Chu Van An served as rector of the Imperial Academy. His integrity and upright character became an enduring model for teachers.',
  ],
  [
    'figure-confucius',
    'Historical figure',
    'Confucius',
    'confucius-statue.jpg',
    'The exemplary teacher for all generations',
    'Confucius was a major Eastern thinker and teacher. The Temple of Literature honors him and stands as a symbol of learning and moral cultivation.',
  ],
  [
    'figure-four-sages',
    'Historical figure',
    'Four Sages',
    'nhan-tu.webp',
    'Four sages honored alongside Confucius',
    'The Four Sages are Yan Hui, Zengzi, Zisi, and Mencius, who inherited and developed Confucius’s teachings.',
  ],
].map(([id, type, title, file, heading, story]) => ({
  id,
  type,
  title,
  heading,
  story,
  image: `/images/heritage/${file}`,
}))

function Detail({ item, unlocked }) {
  const { t } = useLanguage()
  if (!unlocked) {
    return (
      <section className="screen" id={item.id}>
        <div className="locked-detail">
          <LockKeyhole size={44} aria-hidden="true" />
          <h1>{t("detail.items." + item.id + ".title")}</h1>
          <p>{t("detail.locked")}</p>
          <a className="btn btn-primary" href={paths.locations}>
            {t("detail.backToSites")}
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="screen" id={item.id}>
      <div className="interpret-layout">
        <div className="interpret-visual">
          <img className="interpret-art heritage-photo" src={item.image} alt={t("detail.items." + item.id + ".title")} />
          <div className="interpret-title">
            <span className="eyebrow">{t("detail.items." + item.id + ".type")}</span>
            <h1>{t("detail.items." + item.id + ".title")}</h1>
            <span>{t("nav.version")}</span>
          </div>
          <a className="interpret-scroll" href={`#${item.id}-story`}>
            {t("detail.exploreStory")} <span>↓</span>
          </a>
        </div>
        <div className="interpret-content" id={`${item.id}-story`}>
          <div className="interpret-story-grid">
            <div>
              <div className="success">
                <span>
                  <Check size={20} />
                </span>
                <div>
                  <b>{t("detail.unlocked")}</b>
                  <span>{t("detail.materials")}</span>
                </div>
              </div>
              <article className="article">
                <span className="kicker">{t("detail.story")}</span>
                <h2>{t("detail.items." + item.id + ".heading")}</h2>
                <p>{t("detail.items." + item.id + ".story")}</p>
              </article>
              <div className="fact">
                <strong>{t("detail.featured")}</strong>
                <br />
                {t("detail.items." + item.id + ".story")}
              </div>
            </div>
            <div>
              <div className="achievement-gate">
                <div className="before-unlock">
                  <div className="achievement-icon">
                    <Award size={28} />
                  </div>
                  <h2>{t("detail.continue")}</h2>
                  <p>{t("detail.continueDescription")}</p>
                  <a className="btn btn-primary" href={paths.explore}>
                    {t("detail.backToJourney")}
                  </a>
                </div>
              </div>
              <article className="article heritage-stamp">
                <span className="kicker">{t("detail.yourStamp")}</span>
                <h2>{t("detail.recorded")}</h2>
                <p>{t("detail.added")}</p>
                <a className="btn btn-outline" href={paths.passport}>
                  {t("detail.viewPassport")}
                </a>
              </article>
            </div>
          </div>
          {!item.id.startsWith('figure-') && (
            <HeritageMessageBox
              locationId={item.id}
              locationName={t("detail.items." + item.id + ".title")}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default function LocationDetailPage({ id, unlockedLocations }) {
  const item = items.find((candidate) => candidate.id === id)
  if (!item) return null

  return <Detail item={item} unlocked={item.type === 'Historical figure' || unlockedLocations.has(item.id)} />
}
