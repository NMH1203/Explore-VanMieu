import { Award, MapPin, Plus, ScanLine, Send, Sparkles, UserRound } from 'lucide-react'

function HomePage() {
  return (
    <section className="screen" id="explore">
          <div className="hero">
            <img className="hero-bg heritage-photo" src="/images/heritage/van-mieu-hero.jpg" alt="Cổng Văn Miếu – Quốc Tử Giám tại Hà Nội" />
            <header className="hero-header"><a className="hero-logo" href="#explore"><img src="/images/brand-khue-van-cac.jpg" alt="" />Explore Van Mieu</a><a className="avatar" href="#account" aria-label="Tài khoản"><UserRound size={23} strokeWidth={2} aria-hidden="true" /></a></header>
            <div className="hero-copy">
              <div className="eyebrow">Văn Miếu – Quốc Tử Giám</div>
              <h1>Chạm vào những lớp ký ức <span>của nghìn năm hiếu học</span></h1>
              <p>Mỗi bước chân mở ra một công trình, một nhân vật và một câu chuyện đã góp phần tạo nên di sản tri thức Việt Nam.</p>
              <div className="hero-actions"><a className="btn btn-gold" href="#journey">Bắt đầu khám phá →</a><a className="btn btn-light" href="#journey">Xem hành trình hôm nay</a></div>
            </div>
            <a className="scroll-cue" href="#intro">Cuộn để bắt đầu ↓</a>
          </div>

          <div className="intro" id="intro"><div className="container intro-grid">
            <div><span className="kicker">Di sản tri thức</span><h2>Nơi đạo học Việt Nam được gìn giữ qua nhiều thế kỷ</h2><p>Không chỉ là một quần thể kiến trúc, Văn Miếu còn lưu giữ ký ức về giáo dục, khoa cử và những thế hệ hiền tài của dân tộc.</p></div>
            <div className="intro-stat"><div><strong>1070</strong><span>Năm khởi dựng</span></div><div><strong>10</strong><span>Công trình</span></div><div><strong>82</strong><span>Bia tiến sĩ</span></div></div>
          </div></div>

          <section className="how-it-works" aria-labelledby="how-title">
            <div className="container">
              <div className="how-heading"><div><span className="kicker">Bắt đầu thật đơn giản</span><h2 id="how-title">Khám phá Văn Miếu theo cách của bạn</h2></div><p>Chỉ cần điện thoại và vài phút tại mỗi điểm đến, bạn có thể mở từng lớp câu chuyện của di sản.</p></div>
              <div className="use-flow">
                <article className="flow-step"><div className="flow-visual photo-flow"><img className="flow-photo" src="/images/journey/find-nearby-heritage.jpg" alt="Bản đồ tìm di sản gần bạn" loading="lazy" /><span className="flow-icon"><MapPin size={21} aria-hidden="true" /></span><b>01</b></div><div className="flow-copy"><span>Bước 1</span><h3>Tìm di sản gần bạn</h3><p>Mở bản đồ để xem các công trình và chọn điểm muốn khám phá.</p></div></article>
                <span className="flow-arrow" aria-hidden="true">→</span>
                <article className="flow-step"><div className="flow-visual photo-flow"><img className="flow-photo" src="/images/journey/scan-heritage.jpg" alt="Quét công trình di sản bằng camera" loading="lazy" /><span className="flow-icon"><ScanLine size={21} aria-hidden="true" /></span><b>02</b></div><div className="flow-copy"><span>Bước 2</span><h3>Đưa máy lên quét</h3><p>Hướng camera vào công trình để xác minh hình ảnh và vị trí.</p></div></article>
                <span className="flow-arrow" aria-hidden="true">→</span>
                <article className="flow-step"><div className="flow-visual photo-flow"><img className="flow-photo" src="/images/journey/open-heritage-story.jpg" alt="Mở câu chuyện về di sản" loading="lazy" /><span className="flow-icon"><Sparkles size={21} aria-hidden="true" /></span><b>03</b></div><div className="flow-copy"><span>Bước 3</span><h3>Mở câu chuyện</h3><p>Đọc, nghe hoặc hỏi AI để hiểu sâu hơn về dấu tích trước mắt.</p></div></article>
                <span className="flow-arrow" aria-hidden="true">→</span>
                <article className="flow-step"><div className="flow-visual photo-flow"><img className="flow-photo" src="/images/journey/complete-heritage-journey.jpg" alt="Hoàn thành hành trình di sản" loading="lazy" /><span className="flow-icon"><Award size={21} aria-hidden="true" /></span><b>04</b></div><div className="flow-copy"><span>Bước 4</span><h3>Lưu dấu hành trình</h3><p>Nhận con dấu vào Hộ chiếu Di sản và tiếp tục điểm đến mới.</p></div></article>
              </div>
              <div className="how-action"><a className="btn btn-primary" href="#map">Bắt đầu từ bản đồ →</a><span>Không cần tải ứng dụng</span></div>
            </div>
          </section>

          <div className="container">
            <section className="section" id="journey">
              <div className="journey-card">
                <div className="journey-copy"><span className="eyebrow">Hành trình của bạn hôm nay</span><h2>Năm điểm chạm, một mạch ký ức</h2><p>Hệ thống đã chọn 5 địa điểm không trùng lặp. Hoàn thành xác minh GPS và camera để đánh thức từng lớp di sản.</p><div className="progress-label"><span>Tiến trình khám phá</span><strong>1/5 địa điểm</strong></div><div className="progress"><i></i></div><br /><a className="btn btn-gold" href="#map">Tiếp tục hành trình</a></div>
                <div className="journey-list"><div className="journey-stop"><span className="stop-no">✓</span>Khuê Văn Các</div><div className="journey-stop"><span className="stop-no">2</span>Cổng Đại Trung</div><div className="journey-stop"><span className="stop-no">3</span>Điện Đại Thành</div><div className="journey-stop"><span className="stop-no">4</span>Nhà Thái Học</div><div className="journey-stop"><span className="stop-no">5</span>Phương Đình</div></div>
              </div>
            </section>

            <section className="section"><div className="section-head"><div><span className="kicker">Bản đồ tương tác</span><h2>Di sản quanh bạn</h2><p>Tìm công trình gần nhất và theo dõi phần không gian đã được đánh thức.</p></div><a className="btn btn-outline" href="#map">Mở bản đồ lớn</a></div>
              <div className="map-preview"><div className="map-art"></div><div className="map-marker jade" style={{ left: '35%', top: '40%' }}><span>✓</span></div><div className="map-marker" style={{ left: '55%', top: '27%' }}><span>2</span></div><div className="map-marker locked" style={{ left: '71%', top: '57%' }}><span>3</span></div><div className="map-marker" style={{ left: '48%', top: '68%' }}><span>4</span></div><div className="map-card"><strong>Khuê Văn Các · Đã xác minh</strong><p>Cách bạn 32 m · Dấu ấn đầu tiên trong hành trình hôm nay.</p><a className="btn btn-primary" href="#interpret">Xem câu chuyện</a></div></div>
            </section>

            <section className="section"><div className="section-head"><div><span className="kicker">Gần bạn</span><h2>Các công trình nổi bật</h2><p>Mỗi trạng thái đều có nhãn rõ ràng cùng hành động tiếp theo.</p></div></div>
              <div className="cards">
                <article className="location-card"><div className="location-image"><img className="shape-art heritage-photo" src="/images/heritage/khue-van-cac.webp" alt="Khuê Văn Các tại Văn Miếu – Quốc Tử Giám" loading="lazy" /><span className="badge done">✓ Đã mở khóa</span></div><div className="location-body"><h3>Khuê Văn Các</h3><p>Biểu tượng văn chương và trí tuệ, được xây dựng dưới triều Nguyễn.</p><div className="meta"><span>⌖ 32 m</span><span>✓ Camera xác minh</span></div><a className="btn btn-outline btn-block" href="#interpret">Xem câu chuyện</a></div></article>
                <article className="location-card"><div className="location-image"><img className="shape-art heritage-photo" src="/images/heritage/dai-trung-gate.webp" alt="Cổng Đại Trung tại Văn Miếu – Quốc Tử Giám" loading="lazy" /><span className="badge near">⌖ Đang ở gần</span></div><div className="location-body"><h3>Cổng Đại Trung</h3><p>Cánh cổng dẫn vào không gian trung tâm của quần thể Văn Miếu.</p><div className="meta"><span>⌖ 46 m</span><span>◎ Cần xác minh</span></div><a className="btn btn-primary btn-block" href="#location-dai-trung-gate">Xem câu chuyện</a></div></article>
                <article className="location-card locked"><div className="location-image"><img className="shape-art art-c heritage-photo" src="/images/heritage/thai-hoc-building.webp" alt="Toàn cảnh công trình Nhà Thái Học tại Văn Miếu – Quốc Tử Giám" loading="lazy" /><span className="badge">◉ Chưa đến gần</span></div><div className="location-body"><h3>Nhà Thái Học</h3><p>Nội dung lịch sử đang ngủ. Hãy đến gần để mở khóa câu chuyện.</p><div className="meta"><span>⌖ 210 m</span><span>◇ GPS chưa xác nhận</span></div><a className="btn btn-outline btn-block" href="#location-thai-hoc-house">Xem câu chuyện</a></div></article>
              </div>
              <div className="more-row"><a className="btn btn-outline" href="#all-locations">Xem thêm tất cả công trình →</a></div>
            </section>

            <section className="section"><div className="section-head"><div><span className="kicker">Thư viện tri thức</span><h2>Danh nhân và bậc hiền triết</h2></div></div>
              <div className="figures"><article className="figure-card"><img className="portrait-shape heritage-photo" src="/images/heritage/chu-van-an.jpg" alt="Tượng thầy Chu Văn An" loading="lazy" /><div className="figure-copy"><h3>Chu Văn An</h3><small>Người thầy mẫu mực</small><p>Gắn với lịch sử Quốc Tử Giám và truyền thống tôn sư trọng đạo.</p><a className="text-link" href="#figure-chu-van-an">Nghe câu chuyện →</a></div></article><article className="figure-card"><img className="portrait-shape portrait-b heritage-photo" src="/images/heritage/ly-thanh-tong.jpg" alt="Tượng vua Lý Thánh Tông" loading="lazy" /><div className="figure-copy"><h3>Lý Thánh Tông</h3><small>1023–1072</small><p>Vị vua cho dựng Văn Miếu vào năm 1070.</p><a className="text-link" href="#figure-ly-thanh-tong">Hỏi AI →</a></div></article><article className="figure-card"><img className="portrait-shape portrait-c heritage-photo" src="/images/heritage/confucius-statue.jpg" alt="Tượng thờ Khổng Tử tại Văn Miếu – Quốc Tử Giám" loading="lazy" /><div className="figure-copy"><h3>Khổng Tử</h3><small>Bậc vạn thế sư biểu</small><p>Nhân vật trung tâm trong không gian thờ tự của Văn Miếu.</p><a className="text-link" href="#figure-confucius">Nghe câu chuyện →</a></div></article></div>
              <div className="more-row"><a className="btn btn-outline" href="#all-figures">Xem thêm tất cả danh nhân →</a></div>
            </section>

            <section className="section"><div className="passport-teaser"><div className="passport-cover"><div><div className="star">★</div><div className="eyebrow">Digital Heritage Passport</div><h2>Hộ chiếu Di sản</h2><p>1 trong 10 dấu ấn đã thu thập</p><a className="btn btn-gold" href="#passport">Mở hộ chiếu</a></div></div><div className="passport-stamps"><div className="stamp collected">★</div><div className="stamp">○</div><div className="stamp">○</div><div className="stamp">○</div><div className="stamp">○</div><div className="stamp">○</div><div className="stamp">○</div><div className="stamp">○</div><div className="stamp">○</div><div className="stamp">○</div></div></div></section>
    
            <section className="section">
              <div className="ai-guide ai-guide-home" aria-label="Trò chuyện với AI Heritage Guide">
                <header className="ai-guide-header"><div className="ai-avatar">AI</div><div><span>AI Heritage Guide</span><h2>Hỏi để hiểu sâu hơn</h2></div><span className="ai-status">● Đang trực tuyến</span></header>
                <div className="ai-chat-body">
                  <div className="ai-message"><div className="mini-avatar">AI</div><div><span className="message-label">Trợ lý di sản</span><div className="bubble ai">Xin chào! Bạn đang đứng trước Khuê Văn Các. Tôi có thể kể về kiến trúc, ý nghĩa biểu tượng hoặc lịch sử của công trình này.</div></div></div>
                  <div className="ai-message user-message"><div><span className="message-label">Bạn</span><div className="bubble user">Vì sao hình ảnh Khuê Văn Các được in trên tiền Việt Nam?</div></div></div>
                  <p className="suggestion-label">Bạn có thể hỏi tiếp</p>
                  <div className="question-row"><button className="chip">Kiến trúc có gì đặc biệt?</button><button className="chip">Nghe câu chuyện 2 phút</button><button className="chip">Nhân vật liên quan</button></div>
                </div>
                <div className="ai-composer"><button className="composer-tool" aria-label="Thêm nội dung"><Plus size={19} aria-hidden="true" /></button><label><span className="sr-only">Câu hỏi dành cho AI</span><input type="text" placeholder="Hỏi AI về di sản bạn đang khám phá..." /></label><button className="send-button" aria-label="Gửi câu hỏi"><Send size={18} aria-hidden="true" /></button></div>
                <p className="ai-note">AI có thể mắc lỗi. Hãy kiểm chứng những thông tin lịch sử quan trọng.</p>
              </div>
            </section>
          </div>
          <footer className="footer"><strong>Explore Van Mieu</strong>Một hành trình số đánh thức di sản và truyền thống hiếu học Việt Nam.</footer>
        </section>
  )
}

export default HomePage

