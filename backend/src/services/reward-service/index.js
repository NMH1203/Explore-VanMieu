import { randomUUID } from 'node:crypto';
import { transaction } from '../../repositories/database.js';
import { insert } from '../../repositories/index.js';
import { reward as mapReward, claim as mapClaim } from '../../models/index.js';
import { ensure } from '../../utils/errors.js';

export function rewardService(db) {
  const count = userId => db.prepare('SELECT count(*) AS n FROM stamps WHERE user_id=?').get(userId).n;
  return {
    count,
    list(user) {
      const collected = user ? count(user.id) : 0;
      const rows = db.prepare(`SELECT * FROM rewards WHERE is_active=1 OR id IN (SELECT reward_id FROM reward_claims WHERE user_id=?) ORDER BY threshold, name`).all(user?.id ?? '');
      return rows.map(row => {
        const claim = user && db.prepare('SELECT * FROM reward_claims WHERE user_id=? AND reward_id=?').get(user.id, row.id);
        const status = claim ? 'claimed' : !row.is_active ? 'inactive' : !user || collected < row.threshold ? 'locked' : row.stock === 0 ? 'out_of_stock' : 'eligible';
        return { ...mapReward(row), progress: Math.min(collected, row.threshold), collected, status, claim: claim ? mapClaim(claim) : null };
      });
    },
    claim(user, id) {
      return transaction(db, () => {
        const row = db.prepare('SELECT * FROM rewards WHERE id=?').get(id);
        ensure(row, 404, 'REWARD_NOT_FOUND', 'Không tìm thấy phần thưởng.');
        const existing = db.prepare('SELECT * FROM reward_claims WHERE user_id=? AND reward_id=?').get(user.id, id);
        if (existing) return { ...mapClaim(existing), alreadyClaimed: true };
        ensure(row.is_active, 404, 'REWARD_NOT_FOUND', 'Phần thưởng đã ngừng phát hành.');
        ensure(count(user.id) >= row.threshold, 403, 'MILESTONE_NOT_REACHED', `Cần ${row.threshold} con dấu khác nhau để nhận phần thưởng này.`);
        if (row.stock !== null) {
          const reserved = db.prepare('UPDATE rewards SET stock=stock-1 WHERE id=? AND stock>0').run(id);
          ensure(reserved.changes > 0, 409, 'OUT_OF_STOCK', 'Phần thưởng đã hết.');
        }
        const now = new Date().toISOString();
        const claim = insert(db, 'reward_claims', { id: randomUUID(), user_id: user.id, reward_id: id, reward_name: row.name, reward_kind: row.kind, claim_code: randomUUID().replaceAll('-', '').toUpperCase(), status: row.kind === 'physical' ? 'pending' : 'fulfilled', claimed_at: now, fulfilled_at: row.kind === 'physical' ? null : now });
        return { ...mapClaim(claim), alreadyClaimed: false };
      });
    },
  };
}
