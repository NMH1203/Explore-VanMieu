import * as v from '../../validators/index.js';
import { ensure } from '../../utils/errors.js';
const radians = degrees => degrees * Math.PI / 180;

export function distanceMeters(lat1, lon1, lat2, lon2) {
  const a = Math.sin(radians(lat2 - lat1) / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(radians(lon2 - lon1) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(Math.min(1, a)), Math.sqrt(Math.max(0, 1 - a)));
}
export function positionFromQuery(query) {
  if (!query.has('latitude') && !query.has('longitude')) return null;
  ensure(query.has('latitude') && query.has('longitude') && query.get('latitude') !== '' && query.get('longitude') !== '', 422, 'VALIDATION_ERROR', 'Cần cả vĩ độ và kinh độ.');
  return { latitude: v.number(Number(query.get('latitude')), 'Vĩ độ', -90, 90), longitude: v.number(Number(query.get('longitude')), 'Kinh độ', -180, 180) };
}
export function validatePosition(body, location, config) {
  const latitude = v.number(body.latitude, 'Vĩ độ', -90, 90);
  const longitude = v.number(body.longitude, 'Kinh độ', -180, 180);
  const accuracy = v.number(body.accuracy, 'Sai số GPS', 0, 100000);
  const observedAt = v.string(body.observedAt, 'Thời điểm GPS', 20, 35);
  const timestamp = Date.parse(observedAt);
  ensure(Number.isFinite(timestamp) && timestamp <= Date.now() + 10000 && Date.now() - timestamp <= config.gpsMaxAgeSeconds * 1000, 422, 'STALE_POSITION', 'Vị trí đã cũ hoặc thời gian không hợp lệ. Hãy lấy lại GPS.');
  ensure(accuracy <= config.gpsMaxAccuracy, 422, 'LOW_GPS_ACCURACY', `Sai số GPS phải không quá ${config.gpsMaxAccuracy} m. Hãy thử ngoài trời.`, { maxAccuracyMeters: config.gpsMaxAccuracy });
  const distance = distanceMeters(latitude, longitude, location.latitude, location.longitude);
  ensure(distance <= location.radius_meters, 403, 'OUT_OF_RANGE', `Bạn còn cách địa điểm ${Math.round(distance)} m; cần ở trong bán kính ${location.radius_meters} m.`, { distanceMeters: Math.round(distance), radiusMeters: location.radius_meters });
  return { latitude, longitude, accuracy, observedAt: new Date(timestamp).toISOString(), distance };
}
export function visitDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const get = type => parts.find(p => p.type === type).value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
