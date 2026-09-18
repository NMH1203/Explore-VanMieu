import { timingSafeEqual } from 'node:crypto';
import { AppError, ensure } from '../utils/errors.js';

export function sendJson(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}
export async function readJson(req) {
  ensure((req.headers['content-type'] ?? '').split(';')[0].trim().toLowerCase() === 'application/json', 415, 'UNSUPPORTED_MEDIA_TYPE', 'Cần Content-Type: application/json.');
  const maximum = 64 * 1024;
  if (Number(req.headers['content-length']) > maximum) {
    req.resume();
    throw new AppError(413, 'BODY_TOO_LARGE', 'Nội dung không được vượt quá 64 KB.');
  }
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size <= maximum) chunks.push(chunk);
  }
  ensure(size <= maximum, 413, 'BODY_TOO_LARGE', 'Nội dung không được vượt quá 64 KB.');
  let body;
  try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new AppError(400, 'INVALID_JSON', 'JSON không hợp lệ.'); }
  ensure(body && typeof body === 'object' && !Array.isArray(body), 400, 'INVALID_JSON', 'Body phải là một JSON object.');
  return body;
}
export function cookies(req) {
  return Object.fromEntries((req.headers.cookie ?? '').split(';').map(s => s.trim()).filter(s => s.includes('=')).map(s => { const p = s.indexOf('='); return [s.slice(0, p), s.slice(p + 1)]; }));
}
export function sessionCookie(res, rawToken, config, clear = false) {
  res.setHeader('Set-Cookie', `vm_session=${clear ? '' : rawToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${clear ? 0 : config.sessionHours * 3600}${config.production ? '; Secure' : ''}`);
}
export function checkOrigin(req, config) {
  const origin = req.headers.origin;
  ensure(req.headers['sec-fetch-site'] !== 'cross-site' && (!origin || config.allowedOrigins.includes(origin)), 403, 'ORIGIN_DENIED', 'Nguồn gửi yêu cầu không được phép.');
}
export function checkCsrf(req, session) {
  const supplied = req.headers['x-csrf-token'];
  const expected = session.csrfToken;
  ensure(typeof supplied === 'string' && Buffer.byteLength(supplied) === Buffer.byteLength(expected) && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)), 403, 'CSRF_INVALID', 'Phiên xác thực không hợp lệ. Hãy tải lại trang.');
}
export function secureHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(self), microphone=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https: data:; connect-src 'self'; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
}

export function createRateLimiter() {
  const buckets = new Map();
  let nextSweep = 0;
  return function limit(key, maximum, windowMs) {
    const now = Date.now();
    if (now >= nextSweep) {
      for (const [k, value] of buckets) if (value.until <= now) buckets.delete(k);
      nextSweep = now + 60000;
    }
    let bucket = buckets.get(key);
    if (!bucket || bucket.until <= now) {
      // Bộ nhớ được chặn; ngừng nhận khóa mới khi có quá nhiều IP.
      ensure(buckets.size < 20000, 429, 'RATE_LIMITED', 'Hệ thống đang bận. Vui lòng thử lại sau.');
      bucket = { count: 0, until: now + windowMs }; buckets.set(key, bucket);
    }
    bucket.count++;
    ensure(bucket.count <= maximum, 429, 'RATE_LIMITED', 'Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau.', { retryAfterSeconds: Math.ceil((bucket.until - now) / 1000) });
  };
}
