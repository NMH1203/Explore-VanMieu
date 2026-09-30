import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import { getLocationTranslationKey } from '../../i18n/locationKeys.js'
import { Camera as CameraIcon } from 'lucide-react'
import { useCameraStream } from './hooks/useCameraStream.js'
import { useLiveLocation } from './hooks/useLiveLocation.js'
import CameraViewfinder from './components/CameraViewfinder.jsx'
import ScanResultModal from './components/ScanResultModal.jsx'
import { MAP_LOCATIONS } from '../../data/mapLocations.js'
import { paths } from '../../routes/index.js'
import './camera.css'

// Capture -> hooks/useCameraStream.js -> utils/cameraPreview.js and imageProcessing.js.
// GPS -> hooks/useLiveLocation.js. App.jsx supplies onVerifyCheckin, which calls
// services/check-in-service/index.js -> backend/src/routes/checkins.py. Only the
// server's verified response updates the shared ten-site passport progress.
function CameraPage({ onVerifyCheckin }) {
  const { t } = useLanguage()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isScanStarted, setIsScanStarted] = useState(false)
  const [isScanComplete, setIsScanComplete] = useState(false)
  const [verifiedSite, setVerifiedSite] = useState(null)
  const [scanError, setScanError] = useState('')
  const [captureError, setCaptureError] = useState('')
  const [sessionExpired, setSessionExpired] = useState(false)
  const verifyingRef = useRef(false)

  // 1. Manage the device camera
  const {
    videoRef,
    isStreaming,
    isStarting,
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
    retryLocation,
    targetLocation,
  } = useLiveLocation()

  const targetLocationKey = getLocationTranslationKey(targetLocation?.id)
  const displayedTargetLocation = targetLocation ? { ...targetLocation, name: t('locations.names.' + targetLocationKey) } : null
  const hasScanFailure = Boolean(scanError && capturedImage)
  const hasControlError = Boolean(captureError || cameraError || sessionExpired)

  useEffect(() => {
    if (userCoords) setCaptureError(error => error === 'noGps' ? '' : error)
  }, [userCoords])

  const handleBeginScan = async () => {
    setCaptureError('')
    if (!userCoords) retryLocation()
    setScanError('')
    setCapturedImage(null)
    setIsScanStarted(true)
    await startCamera()
  }

  // 3. Handle image recognition
  const handleCaptureAndVerify = async () => {
    if (verifyingRef.current || isStarting || sessionExpired) return

    setScanError('')
    setCaptureError('')
    const imageDataUrl = capturedImage || captureSnapshot()
    if (!imageDataUrl) {
      setCaptureError('noImage')
      return
    }
    if (!userCoords) {
      setCaptureError('noGps')
      retryLocation()
      return
    }

    verifyingRef.current = true
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
      if (error.status === 401) setSessionExpired(true)
      else setScanError(error.message)
    } finally {
      verifyingRef.current = false
      setIsAnalyzing(false)
    }
  }

  // Scan again
  const handleResetScan = () => {
    setCaptureError('')
    setCapturedImage(null)
    setIsScanComplete(false)
    setVerifiedSite(null)
    setIsAnalyzing(false)
    setIsScanStarted(false)
    setScanError('')
  }

  const handleRetryCapture = () => {
    setCaptureError('')
    if (!userCoords) retryLocation()
    if (!isStreaming) void startCamera()
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
            <div className={`camera-bottom scan-ready ${isScanStarted ? 'capture-active' : ''} ${hasScanFailure || hasControlError ? 'match-active' : ''}`}>
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
              ) : !hasScanFailure && !sessionExpired && (
                <div className="camera-capture-controls">
                  {!isStreaming && !capturedImage ? (
                    <button type="button" className="scan-button" onClick={handleBeginScan} disabled={isStarting}>
                      {t(isStarting ? 'camera.connecting' : 'camera.retryCamera')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`camera-shutter ${isAnalyzing ? 'scanning' : ''}`}
                      onClick={handleCaptureAndVerify}
                      disabled={isAnalyzing || isStarting}
                      aria-label={t(isAnalyzing ? 'camera.analyzing' : capturedImage ? 'camera.verifyPhoto' : 'camera.captureNow')}
                      title={t(isAnalyzing ? 'camera.analyzing' : capturedImage ? 'camera.verifyPhoto' : 'camera.captureNow')}
                    >
                      <span />
                    </button>
                  )}
                  {capturedImage && !isAnalyzing && (
                    <button type="button" className="scan-button" onClick={handleRetryCapture}>{t('camera.retryCapture')}</button>
                  )}
                </div>
              )}
              {hasControlError && (
                <div className="scan-failure-panel" role="alert">
                  <p>{t('camera.' + (sessionExpired ? 'sessionExpired' : cameraError || captureError))}</p>
                  {sessionExpired && (
                    <a className="scan-button" href={`${paths.register}?next=${encodeURIComponent(paths.camera)}`}>{t('auth.login')}</a>
                  )}
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
