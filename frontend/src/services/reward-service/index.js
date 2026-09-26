import { handleResponse } from '../../utils/response.js'
export async function getRewards() {
  return handleResponse(await fetch('/api/rewards', { credentials: 'include' }), 'Unable to load rewards')
}
export async function claimReward() {
  return handleResponse(await fetch('/api/rewards/claim', { method: 'POST', credentials: 'include' }), 'Unable to claim reward')
}
