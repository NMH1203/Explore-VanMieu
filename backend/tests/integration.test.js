import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApplication } from '../src/app/index.js';
import { createConfig } from '../src/config/index.js';
import { distanceMeters, visitDate } from '../src/services/gps-service/index.js';

async function fixture(overrides = {}) {
  const config = createConfig({ databasePath: ':memory:', production: false, autoSeed: true, rateLimit: false, allowedOrigins: ['http://localhost:3000'], ...overrides });
  const app = createApplication(config);
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${app.server.address().port}`;
  return { ...app, base, async close() { await new Promise(resolve => app.server.close(resolve)); app.db.close(); } };
}
function client(base) {
  let cookie = ''; let csrf = '';
  return async (method, url, body, extraHeaders = {}) => {
    const headers = { Cookie: cookie, ...extraHeaders };
    if (method !== 'GET') { headers['Content-Type'] ??= 'application/json'; if (!Object.hasOwn(headers, 'X-CSRF-Token')) headers['X-CSRF-Token'] = csrf; }
    const response = await fetch(base + url, { method, headers, ...(method !== 'GET' ? { body: typeof body === 'string' ? body : JSON.stringify(body ?? {}) } : {}) });
    if (response.headers.get('set-cookie')) cookie = response.headers.get('set-cookie').split(';')[0];
    const json = await response.json();
    if (json.data && Object.hasOwn(json.data, 'csrfToken')) csrf = json.data.csrfToken ?? '';
    return { status: response.status, headers: response.headers, ...json };
  };
}
const password = 'Only-for-local-tests-123!';
const gps = location => ({ locationId: location.id, latitude: location.latitude, longitude: location.longitude, accuracy: 8, observedAt: new Date().toISOString() });

test('Luồng API thực tế và ràng buộc dữ liệu', async t => {
  const app = await fixture(); t.after(() => app.close());
  const guest = client(app.base), alice = client(app.base), bob = client(app.base), admin = client(app.base);
  await app.services.auth.createUser({ name: 'Test Admin', email: 'admin@example.test', password }, 'admin');
  assert.equal((await admin('POST', '/api/auth/login', { email: 'admin@example.test', password })).status, 200);
  let aliceId, bobId, first, second;

  await t.test('Đăng ký, email không phân biệt hoa thường và chống tự cấp quyền admin', async () => {
    const result = await alice('POST', '/api/auth/register', { name: 'Alice', email: 'ALICE@example.test', password, role: 'admin' });
    assert.equal(result.status, 201); aliceId = result.data.user.id;
    assert.equal(result.data.user.role, 'visitor');
    assert.equal(result.data.user.email, 'alice@example.test');
    assert.ok(!JSON.stringify(result.data).includes('password'));
    assert.match(result.headers.get('set-cookie'), /HttpOnly/);
    assert.match(result.headers.get('set-cookie'), /SameSite=Strict/);
    assert.equal((await guest('POST', '/api/auth/register', { name: 'Another', email: 'Alice@example.test', password })).status, 409);
    assert.equal((await guest('POST', '/api/auth/register', { name: 'Weak', email: 'weak@example.test', password: '123' })).status, 422);
    const other = await bob('POST', '/api/auth/register', { name: 'Bob', email: 'bob@example.test', password });
    assert.equal(other.status, 201); bobId = other.data.user.id;
  });

  await t.test('Phiên đăng nhập, dữ liệu riêng tư và phân quyền admin', async () => {
    assert.equal((await guest('GET', '/api/auth/session')).data.user, null);
    assert.equal((await alice('GET', '/api/auth/session')).data.user.id, aliceId);
    assert.equal((await guest('GET', '/api/passport')).status, 401);
    assert.equal((await alice('GET', '/api/admin/users')).status, 403);
    assert.equal((await guest('POST', '/api/check-ins', {})).status, 401);
    assert.equal((await guest('POST', '/api/auth/login', { email: 'missing@example.test', password })).status, 401);
  });

  await t.test('Danh sách, tìm kiếm, hiện vật và câu chuyện bị khóa phía server', async () => {
    const catalog = await guest('GET', '/api/locations?limit=100');
    assert.equal(catalog.data.items.length, 10); [first, second] = catalog.data.items;
    assert.ok(catalog.data.items.every(l => !Object.hasOwn(l, 'story') && !l.isUnlocked));
    assert.equal((await guest('GET', `/api/locations/${first.id}`)).data.story, null);
    assert.equal((await guest('GET', '/api/locations?search=Khu%C3%AA')).data.pagination.total, 1);
    assert.equal((await guest('GET', '/api/locations?limit=2&page=2')).data.items.length, 2);
    assert.equal((await guest('GET', '/api/locations?page=0')).status, 422);
    assert.equal((await guest('GET', '/api/locations?latitude=21')).status, 422);
    const artifacts = (await guest('GET', '/api/artifacts')).data.items;
    assert.equal(artifacts.length, 3);
    assert.equal((await guest('GET', `/api/artifacts/${artifacts[0].id}`)).data.id, artifacts[0].id);
  });

  await t.test('Chống CSRF, Origin lạ, JSON sai, body quá lớn và phương thức sai', async () => {
    assert.equal((await alice('PATCH', '/api/users/me', { name: 'Changed' }, { 'X-CSRF-Token': '' })).status, 403);
    assert.equal((await alice('PATCH', '/api/users/me', { name: 'Changed' }, { Origin: 'https://attacker.invalid' })).status, 403);
    assert.equal((await guest('POST', '/api/auth/login', '{broken')).status, 400);
    assert.equal((await guest('POST', '/api/auth/login', {}, { 'Content-Type': 'text/plain' })).status, 415);
    assert.equal((await guest('POST', '/api/auth/login', { padding: 'x'.repeat(70000) })).status, 413);
    assert.equal((await guest('POST', '/api/health', {})).status, 405);
    assert.equal((await guest('GET', '/api/unknown')).status, 404);
  });

  await t.test('Từ chối GPS xa, cũ, sai số lớn hoặc ngoài miền giá trị', async () => {
    assert.equal((await alice('POST', '/api/check-ins', { ...gps(first), latitude: 0, longitude: 0 })).error.code, 'OUT_OF_RANGE');
    assert.equal((await alice('POST', '/api/check-ins', { ...gps(first), observedAt: '2000-01-01T00:00:00.000Z' })).error.code, 'STALE_POSITION');
    assert.equal((await alice('POST', '/api/check-ins', { ...gps(first), observedAt: new Date(Date.now() + 60000).toISOString() })).error.code, 'STALE_POSITION');
    assert.equal((await alice('POST', '/api/check-ins', { ...gps(first), accuracy: 1000 })).error.code, 'LOW_GPS_ACCURACY');
    assert.equal((await alice('POST', '/api/check-ins', { ...gps(first), latitude: 91 })).status, 422);
    assert.equal((await alice('GET', '/api/passport')).data.collected, 0);
  });

  await t.test('Check-in hợp lệ tạo một con dấu, mở truyện và không cộng trùng', async () => {
    const result = await alice('POST', '/api/check-ins', gps(first));
    assert.equal(result.status, 201); assert.equal(result.data.stampAwarded, true);
    const duplicates = await Promise.all([alice('POST', '/api/check-ins', gps(first)), alice('POST', '/api/check-ins', gps(first))]);
    assert.ok(duplicates.every(r => r.status === 200 && r.data.alreadyCheckedIn && !r.data.stampAwarded));
    const passport = (await alice('GET', '/api/passport')).data;
    assert.equal(passport.collected, 1); assert.equal(passport.totalVisits, 1);
    assert.ok((await alice('GET', `/api/locations/${first.id}`)).data.story);
    assert.equal((await bob('GET', `/api/locations/${first.id}`)).data.story, null);
    assert.equal((await bob('GET', `/api/check-ins?userId=${aliceId}`)).data.pagination.total, 0);
  });

  await t.test('Hành trình ngày ổn định, tối đa năm điểm không trùng nhau', async () => {
    const a = (await alice('GET', '/api/journeys/today')).data;
    const b = (await alice('GET', '/api/journeys/today')).data;
    assert.equal(a.id, b.id); assert.equal(a.total, 5);
    assert.equal(new Set(a.stops.map(s => s.locationId)).size, 5);
    assert.equal(a.date, visitDate());
    assert.equal(a.completed, a.stops.filter(s => s.locationId === first.id).length);
  });

  await t.test('Mốc thưởng do server tính, nhận nhiều lần chỉ có một kết quả', async () => {
    assert.equal((await alice('POST', '/api/rewards/reward-scholar/claim', {})).status, 403);
    const results = await Promise.all([alice('POST', '/api/rewards/reward-first-step/claim', {}), alice('POST', '/api/rewards/reward-first-step/claim', {})]);
    assert.deepEqual(results.map(r => r.status).sort(), [200, 201]);
    assert.equal(results[0].data.code, results[1].data.code);
    assert.equal((await alice('GET', '/api/passport')).data.themeUnlocked, true);
    assert.equal((await bob('GET', '/api/passport')).data.themeUnlocked, false);
  });

  let createdLocation, createdArtifact;
  await t.test('Admin thêm/sửa địa điểm, nội dung và hiện vật', async () => {
    const body = { name: 'Điểm thử nghiệm', slug: 'diem-thu-nghiem', description: 'Mô tả thử', story: '<script>no HTML execution</script>', latitude: 21.02, longitude: 105.83, radiusMeters: 30 };
    const result = await admin('POST', '/api/admin/locations', body);
    assert.equal(result.status, 201); createdLocation = result.data;
    assert.equal((await admin('POST', '/api/admin/locations', body)).status, 409);
    assert.equal((await admin('PUT', `/api/admin/locations/${createdLocation.id}`, { ...createdLocation, name: 'Tên mới' })).data.name, 'Tên mới');
    const artifact = await admin('POST', '/api/admin/artifacts', { name: 'Hiện vật thử', locationId: createdLocation.id, description: 'Mô tả thử' });
    assert.equal(artifact.status, 201); createdArtifact = artifact.data;
    assert.equal((await guest('GET', `/api/locations/${createdLocation.id}`)).data.artifacts.length, 1);
    assert.equal((await admin('PUT', `/api/admin/artifacts/${createdArtifact.id}`, { ...createdArtifact, period: '2026' })).data.period, '2026');
    assert.equal((await admin('DELETE', `/api/admin/artifacts/${createdArtifact.id}`, {})).status, 200);
    assert.equal((await guest('GET', `/api/artifacts/${createdArtifact.id}`)).status, 404);
  });

  await t.test('Tồn kho phần thưởng được giữ đúng khi hai người nhận đồng thời', async () => {
    assert.equal((await bob('POST', '/api/check-ins', gps(first))).status, 201);
    const reward = (await admin('POST', '/api/admin/rewards', { name: 'Quà hữu hạn', description: 'Một phần quà', threshold: 1, kind: 'physical', stock: 1 })).data;
    const results = await Promise.all([alice('POST', `/api/rewards/${reward.id}/claim`, {}), bob('POST', `/api/rewards/${reward.id}/claim`, {})]);
    assert.deepEqual(results.map(r => r.status).sort(), [201, 409]);
    const claim = results.find(r => r.status === 201).data;
    assert.equal(claim.status, 'pending');
    const stock = (await admin('GET', '/api/admin/rewards?limit=100')).data.items.find(r => r.id === reward.id).stock;
    assert.equal(stock, 0);
    assert.equal((await admin('PATCH', `/api/admin/claims/${claim.id}`, { status: 'fulfilled' })).data.status, 'fulfilled');
    assert.equal((await admin('PATCH', `/api/admin/claims/${claim.id}`, { status: 'pending' })).status, 422);
  });

  await t.test('Ẩn địa điểm giữ lịch sử, con dấu và thay điểm trong hành trình', async () => {
    const adminLocations = (await admin('GET', '/api/admin/locations?limit=100')).data.items;
    const firstBody = adminLocations.find(l => l.id === first.id);
    assert.equal((await admin('DELETE', `/api/admin/locations/${first.id}`, {})).status, 200);
    assert.equal((await guest('GET', `/api/locations/${first.id}`)).status, 404);
    assert.equal((await alice('POST', '/api/check-ins', gps(first))).status, 404);
    const passport = (await alice('GET', '/api/passport')).data;
    assert.equal(passport.collected, 1); assert.equal(passport.stamps.find(s => s.locationId === first.id).isActive, false);
    const journey = (await alice('GET', '/api/journeys/today')).data;
    assert.equal(journey.total, 5); assert.ok(journey.stops.every(s => s.locationId !== first.id));
    assert.equal((await alice('GET', '/api/check-ins')).data.pagination.total, 1);
    assert.equal((await admin('PUT', `/api/admin/locations/${first.id}`, { ...firstBody, isActive: true })).status, 200);
  });

  await t.test('Lượt thăm ngày khác không cấp thêm con dấu', async () => {
    // Di chuyển dữ liệu fixture sang ngày hôm qua để mô phỏng lượt quay lại hôm nay.
    app.db.prepare('UPDATE check_ins SET visit_date=? WHERE user_id=? AND location_id=?').run(visitDate(new Date(Date.now() - 86400000)), aliceId, first.id);
    const result = await alice('POST', '/api/check-ins', gps(first));
    assert.equal(result.status, 201); assert.equal(result.data.stampAwarded, false);
    const passport = (await alice('GET', '/api/passport')).data;
    assert.equal(passport.collected, 1); assert.equal(passport.totalVisits, 2);
  });

  await t.test('Khóa tài khoản thu hồi phiên và tránh admin tự khóa', async () => {
    assert.equal((await admin('PATCH', `/api/admin/users/${bobId}`, { status: 'disabled' })).status, 200);
    assert.equal((await bob('GET', '/api/passport')).status, 401);
    assert.equal((await bob('POST', '/api/auth/login', { email: 'bob@example.test', password })).status, 401);
    const adminId = (await admin('GET', '/api/auth/session')).data.user.id;
    assert.equal((await admin('PATCH', `/api/admin/users/${adminId}`, { role: 'visitor' })).status, 409);
    assert.equal((await admin('PATCH', `/api/admin/users/${adminId}`, { status: 'disabled' })).status, 409);
    assert.equal((await admin('PATCH', `/api/admin/users/${bobId}`, { status: 'active' })).status, 200);
    assert.equal((await bob('POST', '/api/auth/login', { email: 'bob@example.test', password })).status, 200);
  });

  await t.test('Đổi tên và mật khẩu, thu hồi mọi phiên cũ', async () => {
    const secondSession = client(app.base);
    await secondSession('POST', '/api/auth/login', { email: 'alice@example.test', password });
    assert.equal((await alice('PATCH', '/api/users/me', { name: 'Alice mới', role: 'admin' })).data.role, 'visitor');
    assert.equal((await alice('PATCH', '/api/users/me/password', { currentPassword: 'wrong', newPassword: password + 'new' })).status, 422);
    assert.equal((await alice('PATCH', '/api/users/me/password', { currentPassword: password, newPassword: password + 'new' })).status, 200);
    assert.equal((await secondSession('GET', '/api/passport')).status, 401);
    assert.equal((await alice('POST', '/api/auth/login', { email: 'alice@example.test', password })).status, 401);
    assert.equal((await alice('POST', '/api/auth/login', { email: 'alice@example.test', password: password + 'new' })).status, 200);
    assert.equal((await alice('GET', '/api/passport')).data.collected, 1);
    assert.equal((await alice('POST', '/api/auth/logout', {})).status, 200);
    assert.equal((await alice('GET', '/api/passport')).status, 401);
  });

  await t.test('Nhật ký, thống kê và phòng SQL injection', async () => {
    const stats = (await admin('GET', '/api/admin/stats')).data;
    assert.equal(stats.users, 3); assert.ok(Number.isInteger(stats.checkInsToday));
    assert.ok((await admin('GET', '/api/admin/audit')).data.pagination.total >= 10);
    assert.equal((await guest('GET', '/api/locations?search=%27%20OR%201%3D1--')).data.pagination.total, 0);
    assert.equal((await guest('GET', '/api/locations/%27%20OR%201%3D1--')).status, 404);
    assert.equal(app.db.prepare('SELECT count(*) AS n FROM users').get().n, 3);
  });

  await t.test('Chỉ phục vụ file frontend, không lộ .env, backend và database', async () => {
    for (const url of ['/', '/styles.css', '/integration.css', '/src/app.js', '/src/services/api.js']) assert.equal((await fetch(app.base + url)).status, 200);
    for (const url of ['/.env', '/database/vanmieu.sqlite', '/backend/src/config/index.js', '/src/../../../.env', '/storage/%2e%2e/.env']) assert.equal((await fetch(app.base + url)).status, 404);
    const config = (await guest('GET', '/api/config')).data;
    assert.equal(config.cameraRecognition, false); assert.equal(config.aiGuide, false);
  });
});

test('Dữ liệu và phiên tồn tại sau khi khởi động lại', async () => {
  const directory = mkdtempSync(path.join(tmpdir(), 'vanmieu-test-'));
  const databasePath = path.join(directory, 'test.sqlite');
  let app;
  try {
    app = await fixture({ databasePath });
    const request = client(app.base);
    const user = (await request('POST', '/api/auth/register', { name: 'Persistent', email: 'persist@example.test', password })).data.user;
    const location = (await request('GET', '/api/locations')).data.items[0];
    await request('POST', '/api/check-ins', gps(location));
    const cookie = (await request('POST', '/api/auth/login', { email: user.email, password })).headers.get('set-cookie').split(';')[0];
    await app.close(); app = null;
    app = await fixture({ databasePath });
    const response = await fetch(app.base + '/api/passport', { headers: { Cookie: cookie } });
    assert.equal(response.status, 200); assert.equal((await response.json()).data.collected, 1);
    assert.equal(app.db.prepare('SELECT count(*) AS n FROM locations').get().n, 10);
    const backupPath = path.join(directory, 'backup.sqlite');
    app.db.prepare('VACUUM INTO ?').run(backupPath);
  } finally { if (app) await app.close(); rmSync(directory, { recursive: true, force: true }); }
});

test('Hạn chế số lần đăng nhập', async t => {
  const app = await fixture({ rateLimit: true }); t.after(() => app.close());
  const request = client(app.base);
  for (let i = 0; i < 20; i++) assert.equal((await request('POST', '/api/auth/login', {})).status, 422);
  const blocked = await request('POST', '/api/auth/login', {});
  assert.equal(blocked.status, 429); assert.ok(Number(blocked.headers.get('retry-after')) > 0);
});

test('Haversine và ngày tham quan theo giờ Việt Nam', () => {
  assert.equal(distanceMeters(21, 105, 21, 105), 0);
  assert.ok(Math.abs(distanceMeters(0, 0, 0, 1) - 111194.93) < 1);
  assert.equal(visitDate(new Date('2026-09-15T16:59:59Z')), '2026-09-15');
  assert.equal(visitDate(new Date('2026-09-15T17:00:00Z')), '2026-09-16');
});
