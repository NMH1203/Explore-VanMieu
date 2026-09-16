export function publicUser(row) {
  if (!row) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}
export function location(row, includeStory = false) {
  return { id: row.id, slug: row.slug, name: row.name, description: row.description, ...(includeStory ? { story: row.story } : {}), latitude: row.latitude, longitude: row.longitude, radiusMeters: row.radius_meters, stampIcon: row.stamp_icon, imageUrl: row.image_url, sortOrder: row.sort_order, isActive: Boolean(row.is_active), updatedAt: row.updated_at };
}
export const artifact = row => ({ id: row.id, locationId: row.location_id, name: row.name, description: row.description, period: row.period, imageUrl: row.image_url, isActive: Boolean(row.is_active) });
export const reward = row => ({ id: row.id, name: row.name, description: row.description, threshold: row.threshold, kind: row.kind, stock: row.stock, isActive: Boolean(row.is_active) });
export const claim = row => ({ id: row.id, rewardId: row.reward_id, rewardName: row.reward_name, rewardKind: row.reward_kind, code: row.claim_code, status: row.status, claimedAt: row.claimed_at, fulfilledAt: row.fulfilled_at });
