export function checkInRoutes(router, c) {
  router.add('POST', '/api/check-ins', c.create, { auth: true });
  router.add('GET', '/api/check-ins', c.history, { auth: true });
}
