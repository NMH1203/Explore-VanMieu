import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { ensure } from '../utils/errors.js';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };

export async function serveStatic(req, res, pathname, config) {
  ensure(['GET', 'HEAD'].includes(req.method), 405, 'METHOD_NOT_ALLOWED', 'Chỉ hỗ trợ GET/HEAD.');
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { ensure(false, 400, 'INVALID_PATH', 'Đường dẫn không hợp lệ.'); }
  ensure(!decoded.includes('\0') && !decoded.includes('\\') && !decoded.split('/').some(p => p.startsWith('.')), 404, 'NOT_FOUND', 'Không tìm thấy file.');
  const storage = decoded.startsWith('/storage/');
  const source = decoded.startsWith('/src/');
  const root = storage ? path.join(config.root, 'storage') : source ? path.join(config.root, 'frontend/src') : config.frontendPath;
  const relative = storage ? decoded.slice('/storage/'.length) : source ? decoded.slice('/src/'.length) : decoded === '/' ? 'index.html' : decoded.slice(1);
  const file = path.resolve(root, relative);
  ensure(file.startsWith(path.resolve(root) + path.sep), 404, 'NOT_FOUND', 'Không tìm thấy file.');
  const extension = path.extname(file).toLowerCase();
  ensure(types[extension] && (!storage || ['.jpg', '.jpeg', '.png', '.webp'].includes(extension)), 404, 'NOT_FOUND', 'Không tìm thấy file.');
  let info;
  try {
    const real = await realpath(file);
    ensure(real.startsWith((await realpath(root)) + path.sep), 404, 'NOT_FOUND', 'Không tìm thấy file.');
    info = await stat(file);
  } catch { ensure(false, 404, 'NOT_FOUND', 'Không tìm thấy file.'); }
  ensure(info.isFile(), 404, 'NOT_FOUND', 'Không tìm thấy file.');
  res.writeHead(200, { 'Content-Type': types[extension], 'Content-Length': info.size, 'Cache-Control': 'no-cache' });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).on('error', () => res.destroy()).pipe(res);
}
