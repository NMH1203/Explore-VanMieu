import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from '../config/index.js';
import { transaction } from './database.js';
import { insert } from './index.js';
import { locationInput, artifactInput, rewardInput } from '../validators/index.js';

export function seed(db) {
  if (db.prepare("SELECT value FROM app_meta WHERE key='demo_seed_v1'").get()) return false;
  const data = JSON.parse(readFileSync(path.join(ROOT, 'database/seeds/demo.json'), 'utf8'));
  const now = new Date().toISOString();
  transaction(db, () => {
    for (const [table, validate] of [['locations', locationInput], ['artifacts', artifactInput], ['rewards', rewardInput]]) {
      for (const item of data[table]) {
        if (!db.prepare(`SELECT id FROM ${table} WHERE id=?`).get(item.id)) insert(db, table, { id: item.id, ...validate(item), created_at: now, updated_at: now });
      }
    }
    insert(db, 'app_meta', { key: 'demo_seed_v1', value: data.notice });
  });
  return true;
}
