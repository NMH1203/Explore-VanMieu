import { Award, Check, LockKeyhole, Plus, Send } from 'lucide-react'
import { paths } from '../../routes.js'
import { useLanguage } from '../../i18n/LanguageContext.jsx'

const items = [
  [
    'location-van-mieu-gate',
    'Công trình',
    'Cổng Văn Miếu',
    'van-mieu-gate.webp',
    'Khởi đầu trục không gian đạo học',
    'Lối vào chính mở ra hành trình qua năm lớp sân của quần thể Văn Miếu. Kiến trúc tam quan tạo ranh giới trang nghiêm giữa phố thị và không gian di sản.',
  ],
  [
    'location-dai-trung-gate',
    'Công trình',
    'Cổng Đại Trung',
    'dai-trung-gate.webp',
    'Cánh cổng dẫn vào trung tâm di tích',
    'Đại Trung Môn đánh dấu bước chuyển vào lớp không gian sâu hơn. Hai cổng nhỏ Thành Đức và Đạt Tài gợi nhắc việc rèn đức, luyện tài.',
  ],
  [
    'interpret',
    'Di sản đã thức tỉnh',
    'Khuê Văn Các',
    'khue-van-cac.webp',
    'Biểu tượng của văn chương và ánh sáng tri thức',
    'Công trình đầu thế kỷ XIX nổi bật với lầu vuông tám mái và bốn cửa sổ tròn. Tên gọi gợi sao Khuê, ngôi sao chủ về văn chương.',
  ],
  [
    'location-dai-thanh-gate',
    'Công trình',
    'Cổng Đại Thành',
    'dai-thanh-gate.webp',
    'Lối vào không gian thờ tự',
    'Cổng Đại Thành dẫn vào khu điện thờ Khổng Tử và các bậc hiền triết. Tên gọi biểu thị sự thành tựu lớn lao của học vấn và đạo đức.',
  ],
  [
    'location-dien-dai-thanh',
    'Công trình',
    'Điện Đại Thành',
    'dien-dai-thanh.webp',
    'Trung tâm thờ tự của Văn Miếu',
    'Điện Đại Thành là công trình trung tâm, nơi thờ Khổng Tử và các bậc hiền triết Nho học trong không gian gỗ sơn son trang nghiêm.',
  ],
  [
    'location-thai-hoc-gate',
    'Công trình',
    'Cổng Thái Học',
    'thai-hoc-gate.webp',
    'Dấu mốc chuyển vào khu Quốc Tử Giám',
    'Cổng nối khu Đại Thành với khu Thái Học, có ba gian, mái ngói truyền thống và khoảng sân rộng tạo chiều sâu cho trục tham quan.',
  ],
  [
    'location-thai-hoc-house',
    'Công trình',
    'Nhà Thái Học',
    'thai-hoc-building.webp',
    'Không gian tiếp nối truyền thống Quốc học',
    'Khu Thái Học được dựng trên nền Quốc Tử Giám xưa, giới thiệu lịch sử giáo dục và tưởng niệm những người có công với đạo học.',
  ],
  [
    'location-bell-drum-tower',
    'Công trình',
    'Lầu Chuông – Lầu Trống',
    'bell-drum-tower.webp',
    'Cặp công trình tạo thế cân xứng',
    'Hai lầu đứng hai bên khu Thái Học, tạo bố cục đăng đối và gợi nhịp nghi lễ, sinh hoạt của không gian giáo dục truyền thống.',
  ],
  [
    'location-octagonal-house',
    'Công trình',
    'Nhà Bát Giác',
    'octagonal-house.webp',
    'Không gian tám cạnh giàu biểu tượng',
    'Mặt bằng tám cạnh và hệ mái thanh thoát tạo một điểm dừng kiến trúc hài hòa giữa cảnh quan cây xanh và các tuyến tham quan.',
  ],
  [
    'location-phuong-dinh',
    'Công trình',
    'Phương Đình',
    'phuong-dinh.webp',
    'Điểm dừng chân bên Hồ Văn',
    'Công trình mặt bằng vuông kết nối cảnh quan Hồ Văn với quần thể di tích, tạo nơi nghỉ và quan sát trên trục tham quan.',
  ],
  [
    'figure-ly-thanh-tong',
    'Danh nhân',
    'Lý Thánh Tông',
    'ly-thanh-tong.jpg',
    'Vị vua cho dựng Văn Miếu',
    'Năm 1070, Lý Thánh Tông cho dựng Văn Miếu tại Thăng Long, mở đầu truyền thống tôn vinh đạo học và các bậc tiên hiền.',
  ],
  [
    'figure-ly-nhan-tong',
    'Danh nhân',
    'Lý Nhân Tông',
    'ly-nhan-tong.jpg',
    'Người đặt nền móng cho Quốc Tử Giám',
    'Ông tổ chức khoa thi đầu tiên năm 1075 và lập Quốc Tử Giám năm 1076 để đào tạo nhân tài cho đất nước.',
  ],
  [
    'figure-le-thanh-tong',
    'Danh nhân',
    'Lê Thánh Tông',
    'le-thanh-tong.jpg',
    'Vị vua đề cao hiền tài và khoa cử',
    'Năm 1484, nhà vua cho dựng những bia Tiến sĩ đầu tiên để ghi danh người hiền tài và khuyến khích việc học.',
  ],
  [
    'figure-chu-van-an',
    'Danh nhân',
    'Chu Văn An',
    'chu-van-an.jpg',
    'Người thầy mẫu mực của muôn đời',
    'Chu Văn An từng giữ chức Tư nghiệp Quốc Tử Giám; nhân cách thanh liêm và chính trực của ông trở thành biểu tượng của người thầy.',
  ],
  [
    'figure-confucius',
    'Danh nhân',
    'Khổng Tử',
    'confucius-statue.jpg',
    'Bậc vạn thế sư biểu',
    'Khổng Tử là nhà tư tưởng, nhà giáo lớn của phương Đông. Văn Miếu thờ ông và trở thành biểu tượng cho việc học cùng tu dưỡng đạo đức.',
  ],
  [
    'figure-four-sages',
    'Danh nhân',
    'Tứ Phối',
    'nhan-tu.webp',
    'Bốn bậc hiền triết phối thờ',
    'Tứ Phối gồm Nhan Hồi, Tăng Sâm, Tử Tư và Mạnh Tử, những người kế thừa và phát triển tư tưởng của Khổng Tử.',
  ],
].map(([id, type, title, file, heading, story]) => ({
  id,
  type,
  title,
  heading,
  story,
  image: `/images/heritage/${file}`,
}))

function Detail({ item, unlocked }) {
  const { t } = useLanguage()
  if (!unlocked) {
    return (
      <section className="screen" id={item.id}>
        <div className="locked-detail">
          <LockKeyhole size={44} aria-hidden="true" />
          <h1>{t("detail.items." + item.id + ".title")}</h1>
          <p>{t("detail.locked")}</p>
          <a className="btn btn-primary" href={paths.locations}>
            {t("detail.backToSites")}
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="screen" id={item.id}>
      <div className="interpret-layout">
        <div className="interpret-visual">
          <img className="interpret-art heritage-photo" src={item.image} alt={t("detail.items." + item.id + ".title")} />
          <div className="interpret-title">
            <span className="eyebrow">{t("detail.items." + item.id + ".type")}</span>
            <h1>{t("detail.items." + item.id + ".title")}</h1>
            <span>{t("nav.version")}</span>
          </div>
          <a className="interpret-scroll" href={`#${item.id}-story`}>
            {t("detail.exploreStory")} <span>↓</span>
          </a>
        </div>
        <div className="interpret-content" id={`${item.id}-story`}>
          <div className="interpret-story-grid">
            <div>
              <div className="success">
                <span>
                  <Check size={20} />
                </span>
                <div>
                  <b>{t("detail.unlocked")}</b>
                  <span>{t("detail.materials")}</span>
                </div>
              </div>
              <article className="article">
                <span className="kicker">{t("detail.story")}</span>
                <h2>{t("detail.items." + item.id + ".heading")}</h2>
                <p>{t("detail.items." + item.id + ".story")}</p>
              </article>
              <div className="fact">
                <strong>{t("detail.featured")}</strong>
                <br />
                {t("detail.items." + item.id + ".story")}
              </div>
            </div>
            <div>
              <div className="achievement-gate">
                <div className="before-unlock">
                  <div className="achievement-icon">
                    <Award size={28} />
                  </div>
                  <h2>{t("detail.continue")}</h2>
                  <p>{t("detail.continueDescription")}</p>
                  <a className="btn btn-primary" href={paths.explore}>
                    {t("detail.backToJourney")}
                  </a>
                </div>
              </div>
              <article className="article heritage-stamp">
                <span className="kicker">{t("detail.yourStamp")}</span>
                <h2>{t("detail.recorded")}</h2>
                <p>{t("detail.added")}</p>
                <a className="btn btn-outline" href={paths.passport}>
                  {t("detail.viewPassport")}
                </a>
              </article>
            </div>
          </div>
          <section className="ai-guide" aria-label={t("detail.aiLabel", { title: t("detail.items." + item.id + ".title") })}>
            <header className="ai-guide-header">
              <div className="ai-avatar">AI</div>
              <div>
                <span>AI Heritage Guide</span>
                <h2>{t("detail.askMore", { title: t("detail.items." + item.id + ".title") })}</h2>
              </div>
              <span className="ai-status">{t("detail.online")}</span>
            </header>
            <div className="ai-chat-body">
              <div className="ai-message">
                <div className="mini-avatar">AI</div>
                <div>
                  <span className="message-label">{t("detail.assistant")}</span>
                  <div className="bubble ai">
                    {t("detail.question", { title: t("detail.items." + item.id + ".title") })}
                  </div>
                </div>
              </div>
            </div>
            <div className="ai-composer">
              <button className="composer-tool" aria-label={t("detail.add")}>
                <Plus size={19} />
              </button>
              <label>
                <span className="sr-only">{t("detail.inputLabel")}</span>
                <input placeholder={t("detail.placeholder", { title: t("detail.items." + item.id + ".title") })} />
              </label>
              <button className="send-button" aria-label={t("detail.send")}>
                <Send size={18} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  )
}

export default function LocationDetailPage({ id, unlockedLocations }) {
  const item = items.find((candidate) => candidate.id === id)
  if (!item) return null

  return <Detail item={item} unlocked={item.type === 'Danh nhân' || unlockedLocations.has(item.id)} />
}
