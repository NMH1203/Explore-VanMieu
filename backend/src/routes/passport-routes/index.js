export function passportRoutes(router, c) {
  router.add('GET', '/api/passport', c.passport, { auth: true });
  router.add('GET', '/api/journeys/today', c.today, { auth: true });
}
