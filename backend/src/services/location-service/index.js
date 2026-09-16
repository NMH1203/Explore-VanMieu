import { location as mapLocation, artifact as mapArtifact } from '../../models/index.js';
import { ensure } from '../../utils/errors.js';
import { distanceMeters, positionFromQuery } from '../gps-service/index.js';
import { pagination, string } from '../../validators/index.js';
import { pageResult } from '../../repositories/index.js';

export function locationService(db) {
  function active(id) {
    const row = db.prepare('SELECT * FROM locations WHERE (id=? OR slug=?) AND is_active=1').get(id, id);
    ensure(row, 404, 'LOCATION_NOT_FOUND', 'Không tìm thấy địa điểm đang hoạt động.');
    return row;
  }
  function enrich(row, user, position) {
    const stamp = user && db.prepare('SELECT collected_at FROM stamps WHERE user_id=? AND location_id=?').get(user.id, row.id);
    const distance = position ? distanceMeters(position.latitude, position.longitude, row.latitude, row.longitude) : null;
    return { ...mapLocation(row), isUnlocked: Boolean(stamp), collectedAt: stamp?.collected_at ?? null, distanceMeters: distance == null ? null : Math.round(distance), isNearby: distance == null ? false : distance <= row.radius_meters };
  }
  return {
    active,
    list(query, user) {
      const position = positionFromQuery(query);
      const paging = pagination(query);
      const search = string(query.get('search') ?? '', 'Từ khóa', 0, 100).toLocaleLowerCase('vi');
      let rows = db.prepare('SELECT * FROM locations WHERE is_active=1 ORDER BY sort_order, name').all().filter(r => `${r.name} ${r.description}`.toLocaleLowerCase('vi').includes(search)).map(r => enrich(r, user, position));
      if (position) rows.sort((a, b) => a.distanceMeters - b.distanceMeters);
      return pageResult(rows.slice(paging.offset, paging.offset + paging.limit), rows.length, paging);
    },
    detail(id, query, user) {
      const row = active(id);
      const item = enrich(row, user, positionFromQuery(query));
      return { ...item, story: item.isUnlocked || user?.role === 'admin' ? row.story : null, artifacts: db.prepare('SELECT * FROM artifacts WHERE location_id=? AND is_active=1 ORDER BY name').all(row.id).map(mapArtifact) };
    },
    artifacts(query) {
      const paging = pagination(query);
      const locationId = query.get('locationId');
      const rows = db.prepare('SELECT a.* FROM artifacts a JOIN locations l ON l.id=a.location_id WHERE a.is_active=1 AND l.is_active=1 ORDER BY a.name').all().filter(a => !locationId || a.location_id === locationId);
      return pageResult(rows.slice(paging.offset, paging.offset + paging.limit).map(mapArtifact), rows.length, paging);
    },
    artifactDetail(id) {
      const row = db.prepare('SELECT a.* FROM artifacts a JOIN locations l ON l.id=a.location_id WHERE a.id=? AND a.is_active=1 AND l.is_active=1').get(id);
      ensure(row, 404, 'ARTIFACT_NOT_FOUND', 'Không tìm thấy hiện vật.');
      return mapArtifact(row);
    },
  };
}
