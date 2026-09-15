const navigationItems = [
  { href: '#explore', icon: '✦', label: 'Khám phá' },
  { href: '#map', icon: '⌖', label: 'Bản đồ' },
  { href: '#camera', icon: '◎', label: 'Camera' },
  { href: '#passport', icon: '▣', label: 'Hộ chiếu' },
  { href: '#account', icon: '○', label: 'Tài khoản' },
]

function NavigationLinks({ mobile = false }) {
  return navigationItems.map(({ href, icon, label }) => (
    <a href={href} key={href}>
      {mobile ? <b>{icon}</b> : <span className="icon">{icon}</span>}
      {label}
    </a>
  ))
}

function Navigation() {
  return (
    <>
      <aside className="sidebar">
        <a className="brand" href="#explore">
          <span className="brand-mark">V</span>
          <span><strong>Explore Van Mieu</strong><small>Di sản Việt Nam</small></span>
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
