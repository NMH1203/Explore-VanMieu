const features = [
  ['Định vị thông minh', 'Tự động mở khóa nội dung khi bạn đến gần điểm di sản.'],
  ['Nhận diện hiện vật', 'Chụp ảnh để xác thực hiện vật và nhận nội dung thuyết minh.'],
  ['Hộ chiếu di sản', 'Lưu hành trình, sưu tầm con dấu và chinh phục các cột mốc.'],
]

function App() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Hành trình di sản số</p>
        <h1>Khám phá Văn Miếu theo cách của bạn</h1>
        <p className="intro">
          Tìm địa điểm trên bản đồ, nhận diện hiện vật bằng camera và lắng nghe
          những câu chuyện lịch sử được hỗ trợ bởi AI.
        </p>
        <div className="actions">
          <button type="button">Bắt đầu khám phá</button>
          <a href="#features">Tìm hiểu tính năng</a>
        </div>
      </section>

      <section className="features" id="features" aria-labelledby="features-title">
        <div className="section-heading">
          <p className="eyebrow">Tính năng nổi bật</p>
          <h2 id="features-title">Một hành trình liền mạch</h2>
        </div>
        <div className="feature-grid">
          {features.map(([title, description], index) => (
            <article className="feature-card" key={title}>
              <span aria-hidden="true">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
