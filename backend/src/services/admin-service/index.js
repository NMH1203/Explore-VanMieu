import { randomUUID } from 'node:crypto';
import * as v from '../../validators/index.js';
import * as model from '../../models/index.js';
import { insert, update, audit, pageResult } from '../../repositories/index.js';
import { transaction } from '../../repositories/database.js';
import { ensure } from '../../utils/errors.js';
import { visitDate } from '../gps-service/index.js';

const resources = {
  locations: { table: 'locations', validate: v.locationInput, map: row => model.location(row, true) },
  artifacts: { table: 'artifacts', validate: v.artifactInput, map: model.artifact },
  rewards: { table: 'rewards', validate: v.rewardInput, map: model.reward },
};

export function adminService(db) {
  function resource(kind) {
    const found = resources[kind];
    ensure(found, 404, 'NOT_FOUND', 'Không tìm thấy tài nguyên.');
    return found;
  }
  function exists(table, id) {
    const row = db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id);
    ensure(row, 404, 'NOT_FOUND', 'Không tìm thấy bản ghi.');
    return row;
  }
  return {
    list(kind, query) {
      const item = resource(kind);
      const paging = v.pagination(query);
      return pageResult(db.prepare(`SELECT * FROM ${item.table} ORDER BY created_at DESC, id LIMIT ? OFFSET ?`).all(paging.limit, paging.offset).map(item.map), db.prepare(`SELECT count(*) AS n FROM ${item.table}`).get().n, paging);
    },
    save(kind, id, body, actor) {
      const item = resource(kind);
      const values = item.validate(body);
      const now = new Date().toISOString();
      return transaction(db, () => {
        if (id) exists(item.table, id);
        if (kind === 'artifacts') exists('locations', values.location_id);
        if (kind === 'locations') {
          const duplicate = db.prepare('SELECT id FROM locations WHERE slug=? AND id!=?').get(values.slug, id ?? '');
          ensure(!duplicate, 409, 'SLUG_EXISTS', 'Slug đã được sử dụng.');
        }
        const row = id ? update(db, item.table, id, { ...values, updated_at: now }) : insert(db, item.table, { id: randomUUID(), ...values, created_at: now, updated_at: now });
        audit(db, actor.id, id ? 'update' : 'create', kind, row.id);
        return item.map(row);
      });
    },
    archive(kind, id, actor) {
      const item = resource(kind);
      return transaction(db, () => {
        exists(item.table, id);
        update(db, item.table, id, { is_active: 0, updated_at: new Date().toISOString() });
        audit(db, actor.id, 'archive', kind, id);
        return { id, isActive: false };
      });
    },
    users(query) {
      const paging = v.pagination(query);
      const search = v.string(query.get('search') ?? '', 'Từ khóa', 0, 100).toLocaleLowerCase('vi');
      const rows = db.prepare('SELECT id, name, email, role, status, created_at, updated_at FROM users ORDER BY created_at DESC, id').all().filter(u => `${u.name} ${u.email}`.toLocaleLowerCase('vi').includes(search));
      return pageResult(rows.slice(paging.offset, paging.offset + paging.limit).map(model.publicUser), rows.length, paging);
    },
    updateUser(id, body, actor) {
      return transaction(db, () => {
        const row = exists('users', id);
        const role = body.role === undefined ? row.role : v.oneOf(body.role, 'Vai trò', ['visitor', 'admin']);
        const status = body.status === undefined ? row.status : v.oneOf(body.status, 'Trạng thái', ['active', 'disabled']);
        const name = body.name === undefined ? row.name : v.string(body.name, 'Tên', 2, 100);
        ensure(id !== actor.id || (role === 'admin' && status === 'active'), 409, 'SELF_LOCKOUT', 'Bạn không thể tự bỏ quyền quản trị hoặc tự khóa tài khoản.');
        if (row.role === 'admin' && row.status === 'active' && (role !== 'admin' || status !== 'active')) {
          ensure(db.prepare("SELECT count(*) AS n FROM users WHERE role='admin' AND status='active'").get().n > 1, 409, 'LAST_ADMIN', 'Cần giữ ít nhất một quản trị viên hoạt động.');
        }
        const updated = update(db, 'users', id, { name, role, status, updated_at: new Date().toISOString() });
        if (status !== row.status || role !== row.role) db.prepare('DELETE FROM sessions WHERE user_id=?').run(id);
        audit(db, actor.id, 'update', 'users', id);
        return model.publicUser(updated);
      });
    },
    claims(query) {
      const paging = v.pagination(query);
      const rows = db.prepare('SELECT c.*, u.name AS user_name, u.email FROM reward_claims c JOIN users u ON u.id=c.user_id ORDER BY c.claimed_at DESC, c.id LIMIT ? OFFSET ?').all(paging.limit, paging.offset);
      return pageResult(rows.map(r => ({ ...model.claim(r), userId: r.user_id, userName: r.user_name, email: r.email })), db.prepare('SELECT count(*) AS n FROM reward_claims').get().n, paging);
    },
    fulfill(id, body, actor) {
      v.oneOf(body.status, 'Trạng thái', ['fulfilled']);
      return transaction(db, () => {
        const row = exists('reward_claims', id);
        if (row.status === 'fulfilled') return model.claim(row);
        const updated = update(db, 'reward_claims', id, { status: 'fulfilled', fulfilled_at: new Date().toISOString() });
        audit(db, actor.id, 'fulfill', 'reward_claims', id);
        return model.claim(updated);
      });
    },
    stats() {
      const count = table => db.prepare(`SELECT count(*) AS n FROM ${table}`).get().n;
      return { users: count('users'), locations: count('locations'), artifacts: count('artifacts'), checkIns: count('check_ins'), stamps: count('stamps'), rewards: count('rewards'), claims: count('reward_claims'), pendingClaims: db.prepare("SELECT count(*) AS n FROM reward_claims WHERE status='pending'").get().n, checkInsToday: db.prepare('SELECT count(*) AS n FROM check_ins WHERE visit_date=?').get(visitDate()).n };
    },
    audit(query) {
      const paging = v.pagination(query);
      const rows = db.prepare('SELECT a.*, u.name AS actor_name FROM audit_logs a JOIN users u ON u.id=a.actor_id ORDER BY a.created_at DESC, a.id LIMIT ? OFFSET ?').all(paging.limit, paging.offset);
      return pageResult(rows.map(r => ({ id: r.id, actorId: r.actor_id, actorName: r.actor_name, action: r.action, entityType: r.entity_type, entityId: r.entity_id, createdAt: r.created_at })), db.prepare('SELECT count(*) AS n FROM audit_logs').get().n, paging);
    },
  };
}
