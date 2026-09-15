import Navigation from '../../components/navigation/Navigation.jsx'
import AccountPage from '../../pages/account/AccountPage.jsx'
import CameraPage from '../../pages/camera/CameraPage.jsx'
import FiguresPage from '../../pages/figures/FiguresPage.jsx'
import HomePage from '../../pages/home/HomePage.jsx'
import LocationDetailPage from '../../pages/location-detail/LocationDetailPage.jsx'
import LocationsPage from '../../pages/locations/LocationsPage.jsx'
import MapPage from '../../pages/map/MapPage.jsx'
import PassportPage from '../../pages/passport/PassportPage.jsx'

function HeritageLayout() {
  return (
    <div className="heritage-app">
      <input className="theme-toggle" type="checkbox" id="heritage-awakened" aria-label="Trạng thái mở khóa bảng màu Sơn son – Hoàng kỳ" />
      <input className="scan-toggle" type="checkbox" id="scan-complete" aria-label="Trạng thái nhận diện công trình" />
      <Navigation />
      <main>
        <HomePage />
        <MapPage />
        <LocationsPage />
        <FiguresPage />
        <CameraPage />
        <LocationDetailPage />
        <PassportPage />
        <AccountPage />
      </main>
    </div>
  )
}

export default HeritageLayout
