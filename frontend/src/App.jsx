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
import RegisterPage from './pages/register/RegisterPage.jsx'
import { getRoute, normalizeInitialUrl, paths } from './routes.js'
import {
  authenticate,
  clearAccessToken,
  getAccessToken,
  getAccountStatus,
  getLocationStatuses,
} from './services/api.js'

normalizeInitialUrl()

const protectedPages = new Set(['account', 'camera'])
const noUnlockedLocations = new Set()

function App() {
  const [pathname, setPathname] = useState(window.location.pathname)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authReady, setAuthReady] = useState(!getAccessToken())
  const [account, setAccount] = useState(null)
  const [unlockedLocations, setUnlockedLocations] = useState(noUnlockedLocations)
  const route = getRoute(pathname)

  useEffect(() => {
    function handlePopState() {
      setPathname(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (!getAccessToken()) return
    getAccountStatus()
      .then((status) => {
        setIsAuthenticated(status.authenticated)
        setAccount(status.authenticated ? status : null)
        if (!status.authenticated) clearAccessToken()
      })
      .catch(() => {
        clearAccessToken()
        setIsAuthenticated(false)
      })
      .finally(() => setAuthReady(true))
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setUnlockedLocations(noUnlockedLocations)
      return
    }
    getLocationStatuses()
      .then((locations) => {
        setUnlockedLocations(new Set(locations.filter((item) => item.unlocked).map((item) => item.id)))
      })
      .catch(() => setUnlockedLocations(noUnlockedLocations))
  }, [isAuthenticated])

  function navigate(destination, { replace = false } = {}) {
    const url = new URL(destination, window.location.origin)
    window.history[replace ? 'replaceState' : 'pushState'](null, '', url.pathname + url.search + url.hash)
    setPathname(url.pathname)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    const currentPath = window.location.pathname
    if (authReady && !isAuthenticated && protectedPages.has(route.page) && currentPath !== paths.register) {
      navigate(`${paths.register}?next=${encodeURIComponent(currentPath)}`, { replace: true })
    }
  }, [authReady, isAuthenticated, route.page])

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
    const destinationRoute = getRoute(destination.pathname)
    const requiresAuthentication = protectedPages.has(destinationRoute.page)

    if (!isAuthenticated && requiresAuthentication) {
      navigate(`${paths.register}?next=${encodeURIComponent(destination.pathname)}`)
      return
    }

    navigate(destination.pathname + destination.search + destination.hash)
  }

  async function handleAuthenticate(mode, credentials) {
    const authenticatedAccount = await authenticate(mode, credentials)
    setAccount(authenticatedAccount)
    setIsAuthenticated(true)

    const nextPath = new URLSearchParams(window.location.search).get('next')
    navigate(nextPath?.startsWith('/Explore') ? nextPath : paths.account, { replace: true })
  }

  function handleLogout() {
    clearAccessToken()
    setAccount(null)
    setIsAuthenticated(false)
    setUnlockedLocations(noUnlockedLocations)
    navigate(paths.explore, { replace: true })
  }

  function handleLocationUnlocked(locationId) {
    setUnlockedLocations((current) => new Set([...current, locationId]))
  }

  let page
  switch (route.page) {
    case 'explore':
      page = <HomePage unlockedLocations={unlockedLocations} />
      break
    case 'map':
      page = <MapPage unlockedLocations={unlockedLocations} />
      break
    case 'locations':
      page = <LocationsPage unlockedLocations={unlockedLocations} />
      break
    case 'figures':
      page = <FiguresPage />
      break
    case 'camera':
      page = <CameraPage onLocationUnlocked={handleLocationUnlocked} />
      break
    case 'passport':
      page = <PassportPage unlockedLocations={unlockedLocations} />
      break
    case 'account':
      page = <AccountPage account={account} onLogout={handleLogout} unlockedLocations={unlockedLocations} />
      break
    case 'register':
      page = <RegisterPage onAuthenticate={handleAuthenticate} />
      break
    case 'detail':
      page = <LocationDetailPage id={route.id} unlockedLocations={unlockedLocations} />
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
