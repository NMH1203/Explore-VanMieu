import { useState, useRef } from 'react'
import { Camera, AlertCircle, RefreshCw } from 'lucide-react'

export default function CameraViewfinder({
  videoRef,
  isStreaming,
  hasPermission,
  cameraError,
  isAnalyzing,
  capturedImage,
  facingMode,
  onStartCamera,
}) {
  const [focusPoint, setFocusPoint] = useState(null)
  const focusTimerRef = useRef(null)

  // Hiệu ứng chạm để lấy nét (Tap to focus)
  const handleTapToFocus = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setFocusPoint({ x, y })

    if (focusTimerRef.current) clearTimeout(focusTimerRef.current)
    focusTimerRef.current = setTimeout(() => {
      setFocusPoint(null)
    }, 1200)
  }

  return (
    <div className="camera-viewfinder-container" onClick={handleTapToFocus}>
      {/* 1. Thẻ video webcam thực tế LUÔN LUÔN được mount trong DOM để nhận stream ngay lập tức */}
      <video
        ref={videoRef}
        playsInline
        autoPlay
        muted
        className={`camera-live-video ${facingMode === 'user' ? 'mirror' : ''} ${
          isAnalyzing ? 'blur' : ''
        } ${isStreaming ? 'visible' : 'hidden'}`}
      />

      {/* 2. Màn hình chờ khi chưa bật được Camera (Nền đen sạch, KHÔNG hiện ảnh di tích) */}
      {!isStreaming && (
        <div className="camera-dark-placeholder">
          <div className="fallback-card">
            <div className="fallback-icon">
              {cameraError ? <AlertCircle size={28} /> : <Camera size={28} />}
            </div>
            <h3>{cameraError ? 'Camera chưa được cấp quyền' : 'Đang khởi động Camera...'}</h3>
            <p>
              {cameraError ||
                'Nhấn vào nút bên dưới để cấp quyền và mở webcam quét mặt trực tiếp.'}
            </p>
            <button
              type="button"
              className="btn-enable-camera"
              onClick={(e) => {
                e.stopPropagation()
                onStartCamera?.()
              }}
            >
              <RefreshCw size={16} /> Bật Camera quét mặt ngay
            </button>
          </div>
        </div>
      )}

      {/* 3. Hiển thị ảnh chụp đóng băng khi nhấn chụp */}
      {capturedImage && (
        <img
          src={capturedImage}
          alt="Ảnh chụp thực tế"
          className={`captured-preview-img ${facingMode === 'user' ? 'mirror' : ''}`}
        />
      )}

      {/* 4. Vòng tròn lấy nét khi chạm vào màn hình */}
      {focusPoint && (
        <div
          className="camera-focus-ring"
          style={{ left: `${focusPoint.x}px`, top: `${focusPoint.y}px` }}
        ></div>
      )}
    </div>
  )
}
