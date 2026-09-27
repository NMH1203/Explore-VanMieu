import { Camera, Compass, Map, NotebookTabs, UserRound } from 'lucide-react'
import { paths } from '../../routes/index.js'
import { useLanguage } from '../../i18n/LanguageContext.jsx'
import LanguageSwitch from './LanguageSwitch.jsx'

const navigationItems = [
  { href: paths.explore, Icon: Compass, key: 'common.explore' },
  { href: paths.map, Icon: Map, key: 'common.map' },
  { href: paths.camera, Icon: Camera, key: 'common.camera' },
  { href: paths.passport, Icon: NotebookTabs, key: 'common.passport' },
  { href: paths.account, Icon: UserRound, key: 'common.account' },
]

function NavigationLinks({ mobile = false, t }) {
  return navigationItems.map(({ href, Icon, key }) => (
    <a href={href} key={href}>
      {mobile ? <b><Icon size={19} strokeWidth={1.9} aria-hidden="true" /></b> : <span className="icon"><Icon size={19} strokeWidth={1.9} aria-hidden="true" /></span>}
      {t(key)}
    </a>
  ))
}

function Navigation({ showLanguageSwitch = false }) {
  const { t } = useLanguage()
  return (
    <>
      <aside className="sidebar">
        <a className="brand" href={paths.explore}>
          <img className="brand-icon" src="/images/brand-khue-van-cac.jpg" alt="" />
          <span><strong>Explore Van Mieu</strong><small>{t('nav.heritage')}</small></span>
        </a>
        <nav className="side-links" aria-label={t('nav.main')}><NavigationLinks t={t} /></nav>
        <div className="side-note">{t('nav.version')}</div>
      </aside>
      <nav className="bottom-nav" aria-label={t('nav.main')}><NavigationLinks mobile t={t} /></nav>
      {showLanguageSwitch && <LanguageSwitch />}
    </>
  )
}

export default Navigation
