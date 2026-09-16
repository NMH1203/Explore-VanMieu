export function rewardRoutes(router, c) {
  router.add('GET', '/api/rewards', c.list);
  router.add('POST', '/api/rewards/:id/claim', c.claim, { auth: true });
}
