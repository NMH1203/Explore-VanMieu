export function authRoutes(router, c) {
  router.add('POST', '/api/auth/register', c.register, { authRate: true });
  router.add('POST', '/api/auth/login', c.login, { authRate: true });
  router.add('GET', '/api/auth/session', c.session);
  router.add('POST', '/api/auth/logout', c.logout, { auth: true });
}
