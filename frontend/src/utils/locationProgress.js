import { MAP_LOCATIONS } from '../data/mapLocations.js'

// Presentation IDs must match database/seeds/seed_locations.py. Unknown IDs
// cannot increase the ten-site passport count or unlock an unrelated route.
const knownIds = new Set(MAP_LOCATIONS.map(location => location.id))

export function locationProgressReducer(state, action) {
  if (action.type === 'reset') return { userId: action.userId, ids: new Set() }
  // Ignore responses belonging to a previous account after logout/login.
  if (!action.userId || action.userId !== state.userId) return state
  const ids = new Set(state.ids)
  if (action.type === 'loaded') {
    // Merge an initial database snapshot with scans completed while it was in
    // flight. Replacing the set would briefly re-lock a freshly verified site.
    for (const row of action.progress) {
      if (row.status === true && knownIds.has(row.location_id)) ids.add(row.location_id)
    }
  } else if (action.type === 'verified' && action.result.verified === true) {
    if (knownIds.has(action.result.location_id)) ids.add(action.result.location_id)
  }
  return { userId: state.userId, ids }
}
