import { sessionCookie } from '../../middleware/http.js';

export function authController(services, config) {
  // Hàm bổ trợ đóng gói dữ liệu và thiết lập Session Cookie trả về cho client
  const respond = (ctx, result, status) => {
    // Nếu client đang có một phiên làm việc cũ, thực hiện hủy bỏ trong Database trước
    if (ctx.rawToken) {
      services.auth.logout(ctx.rawToken);
    }
    
    // Tạo chuỗi Cookie an toàn từ Token mã hóa mới sinh ra
    const token = result && result.rawToken ? result.rawToken : '';
    sessionCookie(ctx.res, token, config);
    
    // ĐỒNG BỘ FRONTEND: Trả trực tiếp đối tượng chứa user về cho ctx.reply xử lý bọc thuộc tính data
    ctx.reply(status, { 
      user: result?.user ?? null, 
      csrfToken: result?.csrfToken ?? null, 
      expiresAt: result?.expiresAt ?? null 
    });
  };

  return {
    // Kịch bản Đăng ký Thành viên mới
    register: async ctx => {
      try {
        const result = await services.auth.register({
          email: ctx.body?.email,
          password: ctx.body?.password,
          name: ctx.body?.name || 'Thành viên mới'
        });
        respond(ctx, result, 201);
      } catch (error) {
        // In log chi tiết ra Terminal của Backend để bạn theo dõi nghiệp vụ (Ví dụ: Trùng email, sai mật khẩu)
        console.error("--- LỖI ĐĂNG KÝ HỆ THỐNG BACKEND ---", error.message || error);
        
        // Trả lỗi 400 kèm thông điệp từ Validator/Database
        ctx.reply(400, { error: { code: 'BAD_REQUEST', message: error.message || 'Lỗi đăng ký tài khoản.' } });
      }
    },

    // Kịch bản Đăng nhập Hệ thống
    login: async ctx => {
      try {
        const result = await services.auth.login(ctx.body);
        respond(ctx, result, 200);
      } catch (error) {
        // In log chi tiết ra Terminal của Backend khi đăng nhập thất bại
        console.error("--- LỖI ĐĂNG NHẬP HỆ THỐNG BACKEND ---", error.message || error);
        
        ctx.reply(400, { error: { code: 'UNAUTHORIZED', message: error.message || 'Sai tài khoản hoặc mật khẩu.' } });
      }
    },

    // Kịch bản kiểm tra trạng thái Session âm thầm từ client
    session: ctx => {
      ctx.reply(200, ctx.session ?? { user: null, csrfToken: null, expiresAt: null });
    },

    // Kịch bản Đăng xuất Hệ thống
    logout: ctx => { 
      if (ctx.rawToken) {
        services.auth.logout(ctx.rawToken); 
      }
      // Ghi đè Cookie bằng chuỗi rỗng để trình duyệt xóa hoàn toàn phiên cũ
      sessionCookie(ctx.res, '', config, true); 
      ctx.reply(200, { message: 'Đã đăng xuất thành công.' }); 
    },
  };
}
