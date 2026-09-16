import { sessionCookie } from '../../middleware/http.js';
export function authController(services, config) {
  const respond = (ctx, result, status) => {
    // Đăng nhập/đăng ký thay phiên hiện có; không để lại phiên cũ trong DB.
    services.auth.logout(ctx.rawToken);
    sessionCookie(ctx.res, result.rawToken, config);
    ctx.reply(status, { user: result.user, csrfToken: result.csrfToken, expiresAt: result.expiresAt });
  };
  return {
    register: async ctx => respond(ctx, await services.auth.register(ctx.body), 201),
    login: async ctx => respond(ctx, await services.auth.login(ctx.body), 200),
    session: ctx => ctx.reply(200, ctx.session ?? { user: null, csrfToken: null, expiresAt: null }),
    logout: ctx => { services.auth.logout(ctx.rawToken); sessionCookie(ctx.res, '', config, true); ctx.reply(200, { message: 'Đã đăng xuất.' }); },
  };
}
