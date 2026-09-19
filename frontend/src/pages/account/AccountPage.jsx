import { useUnlockedLocations } from '../../state/heritageProgress.js'

function AccountPage({ user, onLogout }) {
  const unlockedCount = useUnlockedLocations().size
  const displayName = user?.username || user?.email || 'Đang tải...'
  const avatarText = displayName[0].toUpperCase()

  return (
    <section className="screen" id="account">
      <div className="profile-hero">
        <div className="profile">
          <div className="avatar">{avatarText}</div>
          <div>
            <h1>{displayName}</h1>
            <p>{user?.email || ''}</p>
            <br />
            <span className="btn btn-gold">★ Explore Van Mieu</span>
          </div>
        </div>
      </div>
      <div className="container passport-page">
        <div className="account-grid section">
          <div className="stat-card">
            <strong>{unlockedCount}</strong>
            <span>Địa điểm / 10</span>
          </div>
          <div className="stat-card">
            <strong>{unlockedCount}</strong>
            <span>Dấu ấn / 10</span>
          </div>
          <div className="stat-card">
            <strong>1</strong>
            <span>Cột mốc / 4</span>
          </div>
        </div>
        <section className="panel section">
          <h2>Truy cập nhanh</h2>
          <div className="quick-grid">
            <a className="btn btn-outline" href="/Explore/Ho-Chieu">
              Hộ chiếu
            </a>
            <a className="btn btn-outline" href="/Explore/Ban-Do">
              Bản đồ
            </a>
            <a className="btn btn-outline" href="/Explore/Camera">
              Camera
            </a>
            <a className="btn btn-outline" href="/Explore">
              Khám phá
            </a>
          </div>
        </section>
        <section className="panel settings section">
          <h2>Cài đặt</h2>
          <div className="setting">
            <span>🌐 Ngôn ngữ</span>
            <span>Tiếng Việt ›</span>
          </div>
          <div className="setting">
            <span>🔔 Thông báo</span>
            <span>Đang bật ›</span>
          </div>
          <div className="setting">
            <span>📍 GPS</span>
            <span>Luôn bật ›</span>
          </div>
          <div className="setting">
            <span>☀ Chủ đề</span>
            <span>Sáng ›</span>
          </div>
        </section>
        <button className="btn btn-outline btn-block" type="button" onClick={onLogout}>
          Đăng xuất
        </button>
      </div>
    </section>
  )
}

export default AccountPage
