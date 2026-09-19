import { useState } from 'react'
import { ArrowLeft, Sun, SunMedium, Camera as CameraIcon } from 'lucide-react'
import { useCameraStream } from './hooks/useCameraStream.js'
import { useLiveLocation } from './hooks/useLiveLocation.js'
import CameraViewfinder from './components/CameraViewfinder.jsx'
import LocationBanner from './components/LocationBanner.jsx'
import ScanResultModal from './components/ScanResultModal.jsx'
import { unlockLocation } from '../../services/api.js'
import './camera.css'

function CameraPage({ onLocationUnlocked }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isScanComplete, setIsScanComplete] = useState(false)
  const [scanError, setScanError] = useState('')

  // 1. Quản lý Camera thiết bị
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

  // 2. Quản lý Tọa độ GPS & 10 điểm Văn Miếu
  const {
    targetLocation,
    setTargetLocation,
    distanceMeters,
    gpsAccuracy,
    isNearEnough,
  } = useLiveLocation()

  // 3. Xử lý quét nhận diện
  const handleStartScan = () => {
    if (isAnalyzing) return

    // Chụp lại khung hình hiện tại từ camera
    captureSnapshot()
    setIsAnalyzing(true)
    setScanError('')

    // Mô phỏng AI đối chiếu kiến trúc và vị trí (1.2s)
    setTimeout(async () => {
      try {
        await unlockLocation(targetLocation.id)
        onLocationUnlocked(targetLocation.id)
        setIsScanComplete(true)
      } catch (error) {
        setScanError(error.message)
      } finally {
        setIsAnalyzing(false)
      }
    }, 1300)
  }

  // Quét lại
  const handleResetScan = () => {
    setCapturedImage(null)
    setIsScanComplete(false)
    setIsAnalyzing(false)
  }

  return (
    <section className="screen" id="camera">
      <div className="camera-screen">
        <div className="camera-ui">
          {/* Thanh điều khiển trên cùng */}
          <div className="camera-top">
            <a className="round-btn" href="/Explore/Ban-Do" title="Quay lại Bản đồ">
              <ArrowLeft size={18} />
            </a>

            <div className="camera-progress">
              <span className={!isScanComplete && !isAnalyzing ? 'active' : 'completed'}>
                1 · Quét
              </span>
              <i></i>
              <span className={isAnalyzing ? 'active' : isScanComplete ? 'completed' : ''}>
                2 · Nhận diện AI
              </span>
              <i></i>
              <span className={isScanComplete ? 'active' : ''}>
                3 · Khám phá
              </span>
            </div>

            <button
              type="button"
              className={`round-btn ${isTorchOn ? 'torch-active' : ''}`}
              onClick={toggleTorch}
              title="Bật/tắt đèn chiếu sáng"
              aria-label="Bật đèn"
            >
              {isTorchOn ? <SunMedium size={18} /> : <Sun size={18} />}
            </button>
          </div>

          {/* Banner vị trí GPS thời gian thực */}
          <LocationBanner
            targetLocation={targetLocation}
            setTargetLocation={setTargetLocation}
            distanceMeters={distanceMeters}
            gpsAccuracy={gpsAccuracy}
            isNearEnough={isNearEnough}
          />

          {/* Khung ngắm Camera thật & Kính ngắm di sản */}
          <CameraViewfinder
            videoRef={videoRef}
            isStreaming={isStreaming}
            hasPermission={hasPermission}
            cameraError={cameraError}
            isAnalyzing={isAnalyzing}
            capturedImage={capturedImage}
            targetLocation={targetLocation}
          />

          {/* Bảng điều khiển nút bấm phía dưới */}
          {!isScanComplete ? (
            <div className="camera-bottom scan-ready">
              <span className="camera-kicker">Nhận diện công trình & Hiện vật</span>
              <h2>Hướng camera về phía {targetLocation?.name || 'Khuê Văn Các'}</h2>
              <p>
                Hệ thống AI sẽ đối chiếu đặc trưng kiến trúc và GPS để xác nhận lượt tham quan và trao con dấu di sản.
              </p>

              <button
                type="button"
                className={`scan-button ${isAnalyzing ? 'scanning' : ''}`}
                onClick={handleStartScan}
                disabled={isAnalyzing}
              >
                <CameraIcon size={16} />
                <span>{isAnalyzing ? 'Đang phân tích hình ảnh...' : 'Bắt đầu quét'}</span>
              </button>
              {scanError && <p role="alert">{scanError}</p>}
            </div>
          ) : (
            <ScanResultModal
              location={targetLocation}
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
