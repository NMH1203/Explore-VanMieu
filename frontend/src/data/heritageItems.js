const location = (id, file) => ({
  id,
  kind: 'location',
  image: `/images/heritage/${file}`,
})

const figure = (id, file) => ({
  id,
  kind: 'figure',
  image: `/images/heritage/${file}`,
})

export const heritageItems = [
  location('location-van-mieu-gate', 'van-mieu-gate.webp'),
  location('location-dai-trung-gate', 'dai-trung-gate.webp'),
  location('interpret', 'khue-van-cac.webp'),
  location('location-dai-thanh-gate', 'dai-thanh-gate.webp'),
  location('location-dien-dai-thanh', 'dien-dai-thanh.webp'),
  location('location-thai-hoc-gate', 'thai-hoc-gate.webp'),
  location('location-thai-hoc-house', 'thai-hoc-building.webp'),
  location('location-bell-drum-tower', 'bell-drum-tower.webp'),
  location('location-octagonal-house', 'octagonal-house.webp'),
  location('location-phuong-dinh', 'phuong-dinh.webp'),
  figure('figure-ly-thanh-tong', 'ly-thanh-tong.jpg'),
  figure('figure-ly-nhan-tong', 'ly-nhan-tong.jpg'),
  figure('figure-le-thanh-tong', 'le-thanh-tong.jpg'),
  figure('figure-chu-van-an', 'chu-van-an.jpg'),
  figure('figure-confucius', 'confucius-statue.jpg'),
  figure('figure-four-sages', 'nhan-tu.webp'),
]
