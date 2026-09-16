export function locationRoutes(router, c) {
  router.add('GET', '/api/locations', c.list);
  router.add('GET', '/api/locations/:id', c.detail);
  router.add('GET', '/api/artifacts', c.artifacts);
  router.add('GET', '/api/artifacts/:id', c.artifact);
}
