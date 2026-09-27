import { paths } from '../../routes/index.js'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import { useReward } from '../../store/RewardContext.jsx'
import { getLocationTranslationKey } from '../../i18n/locationKeys.js'
import { useState } from 'react'

function JourneyCard() {
  const { t, lang } = useLanguage()
  const { reward, error, claim, signedIn } = useReward()
  const [busy, setBusy] = useState(false)
  const [claimError, setClaimError] = useState('')
  const vi = lang === 'vi'
  const journeyLocations = (reward?.target_ids || []).map(id => [id, 'locations.names.' + getLocationTranslationKey(id)])
  const journeyCount = reward?.completed_ids.length || 0
  async function receive() {
    if (busy) return
    setBusy(true); setClaimError('')
    try { await claim() } catch (e) { setClaimError(e.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="journey-card">
      <div className="journey-copy">
        <span className="eyebrow">{vi ? 'HÀNH TRÌNH CỦA BẠN' : 'YOUR JOURNEY'}</span>
        <h2>{t("journey.title")}</h2>
        <p>
          {vi ? 'Khám phá và check-in 5 điểm quan trọng của bạn để nhận quà di sản và mở bảng màu Đỏ son.' : 'Visit and verify your five heritage targets to claim your reward and unlock the Vermilion theme.'}
        </p>
        <div className="progress-label">
          <span>{t("journey.progress")}</span>
          <strong>{t("journey.count", { count: journeyCount })}</strong>
        </div>
        <div className="progress">
          <i style={{ width: `${journeyCount * 20}%` }}></i>
        </div>
        <br />
        {reward?.completed && <p role="status">{vi ? 'Đã hoàn thành 5/5 điểm quan trọng. Bảng màu Đỏ son đã mở khóa!' : 'All 5 targets complete. The Vermilion theme is unlocked!'}</p>}
        {!reward && <p role="status">{error || (signedIn ? (vi ? 'Đang tải hành trình…' : 'Loading journey…') : (vi ? 'Đăng nhập để nhận hành trình riêng.' : 'Sign in for your own journey.'))}</p>}
        {(claimError || (reward && error)) && <p role="alert">{claimError || error}</p>}
        {reward?.completed && <button className="btn btn-gold" type="button" onClick={receive} disabled={busy || reward.claimed}>
          {reward.claimed ? (vi ? 'Đã nhận quà di sản' : 'Reward claimed') : busy ? (vi ? 'Đang nhận…' : 'Claiming…') : (vi ? 'Nhận quà di sản' : 'Claim reward')}
        </button>}
        <a className="btn btn-gold" href={paths.map}>
          {t("journey.continue")}
        </a>
      </div>
      <div className="journey-list">
        {journeyLocations.map(([id, name], index) => (
          <div className="journey-stop" key={id}>
            <span className="stop-no">{reward.completed_ids.includes(id) ? '✓' : index + 1}</span>
            {t(name)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default JourneyCard
