import { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import { getLocationTranslationKey } from '../../i18n/locationKeys.js'
import { ArrowLeft, Sun, SunMedium, Camera as CameraIcon } from 'lucide-react'
import { useCameraStream } from './hooks/useCameraStream.js'
import { useLiveLocation } from './hooks/useLiveLocation.js'
import CameraViewfinder from './components/CameraViewfinder.jsx'
import LocationBanner from './components/LocationBanner.jsx'
import ScanResultModal from './components/ScanResultModal.jsx'
import './camera.css'

function CameraPage({ onVerifyCheckin }) {
  const { t } = useLanguage()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isScanComplete, setIsScanComplete] = useState(false)
  const [scanError, setScanError] = useState('')

  // 1. Manage the device camera
  const {
    videoRef,
    isStreaming,
    hasPermission,
    cameraError,
    capturedImage,
    setCapturedImage,
    isTorchOn,
    toggleTorch,
    captureSnapshot,
  } = useCameraStream()

  // 2. Manage GPS coordinates and the ten heritage sites
  const {
    userCoords,
    targetLocation,
    setTargetLocation,
    distanceMeters,
    gpsAccuracy,
    isNearEnough,
  } = useLiveLocation()

  const targetLocationKey = getLocationTranslationKey(targetLocation?.id)
  const displayedTargetLocation = targetLocation ? { ...targetLocation, name: t('locations.names.' + targetLocationKey) } : null

  // 3. Handle image recognition
  const handleStartScan = async () => {
    if (isAnalyzing) return

    setScanError('')
    const imageDataUrl = captureSnapshot()
    if (!imageDataUrl) {
      setScanError(t('camera.noImage'))
      return
    }
    if (!userCoords) {
      setScanError(t('camera.noGps'))
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await onVerifyCheckin({
        imageDataUrl,
        locationId: targetLocation.id,
        latitude: userCoords.lat,
        longitude: userCoords.lng,
      })
      if (result.verified) {
        setIsScanComplete(true)
      } else {
        setScanError(result.message)
      }
    } catch (error) {
      setScanError(error.message)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Scan again
  const handleResetScan = () => {
    setCapturedImage(null)
    setIsScanComplete(false)
    setIsAnalyzing(false)
    setScanError('')
  }

  return (
    <section className="screen" id="camera">
      <div className="camera-screen">
        <div className="camera-ui">
          {/* Top controls */}
          <div className="camera-top">
            <a className="round-btn" href="/Explore/Ban-Do" title={t("common.back") + " " + t("common.map")}>
              <ArrowLeft size={18} />
            </a>

            <div className="camera-progress">
              <span className={!isScanComplete && !isAnalyzing ? 'active' : 'completed'}>
                1 · {t("camera.scan")}
              </span>
              <i></i>
              <span className={isAnalyzing ? 'active' : isScanComplete ? 'completed' : ''}>
                2 · {t("camera.recognition")}
              </span>
              <i></i>
              <span className={isScanComplete ? 'active' : ''}>
                3 · {t("camera.discover")}
              </span>
            </div>

            <button
              type="button"
              className={`round-btn ${isTorchOn ? 'torch-active' : ''}`}
              onClick={toggleTorch}
              title={t("camera.torch")}
              aria-label={t("camera.torchOn")}
            >
              {isTorchOn ? <SunMedium size={18} /> : <Sun size={18} />}
            </button>
          </div>

          {/* Live GPS location banner */}
          <LocationBanner
            targetLocation={displayedTargetLocation}
            setTargetLocation={setTargetLocation}
            distanceMeters={distanceMeters}
            gpsAccuracy={gpsAccuracy}
            isNearEnough={isNearEnough}
          />

          {/* Live camera and heritage viewfinder */}
          <CameraViewfinder
            videoRef={videoRef}
            isStreaming={isStreaming}
            hasPermission={hasPermission}
            cameraError={cameraError}
            isAnalyzing={isAnalyzing}
            capturedImage={capturedImage}
            targetLocation={displayedTargetLocation}
          />

          {/* Bottom controls */}
          {!isScanComplete ? (
            <div className="camera-bottom scan-ready">
              <span className="camera-kicker">{t("camera.kicker")}</span>
              <h2>{t("camera.pointCamera", { name: displayedTargetLocation?.name || t("camera.defaultSite") })}</h2>
              <p>
                {t("camera.description")}
              </p>

              <button
                type="button"
                className={`scan-button ${isAnalyzing ? 'scanning' : ''}`}
                onClick={handleStartScan}
                disabled={isAnalyzing}
              >
                <CameraIcon size={16} />
                <span>{isAnalyzing ? t("camera.analyzing") : t("camera.start")}</span>
              </button>
              {scanError && <p role="alert">{scanError}</p>}
            </div>
          ) : (
            <ScanResultModal
              location={displayedTargetLocation}
              distanceMeters={distanceMeters}
              onResetScan={handleResetScan}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default CameraPage
