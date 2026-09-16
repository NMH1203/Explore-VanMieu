import { useUnlockedLocations } from '../../state/heritageProgress.js'

const stamps = [
  ['interpret', 'Khuê Văn Các', 'khue-van-cac.jpg'],
  ['location-van-mieu-gate', 'Cổng Văn Miếu', 'cong-van-mieu.jpg'],
  ['location-dai-trung-gate', 'Cổng Đại Trung', 'cong-dai-trung.jpg'],
  ['location-dai-thanh-gate', 'Cổng Đại Thành', 'cong-dai-thanh.jpg'],
  ['location-dien-dai-thanh', 'Điện Đại Thành', 'dien-dai-thanh.jpg'],
  ['location-thai-hoc-gate', 'Cổng Thái Học', 'cong-thai-hoc.jpg'],
  ['location-thai-hoc-house', 'Nhà Thái Học', 'nha-thai-hoc.jpg'],
  ['location-bell-drum-tower', 'Lầu Chuông – Lầu Trống', 'lau-chuong-lau-trong.jpg'],
  ['location-octagonal-house', 'Nhà Bát Giác', 'nha-bat-giac.jpg'],
  ['location-phuong-dinh', 'Phương Đình', 'phuong-dinh.jpg'],
]

function PassportPage() {
  const unlockedLocations = useUnlockedLocations()
  const unlockedCount = stamps.filter(([id]) => unlockedLocations.has(id)).length

  return (
    <section className="screen" id="passport">
      <header className="topbar">
        <div className="inner">
          <div className="eyebrow">Hộ chiếu Di sản</div>
          <h1>Bộ sưu tập dấu ấn</h1>
          <p>Văn Miếu – Quốc Tử Giám · {unlockedCount}/10 công trình đã khám phá</p>
        </div>
      </header>
      <div className="container passport-page">
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Dấu ấn di sản</h2>
              <p>Mỗi công trình hoàn tất sẽ để lại một con dấu riêng.</p>
            </div>
            <strong>{unlockedCount}/10</strong>
          </div>
          <div className="stamp-grid">
            {stamps.map(([id, name, image]) => {
              const unlocked = unlockedLocations.has(id)
              return (
                <div className="stamp-wrap" key={id}>
                  <div className={`stamp art-stamp${unlocked ? ' collected' : ''}`}>
                    <img src={`/images/passport/${image}`} alt={`Dấu ấn ${name}`} />
                  </div>
                  <span>{name}</span>
                </div>
              )
            })}
          </div>
        </section>
        <section className="section">
          <h2>Cột mốc</h2>
          <br />
          <div className="milestones">
            <article className="milestone current">
              <div className="milestone-icon">★</div>
              <div>
                <h3>Bước đầu hành trình</h3>
                <p>Đạt {Math.min(unlockedCount, 1)}/1 · Huy hiệu Explore Van Mieu</p>
              </div>
            </article>
            <article className="milestone">
              <div className="milestone-icon">○</div>
              <div>
                <h3>Người tìm kiếm di sản</h3>
                <p>{Math.min(unlockedCount, 3)}/3 · Bưu thiếp kỹ thuật số độc quyền</p>
              </div>
            </article>
            <article className="milestone">
              <div className="milestone-icon">○</div>
              <div>
                <h3>Hoàn thành hành trình</h3>
                <p>{Math.min(unlockedCount, 5)}/5 · Chứng nhận Đại sứ Văn hóa</p>
              </div>
            </article>
            <article className="milestone">
              <div className="milestone-icon">○</div>
              <div>
                <h3>Bậc hiếu học</h3>
                <p>{unlockedCount}/10 · Danh hiệu Học giả Di sản</p>
              </div>
            </article>
          </div>
        </section>
        <a className="btn btn-primary btn-block" href="#explore">
          Tiếp tục khám phá
        </a>
      </div>
    </section>
  )
}

export default PassportPage
