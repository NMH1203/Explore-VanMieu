import { ensure } from '../utils/errors.js';
export class Router {
  routes = [];
  add(method, pattern, handler, options = {}) {
    const keys = [];
    const expression = pattern.split('/').map(part => {
      if (part.startsWith(':')) { keys.push(part.slice(1)); return '([^/]+)'; }
      return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('/');
    this.routes.push({ method, regex: new RegExp(`^${expression}/?$`), keys, handler, ...options });
  }
  match(method, pathname) {
    for (const route of this.routes) {
      const match = route.regex.exec(pathname);
      if (route.method !== method || !match) continue;
      let params;
      try { params = Object.fromEntries(route.keys.map((key, i) => [key, decodeURIComponent(match[i + 1])])); }
      catch { ensure(false, 400, 'INVALID_PATH', 'Đường dẫn không hợp lệ.'); }
      return { ...route, params };
    }
    const allowed = this.routes.filter(r => r.regex.test(pathname)).map(r => r.method);
    ensure(!allowed.length, 405, 'METHOD_NOT_ALLOWED', 'Phương thức không được hỗ trợ.', { allowed });
    return null;
  }
}
