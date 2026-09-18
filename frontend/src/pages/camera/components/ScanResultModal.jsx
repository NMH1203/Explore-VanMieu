import { Check, ArrowRight, BookOpen, RotateCcw } from 'lucide-react'

export default function ScanResultModal({
  location,
  distanceMeters,
  onResetScan,
}) {
  if (!location) return null

  return (
    <div className="camera-bottom scan-result-modal">
      <div className="result-check">
        <Check size={28} strokeWidth={3} />
      </div>

      <div className="result-copy">
        <span className="camera-kicker">Đã nhận diện · độ tin cậy 98.4%</span>
        <h2>{location.name}</h2>
        <p>
          <b>⌖ Vị trí hợp lệ:</b> Cách công trình {distanceMeters} m.
          <br />
          Tọa độ GPS và hình ảnh kiến trúc đã trùng khớp. Con dấu đã được đóng vào Hộ chiếu di sản!
        </p>

        <div className="result-actions">
          <a className="btn btn-gold" href={location.detailPath}>
            Xem thông tin di sản <ArrowRight size={14} />
          </a>
          <a className="btn btn-outline-light" href="/Explore/Ho-Chieu">
            <BookOpen size={14} /> Mở Hộ chiếu
          </a>
          <button type="button" className="scan-again-btn" onClick={onResetScan}>
            <RotateCcw size={14} /> Quét lại
          </button>
        </div>
      </div>
    </div>
  )
}
