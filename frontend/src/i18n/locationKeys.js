export const LOCATION_TRANSLATION_KEYS = Object.freeze({
  'location-van-mieu-gate': 'vanMieuGate',
  'location-dai-trung-gate': 'daiTrungGate',
  interpret: 'khueVanCac',
  'location-dai-thanh-gate': 'daiThanhGate',
  'location-dien-dai-thanh': 'dienDaiThanh',
  'location-thai-hoc-gate': 'thaiHocGate',
  'location-thai-hoc-house': 'thaiHocHouse',
  'location-bell-drum-tower': 'bellDrum',
  'location-octagonal-house': 'octagonalHouse',
  'location-phuong-dinh': 'phuongDinh',
})

export function getLocationTranslationKey(id) {
  return LOCATION_TRANSLATION_KEYS[id]
}
