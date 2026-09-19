function FiguresPage() {
  return (
    <section className="screen" id="all-figures">
      <header className="topbar">
        <div className="inner">
          <div className="catalog-back">
            <a className="btn btn-light" href="/Explore">
              ← Quay lại
            </a>
          </div>
          <div className="eyebrow">Danh nhân</div>
          <h1>Danh nhân và bậc hiền triết</h1>
          <p>
            Sáu nhân vật gắn với lịch sử hình thành, giáo dục và đời sống tinh thần của Văn Miếu.
          </p>
        </div>
      </header>
      <div className="container">
        <div className="catalog-summary">
          <span>6 nhân vật</span>
          <span>3 đã mở khóa</span>
          <span>Thư viện tri thức</span>
        </div>
        <div className="figures all-figures">
          <article className="figure-card">
            <img
              className="portrait-shape heritage-photo"
              src="/images/heritage/ly-thanh-tong.jpg"
              alt="Tượng vua Lý Thánh Tông"
              loading="lazy"
            />
            <div className="figure-copy">
              <h3>
                <a href="/Explore/Danh-Nhan/Ly-Thanh-Tong">Lý Thánh Tông</a>
              </h3>
              <small>1023–1072 · Người dựng Văn Miếu</small>
              <p>
                Nhà vua cho dựng Văn Miếu năm 1070, đặt nền móng cho không gian tôn vinh đạo học.
              </p>
              <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Ly-Thanh-Tong">
                Xem câu chuyện
              </a>
            </div>
          </article>
          <article className="figure-card">
            <img
              className="portrait-shape heritage-photo"
              src="/images/heritage/ly-nhan-tong.jpg"
              alt="Tượng vua Lý Nhân Tông"
              loading="lazy"
            />
            <div className="figure-copy">
              <h3>
                <a href="/Explore/Danh-Nhan/Ly-Nhan-Tong">Lý Nhân Tông</a>
              </h3>
              <small>1066–1128 · Người lập Quốc Tử Giám</small>
              <p>Nhà vua cho thành lập Quốc Tử Giám, trường đại học đầu tiên của Việt Nam.</p>
              <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Ly-Nhan-Tong">
                Xem câu chuyện
              </a>
            </div>
          </article>
          <article className="figure-card">
            <img
              className="portrait-shape heritage-photo"
              src="/images/heritage/le-thanh-tong.jpg"
              alt="Tượng vua Lê Thánh Tông"
              loading="lazy"
            />
            <div className="figure-copy">
              <h3>
                <a href="/Explore/Danh-Nhan/Le-Thanh-Tong">Lê Thánh Tông</a>
              </h3>
              <small>1442–1497 · Vị vua trọng hiền tài</small>
              <p>Khởi xướng việc dựng bia ghi danh tiến sĩ, lưu lại truyền thống khoa bảng.</p>
              <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Le-Thanh-Tong">
                Xem câu chuyện
              </a>
            </div>
          </article>
          <article className="figure-card">
            <img
              className="portrait-shape heritage-photo"
              src="/images/heritage/chu-van-an.jpg"
              alt="Tượng thầy Chu Văn An"
              loading="lazy"
            />
            <div className="figure-copy">
              <h3>
                <a href="/Explore/Danh-Nhan/Chu-Van-An">Chu Văn An</a>
              </h3>
              <small>1292–1370 · Người thầy mẫu mực</small>
              <p>Biểu tượng về nhân cách người thầy và tinh thần tôn sư trọng đạo.</p>
              <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Chu-Van-An">
                Xem câu chuyện
              </a>
            </div>
          </article>
          <article className="figure-card">
            <img
              className="portrait-shape heritage-photo"
              src="/images/heritage/confucius-statue.jpg"
              alt="Tượng thờ Khổng Tử tại Văn Miếu"
              loading="lazy"
            />
            <div className="figure-copy">
              <h3>
                <a href="/Explore/Danh-Nhan/Khong-Tu">Khổng Tử</a>
              </h3>
              <small>551–479 TCN · Vạn thế sư biểu</small>
              <p>Nhân vật trung tâm trong không gian thờ tự và tư tưởng Nho học tại Văn Miếu.</p>
              <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Khong-Tu">
                Xem câu chuyện
              </a>
            </div>
          </article>
          <article className="figure-card">
            <div
              className="figure-portrait-collage"
              role="img"
              aria-label="Tứ Phối gồm Nhan Tử, Tăng Tử, Mạnh Tử và Tử Tư"
            >
              <img src="/images/heritage/nhan-tu.webp" alt="" loading="lazy" />
              <img src="/images/heritage/tang-tu.webp" alt="" loading="lazy" />
              <img src="/images/heritage/manh-tu.webp" alt="" loading="lazy" />
              <img src="/images/heritage/tu-tu.webp" alt="" loading="lazy" />
            </div>
            <div className="figure-copy">
              <h3>
                <a href="/Explore/Danh-Nhan/Tu-Phoi">Tứ Phối</a>
              </h3>
              <small>Bốn bậc hiền triết phối thờ</small>
              <p>Nhan Hồi, Tăng Sâm, Tử Tư và Mạnh Tử — những người kế thừa, phát triển Nho học.</p>
              <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Tu-Phoi">
                Xem câu chuyện
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default FiguresPage
