import { createHash, randomUUID } from 'node:crypto';
import { transaction } from '../../repositories/database.js';
import { insert } from '../../repositories/index.js';
import { visitDate } from '../gps-service/index.js';

export function passportService(db, rewards) {
  return {
    passport(user) {
      // Giữ cả con dấu đã thu thập của địa điểm sau khi quản trị viên ẩn nó.
      const rows = db.prepare(`SELECT l.*, s.collected_at FROM locations l LEFT JOIN stamps s ON s.location_id=l.id AND s.user_id=? WHERE l.is_active=1 OR s.user_id IS NOT NULL ORDER BY l.sort_order, l.name`).all(user.id);
      const stamps = rows.map(r => ({ locationId: r.id, name: r.name, stampIcon: r.stamp_icon, isActive: Boolean(r.is_active), collectedAt: r.collected_at, collected: Boolean(r.collected_at) }));
      const milestones = rewards.list(user);
      return { user: { id: user.id, name: user.name }, collected: rewards.count(user.id), total: stamps.length, totalVisits: db.prepare('SELECT count(*) AS n FROM check_ins WHERE user_id=?').get(user.id).n, stamps, milestones, themeUnlocked: milestones.some(r => r.id === 'reward-first-step' && r.status === 'claimed') };
    },
    today(user) {
      const date = visitDate();
      const journey = transaction(db, () => {
        let item = db.prepare('SELECT * FROM journeys WHERE user_id=? AND visit_date=?').get(user.id, date);
        if (!item) item = insert(db, 'journeys', { id: randomUUID(), user_id: user.id, visit_date: date });
        // Bỏ điểm ngừng hoạt động và bù điểm khác, giữ thứ tự các điểm còn lại.
        db.prepare('DELETE FROM journey_stops WHERE journey_id=? AND location_id IN (SELECT id FROM locations WHERE is_active=0)').run(item.id);
        const current = db.prepare('SELECT * FROM journey_stops WHERE journey_id=? ORDER BY position').all(item.id);
        const ids = new Set(current.map(r => r.location_id));
        const rank = id => createHash('sha256').update(`${user.id}:${date}:${id}`).digest('hex');
        const choices = db.prepare('SELECT id FROM locations WHERE is_active=1').all().filter(r => !ids.has(r.id)).sort((a, b) => rank(a.id).localeCompare(rank(b.id)));
        let position = current.length ? Math.max(...current.map(r => r.position)) + 1 : 0;
        for (const candidate of choices.slice(0, Math.max(0, 5 - current.length))) insert(db, 'journey_stops', { journey_id: item.id, location_id: candidate.id, position: position++ });
        return item;
      });
      const rows = db.prepare(`SELECT l.id, l.name, c.created_at FROM journey_stops j JOIN locations l ON l.id=j.location_id LEFT JOIN check_ins c ON c.location_id=l.id AND c.user_id=? AND c.visit_date=? WHERE j.journey_id=? ORDER BY j.position`).all(user.id, date, journey.id);
      const stops = rows.map(r => ({ locationId: r.id, name: r.name, completed: Boolean(r.created_at), completedAt: r.created_at ?? null }));
      return { id: journey.id, date, timeZone: 'Asia/Ho_Chi_Minh', completed: stops.filter(s => s.completed).length, total: stops.length, stops };
    },
  };
}
