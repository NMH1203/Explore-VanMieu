function LocationsPage() {
  return (
    <section className="screen" id="all-locations">
      <header className="topbar">
        <div className="inner">
          <div className="catalog-back">
            <a className="btn btn-light" href="#explore">
              ← Quay lại
            </a>
          </div>
          <div className="eyebrow">Công trình kiến trúc</div>
          <h1>Tất cả địa điểm</h1>
          <p>Khám phá đầy đủ 10 công trình trong quần thể Văn Miếu – Quốc Tử Giám.</p>
        </div>
      </header>
      <div className="container">
        <div className="catalog-summary">
          <span>10 công trình</span>
          <span>1 đã mở khóa</span>
          <span>5 thuộc hành trình hôm nay</span>
        </div>
        <div className="cards all-cards">
          <article className="location-card locked">
            <div className="location-image">
              <img
                className="shape-art heritage-photo"
                src="/images/heritage/van-mieu-gate.webp"
                alt="Cổng Văn Miếu"
                loading="lazy"
              />
              <span className="badge">◉ Đang khóa</span>
            </div>
            <div className="location-body">
              <h3>
                <a href="#location-van-mieu-gate">Cổng Văn Miếu</a>
              </h3>
              <p>Lối vào đầu tiên mở ra trục kiến trúc và không gian đạo học.</p>
              <div className="meta">
                <span>⌖ 280 m</span>
                <span>◇ GPS chưa xác nhận</span>
              </div>
              <a className="btn btn-outline btn-block" href="#location-van-mieu-gate">
                Xem câu chuyện
              </a>
            </div>
          </article>
          <article className="location-card">
            <div className="location-image">
              <img
                className="shape-art heritage-photo"
                src="/images/heritage/dai-trung-gate.webp"
                alt="Cổng Đại Trung"
                loading="lazy"
              />
              <span className="badge near">⌖ Đang ở gần</span>
            </div>
            <div className="location-body">
              <h3>
                <a href="#location-dai-trung-gate">Cổng Đại Trung</a>
              </h3>
              <p>Cánh cổng dẫn vào không gian trung tâm của quần thể.</p>
              <div className="meta">
                <span>⌖ 46 m</span>
                <span>◎ Cần xác minh</span>
              </div>
              <a className="btn btn-primary btn-block" href="#location-dai-trung-gate">
                Xem câu chuyện
              </a>
            </div>
          </article>
          <article className="location-card">
            <div className="location-image">
              <img
                className="shape-art heritage-photo"
                src="/images/heritage/khue-van-cac.webp"
                alt="Khuê Văn Các"
                loading="lazy"
              />
              <span className="badge done">✓ Đã mở khóa</span>
            </div>
            <div className="location-body">
              <h3>
                <a href="#interpret">Khuê Văn Các</a>
              </h3>
              <p>Biểu tượng của văn chương, trí tuệ và Thủ đô Hà Nội.</p>
              <div className="meta">
                <span>⌖ 32 m</span>
                <span>✓ Camera xác minh</span>
              </div>
              <a className="btn btn-outline btn-block" href="#interpret">
                Xem câu chuyện
              </a>
            </div>
          </article>
          <article className="location-card">
            <div className="location-image">
              <img
                className="shape-art heritage-photo"
                src="/images/heritage/dai-thanh-gate.webp"
                alt="Cổng Đại Thành"
                loading="lazy"
              />
              <span className="badge near">◇ Trong hành trình</span>
            </div>
            <div className="location-body">
              <h3>
                <a href="#location-dai-thanh-gate">Cổng Đại Thành</a>
              </h3>
              <p>Cánh cổng đánh dấu lối vào khu điện thờ trang nghiêm.</p>
              <div className="meta">
                <span>⌖ 95 m</span>
                <span>◇ Chưa xác minh</span>
              </div>
              <a className="btn btn-outline btn-block" href="#location-dai-thanh-gate">
                Xem câu chuyện
              </a>
            </div>
          </article>
          <article className="location-card">
            <div className="location-image">
              <img
                className="shape-art heritage-photo"
                src="/images/heritage/dien-dai-thanh.webp"
                alt="Điện Đại Thành"
                loading="lazy"
              />
              <span className="badge near">◇ Trong hành trình</span>
            </div>
            <div className="location-body">
              <h3>
                <a href="#location-dien-dai-thanh">Điện Đại Thành</a>
              </h3>
              <p>Không gian thờ Khổng Tử và các bậc hiền triết Nho học.</p>
              <div className="meta">
                <span>⌖ 120 m</span>
                <span>◇ GPS chưa xác nhận</span>
              </div>
              <a className="btn btn-outline btn-block" href="#location-dien-dai-thanh">
                Xem câu chuyện
              </a>
            </div>
          </article>
          <article className="location-card locked">
            <div className="location-image">
              <img
                className="shape-art heritage-photo"
                src="/images/heritage/thai-hoc-gate.webp"
                alt="Cổng Thái Học"
                loading="lazy"
              />
              <span className="badge">◉ Đang khóa</span>
            </div>
            <div className="location-body">
              <h3>
                <a href="#location-thai-hoc-gate">Cổng Thái Học</a>
              </h3>
              <p>Lối chuyển tiếp vào khu vực tưởng niệm truyền thống giáo dục.</p>
              <div className="meta">
                <span>⌖ 185 m</span>
                <span>◇ GPS chưa xác nhận</span>
              </div>
              <a className="btn btn-outline btn-block" href="#location-thai-hoc-gate">
                Xem câu chuyện
              </a>
            </div>
          </article>
          <article className="location-card locked">
            <div className="location-image">
              <img
                className="shape-art heritage-photo"
                src="/images/heritage/thai-hoc-building.webp"
                alt="Nhà Thái Học"
                loading="lazy"
              />
              <span className="badge">◉ Đang khóa</span>
            </div>
            <div className="location-body">
              <h3>
                <a href="#location-thai-hoc-house">Nhà Thái Học</a>
              </h3>
              <p>Công trình tôn vinh Quốc Tử Giám và những người thầy tiêu biểu.</p>
              <div className="meta">
                <span>⌖ 210 m</span>
                <span>◇ GPS chưa xác nhận</span>
              </div>
              <a className="btn btn-outline btn-block" href="#location-thai-hoc-house">
                Xem câu chuyện
              </a>
            </div>
          </article>
          <article className="location-card locked">
            <div className="location-image">
              <img
                className="shape-art heritage-photo"
                src="/images/heritage/bell-drum-tower.webp"
                alt="Lầu Chuông – Lầu Trống"
                loading="lazy"
              />
              <span className="badge">◉ Đang khóa</span>
            </div>
            <div className="location-body">
              <h3>
                <a href="#location-bell-drum-tower">Lầu Chuông – Lầu Trống</a>
              </h3>
              <p>Cặp công trình tạo nhịp điệu cân xứng cho khu Thái Học.</p>
              <div className="meta">
                <span>⌖ 235 m</span>
                <span>◇ GPS chưa xác nhận</span>
              </div>
              <a className="btn btn-outline btn-block" href="#location-bell-drum-tower">
                Xem câu chuyện
              </a>
            </div>
          </article>
          <article className="location-card locked">
            <div className="location-image">
              <img
                className="shape-art heritage-photo"
                src="/images/heritage/octagonal-house.webp"
                alt="Nhà Bát Giác"
                loading="lazy"
              />
              <span className="badge">◉ Đang khóa</span>
            </div>
            <div className="location-body">
              <h3>
                <a href="#location-octagonal-house">Nhà Bát Giác</a>
              </h3>
              <p>Không gian kiến trúc tám cạnh giàu tính biểu tượng.</p>
              <div className="meta">
                <span>⌖ 260 m</span>
                <span>◇ GPS chưa xác nhận</span>
              </div>
              <a className="btn btn-outline btn-block" href="#location-octagonal-house">
                Xem câu chuyện
              </a>
            </div>
          </article>
          <article className="location-card">
            <div className="location-image">
              <img
                className="shape-art heritage-photo"
                src="/images/heritage/phuong-dinh.webp"
                alt="Phương Đình"
                loading="lazy"
              />
              <span className="badge near">◇ Trong hành trình</span>
            </div>
            <div className="location-body">
              <h3>
                <a href="#location-phuong-dinh">Phương Đình</a>
              </h3>
              <p>Điểm dừng chân nối kết cảnh quan và trục tham quan.</p>
              <div className="meta">
                <span>⌖ 175 m</span>
                <span>◇ Chưa xác minh</span>
              </div>
              <a className="btn btn-outline btn-block" href="#">
                Xem câu chuyện
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default LocationsPage
