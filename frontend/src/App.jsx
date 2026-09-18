import { useEffect, useState } from 'react'
import Navigation from './components/Navigation.jsx'
import AccountPage from './pages/account/AccountPage.jsx'
import CameraPage from './pages/camera/CameraPage.jsx'
import FiguresPage from './pages/figures/FiguresPage.jsx'
import HomePage from './pages/home/HomePage.jsx'
import LocationDetailPage from './pages/location-detail/LocationDetailPage.jsx'
import LocationsPage from './pages/locations/LocationsPage.jsx'
import MapPage from './pages/map/MapPage.jsx'
import PassportPage from './pages/passport/PassportPage.jsx'
import { getRoute, normalizeInitialUrl, paths } from './routes.js'

normalizeInitialUrl()

function App() {
  const [pathname, setPathname] = useState(window.location.pathname)
  const route = getRoute(pathname)

  useEffect(() => {
    function handlePopState() {
      setPathname(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function handleNavigation(event) {
    const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null
    if (
      !anchor ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return

    const destination = new URL(anchor.href)
    if (destination.origin !== window.location.origin || !destination.pathname.startsWith('/Explore')) return
    if (destination.pathname === window.location.pathname && destination.hash) return

    event.preventDefault()
    window.history.pushState(null, '', destination.pathname + destination.search + destination.hash)
    setPathname(destination.pathname)
    window.scrollTo(0, 0)
  }

  let page
  switch (route.page) {
    case 'explore':
      page = <HomePage />
      break
    case 'map':
      page = <MapPage />
      break
    case 'locations':
      page = <LocationsPage />
      break
    case 'figures':
      page = <FiguresPage />
      break
    case 'camera':
      page = <CameraPage />
      break
    case 'passport':
      page = <PassportPage />
      break
    case 'account':
      page = <AccountPage />
      break
    case 'detail':
      page = <LocationDetailPage id={route.id} />
      break
    default:
      page = (
        <section className="screen locked-detail">
          <h1>Không tìm thấy trang</h1>
          <a className="btn btn-primary" href={paths.explore}>Quay lại Khám phá</a>
        </section>
      )
  }

  return (
    <div className="heritage-app" onClick={handleNavigation}>
      <input
        className="theme-toggle"
        type="checkbox"
        id="heritage-awakened"
        aria-label="Trạng thái mở khóa bảng màu Sơn son – Hoàng kỳ"
      />
      <input
        className="scan-toggle"
        type="checkbox"
        id="scan-complete"
        aria-label="Trạng thái nhận diện công trình"
      />
      <Navigation />
      <main>{page}</main>
    </div>
  )
}

export default App
