import { paths } from '../routes.js'

const journeyLocations = [
  ['interpret', 'Khuê Văn Các'],
  ['location-dai-trung-gate', 'Cổng Đại Trung'],
  ['location-dien-dai-thanh', 'Điện Đại Thành'],
  ['location-thai-hoc-house', 'Nhà Thái Học'],
  ['location-phuong-dinh', 'Phương Đình'],
]

function JourneyCard({ unlockedLocations }) {
  const journeyCount = journeyLocations.filter(([id]) => unlockedLocations.has(id)).length

  return (
    <div className="journey-card">
      <div className="journey-copy">
        <span className="eyebrow">Hành trình của bạn hôm nay</span>
        <h2>Năm điểm chạm, một mạch ký ức</h2>
        <p>
          Hệ thống đã chọn 5 địa điểm không trùng lặp. Hoàn thành xác minh GPS và camera để đánh
          thức từng lớp di sản.
        </p>
        <div className="progress-label">
          <span>Tiến trình khám phá</span>
          <strong>{journeyCount}/5 địa điểm</strong>
        </div>
        <div className="progress">
          <i style={{ width: `${journeyCount * 20}%` }}></i>
        </div>
        <br />
        <a className="btn btn-gold" href={paths.map}>
          Tiếp tục hành trình
        </a>
      </div>
      <div className="journey-list">
        {journeyLocations.map(([id, name], index) => (
          <div className="journey-stop" key={id}>
            <span className="stop-no">{unlockedLocations.has(id) ? '✓' : index + 1}</span>
            {name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default JourneyCard
