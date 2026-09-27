import { useState } from 'react'
import { MAP_LOCATIONS } from '../../../data/mapLocations.js'
import { useReward } from '../../../store/RewardContext.jsx'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { getLocationTranslationKey } from '../../../i18n/locationKeys.js'

export default function TestCamera({ onVerifyCheckin, onExit }) {
  const { reward } = useReward()
  const { t, lang } = useLanguage()
  const vi = lang === 'vi'
  const locations = [...MAP_LOCATIONS].sort((a, b) => Number(reward?.target_ids.includes(b.id)) - Number(reward?.target_ids.includes(a.id)))
  const [selected, setSelected] = useState(locations[0].id)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const location = locations.find(item => item.id === selected)
  const name = t('locations.names.' + getLocationTranslationKey(selected))
  async function capture() {
    if (busy || !ready) return
    setBusy(true); setError('')
    try {
      const result = await onVerifyCheckin({ locationId: selected, testMode: true })
      if (!result.verified) throw new Error(result.message || (vi ? 'Chưa xác minh được địa điểm.' : 'Site could not be verified.'))
      setSelected(result.location_id)
      setDone(true)
    }
    catch (e) { setError(e.message) }
    finally { setBusy(false) }
  }
  return <section className="screen camera-test-page">
    <header><h1>{vi ? 'Camera thử nghiệm' : 'Test camera'}</h1>
      <p>{vi ? 'Dùng ảnh có sẵn · Không kiểm tra GPS/AI · Lưu mở khóa thật vào tài khoản test.' : 'Sample images · No GPS/AI verification · Saves unlocks to the test account.'}</p>
      <button className="btn btn-outline" onClick={onExit} disabled={busy}>{vi ? 'Dùng camera thật' : 'Use live camera'}</button>
    </header>
    <label htmlFor="test-camera-site">{vi ? 'Chọn địa điểm (★ là điểm quan trọng)' : 'Choose a site (★ marks a journey target)'}</label>
    <select id="test-camera-site" value={selected} disabled={busy} onChange={e => { setSelected(e.target.value); setReady(false); setDone(false); setError('') }}>
      {locations.map(item => <option key={item.id} value={item.id}>{reward?.target_ids.includes(item.id) ? '★ ' : ''}{t('locations.names.' + getLocationTranslationKey(item.id))}</option>)}
    </select>
    <img key={selected} src={location.image} alt={name} onLoad={() => setReady(true)} onError={() => { setReady(false); setError(vi ? 'Không tải được ảnh.' : 'Unable to load image.') }} />
    <div className="test-camera-actions">
      {!done && <button type="button" className="camera-shutter" onClick={capture} disabled={busy || !ready} aria-label={vi ? 'Chụp thử và mở khóa' : 'Test capture and unlock'}><span /></button>}
      <p role="status">{done ? (vi ? `Bạn đã tới ${name}! Địa điểm đã được mở khóa.` : `You have arrived at ${name}! This site is now unlocked.`) : busy ? (vi ? 'Đang lưu…' : 'Saving…') : (vi ? 'Bấm chụp để mở khóa địa điểm này' : 'Capture to unlock this site')}</p>
      {error && <p role="alert">{error}</p>}
      {done && <a className="btn btn-gold" href={location.detailPath}>{vi ? 'Đi tới trang thông tin' : 'View site information'} →</a>}
    </div>
  </section>
}
