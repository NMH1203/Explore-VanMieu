import { useState } from 'react'
import { SwitchCamera } from 'lucide-react'
import { useCameraStream } from './hooks/useCameraStream.js'
import { useLiveLocation } from './hooks/useLiveLocation.js'
import CameraViewfinder from './components/CameraViewfinder.jsx'
import LocationBanner from './components/LocationBanner.jsx'
import ScanResultModal from './components/ScanResultModal.jsx'
import './camera.css'

function CameraPage({ onVerifyCheckin }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isScanComplete, setIsScanComplete] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false)

  // 1. Quản lý Camera thiết bị (mặc định camera trước quét mặt, hỗ trợ đổi camera trước/sau)
  const {
    videoRef,
    isStreaming,
    hasPermission,
    cameraError,
    capturedImage,
    setCapturedImage,
    facingMode,
    toggleFacingMode,
    startCamera,
    captureSnapshot,
  } = useCameraStream()

  // 2. Quản lý Tọa độ GPS & Xác định công trình
  const {
    userCoords,
    targetLocation,
    distanceMeters,
    gpsAccuracy,
    isNearEnough,
  } = useLiveLocation()

  // 3. Xử lý khi nhấn nút chụp ảnh
  const handleShutterClick = () => {
    if (isAnalyzing || isScanComplete) return

    // Hiệu ứng chớp sáng màn trập (Shutter Flash)
    setIsFlashing(true)
    setTimeout(() => setIsFlashing(false), 180)

    // Chụp lại khung hình từ camera (đã tích hợp âm thanh tiếng "tách")
    const snapshot = captureSnapshot()
    setIsAnalyzing(true)

    // Mô phỏng AI phân tích nhận diện vật thể/hiện vật (1.2s)
    setTimeout(async () => {
      if (onVerifyCheckin && targetLocation?.id) {
        try {
          await onVerifyCheckin({
            imageDataUrl: snapshot,
            locationId: targetLocation.id,
            latitude: userCoords?.latitude || targetLocation.latitude,
            longitude: userCoords?.longitude || targetLocation.longitude,
          })
        } catch (err) {
          console.warn('Verify checkin notice:', err)
        }
      }
      setIsAnalyzing(false)
      setIsScanComplete(true)
    }, 1200)
  }

  // Quét lại / Chụp ảnh khác
  const handleResetScan = () => {
    setCapturedImage(null)
    setIsScanComplete(false)
    setIsAnalyzing(false)
  }

  return (
    <section className="screen" id="camera">
      <div className="camera-screen">
        {/* LỚP 1: VIDEO WEBCAM NẰM DƯỚI CÙNG (z-index: 1) */}
        <CameraViewfinder
          videoRef={videoRef}
          isStreaming={isStreaming}
          hasPermission={hasPermission}
          cameraError={cameraError}
          isAnalyzing={isAnalyzing}
          capturedImage={capturedImage}
          targetLocation={targetLocation}
          facingMode={facingMode}
          onStartCamera={startCamera}
        />

        {/* LỚP 2: HIỆU ỨNG CHỚP SÁNG MÀN TRẬP KHI BẤM CHỤP (z-index: 15) */}
        {isFlashing && <div className="camera-shutter-flash"></div>}

        {/* LỚP 3: TOÀN BỘ GIAO DIỆN NỔI TRÊN CÙNG 1 KHUNG HÌNH (z-index: 20) */}
        <div className="camera-ui">
          {/* TRÊN CÙNG: THANH TIẾN TRÌNH HƯỚNG DẪN + VỊ TRÍ */}
          <div className="camera-header-block">
            <div className="camera-progress-center">
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
            </div>

            {/* Banner vị trí GPS */}
            <LocationBanner
              targetLocation={targetLocation}
              distanceMeters={distanceMeters}
              gpsAccuracy={gpsAccuracy}
              isNearEnough={isNearEnough}
            />
          </div>

          {/* DƯỚI CÙNG: LỜI HƯỚNG DẪN + NÚT CHỤP TRÒN TRẮNG + NÚT ĐỔI CAM */}
          {!isScanComplete ? (
            <div className="camera-bottom-controls">
              {/* Lời hướng dẫn quét khuôn mặt / hiện vật (giữ nguyên không xóa) */}
              <div className="camera-instruction-hint">
                <p>
                  Hướng camera vào khuôn mặt hoặc hiện vật cần nhận diện, sau đó bấm nút chụp.
                </p>
              </div>

              {isAnalyzing ? (
                <div className="camera-analyzing-pill">
                  <span className="analyzing-spinner"></span>
                  <span>AI đang phân tích nhận diện hình ảnh...</span>
                </div>
              ) : (
                <div className="camera-shutter-dock">
                  {/* Cột trái để cân đối nút chụp ở chính giữa */}
                  <div className="dock-slot"></div>

                  {/* Nút Chụp tròn lớn ở giữa (chuẩn Camera 76px) */}
                  <div className="dock-center">
                    <button
                      type="button"
                      className="camera-shutter-btn"
                      onClick={handleShutterClick}
                      aria-label="Chụp ảnh nhận diện"
                      title="Bấm để chụp ảnh nhận diện"
                    >
                      <span className="camera-shutter-inner"></span>
                    </button>
                  </div>

                  {/* Nút Đổi Camera [ 🔄 Cam trước / Cam sau ] nằm ngay bên phải nút chụp tròn */}
                  <div className="dock-slot">
                    <button
                      type="button"
                      className="camera-flip-btn"
                      onClick={toggleFacingMode}
                      title={facingMode === 'user' ? 'Đang dùng Cam trước (quét mặt) - Bấm đổi sang Cam sau' : 'Đang dùng Cam sau - Bấm đổi sang Cam trước'}
                      aria-label="Đổi camera trước hoặc sau"
                    >
                      <SwitchCamera size={22} />
                      <span className="flip-label">
                        {facingMode === 'user' ? 'Cam trước' : 'Cam sau'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
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
