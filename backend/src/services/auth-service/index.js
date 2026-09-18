import { randomUUID } from 'node:crypto';
import * as v from '../../validators/index.js';
import { digest, token, hashPassword, verifyPassword, DUMMY_HASH } from '../../utils/crypto.js';
import { ensure, AppError } from '../../utils/errors.js';
import { publicUser } from '../../models/index.js';
import { insert } from '../../repositories/index.js';

export function authService(db, config) {
  // Hàm khởi tạo và lưu trữ phiên làm việc mới vào bảng sessions trong SQLite
  function generateSession(user) {
    const rawToken = token();
    const csrfToken = token();
    const expiresAt = Date.now() + config.sessionHours * 3600000; // Quy đổi số giờ cấu hình ra mili-giây
    
    // Dọn dẹp định kỳ: Xóa toàn bộ các phiên làm việc đã quá hạn trong hệ thống
    db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
    
    // Lưu bản ghi hash token bảo mật vào Database
    insert(db, 'sessions', { 
      token_hash: digest(rawToken), 
      user_id: user.id, 
      csrf_token: csrfToken, 
      expires_at: expiresAt 
    });
    
    // Trả ra thông tin người dùng sạch (Đã qua bộ lọc lọc bỏ password_hash của Model)
    return { rawToken, csrfToken, expiresAt, user: publicUser(user) };
  }

  // Hàm tạo người dùng (Dùng chung cho cả luồng Đăng ký và lệnh Admin của CLI)
  async function createUser(body, role = 'visitor') {
    // Trích xuất và xác thực định dạng dữ liệu thông qua tầng Validators của bạn
    const name = v.string(body.name, 'Tên', 2, 100);
    const email = v.email(body.email);
    const secret = v.password(body.password);
    
    // Ràng buộc nghiệp vụ: Chặn đăng ký nếu trùng Email trong hệ thống
    const existing = db.prepare('SELECT id FROM users WHERE email=?').get(email);
    ensure(!existing, 409, 'EMAIL_EXISTS', 'Email đã được sử dụng.');
    
    // Tiến hành băm mật khẩu an toàn bằng thuật toán scrypt thông qua hàm bổ trợ crypto
    const passwordHash = await hashPassword(secret);
    const now = new Date().toISOString();
    
    try {
      return insert(db, 'users', { 
        id: randomUUID(), 
        name, 
        email, 
        password_hash: passwordHash, 
        role, 
        status: 'active', 
        created_at: now, 
        updated_at: now 
      });
    } catch (error) {
      if (db.prepare('SELECT id FROM users WHERE email=?').get(email)) {
        throw new AppError(409, 'EMAIL_EXISTS', 'Email đã được sử dụng.');
      }
      throw error;
    }
  }

  return {
    createUser,
    
    // Xử lý logic Đăng ký: Tạo user mới -> Tự động kích hoạt Session Đăng nhập lập tức
    async register(body) { 
      return generateSession(await createUser(body, 'visitor')); 
    },
    
    // Xử lý logic Đăng nhập: Đối chiếu Email và Mật khẩu băm
    async login(body) {
      const email = v.email(body.email);
      const secret = v.string(body.password, 'Mật khẩu', 1, 128, false);
      
      // Tìm kiếm thông tin người dùng trong SQLite
      const user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
      
      // So khớp chuỗi băm. Sử dụng DUMMY_HASH nếu không tìm thấy user để chống tấn công dò quét thời gian (Timing Attack)
      const valid = await verifyPassword(secret, user?.password_hash ?? DUMMY_HASH);
      
      // Lấy trạng thái bản ghi mới nhất để kiểm tra tài khoản còn hoạt động hay không
      const current = user && db.prepare('SELECT * FROM users WHERE id=?').get(user.id);
      
      ensure(
        valid && current?.status === 'active' && current.password_hash === user.password_hash, 
        401, 
        'INVALID_CREDENTIALS', 
        'Email hoặc mật khẩu không đúng, hoặc tài khoản đã bị khóa.'
      );
      
      return generateSession(current);
    },

    // Kiểm tra tính hợp lệ của Session Cookie gửi kèm trong Request từ Middleware
    authenticate(rawToken) {
      if (!rawToken || !/^[a-f0-9]{64}\$/.test(rawToken)) return null;
      
      // Truy vấn kết hợp bảng sessions và users để bóc tách thông tin phân quyền
      const row = db.prepare(`
        SELECT s.csrf_token, s.expires_at, u.* 
        FROM sessions s 
        JOIN users u ON u.id=s.user_id 
        WHERE s.token_hash=? AND s.expires_at>? AND u.status='active'
      `).get(digest(rawToken), Date.now());
      
      return row ? { user: publicUser(row), csrfToken: row.csrf_token, expiresAt: row.expires_at } : null;
    },

    // Xóa bỏ bản ghi phiên làm việc trong Database khi nhận lệnh Logout
    logout(rawToken) { 
      if (rawToken) {
        db.prepare('DELETE FROM sessions WHERE token_hash=?').run(digest(rawToken)); 
      }
    }
  };
}
