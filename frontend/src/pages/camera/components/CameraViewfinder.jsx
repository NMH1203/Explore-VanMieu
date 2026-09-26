import { Camera, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { useLanguage } from '../../../i18n/LanguageContext.jsx'
import { getLocationTranslationKey } from '../../../i18n/locationKeys.js'

export default function CameraViewfinder({
  videoRef,
  isStreaming,
  hasPermission,
  cameraError,
  isAnalyzing,
  capturedImage,
  targetLocation,
  onSimulateCapture,
}) {
  const { t } = useLanguage()
  const targetName = targetLocation ? t('locations.names.' + getLocationTranslationKey(targetLocation.id)) : t('camera.defaultSite')
  return (
    <div className="camera-viewfinder-container">
      {/* 1. Live video or fallback layer */}
      <video
          ref={videoRef}
          style={{ display: isStreaming ? undefined : 'none' }}
          playsInline
          autoPlay
          muted
          className={`camera-live-video ${isAnalyzing ? 'blur' : ''}`}
        />
      {!isStreaming && (
        <div
          className="camera-art-fallback"
          style={{
            backgroundImage: `url(${targetLocation?.image || '/images/heritage/khue-van-cac.webp'})`,
          }}
        >
          <div className="fallback-badge">
            {cameraError ? (
              <span>
                <AlertCircle size={14} /> {t("camera.simulation")}
              </span>
            ) : (
              <span>
                <Camera size={14} /> {t("camera.connecting")}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Display the captured frame when available */}
      {capturedImage && (
        <img src={capturedImage} alt={t("camera.captured")} className="captured-preview-img" />
      )}

      {/* 2. Heritage viewfinder */}
      <div className={`viewfinder ${isAnalyzing ? 'analyzing' : ''}`}>
        <span className="corner tl"></span>
        <span className="corner tr"></span>
        <span className="corner bl"></span>
        <span className="corner br"></span>

        {/* Viewfinder instructions */}
        <div className="scan-hint">
          {isAnalyzing
            ? t("camera.analyzingHint")
            : t("camera.frameHint", { name: targetName })}
        </div>
      </div>
    </div>
  )
}
