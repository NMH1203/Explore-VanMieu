export function checkInController({ checkIns }) {
  return {
    create: ctx => { const result = checkIns.checkIn(ctx.user, ctx.body); ctx.reply(result.alreadyCheckedIn ? 200 : 201, result); },
    history: ctx => ctx.reply(200, checkIns.history(ctx.user, ctx.query)),
  };
}
