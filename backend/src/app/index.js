import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { openDatabase, migrate } from '../repositories/database.js';
import { seed } from '../repositories/seed.js';
import { Router } from './router.js';
import { serveStatic } from './static.js';
import { ensure, AppError } from '../utils/errors.js';
import { sendJson, readJson, cookies, checkOrigin, checkCsrf, secureHeaders, createRateLimiter } from '../middleware/http.js';
import { authService } from '../services/auth-service/index.js';
import { locationService } from '../services/location-service/index.js';
import { checkInService } from '../services/check-in-service/index.js';
import { rewardService } from '../services/reward-service/index.js';
import { passportService } from '../services/passport-service/index.js';
import { adminService } from '../services/admin-service/index.js';
import { authController } from '../controllers/auth-controller/index.js';
import { userController } from '../controllers/user-controller/index.js';
import { locationController } from '../controllers/location-controller/index.js';
import { checkInController } from '../controllers/check-in-controller/index.js';
import { passportController } from '../controllers/passport-controller/index.js';
import { rewardController } from '../controllers/reward-controller/index.js';
import { adminController } from '../controllers/admin-controller/index.js';
import { authRoutes } from '../routes/auth-routes/index.js';
import { userRoutes } from '../routes/user-routes/index.js';
import { locationRoutes } from '../routes/location-routes/index.js';
import { checkInRoutes } from '../routes/check-in-routes/index.js';
import { passportRoutes } from '../routes/passport-routes/index.js';
import { rewardRoutes } from '../routes/reward-routes/index.js';
import { adminRoutes } from '../routes/admin-routes/index.js';

export function createApplication(config) {
  const db = openDatabase(config.databasePath);
  migrate(db);
  if (config.autoSeed) seed(db);
  const auth = authService(db, config);
  const locations = locationService(db);
  const rewards = rewardService(db);
  const services = { auth, locations, rewards, checkIns: checkInService(db, config, locations), passports: passportService(db, rewards), admin: adminService(db) };
  const router = new Router();
  for (const [routes, controller] of [[authRoutes, authController], [userRoutes, userController], [locationRoutes, locationController], [checkInRoutes, checkInController], [passportRoutes, passportController], [rewardRoutes, rewardController], [adminRoutes, adminController]]) routes(router, controller(services, config));
  router.add('GET', '/api/health', ctx => { db.prepare('SELECT 1').get(); ctx.reply(200, { status: 'ok' }); });
  router.add('GET', '/api/config', ctx => ctx.reply(200, { gpsMaxAccuracyMeters: config.gpsMaxAccuracy, gpsMaxAgeSeconds: config.gpsMaxAgeSeconds, checkInVerification: 'gps', cameraRecognition: false, aiGuide: false, sampleDataNotice: db.prepare("SELECT value FROM app_meta WHERE key='demo_seed_v1'").get()?.value ?? null }));
  const rateLimit = createRateLimiter();
  const server = createServer({ requestTimeout: 15000, headersTimeout: 10000, maxHeaderSize: 16384 }, async (req, res) => {
    const requestId = randomUUID();
    secureHeaders(res);
    res.setHeader('X-Request-Id', requestId);
    try {
      // Origin cố định để không tin Host header cho URL parsing hoặc xác thực.
      const url = new URL(req.url, 'http://internal.invalid');
      if (!url.pathname.startsWith('/api/') && url.pathname !== '/api') return await serveStatic(req, res, url.pathname, config);
      const ip = req.socket.remoteAddress ?? 'unknown';
      if (config.rateLimit) rateLimit(`api:${ip}`, 300, 60000);
      checkOrigin(req, config);
      const route = router.match(req.method, url.pathname);
      ensure(route, 404, 'NOT_FOUND', 'Không tìm thấy API.');
      if (route.authRate && config.rateLimit) rateLimit(`auth:${ip}`, 20, 15 * 60000);
      const rawToken = cookies(req).vm_session;
      const session = auth.authenticate(rawToken);
      if (route.auth) ensure(session, 401, 'AUTH_REQUIRED', 'Vui lòng đăng nhập.');
      if (route.admin) ensure(session?.user.role === 'admin', 403, 'ADMIN_REQUIRED', 'Chức năng này chỉ dành cho quản trị viên.');
      const mutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
      if (mutation && route.auth) checkCsrf(req, session);
      const body = mutation ? await readJson(req) : {};
      const ctx = { req, res, body, query: url.searchParams, params: route.params, session, user: session?.user ?? null, rawToken, reply: (status, data) => sendJson(res, status, { data }) };
      await route.handler(ctx);
    } catch (error) {
      if (res.headersSent || res.destroyed) return;
      const known = error instanceof AppError;
      if (!known) console.error(`[${requestId}]`, error);
      const status = known ? error.status : 500;
      if (status === 429) res.setHeader('Retry-After', error.details?.retryAfterSeconds ?? 60);
      if (status === 405 && error.details?.allowed) res.setHeader('Allow', error.details.allowed.join(', '));
      sendJson(res, status, { error: { code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : 'Máy chủ gặp lỗi. Vui lòng thử lại.', ...(known && error.details ? { details: error.details } : {}), requestId } });
    }
  });
  return { server, db, services };
}
