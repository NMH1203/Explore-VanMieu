import { Camera, Image as ImageIcon, AlertCircle } from 'lucide-react'

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
  return (
    <div className="camera-viewfinder-container">
      {/* 1. Lớp hiển thị video thật hoặc fallback mô phỏng */}
      {isStreaming ? (
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`camera-live-video ${isAnalyzing ? 'blur' : ''}`}
        />
      ) : (
        <div
          className="camera-art-fallback"
          style={{
            backgroundImage: `url(${targetLocation?.image || '/images/heritage/khue-van-cac.webp'})`,
          }}
        >
          <div className="fallback-badge">
            {cameraError ? (
              <span>
                <AlertCircle size={14} /> Chế độ mô phỏng AI (Chưa bật camera)
              </span>
            ) : (
              <span>
                <Camera size={14} /> Đang kết nối camera thiết bị...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Nếu đã chụp ảnh thì hiển thị ảnh chụp đóng băng */}
      {capturedImage && (
        <img src={capturedImage} alt="Ảnh chụp" className="captured-preview-img" />
      )}

      {/* 2. Kính ngắm di sản (Viewfinder) */}
      <div className={`viewfinder ${isAnalyzing ? 'analyzing' : ''}`}>
        <span className="corner tl"></span>
        <span className="corner tr"></span>
        <span className="corner bl"></span>
        <span className="corner br"></span>

        {/* Đường quét tia laser */}
        <div className={`scan-line ${isAnalyzing ? 'fast-scan' : ''}`}></div>

        {/* Thông báo hướng dẫn trong kính ngắm */}
        <div className="scan-hint">
          {isAnalyzing
            ? '⚡ AI đang phân tích kiến trúc & tọa độ...'
            : `Giữ ${targetLocation?.name || 'công trình'} nằm trọn trong khung`}
        </div>
      </div>
    </div>
  )
}
