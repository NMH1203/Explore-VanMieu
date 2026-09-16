import { loadEnvFile } from 'node:process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const envPath = path.join(ROOT, '.env');
if (existsSync(envPath)) loadEnvFile(envPath);

function integer(name, fallback, min, max) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name} khong hop le.`);
  return value;
}

export function createConfig(overrides = {}) {
  const production = process.env.NODE_ENV === 'production';
  const port = integer('PORT', 3000, 1, 65535);
  const origin = process.env.APP_ORIGIN || `http://localhost:${port}`;
  if (new URL(origin).origin !== origin) throw new Error('APP_ORIGIN phai la origin, khong co duong dan hoac dau / cuoi.');
  if (production && !origin.startsWith('https://')) throw new Error('Production can APP_ORIGIN=https://...');
  return {
    root: ROOT,
    host: process.env.HOST || '127.0.0.1', port, production,
    allowedOrigins: production ? [origin] : [...new Set([origin, `http://localhost:${port}`, `http://127.0.0.1:${port}`])],
    databasePath: path.resolve(ROOT, process.env.DATABASE_PATH || 'database/vanmieu.sqlite'),
    frontendPath: path.join(ROOT, 'frontend/public'),
    autoSeed: process.env.AUTO_SEED !== 'false' && !production,
    sessionHours: integer('SESSION_HOURS', 24, 1, 168),
    gpsMaxAccuracy: integer('GPS_MAX_ACCURACY_METERS', 50, 1, 200),
    gpsMaxAgeSeconds: integer('GPS_MAX_AGE_SECONDS', 120, 10, 600),
    rateLimit: true,
    ...overrides,
  };
}
