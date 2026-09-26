import { Check, ArrowRight, BookOpen, RotateCcw } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { getLocationTranslationKey } from '../../../i18n/locationKeys.js'

export default function ScanResultModal({
  location,
  distanceMeters,
  onResetScan,
}) {
  const { t } = useLanguage()
  if (!location) return null
  const locationName = t('locations.names.' + getLocationTranslationKey(location.id))

  return (
    <div className="camera-bottom scan-result-modal">
      <div className="result-check">
        <Check size={28} strokeWidth={3} />
      </div>

      <div className="result-copy">
        <span className="camera-kicker">{t("camera.recognized")}</span>
        <h2>{locationName}</h2>
        <p>
          <b>{t("camera.gpsValid")}</b> {t("camera.distance", { distance: distanceMeters })}.
          <br />
          {t("camera.confirmed")}
        </p>

        <div className="result-actions">
          <a className="btn btn-gold" href={location.detailPath}>
            {t("camera.heritageInfo")} <ArrowRight size={14} />
          </a>
          <a className="btn btn-outline-light" href="/Explore/Ho-Chieu">
            <BookOpen size={14} /> {t("camera.openPassport")}
          </a>
          <button type="button" className="scan-again-btn" onClick={onResetScan}>
            <RotateCcw size={14} /> {t("camera.scanAgain")}
          </button>
        </div>
      </div>
    </div>
  )
}
