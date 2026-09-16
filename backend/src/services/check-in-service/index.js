import { randomUUID } from 'node:crypto';
import { insert, pageResult } from '../../repositories/index.js';
import { transaction } from '../../repositories/database.js';
import { pagination, string } from '../../validators/index.js';
import { validatePosition, visitDate } from '../gps-service/index.js';

export function checkInService(db, config, locations) {
  return {
    checkIn(user, body) {
      const location = locations.active(string(body.locationId, 'Địa điểm', 1, 100));
      const gps = validatePosition(body, location, config);
      const date = visitDate();
      return transaction(db, () => {
        const existing = db.prepare('SELECT * FROM check_ins WHERE user_id=? AND location_id=? AND visit_date=?').get(user.id, location.id, date);
        if (existing) return { id: existing.id, locationId: location.id, locationName: location.name, createdAt: existing.created_at, distanceMeters: Math.round(existing.distance_meters), alreadyCheckedIn: true, stampAwarded: false };
        const now = new Date().toISOString();
        const id = randomUUID();
        insert(db, 'check_ins', { id, user_id: user.id, location_id: location.id, latitude: gps.latitude, longitude: gps.longitude, accuracy_meters: gps.accuracy, distance_meters: gps.distance, observed_at: gps.observedAt, visit_date: date, created_at: now });
        const result = db.prepare('INSERT OR IGNORE INTO stamps(user_id, location_id, check_in_id, collected_at) VALUES (?, ?, ?, ?)').run(user.id, location.id, id, now);
        return { id, locationId: location.id, locationName: location.name, createdAt: now, distanceMeters: Math.round(gps.distance), alreadyCheckedIn: false, stampAwarded: result.changes > 0 };
      });
    },
    history(user, query) {
      const paging = pagination(query);
      const rows = db.prepare('SELECT c.*, l.name, l.stamp_icon FROM check_ins c JOIN locations l ON l.id=c.location_id WHERE c.user_id=? ORDER BY c.created_at DESC, c.id LIMIT ? OFFSET ?').all(user.id, paging.limit, paging.offset);
      const total = db.prepare('SELECT count(*) AS n FROM check_ins WHERE user_id=?').get(user.id).n;
      return pageResult(rows.map(r => ({ id: r.id, locationId: r.location_id, locationName: r.name, stampIcon: r.stamp_icon, createdAt: r.created_at, visitDate: r.visit_date, distanceMeters: Math.round(r.distance_meters) })), total, paging);
    },
  };
}
