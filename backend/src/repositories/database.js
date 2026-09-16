import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from '../config/index.js';

export function openDatabase(filename) {
  if (filename !== ':memory:') mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  return db;
}
// Giao dịch này chỉ nhận hàm đồng bộ: không await bên trong transaction.
export function transaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try { const result = fn(); db.exec('COMMIT'); return result; }
  catch (error) { db.exec('ROLLBACK'); throw error; }
}
export function migrate(db) {
  db.exec('CREATE TABLE IF NOT EXISTS migrations(name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
  const directory = path.join(ROOT, 'database/migrations');
  for (const name of readdirSync(directory).filter(x => x.endsWith('.sql')).sort()) {
    if (db.prepare('SELECT name FROM migrations WHERE name=?').get(name)) continue;
    transaction(db, () => {
      db.exec(readFileSync(path.join(directory, name), 'utf8'));
      db.prepare('INSERT INTO migrations VALUES (?, ?)').run(name, new Date().toISOString());
    });
  }
}
