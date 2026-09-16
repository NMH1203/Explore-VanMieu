export function userRoutes(router, c) {
  router.add('GET', '/api/users/me', c.me, { auth: true });
  router.add('PATCH', '/api/users/me', c.update, { auth: true });
  router.add('PATCH', '/api/users/me/password', c.password, { auth: true, authRate: true });
}
