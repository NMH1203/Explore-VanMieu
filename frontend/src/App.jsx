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
import { getCurrentUser, logout } from './services/auth.js'

normalizeInitialUrl()


const protectedPages = new Set(['account', 'camera'])
// Backend will replace this with the authenticated user's unlocked location IDs.
// Until that API is connected, every location must remain locked.
const noUnlockedLocations = new Set()

function App() {
  const [pathname, setPathname] = useState(window.location.pathname)
  const [user, setUser] = useState(undefined)
  const isAuthenticated = Boolean(user)
  const route = getRoute(pathname)
  useEffect(() => {
    getCurrentUser()
      .then((account) => setUser(account))
      .catch(() => setUser(null))
  }, [])

  useEffect(() => {
    function handlePopState() {
      setPathname(window.location.pathname)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(destination, { replace = false } = {}) {
    const url = new URL(destination, window.location.origin)
    window.history[replace ? 'replaceState' : 'pushState'](null, '', url.pathname + url.search + url.hash)
    setPathname(url.pathname)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    if (user === undefined) return

    const currentPath = window.location.pathname
    if (!isAuthenticated && protectedPages.has(route.page) && currentPath !== paths.register) {
      navigate(`${paths.register}?next=${encodeURIComponent(currentPath)}`, { replace: true })
    }
  }, [user, isAuthenticated, route.page])

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

  function handleAuthenticate(account) {
    setUser(account)

    const nextPath = new URLSearchParams(window.location.search).get('next')
    navigate(nextPath?.startsWith('/Explore') ? nextPath : paths.account, { replace: true })
  }

  async function handleLogout() {
    try {
      await logout()
      setUser(null)
      navigate(paths.explore, { replace: true })
    } catch (error) {
      alert(error.message)
    }
  }

  let page
  switch (route.page) {
    case 'explore':
      page = <HomePage unlockedLocations={noUnlockedLocations} />
      break
    case 'map':
      page = <MapPage unlockedLocations={noUnlockedLocations} />
      break
    case 'locations':
      page = <LocationsPage unlockedLocations={noUnlockedLocations} />
      break
    case 'figures':
      page = <FiguresPage />
      break
    case 'camera':
      page = <CameraPage />
      break
    case 'passport':
      page = <PassportPage unlockedLocations={noUnlockedLocations} />
      break
    case 'account':
      page = (
        <AccountPage
          user={user}
          onLogout={handleLogout}
          unlockedLocations={noUnlockedLocations}
        />
      )
      break
    case 'register':
      page = <RegisterPage onAuthenticate={handleAuthenticate} />
      break
    case 'detail':
      page = <LocationDetailPage id={route.id} unlockedLocations={noUnlockedLocations} />
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
