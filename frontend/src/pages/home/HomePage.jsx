import { Award, LockKeyhole, MapPin, Plus, ScanLine, Send, Sparkles, UserRound } from 'lucide-react'
import JourneyCard from '../../components/JourneyCard.jsx'
import { useLanguage } from '../../i18n/LanguageContext.jsx'

function HomePage({ unlockedLocations }) {
  const { t } = useLanguage()
  const khueVanCacUnlocked = unlockedLocations.has('interpret')
  const daiTrungUnlocked = unlockedLocations.has('location-dai-trung-gate')
  const thaiHocUnlocked = unlockedLocations.has('location-thai-hoc-house')
  const passportPreview = [
    ['interpret', 'khue-van-cac.jpg', 'Khuê Văn Các'],
    ['location-van-mieu-gate', 'cong-van-mieu.jpg', 'Cổng Văn Miếu'],
    ['location-dai-trung-gate', 'cong-dai-trung.jpg', 'Cổng Đại Trung'],
    ['location-dai-thanh-gate', 'cong-dai-thanh.jpg', 'Cổng Đại Thành'],
    ['location-dien-dai-thanh', 'dien-dai-thanh.jpg', 'Điện Đại Thành'],
    ['location-thai-hoc-gate', 'cong-thai-hoc.jpg', 'Cổng Thái Học'],
  ]

  return (
    <section className="screen" id="explore">
      <div className="hero">
        <img
          className="hero-bg heritage-photo"
          src="/images/heritage/van-mieu-hero.jpg"
          alt={t("home.hero.imageAlt")}
        />
        <header className="hero-header">
          <a className="hero-logo" href="/Explore">
            <img src="/images/brand-khue-van-cac.jpg" alt="" />
            Explore Van Mieu
          </a>
          <a className="avatar" href="/Explore/Tai-Khoan" aria-label={t("common.account")}>
            <UserRound size={23} strokeWidth={2} aria-hidden="true" />
          </a>
        </header>
        <div className="hero-copy">
          <div className="eyebrow">{t("home.hero.eyebrow")}</div>
          <h1>
            {t("home.hero.title")} <span>{t("home.hero.subtitle")}</span>
          </h1>
          <p>
            Mỗi bước chân mở ra một công trình, một nhân vật và một câu chuyện đã góp phần tạo nên
            di sản tri thức Việt Nam.
          </p>
          <div className="hero-actions">
            <a className="btn btn-gold" href="#journey">
              {t("home.hero.start")}
            </a>
            <a className="btn btn-light" href="#journey">
              {t("home.hero.today")}
            </a>
          </div>
        </div>
        <a className="scroll-cue" href="#intro">
          {t("home.hero.scroll")}
        </a>
      </div>

      <div className="intro" id="intro">
        <div className="container intro-grid">
          <div>
            <span className="kicker">{t("home.intro.kicker")}</span>
            <h2>{t("home.intro.title")}</h2>
            <p>
              {t("home.intro.description")}
            </p>
          </div>
          <div className="intro-stat">
            <div>
              <strong>1070</strong>
              <span>{t("home.intro.founded")}</span>
            </div>
            <div>
              <strong>10</strong>
              <span>{t("home.intro.sites")}</span>
            </div>
            <div>
              <strong>82</strong>
              <span>{t("home.intro.steles")}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="how-it-works" aria-labelledby="how-title">
        <div className="container">
          <div className="how-heading">
            <div>
              <span className="kicker">{t("home.how.kicker")}</span>
              <h2 id="how-title">{t("home.how.title")}</h2>
            </div>
            <p>
              Chỉ cần điện thoại và vài phút tại mỗi điểm đến, bạn có thể mở từng lớp câu chuyện của
              di sản.
            </p>
          </div>
          <div className="use-flow">
            <article className="flow-step">
              <div className="flow-visual photo-flow">
                <img
                  className="flow-photo"
                  src="/images/journey/find-nearby-heritage.jpg"
                  alt={t("home.how.findAlt")}
                  loading="lazy"
                />
                <span className="flow-icon">
                  <MapPin size={21} aria-hidden="true" />
                </span>
                <b>01</b>
              </div>
              <div className="flow-copy">
                <span>{t("home.how.stepOne")}</span>
                <h3>{t("home.how.find")}</h3>
                <p>{t("home.how.findDescription")}</p>
              </div>
            </article>
            <span className="flow-arrow" aria-hidden="true">
              →
            </span>
            <article className="flow-step">
              <div className="flow-visual photo-flow">
                <img
                  className="flow-photo"
                  src="/images/journey/scan-heritage.jpg"
                  alt={t("home.how.scanAlt")}
                  loading="lazy"
                />
                <span className="flow-icon">
                  <ScanLine size={21} aria-hidden="true" />
                </span>
                <b>02</b>
              </div>
              <div className="flow-copy">
                <span>{t("home.how.stepTwo")}</span>
                <h3>{t("home.how.scan")}</h3>
                <p>{t("home.how.scanDescription")}</p>
              </div>
            </article>
            <span className="flow-arrow" aria-hidden="true">
              →
            </span>
            <article className="flow-step">
              <div className="flow-visual photo-flow">
                <img
                  className="flow-photo"
                  src="/images/journey/open-heritage-story.jpg"
                  alt={t("home.how.storyAlt")}
                  loading="lazy"
                />
                <span className="flow-icon">
                  <Sparkles size={21} aria-hidden="true" />
                </span>
                <b>03</b>
              </div>
              <div className="flow-copy">
                <span>{t("home.how.stepThree")}</span>
                <h3>{t("home.how.story")}</h3>
                <p>{t("home.how.storyDescription")}</p>
              </div>
            </article>
            <span className="flow-arrow" aria-hidden="true">
              →
            </span>
            <article className="flow-step">
              <div className="flow-visual photo-flow">
                <img
                  className="flow-photo"
                  src="/images/journey/complete-heritage-journey.jpg"
                  alt={t("home.how.stampAlt")}
                  loading="lazy"
                />
                <span className="flow-icon">
                  <Award size={21} aria-hidden="true" />
                </span>
                <b>04</b>
              </div>
              <div className="flow-copy">
                <span>{t("home.how.stepFour")}</span>
                <h3>{t("home.how.stamp")}</h3>
                <p>Nhận con dấu vào {t("home.passport.title")} và tiếp tục điểm đến mới.</p>
              </div>
            </article>
          </div>
          <div className="how-action">
            <a className="btn btn-primary" href="/Explore/Ban-Do">
              {t("home.how.startMap")}
            </a>
            <span>{t("home.how.noDownload")}</span>
          </div>
        </div>
      </section>

      <div className="container">
        <section className="section" id="journey">
          <JourneyCard unlockedLocations={unlockedLocations} />
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <span className="kicker">{t("home.map.kicker")}</span>
              <h2>{t("home.map.title")}</h2>
              <p>{t("home.map.description")}</p>
            </div>
            <a className="btn btn-outline" href="/Explore/Ban-Do">
              {t("home.map.open")}
            </a>
          </div>
          <div className="map-preview">
            <div className="map-art"></div>
            <div
              className={`map-marker${khueVanCacUnlocked ? ' jade' : ' locked'}`}
              style={{ left: '35%', top: '40%' }}
            >
              <span>{khueVanCacUnlocked ? '✓' : '1'}</span>
            </div>
            <div
              className={`map-marker${daiTrungUnlocked ? ' jade' : ' locked'}`}
              style={{ left: '55%', top: '27%' }}
            >
              <span>2</span>
            </div>
            <div className="map-marker locked" style={{ left: '71%', top: '57%' }}>
              <span>3</span>
            </div>
            <div
              className={`map-marker${thaiHocUnlocked ? ' jade' : ' locked'}`}
              style={{ left: '48%', top: '68%' }}
            >
              <span>4</span>
            </div>
            <div className="map-card">
              <strong>Khuê Văn Các · {khueVanCacUnlocked ? t("home.map.verifiedState") : t("home.map.unverifiedState")}</strong>
              <p>{t("home.map.distance")}</p>
              {khueVanCacUnlocked ? (
                <a className="btn btn-primary" href="/Explore/Khue-Van-Cac">
                  {t("common.readStory")}
                </a>
              ) : (
                <a className="btn btn-primary" href="/Explore/Camera">
                  {t("map.verify", { distance: "32 m" })}
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <span className="kicker">{t("home.featured.nearby")}</span>
              <h2>{t("home.featured.title")}</h2>
              <p>{t("home.featured.description")}</p>
            </div>
          </div>
          <div className="cards">
            <article className={`location-card${khueVanCacUnlocked ? '' : ' locked'}`}>
              <div className="location-image">
                <img
                  className="shape-art heritage-photo"
                  src="/images/heritage/khue-van-cac.webp"
                  alt={t("locations.names.khueVanCac")}
                  loading="lazy"
                />
                <span className={`badge${khueVanCacUnlocked ? ' done' : ''}`}>
                  {khueVanCacUnlocked ? '✓ ' + t("common.unlocked") : t("common.locked")}
                </span>
              </div>
              <div className="location-body">
                <h3>{t("locations.names.khueVanCac")}</h3>
                <p>{t("locations.descriptions.khueVanCac")}</p>
                <div className="meta">
                  <span>⌖ 32 m</span>
                  {khueVanCacUnlocked && <span>{t("home.map.verified")}</span>}
                </div>
                {khueVanCacUnlocked ? (
                  <a className="btn btn-outline btn-block" href="/Explore/Khue-Van-Cac">
                    {t("common.readStory")}
                  </a>
                ) : (
                  <button className="btn btn-outline btn-block locked-action" type="button" disabled>
                    <LockKeyhole size={16} aria-hidden="true" />
                    {t("common.locked")}
                  </button>
                )}
              </div>
            </article>
            <article className={`location-card${daiTrungUnlocked ? '' : ' locked'}`}>
              <div className="location-image">
                <img
                  className="shape-art heritage-photo"
                  src="/images/heritage/dai-trung-gate.webp"
                  alt={t("locations.names.daiTrungGate")}
                  loading="lazy"
                />
                <span className={`badge${daiTrungUnlocked ? ' done' : ''}`}>
                  {daiTrungUnlocked ? '✓ ' + t("common.unlocked") : t("common.locked")}
                </span>
              </div>
              <div className="location-body">
                <h3>{t("locations.names.daiTrungGate")}</h3>
                <p>{t("locations.descriptions.daiTrungGate")}</p>
                <div className="meta">
                  <span>⌖ 46 m</span>
                </div>
                {daiTrungUnlocked ? (
                  <a className="btn btn-outline btn-block" href="/Explore/Cong-Dai-Trung">
                    {t("common.readStory")}
                  </a>
                ) : (
                  <button className="btn btn-outline btn-block locked-action" type="button" disabled>
                    <LockKeyhole size={16} aria-hidden="true" />
                    {t("common.locked")}
                  </button>
                )}
              </div>
            </article>
            <article className={`location-card${thaiHocUnlocked ? '' : ' locked'}`}>
              <div className="location-image">
                <img
                  className="shape-art art-c heritage-photo"
                  src="/images/heritage/thai-hoc-building.webp"
                  alt={t("locations.names.thaiHocHouse")}
                  loading="lazy"
                />
                <span className={`badge${thaiHocUnlocked ? ' done' : ''}`}>
                  {thaiHocUnlocked ? '✓ ' + t("common.unlocked") : t("common.locked")}
                </span>
              </div>
              <div className="location-body">
                <h3>{t("locations.names.thaiHocHouse")}</h3>
                <p>{t("home.featured.unlockStory")}</p>
                <div className="meta">
                  <span>⌖ 210 m</span>
                </div>
                {thaiHocUnlocked ? (
                  <a className="btn btn-outline btn-block" href="/Explore/Nha-Thai-Hoc">
                    {t("common.readStory")}
                  </a>
                ) : (
                  <button className="btn btn-outline btn-block locked-action" type="button" disabled>
                    <LockKeyhole size={16} aria-hidden="true" />
                    {t("common.locked")}
                  </button>
                )}
              </div>
            </article>
          </div>
          <div className="more-row">
            <a className="btn btn-outline" href="/Explore/Cong-Trinh">
              {t("home.featured.viewAll")}
            </a>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <span className="kicker">{t("home.featured.library")}</span>
              <h2>{t("home.featured.figures")}</h2>
            </div>
          </div>
          <div className="figures">
            <article className="figure-card">
              <img
                className="portrait-shape heritage-photo"
                src="/images/heritage/chu-van-an.jpg"
                alt={t("figures.alt.chuVanAn")}
                loading="lazy"
              />
              <div className="figure-copy">
                <h3>{t("detail.items.figure-chu-van-an.title")}</h3>
                <small>{t("figures.profiles.chuVanAnRole")}</small>
                <p>{t("figures.profiles.chuVanAnStory")}</p>
                <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Chu-Van-An">
                  {t("common.readStory")}
                </a>
              </div>
            </article>
            <article className="figure-card">
              <img
                className="portrait-shape portrait-b heritage-photo"
                src="/images/heritage/ly-thanh-tong.jpg"
                alt={t("figures.alt.lyThanhTong")}
                loading="lazy"
              />
              <div className="figure-copy">
                <h3>{t("detail.items.figure-ly-thanh-tong.title")}</h3>
                <small>1023–1072</small>
                <p>{t("figures.profiles.lyThanhTongStory")}</p>
                <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Ly-Thanh-Tong">
                  {t("common.readStory")}
                </a>
              </div>
            </article>
            <article className="figure-card">
              <img
                className="portrait-shape portrait-c heritage-photo"
                src="/images/heritage/confucius-statue.jpg"
                alt={t("figures.alt.confucius")}
                loading="lazy"
              />
              <div className="figure-copy">
                <h3>{t("detail.items.figure-confucius.title")}</h3>
                <small>{t("figures.profiles.confuciusRole")}</small>
                <p>{t("figures.profiles.confuciusStory")}</p>
                <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Khong-Tu">
                  {t("common.readStory")}
                </a>
              </div>
            </article>
          </div>
          <div className="more-row">
            <a className="btn btn-outline" href="/Explore/Danh-Nhan">
              {t("home.featured.viewFigures")}
            </a>
          </div>
        </section>

        <section className="section">
          <div className="passport-teaser">
            <div className="passport-cover">
              <div>
                <img
                  className="passport-cover-stamp"
                  src="/images/passport/khue-van-cac.jpg"
                  alt={t("passport.stampAlt", { name: t("locations.names.khueVanCac") })}
                  loading="lazy"
                />
                <div className="eyebrow">{t("home.passport.eyebrow")}</div>
                <h2>{t("home.passport.title")}</h2>
                <p>{t("home.passport.collected", { count: unlockedLocations.size })}</p>
                <a className="btn btn-gold" href="/Explore/Ho-Chieu">
                  {t("home.passport.open")}
                </a>
              </div>
            </div>
            <div className="passport-stamps">
              {passportPreview.map(([id, image, name]) => {
                const unlocked = unlockedLocations.has(id)
                return (
                  <div className={`stamp${unlocked ? ' collected' : ''}`} key={id}>
                    <img
                      src={`/images/passport/${image}`}
                      alt={`${name} ${unlocked ? 'đã mở khóa' : 'chưa mở khóa'}`}
                      loading="lazy"
                    />
                  </div>
                )
              })}
              <a className="passport-stamps-link" href="/Explore/Ho-Chieu">
                {t("home.passport.allStamps")}
              </a>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="ai-guide ai-guide-home" aria-label={t("home.ai.title")}>
            <header className="ai-guide-header">
              <div className="ai-avatar">AI</div>
              <div>
                <span>AI Heritage Guide</span>
                <h2>{t("home.ai.title")}</h2>
              </div>
              <span className="ai-status">{t("home.ai.online")}</span>
            </header>
            <div className="ai-chat-body">
              <div className="ai-message">
                <div className="mini-avatar">AI</div>
                <div>
                  <span className="message-label">{t("home.ai.assistant")}</span>
                  <div className="bubble ai">
                    Xin chào! Bạn đang đứng trước Khuê Văn Các. Tôi có thể kể về kiến trúc, ý nghĩa
                    biểu tượng hoặc lịch sử của công trình này.
                  </div>
                </div>
              </div>
              <div className="ai-message user-message">
                <div>
                  <span className="message-label">{t("home.ai.you")}</span>
                  <div className="bubble user">
                    {t("home.ai.sampleQuestion")}
                  </div>
                </div>
              </div>
              <p className="suggestion-label">{t("home.ai.suggestions")}</p>
              <div className="question-row">
                <button className="chip">{t("home.ai.architecture")}</button>
                <button className="chip">{t("home.ai.shortStory")}</button>
                <button className="chip">{t("home.ai.relatedFigures")}</button>
              </div>
            </div>
            <div className="ai-composer">
              <button className="composer-tool" aria-label={t("home.ai.add")}>
                <Plus size={19} aria-hidden="true" />
              </button>
              <label>
                <span className="sr-only">{t("home.ai.inputLabel")}</span>
                <input type="text" placeholder={t("home.ai.placeholder")} />
              </label>
              <button className="send-button" aria-label={t("home.ai.send")}>
                <Send size={18} aria-hidden="true" />
              </button>
            </div>
            <p className="ai-note">
              {t("home.ai.notice")}
            </p>
          </div>
        </section>
      </div>
      <footer className="footer">
        <strong>Explore Van Mieu</strong>{t("home.footer")}
        Việt Nam.
      </footer>
    </section>
  )
}

export default HomePage
