export function adminRoutes(router, c) {
  const options = { auth: true, admin: true };
  for (const kind of ['locations', 'artifacts', 'rewards']) {
    router.add('GET', `/api/admin/${kind}`, c.list(kind), options);
    router.add('POST', `/api/admin/${kind}`, c.create(kind), options);
    router.add('PUT', `/api/admin/${kind}/:id`, c.update(kind), options);
    router.add('DELETE', `/api/admin/${kind}/:id`, c.archive(kind), options);
  }
  router.add('GET', '/api/admin/users', c.users, options);
  router.add('PATCH', '/api/admin/users/:id', c.updateUser, options);
  router.add('GET', '/api/admin/claims', c.claims, options);
  router.add('PATCH', '/api/admin/claims/:id', c.fulfill, options);
  router.add('GET', '/api/admin/stats', c.stats, options);
  router.add('GET', '/api/admin/audit', c.audit, options);
}
