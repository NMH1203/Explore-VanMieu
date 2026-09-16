function PassportPage() {
  return (
    <section className="screen" id="passport">
      <header className="topbar">
        <div className="inner">
          <div className="eyebrow">Hộ chiếu Di sản</div>
          <h1>Bộ sưu tập dấu ấn</h1>
          <p>Văn Miếu – Quốc Tử Giám · 1/10 công trình đã khám phá</p>
        </div>
      </header>
      <div className="container passport-page">
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Dấu ấn di sản</h2>
              <p>Mỗi công trình hoàn tất sẽ để lại một con dấu riêng.</p>
            </div>
            <strong>1/10</strong>
          </div>
          <div className="stamp-grid">
            <div className="stamp-wrap">
              <div className="stamp collected">★</div>
              <span>Khuê Văn Các</span>
            </div>
            <div className="stamp-wrap">
              <div className="stamp">○</div>
              <span>Cổng Văn Miếu</span>
            </div>
            <div className="stamp-wrap">
              <div className="stamp">○</div>
              <span>Cổng Đại Trung</span>
            </div>
            <div className="stamp-wrap">
              <div className="stamp">○</div>
              <span>Cổng Đại Thành</span>
            </div>
            <div className="stamp-wrap">
              <div className="stamp">○</div>
              <span>Điện Đại Thành</span>
            </div>
            <div className="stamp-wrap">
              <div className="stamp">○</div>
              <span>Cổng Thái Học</span>
            </div>
            <div className="stamp-wrap">
              <div className="stamp">○</div>
              <span>Nhà Thái Học</span>
            </div>
            <div className="stamp-wrap">
              <div className="stamp">○</div>
              <span>Lầu Chuông</span>
            </div>
            <div className="stamp-wrap">
              <div className="stamp">○</div>
              <span>Nhà Bát Giác</span>
            </div>
            <div className="stamp-wrap">
              <div className="stamp">○</div>
              <span>Phương Đình</span>
            </div>
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
                <p>Đạt 1/1 · Huy hiệu Explore Van Mieu</p>
              </div>
            </article>
            <article className="milestone">
              <div className="milestone-icon">○</div>
              <div>
                <h3>Người tìm kiếm di sản</h3>
                <p>1/3 · Bưu thiếp kỹ thuật số độc quyền</p>
              </div>
            </article>
            <article className="milestone">
              <div className="milestone-icon">○</div>
              <div>
                <h3>Hoàn thành hành trình</h3>
                <p>1/5 · Chứng nhận Đại sứ Văn hóa</p>
              </div>
            </article>
            <article className="milestone">
              <div className="milestone-icon">○</div>
              <div>
                <h3>Bậc hiếu học</h3>
                <p>1/10 · Danh hiệu Học giả Di sản</p>
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
