import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { createConfig } from '../config/index.js';
import { openDatabase, migrate } from '../repositories/database.js';
import { seed } from '../repositories/seed.js';
import { authService } from '../services/auth-service/index.js';
const config = createConfig();
const db = openDatabase(config.databasePath);
try {
  migrate(db);
  const command = process.argv[2];
  if (command === 'migrate') console.log('Migration hoan tat.');
  else if (command === 'seed') console.log(seed(db) ? 'Da them du lieu mau.' : 'Du lieu mau da duoc khoi tao; khong ghi de.');
  else if (command === 'admin') {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error('Dien ADMIN_EMAIL va ADMIN_PASSWORD (10–128 ky tu) trong .env, roi chay lai.');
    const user = await authService(db, config).createUser({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, name: process.env.ADMIN_NAME || 'Quan tri vien' }, 'admin');
    console.log(`Da tao quan tri vien: ${user.email}. Hay xoa ADMIN_PASSWORD khoi .env sau khi tao.`);
  } else if (command === 'backup') {
    const directory = path.join(config.root, 'database/backups');
    mkdirSync(directory, { recursive: true });
    const filename = path.join(directory, `vanmieu-${new Date().toISOString().replaceAll(':', '-')}.sqlite`);
    db.prepare('VACUUM INTO ?').run(filename);
    console.log(`Da sao luu: ${filename}`);
  } else throw new Error('Lenh hop le: migrate, seed, admin, backup.');
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { db.close(); }
