function CameraPage() {
  return (
    <section className="screen" id="camera">
          <div className="camera-screen">
            <div className="camera-art" role="img" aria-label="Khối hình học mô phỏng góc nhìn camera"></div>
            <div className="camera-ui">
              <div className="camera-top"><a className="round-btn" href="#map">←</a><div className="camera-progress"><span className="active">1 · Quét</span><i></i><span>2 · Xác định vị trí</span><i></i><span>3 · Khám phá</span></div><button className="round-btn" aria-label="Bật đèn">☼</button></div>
              <div className="camera-location"><span className="location-dot">●</span><div><small>Vị trí hiện tại</small><strong>Sân Khuê Văn Các</strong><span>Văn Miếu – Quốc Tử Giám · Chính xác ±8 m</span></div></div>
              <div className="viewfinder"><span className="corner tl"></span><span className="corner tr"></span><span className="corner bl"></span><span className="corner br"></span><div className="scan-line"></div><div className="scan-hint">Giữ công trình nằm trọn trong khung</div></div>
              <div className="camera-bottom scan-ready"><span className="camera-kicker">Nhận diện công trình</span><h2>Hướng camera về phía Khuê Văn Các</h2><p>AI sẽ đối chiếu kiến trúc và GPS để tìm đúng câu chuyện di sản tại vị trí của bạn.</p><label className="scan-button" htmlFor="scan-complete"><span>◎</span> Bắt đầu quét</label></div>
              <div className="camera-bottom scan-result"><div className="result-check">✓</div><div className="result-copy"><span className="camera-kicker">Đã nhận diện · độ tin cậy 98%</span><h2>Khuê Văn Các</h2><p><b>⌖ Bạn đang ở Sân Khuê Văn Các</b><br />Cách công trình 12 m · GPS và hình ảnh đã trùng khớp.</p><div className="result-actions"><a className="btn btn-gold" href="#interpret">Xem thông tin di sản →</a><label className="scan-again" htmlFor="scan-complete">Quét lại</label></div></div></div>
            </div>
          </div>
        </section>
  )
}

export default CameraPage
