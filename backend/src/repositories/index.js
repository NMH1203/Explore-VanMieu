import { randomUUID } from 'node:crypto';

// Tên bảng/cột chỉ đến từ code nội bộ đã định nghĩa, giá trị luôn bind bằng ?.
export function insert(db, table, values) {
  const columns = Object.keys(values);
  db.prepare(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${columns.map(() => '?').join(',')})`).run(...Object.values(values));
  return values;
}
export function update(db, table, id, values) {
  db.prepare(`UPDATE ${table} SET ${Object.keys(values).map(k => `${k}=?`).join(',')} WHERE id=?`).run(...Object.values(values), id);
  return db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id);
}
export function audit(db, actorId, action, type, id) {
  insert(db, 'audit_logs', { id: randomUUID(), actor_id: actorId, action, entity_type: type, entity_id: id, created_at: new Date().toISOString() });
}
export function pageResult(items, total, { page, limit }) { return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }; }
