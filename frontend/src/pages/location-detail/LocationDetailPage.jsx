import { Award, Check, LockKeyhole } from 'lucide-react'
import { paths } from '../../routes/index.js'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import HeritageMessageBox from './components/HeritageMessageBox.jsx'
import { useReward } from '../../store/RewardContext.jsx'
import { heritageItems } from '../../data/heritageItems.js'

function Detail({ item, unlocked }) {
  const { t } = useLanguage()
  const { reward } = useReward()
  const isFeaturedStop = reward?.completed_ids.includes(item.id)
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
                <h3>{t("detail.moreInformation")}</h3>
                <p>{t("detail.items." + item.id + ".fact1")}</p>
                <p>{t("detail.items." + item.id + ".fact2")}</p>
              </article>
              <div className="fact">
                <strong>{t("detail.featured")}</strong>
                <br />
                {t("detail.items." + item.id + ".fact1")}
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
              {isFeaturedStop && (
                <article className="article heritage-stamp">
                  <span className="kicker">{t("detail.yourStamp")}</span>
                  <h2>{t("detail.recorded")}</h2>
                  <p>{t("detail.added")}</p>
                  <a className="btn btn-outline" href={paths.passport}>
                    {t("detail.viewPassport")}
                  </a>
                </article>
              )}
            </div>
          </div>
          <HeritageMessageBox
            locationId={item.id}
            locationName={t("detail.items." + item.id + ".title")}
            subjectType={item.kind}
          />
        </div>
      </div>
    </section>
  )
}

export default function LocationDetailPage({ id, unlockedLocations }) {
  const item = heritageItems.find((candidate) => candidate.id === id)
  if (!item) return null

  return <Detail item={item} unlocked={item.kind === 'figure' || unlockedLocations.has(item.id)} />
}
