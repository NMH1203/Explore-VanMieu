import { useLanguage } from '../../i18n/LanguageContext.jsx'
function FiguresPage() {
  const { t } = useLanguage()
  return (
    <section className="screen" id="all-figures">
      <header className="topbar">
        <div className="inner">
          <div className="catalog-back">
            <a className="btn btn-light" href="/Explore">
              ← {t("common.back")}
            </a>
          </div>
          <div className="eyebrow">{t("figures.eyebrow")}</div>
          <h1>{t("figures.title")}</h1>
          <p>
            {t("figures.description")}
          </p>
        </div>
      </header>
      <div className="container">
        <div className="catalog-summary">
          <span>{t("figures.count")}</span>
          <span>{t("figures.unlocked")}</span>
          <span>{t("figures.summary")}</span>
        </div>
        <div className="figures all-figures">
          <article className="figure-card">
            <img
              className="portrait-shape heritage-photo"
              src="/images/heritage/ly-thanh-tong.jpg"
              alt={t("figures.alt.lyThanhTong")}
              loading="lazy"
            />
            <div className="figure-copy">
              <h3>
                <a href="/Explore/Danh-Nhan/Ly-Thanh-Tong">{t("detail.items.figure-ly-thanh-tong.title")}</a>
              </h3>
              <small>1023–1072 · {t("figures.profiles.lyThanhTongRole")}</small>
              <p>
                {t("figures.profiles.lyThanhTongStory")}
              </p>
              <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Ly-Thanh-Tong">
                {t("common.readStory")}
              </a>
            </div>
          </article>
          <article className="figure-card">
            <img
              className="portrait-shape heritage-photo"
              src="/images/heritage/ly-nhan-tong.jpg"
              alt={t("figures.alt.lyNhanTong")}
              loading="lazy"
            />
            <div className="figure-copy">
              <h3>
                <a href="/Explore/Danh-Nhan/Ly-Nhan-Tong">{t("detail.items.figure-ly-nhan-tong.title")}</a>
              </h3>
              <small>1066–1128 · {t("figures.profiles.lyNhanTongRole")}</small>
              <p>{t("figures.profiles.lyNhanTongStory")}</p>
              <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Ly-Nhan-Tong">
                {t("common.readStory")}
              </a>
            </div>
          </article>
          <article className="figure-card">
            <img
              className="portrait-shape heritage-photo"
              src="/images/heritage/le-thanh-tong.jpg"
              alt={t("figures.alt.leThanhTong")}
              loading="lazy"
            />
            <div className="figure-copy">
              <h3>
                <a href="/Explore/Danh-Nhan/Le-Thanh-Tong">{t("detail.items.figure-le-thanh-tong.title")}</a>
              </h3>
              <small>1442–1497 · {t("figures.profiles.leThanhTongRole")}</small>
              <p>{t("figures.profiles.leThanhTongStory")}</p>
              <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Le-Thanh-Tong">
                {t("common.readStory")}
              </a>
            </div>
          </article>
          <article className="figure-card">
            <img
              className="portrait-shape heritage-photo"
              src="/images/heritage/chu-van-an.jpg"
              alt={t("figures.alt.chuVanAn")}
              loading="lazy"
            />
            <div className="figure-copy">
              <h3>
                <a href="/Explore/Danh-Nhan/Chu-Van-An">{t("detail.items.figure-chu-van-an.title")}</a>
              </h3>
              <small>1292–1370 · {t("figures.profiles.chuVanAnRole")}</small>
              <p>{t("figures.profiles.chuVanAnStory")}</p>
              <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Chu-Van-An">
                {t("common.readStory")}
              </a>
            </div>
          </article>
          <article className="figure-card">
            <img
              className="portrait-shape heritage-photo"
              src="/images/heritage/confucius-statue.jpg"
              alt={t("figures.alt.confucius")}
              loading="lazy"
            />
            <div className="figure-copy">
              <h3>
                <a href="/Explore/Danh-Nhan/Khong-Tu">{t("detail.items.figure-confucius.title")}</a>
              </h3>
              <small>551–479 BCE · {t("figures.profiles.confuciusRole")}</small>
              <p>{t("figures.profiles.confuciusStory")}</p>
              <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Khong-Tu">
                {t("common.readStory")}
              </a>
            </div>
          </article>
          <article className="figure-card">
            <div
              className="figure-portrait-collage"
              role="img"
              aria-label={t("figures.alt.fourSages")}
            >
              <img src="/images/heritage/nhan-tu.webp" alt="" loading="lazy" />
              <img src="/images/heritage/tang-tu.webp" alt="" loading="lazy" />
              <img src="/images/heritage/manh-tu.webp" alt="" loading="lazy" />
              <img src="/images/heritage/tu-tu.webp" alt="" loading="lazy" />
            </div>
            <div className="figure-copy">
              <h3>
                <a href="/Explore/Danh-Nhan/Tu-Phoi">{t("detail.items.figure-four-sages.title")}</a>
              </h3>
              <small>{t("figures.profiles.fourSagesRole")}</small>
              <p>{t("figures.profiles.fourSagesStory")}</p>
              <a className="btn btn-outline btn-block figure-story-btn" href="/Explore/Danh-Nhan/Tu-Phoi">
                {t("common.readStory")}
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

export default FiguresPage
