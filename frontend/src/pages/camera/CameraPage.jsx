import { useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import { getLocationTranslationKey } from '../../i18n/locationKeys.js'
import { Camera as CameraIcon } from 'lucide-react'
import { useCameraStream } from './hooks/useCameraStream.js'
import { useLiveLocation } from './hooks/useLiveLocation.js'
import CameraViewfinder from './components/CameraViewfinder.jsx'
import ScanResultModal from './components/ScanResultModal.jsx'
import { MAP_LOCATIONS } from '../../data/mapLocations.js'
import './camera.css'

// AR Camera check-in page combining live camera stream, GPS coordinates, and server verification
function CameraPage({ onVerifyCheckin }) {
  const { t } = useLanguage()

  // Scanning workflow state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isScanStarted, setIsScanStarted] = useState(false)
  const [isScanComplete, setIsScanComplete] = useState(false)
  const [verifiedSite, setVerifiedSite] = useState(null)
  const [scanError, setScanError] = useState('')

  // 1. Manage the device camera stream and frame capture
  const {
    videoRef,
    isStreaming,
    hasPermission,
    cameraError,
    capturedImage,
    setCapturedImage,
    startCamera,
    captureSnapshot,
  } = useCameraStream()


  // 2. Manage GPS coordinates and the ten heritage sites
  const {
    userCoords,
    targetLocation,
  } = useLiveLocation()

  const targetLocationKey = getLocationTranslationKey(targetLocation?.id)
  const displayedTargetLocation = targetLocation ? { ...targetLocation, name: t('locations.names.' + targetLocationKey) } : null
  const hasScanFailure = Boolean(scanError && capturedImage)

  const handleBeginScan = async () => {
    setScanError('')
    setCapturedImage(null)
    setIsScanStarted(true)
    await startCamera()
  }

  // 3. Handle image recognition
  const handleCaptureAndVerify = async () => {
    if (isAnalyzing) return

    setScanError('')
    const imageDataUrl = capturedImage || captureSnapshot()
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
        latitude: userCoords.lat,
        longitude: userCoords.lng,
      })
      if (result.verified) {
        setVerifiedSite({ location: MAP_LOCATIONS.find(item => item.id === result.location_id), distance: result.distance_meters })
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
    setVerifiedSite(null)
    setIsAnalyzing(false)
    setIsScanStarted(false)
    setScanError('')
  }

  const handleRetryCapture = () => {
    setCapturedImage(null)
    setScanError('')
    setIsScanStarted(true)
  }

  return (
    <section className="screen" id="camera">
      <div className="camera-screen">
        <div className="camera-ui">
          {/* Top controls */}
          <div className="camera-top">
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

          </div>

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
            <div className={`camera-bottom scan-ready ${isScanStarted ? 'capture-active' : ''} ${hasScanFailure ? 'match-active' : ''}`}>
              {!isScanStarted && (
                <>
                  <span className="camera-kicker">{t("camera.kicker")}</span>
                  <h2>{t("camera.pointCamera")}</h2>
                  <p>{t("camera.description")}</p>
                </>
              )}

              {!isScanStarted ? (
                <button
                  type="button"
                  className="scan-button"
                  onClick={handleBeginScan}
                >
                  <CameraIcon size={16} />
                  <span>{t("camera.start")}</span>
                </button>
              ) : !hasScanFailure && (
                <div className="camera-capture-controls">
                  <button
                    type="button"
                    className={`camera-shutter ${isAnalyzing ? 'scanning' : ''}`}
                    onClick={handleCaptureAndVerify}
                    disabled={isAnalyzing}
                    aria-label={isAnalyzing ? t('camera.analyzing') : t('camera.captureNow')}
                    title={isAnalyzing ? t('camera.analyzing') : t('camera.captureNow')}
                  >
                    <span />
                  </button>
                </div>
              )}
              {hasScanFailure && (
                <div className="scan-failure-panel" role="alert">
                  <strong>{t('camera.matchFailed')}</strong>
                  <p>{scanError}</p>
                  <p>{t('camera.captureGuidance')}</p>
                  <button type="button" className="retry-match-button" onClick={handleRetryCapture}>
                    {t('camera.retryCapture')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <ScanResultModal
              location={verifiedSite?.location}
              distanceMeters={verifiedSite?.distance}
              onResetScan={handleResetScan}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default CameraPage
