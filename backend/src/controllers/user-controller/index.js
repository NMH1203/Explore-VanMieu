import { sessionCookie } from '../../middleware/http.js';
export function userController(services, config) {
  return {
    me: ctx => ctx.reply(200, ctx.user),
    update: ctx => ctx.reply(200, services.auth.updateProfile(ctx.user.id, ctx.body)),
    password: async ctx => { const result = await services.auth.changePassword(ctx.user.id, ctx.body); sessionCookie(ctx.res, '', config, true); ctx.reply(200, result); },
  };
}
