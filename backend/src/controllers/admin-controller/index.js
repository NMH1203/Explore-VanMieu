export function adminController({ admin }) {
  return {
    list: kind => ctx => ctx.reply(200, admin.list(kind, ctx.query)),
    create: kind => ctx => ctx.reply(201, admin.save(kind, null, ctx.body, ctx.user)),
    update: kind => ctx => ctx.reply(200, admin.save(kind, ctx.params.id, ctx.body, ctx.user)),
    archive: kind => ctx => ctx.reply(200, admin.archive(kind, ctx.params.id, ctx.user)),
    users: ctx => ctx.reply(200, admin.users(ctx.query)),
    updateUser: ctx => ctx.reply(200, admin.updateUser(ctx.params.id, ctx.body, ctx.user)),
    claims: ctx => ctx.reply(200, admin.claims(ctx.query)),
    fulfill: ctx => ctx.reply(200, admin.fulfill(ctx.params.id, ctx.body, ctx.user)),
    stats: ctx => ctx.reply(200, admin.stats()),
    audit: ctx => ctx.reply(200, admin.audit(ctx.query)),
  };
}
