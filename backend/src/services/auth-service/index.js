import { randomUUID } from 'node:crypto';
import * as v from '../../validators/index.js';
import { digest, token, hashPassword, verifyPassword, DUMMY_HASH } from '../../utils/crypto.js';
import { ensure, AppError } from '../../utils/errors.js';
import { publicUser } from '../../models/index.js';
import { insert, update } from '../../repositories/index.js';
import { transaction } from '../../repositories/database.js';

export function authService(db, config) {
  function session(user) {
    const rawToken = token();
    const csrfToken = token();
    const expiresAt = Date.now() + config.sessionHours * 3600000;
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
    insert(db, 'sessions', { token_hash: digest(rawToken), user_id: user.id, csrf_token: csrfToken, expires_at: expiresAt });
    return { rawToken, csrfToken, expiresAt, user: publicUser(user) };
  }
  async function createUser(body, role = 'visitor') {
    const name = v.string(body.name, 'Tên', 2, 100);
    const email = v.email(body.email);
    const secret = v.password(body.password);
    ensure(!db.prepare('SELECT id FROM users WHERE email=?').get(email), 409, 'EMAIL_EXISTS', 'Email đã được sử dụng.');
    const passwordHash = await hashPassword(secret);
    const now = new Date().toISOString();
    try {
      return insert(db, 'users', { id: randomUUID(), name, email, password_hash: passwordHash, role, status: 'active', created_at: now, updated_at: now });
    } catch (error) {
      if (db.prepare('SELECT id FROM users WHERE email=?').get(email)) throw new AppError(409, 'EMAIL_EXISTS', 'Email đã được sử dụng.');
      throw error;
    }
  }
  return {
    createUser,
    async register(body) { return session(await createUser(body)); },
    async login(body) {
      const email = v.email(body.email);
      const secret = v.string(body.password, 'Mật khẩu', 1, 128, false);
      const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
      const valid = await verifyPassword(secret, user?.password_hash ?? DUMMY_HASH);
      // Kiểm tra lại sau await để không bỏ qua thao tác khóa tài khoản/đổi mật khẩu.
      const current = user && db.prepare('SELECT * FROM users WHERE id=?').get(user.id);
      ensure(valid && current?.status === 'active' && current.password_hash === user.password_hash, 401, 'INVALID_CREDENTIALS', 'Email hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa.');
      return session(current);
    },
    authenticate(rawToken) {
      if (!rawToken || !/^[a-f0-9]{64}$/.test(rawToken)) return null;
      const row = db.prepare(`SELECT s.csrf_token, s.expires_at, u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.status='active'`).get(digest(rawToken), Date.now());
      return row ? { user: publicUser(row), csrfToken: row.csrf_token, expiresAt: row.expires_at } : null;
    },
    logout(rawToken) { if (rawToken) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(rawToken)); },
    updateProfile(userId, body) {
      const name = v.string(body.name, 'Tên', 2, 100);
      return publicUser(update(db, 'users', userId, { name, updated_at: new Date().toISOString() }));
    },
    async changePassword(userId, body) {
      const oldSecret = v.string(body.currentPassword, 'Mật khẩu hiện tại', 1, 128, false);
      const newSecret = v.password(body.newPassword);
      const user = db.prepare('SELECT * FROM users WHERE id=?').get(userId);
      ensure(await verifyPassword(oldSecret, user.password_hash), 422, 'WRONG_PASSWORD', 'Mật khẩu hiện tại không đúng.');
      const hash = await hashPassword(newSecret);
      transaction(db, () => {
        const current = db.prepare('SELECT * FROM users WHERE id=?').get(userId);
        ensure(current.status === 'active' && current.password_hash === user.password_hash, 409, 'ACCOUNT_CHANGED', 'Tài khoản vừa thay đổi. Hãy đăng nhập lại.');
        update(db, 'users', userId, { password_hash: hash, updated_at: new Date().toISOString() });
        db.prepare('DELETE FROM sessions WHERE user_id=?').run(userId);
      });
      return { message: 'Đã đổi mật khẩu. Vui lòng đăng nhập lại trên các thiết bị.' };
    },
  };
}
