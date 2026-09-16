export function passportController({ passports }) {
  return { passport: ctx => ctx.reply(200, passports.passport(ctx.user)), today: ctx => ctx.reply(200, passports.today(ctx.user)) };
}
