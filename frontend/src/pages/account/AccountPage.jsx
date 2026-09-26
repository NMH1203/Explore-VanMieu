import { useLanguage } from '../../i18n/LanguageContext.jsx'

function AccountPage({ user, onLogout, unlockedLocations }) {
  const { t, lang } = useLanguage()
  const unlockedCount = unlockedLocations.size
  const displayName = user?.username || user?.email || t('common.loading')
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
            <span>{t('account.locations')}</span>
          </div>
          <div className="stat-card">
            <strong>{unlockedCount}</strong>
            <span>{t('account.stamps')}</span>
          </div>
          <div className="stat-card">
            <strong>1</strong>
            <span>{t('account.milestones')}</span>
          </div>
        </div>
        <section className="panel section">
          <h2>{t('account.quick')}</h2>
          <div className="quick-grid">
            <a className="btn btn-outline" href="/Explore/Ho-Chieu">
              {t('common.passport')}
            </a>
            <a className="btn btn-outline" href="/Explore/Ban-Do">
              {t('common.map')}
            </a>
            <a className="btn btn-outline" href="/Explore/Camera">
              {t('common.camera')}
            </a>
            <a className="btn btn-outline" href="/Explore">
              {t('common.explore')}
            </a>
          </div>
        </section>
        <section className="panel settings section">
          <h2>{t('account.settings')}</h2>
          <div className="setting">
            <span>{t('account.language')}</span>
            <span>{t(lang === 'en' ? 'account.english' : 'account.vietnamese')}</span>
          </div>
          <div className="setting">
            <span>{t('account.notifications')}</span>
            <span>{t('account.enabled')}</span>
          </div>
          <div className="setting">
            <span>{t('account.gps')}</span>
            <span>{t('account.alwaysOn')}</span>
          </div>
          <div className="setting">
            <span>{t('account.theme')}</span>
            <span>{t('account.light')}</span>
          </div>
        </section>
        <button className="btn btn-outline btn-block" type="button" onClick={onLogout}>
          {t('common.logout')}
        </button>
      </div>
    </section>
  )
}

export default AccountPage
