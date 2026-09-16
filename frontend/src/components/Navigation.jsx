import { Camera, Compass, Map, NotebookTabs, UserRound } from 'lucide-react'
import { paths } from '../routes.js'

const navigationItems = [
  { href: paths.explore, Icon: Compass, label: 'Khám phá' },
  { href: paths.map, Icon: Map, label: 'Bản đồ' },
  { href: paths.camera, Icon: Camera, label: 'Camera' },
  { href: paths.passport, Icon: NotebookTabs, label: 'Hộ chiếu' },
  { href: paths.account, Icon: UserRound, label: 'Tài khoản' },
]

function NavigationLinks({ mobile = false }) {
  return navigationItems.map(({ href, Icon, label }) => (
    <a href={href} key={href}>
      {mobile ? (
        <b>
          <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
        </b>
      ) : (
        <span className="icon">
          <Icon size={19} strokeWidth={1.9} aria-hidden="true" />
        </span>
      )}
      {label}
    </a>
  ))
}

function Navigation() {
  return (
    <>
      <aside className="sidebar">
        <a className="brand" href={paths.explore}>
          <img className="brand-icon" src="/images/brand-khue-van-cac.jpg" alt="" />
          <span>
            <strong>Explore Van Mieu</strong>
            <small>Di sản Việt Nam</small>
          </span>
        </a>

        <nav className="side-links" aria-label="Điều hướng chính">
          <NavigationLinks />
        </nav>

        <div className="side-note">v1.0 · Văn Miếu — Quốc Tử Giám</div>
      </aside>

      <nav className="bottom-nav" aria-label="Điều hướng di động">
        <NavigationLinks mobile />
      </nav>
    </>
  )
}

export default Navigation
