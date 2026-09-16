export function rewardController({ rewards }) {
  return { list: ctx => ctx.reply(200, rewards.list(ctx.user)), claim: ctx => { const result = rewards.claim(ctx.user, ctx.params.id); ctx.reply(result.alreadyClaimed ? 200 : 201, result); } };
}
