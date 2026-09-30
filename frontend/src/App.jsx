import { useEffect, useRef, useState } from 'react'
import { getRewards, claimReward } from './services/reward-service/index.js'
import { RewardContext } from './store/RewardContext.jsx'
import Navigation from './components/navigation/Navigation.jsx'
import AccountPage from './pages/account/AccountPage.jsx'
import CameraPage from './pages/camera/CameraPage.jsx'
import FiguresPage from './pages/figures/FiguresPage.jsx'
import HomePage from './pages/home/HomePage.jsx'
import LocationDetailPage from './pages/location-detail/LocationDetailPage.jsx'
import LocationsPage from './pages/locations/LocationsPage.jsx'
import MapPage from './pages/map/MapPage.jsx'
import PassportPage from './pages/passport/PassportPage.jsx'
import RegisterPage from './pages/register/RegisterPage.jsx'
import { getRoute, normalizeInitialUrl, paths } from './routes/index.js'
import { getCurrentUser, logout } from './services/auth-service/index.js'
import { useLocationProgress } from './hooks/useLocationProgress.js'
import { verifyCheckin } from './services/check-in-service/index.js'
import { useLanguage } from './i18n/LanguageContext.jsx'

normalizeInitialUrl()
const protectedPages = new Set(['account', 'camera'])

function App() {
  const [pathname, setPathname] = useState(window.location.pathname)
  const [user, setUser] = useState(undefined)
  const authVersion = useRef(0)
  const [reward, setReward] = useState(null)
  const [rewardError, setRewardError] = useState('')
  useEffect(() => {
    let active = true
    setReward(null)
    setRewardError('')
    if (user) getRewards().then(value => { if (active) setReward(value) })
      .catch(error => { if (active) setRewardError(error.message) })
    return () => { active = false }
  }, [user])
  async function handleClaimReward() {
    setReward(await claimReward())
  }
  const { unlockedLocations, recordVerifiedCheckin } = useLocationProgress(user?.user_id)
  const { t } = useLanguage()
  const isAuthenticated = Boolean(user)
  const route = getRoute(pathname)
  useEffect(() => {
    let active = true
    const version = authVersion.current
    getCurrentUser()
      .then((account) => { if (active && version === authVersion.current) setUser(account) })
      .catch(() => { if (active && version === authVersion.current) setUser(null) })
    return () => { active = false }
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
    authVersion.current += 1
    setUser(account)

    const nextPath = new URLSearchParams(window.location.search).get('next')
    const safeNextPath = nextPath?.startsWith('/Explore') ? nextPath : paths.account
    navigate(safeNextPath, { replace: true })
  }

  async function handleVerifyCheckin(checkinData) {
    const version = authVersion.current
    const result = await verifyCheckin(checkinData)
    // The request may finish after logout or an account switch. Its database
    // write belongs to the original session, never to the new account's UI.
    if (version !== authVersion.current) return result
    if (result.verified) {
      recordVerifiedCheckin(result)
      try {
        const nextReward = await getRewards()
        if (version === authVersion.current) { setReward(nextReward); setRewardError('') }
      } catch (error) {
        if (version === authVersion.current) setRewardError(error.message)
      }
    }
    return result
  }

  async function handleLogout() {
    try {
      await logout()
      authVersion.current += 1
      setUser(null)
      navigate(paths.explore, { replace: true })
    } catch (error) {
      alert(error.message)
    }
  }

  let page
  switch (route.page) {
   case 'explore':
      page = (
        <HomePage
          userId={user?.user_id}
          unlockedLocations={unlockedLocations}
        />
      )
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
      page = <CameraPage onVerifyCheckin={handleVerifyCheckin} />
      break
    case 'passport':
      page = (
        <PassportPage
          userId={user?.user_id}
          unlockedLocations={unlockedLocations}
        />
      )
      break
    case 'account':
      page = (
        <AccountPage
          user={user}
          onLogout={handleLogout}
          unlockedLocations={unlockedLocations}
        />
      )
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
          <h1>{t('common.notFound')}</h1>
          <a className="btn btn-primary" href={paths.explore}>{t('common.backToExplore')}</a>
        </section>
      )
  }

  return (
    <div className="heritage-app" onClick={handleNavigation}>
      <RewardContext.Provider value={{ reward, error: rewardError, claim: handleClaimReward, signedIn: Boolean(user) }}>
      <input
        className="theme-toggle"
        type="checkbox"
        id="heritage-awakened"
        checked={Boolean(user) && reward?.theme === 'vermilion'}
        readOnly
        aria-label={t('app.themeStatus')}
      />
      <input
        className="scan-toggle"
        type="checkbox"
        id="scan-complete"
        aria-label={t('app.scanStatus')}
      />
      <Navigation showLanguageSwitch={route.page === 'explore'} />
      <main>{page}</main>
      </RewardContext.Provider>
    </div>
  )
}

export default App
