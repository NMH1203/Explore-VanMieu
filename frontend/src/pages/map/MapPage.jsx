function MapPage() {
  return (
    <section className="screen" id="map">
      <header className="topbar">
        <div className="inner">
          <div className="eyebrow">All locations</div>
          <h1>Bản đồ Văn Miếu</h1>
          <p>Theo dõi vị trí hiện tại, các điểm trong hành trình và trạng thái mở khóa.</p>
        </div>
      </header>
      <div className="container">
        <div className="map-layout">
          <div className="map-full">
            <div className="map-art"></div>
            <div className="map-legend">
              <span>
                <i className="dot jade"></i>Đã mở khóa
              </span>
              <span>
                <i className="dot"></i>Trong hành trình
              </span>
              <span>
                <i className="dot stone"></i>Đang khóa
              </span>
            </div>
            <div className="map-marker jade" style={{ left: '25%', top: '36%' }}>
              <span>✓</span>
            </div>
            <div className="map-marker" style={{ left: '46%', top: '22%' }}>
              <span>2</span>
            </div>
            <div className="map-marker" style={{ left: '67%', top: '39%' }}>
              <span>3</span>
            </div>
            <div className="map-marker locked" style={{ left: '79%', top: '69%' }}>
              <span>4</span>
            </div>
            <div className="map-marker locked" style={{ left: '39%', top: '72%' }}>
              <span>5</span>
            </div>
            <div className="map-card">
              <strong>Vị trí của bạn</strong>
              <p>Gần Cổng Đại Trung · còn 46 m để xác nhận GPS.</p>
              <a className="btn btn-primary" href="#camera">
                Mở xác minh
              </a>
            </div>
          </div>
          <aside className="map-side">
            <article className="mini-location">
              <div className="mini-shape" role="img" aria-label="Khối hình học Khuê Văn Các"></div>
              <div>
                <h3>Khuê Văn Các</h3>
                <p>✓ Đã hoàn tất · 32 m</p>
              </div>
            </article>
            <article className="mini-location">
              <div
                className="mini-shape art-b"
                role="img"
                aria-label="Khối hình học Cổng Đại Trung"
              ></div>
              <div>
                <h3>Cổng Đại Trung</h3>
                <p>⌖ Đang ở gần · 46 m</p>
              </div>
            </article>
            <article className="mini-location">
              <div
                className="mini-shape art-c"
                role="img"
                aria-label="Khối hình học Điện Đại Thành"
              ></div>
              <div>
                <h3>Điện Đại Thành</h3>
                <p>◇ Trong hành trình · 120 m</p>
              </div>
            </article>
            <article className="mini-location">
              <div
                className="mini-shape art-a"
                role="img"
                aria-label="Khối hình học Nhà Thái Học"
              ></div>
              <div>
                <h3>Nhà Thái Học</h3>
                <p>◉ Chưa đến gần · 210 m</p>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default MapPage
