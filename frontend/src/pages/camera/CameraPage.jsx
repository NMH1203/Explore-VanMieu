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

function CameraPage({ onVerifyCheckin }) {
  const { t } = useLanguage()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isScanStarted, setIsScanStarted] = useState(false)
  const [isScanComplete, setIsScanComplete] = useState(false)
  const [scanError, setScanError] = useState('')
  const [hasConfirmedMatch, setHasConfirmedMatch] = useState(false)

  // 1. Manage the device camera
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
    setTargetLocation,
    distanceMeters,
  } = useLiveLocation()

  const targetLocationKey = getLocationTranslationKey(targetLocation?.id)
  const displayedTargetLocation = targetLocation ? { ...targetLocation, name: t('locations.names.' + targetLocationKey) } : null
  const isChoosingMatch = Boolean(scanError && capturedImage)

  const handleBeginScan = async () => {
    setScanError('')
    setCapturedImage(null)
    setHasConfirmedMatch(false)
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
    setIsScanStarted(false)
    setHasConfirmedMatch(false)
    setScanError('')
  }

  const handleConfirmMatch = () => {
    setCapturedImage(null)
    setScanError('')
    setIsScanStarted(true)
    setHasConfirmedMatch(true)
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
            <div className={`camera-bottom scan-ready ${isScanStarted ? 'capture-active' : ''} ${isChoosingMatch ? 'match-active' : ''}`}>
              {!isScanStarted && (
                <>
                  <span className="camera-kicker">{t("camera.kicker")}</span>
                  <h2>{t("camera.pointCamera", { name: displayedTargetLocation?.name || t("camera.defaultSite") })}</h2>
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
              ) : !isChoosingMatch && (
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
                  {hasConfirmedMatch && (
                    <div className="camera-target-label">
                      <small>{t('camera.recognitionTarget')}</small>
                      <strong>{displayedTargetLocation?.name || t('camera.defaultSite')}</strong>
                    </div>
                  )}
                </div>
              )}
              {isChoosingMatch && (
                <div className="scan-failure-panel" role="alert">
                  <strong>{t('camera.matchFailed')}</strong>
                  <p>{scanError}</p>
                  <label htmlFor="camera-location-confirm">{t('camera.chooseMatch')}</label>
                  <select
                    id="camera-location-confirm"
                    value={targetLocation?.id || ''}
                    onChange={(event) => {
                      const location = MAP_LOCATIONS.find((item) => item.id === event.target.value)
                      if (location) setTargetLocation(location)
                    }}
                  >
                    {MAP_LOCATIONS.map((location) => (
                      <option value={location.id} key={location.id}>
                        {t('locations.names.' + getLocationTranslationKey(location.id))}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="retry-match-button" onClick={handleConfirmMatch}>
                    {t('camera.confirmMatch')}
                  </button>
                </div>
              )}
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
