export const paths = {
  explore: '/Explore',
  map: '/Explore/Ban-Do',
  camera: '/Explore/Camera',
  passport: '/Explore/Ho-Chieu',
  account: '/Explore/Tai-Khoan',
  register: '/Explore/Dang-Nhap',
  locations: '/Explore/Cong-Trinh',
  figures: '/Explore/Danh-Nhan',
}

export const detailPaths = {
  'location-van-mieu-gate': '/Explore/Cong-Van-Mieu',
  'location-dai-trung-gate': '/Explore/Cong-Dai-Trung',
  interpret: '/Explore/Khue-Van-Cac',
  'location-dai-thanh-gate': '/Explore/Cong-Dai-Thanh',
  'location-dien-dai-thanh': '/Explore/Dien-Dai-Thanh',
  'location-thai-hoc-gate': '/Explore/Cong-Thai-Hoc',
  'location-thai-hoc-house': '/Explore/Nha-Thai-Hoc',
  'location-bell-drum-tower': '/Explore/Lau-Chuong-Lau-Trong',
  'location-octagonal-house': '/Explore/Nha-Bat-Giac',
  'location-phuong-dinh': '/Explore/Phuong-Dinh',
  'figure-ly-thanh-tong': '/Explore/Danh-Nhan/Ly-Thanh-Tong',
  'figure-ly-nhan-tong': '/Explore/Danh-Nhan/Ly-Nhan-Tong',
  'figure-le-thanh-tong': '/Explore/Danh-Nhan/Le-Thanh-Tong',
  'figure-chu-van-an': '/Explore/Danh-Nhan/Chu-Van-An',
  'figure-confucius': '/Explore/Danh-Nhan/Khong-Tu',
  'figure-four-sages': '/Explore/Danh-Nhan/Tu-Phoi',
}

const pathToDetailId = Object.fromEntries(
  Object.entries(detailPaths).map(([id, path]) => [path, id]),
)

const legacyPaths = {
  explore: paths.explore,
  map: paths.map,
  camera: paths.camera,
  passport: paths.passport,
  account: paths.account,
  'all-locations': paths.locations,
  'all-figures': paths.figures,
  ...detailPaths,
}

export function normalizeInitialUrl() {
  const { pathname, hash } = window.location
  if (pathname === '/camera') {
    window.history.replaceState(null, '', paths.camera + hash)
    return
  }
  if (pathname === '/' && hash) {
    const legacyId = hash.slice(1)
    const path = legacyPaths[legacyId]
    if (path) {
      window.history.replaceState(null, '', path)
      return
    }
  }

  if (pathname === '/') {
    window.history.replaceState(null, '', paths.explore + hash)
  }
}

export function getRoute(pathname) {
  if (pathname === paths.explore) return { page: 'explore' }
  if (pathname === paths.map) return { page: 'map' }
  if (pathname === paths.camera) return { page: 'camera' }
  if (pathname === paths.passport) return { page: 'passport' }
  if (pathname === paths.account) return { page: 'account' }
  if (pathname === paths.register) return { page: 'register' }
  if (pathname === paths.locations) return { page: 'locations' }
  if (pathname === paths.figures) return { page: 'figures' }
  if (pathToDetailId[pathname]) return { page: 'detail', id: pathToDetailId[pathname] }
  return { page: 'not-found' }
}
