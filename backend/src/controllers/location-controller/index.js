export function locationController({ locations }) {
  return {
    list: ctx => ctx.reply(200, locations.list(ctx.query, ctx.user)),
    detail: ctx => ctx.reply(200, locations.detail(ctx.params.id, ctx.query, ctx.user)),
    artifacts: ctx => ctx.reply(200, locations.artifacts(ctx.query)),
    artifact: ctx => ctx.reply(200, locations.artifactDetail(ctx.params.id)),
  };
}
