import { handleResponse } from '../../utils/response.js'

// Fetch the user's reward milestones, unlocked theme, and claim eligibility
export async function getRewards() {
  return handleResponse(await fetch('/api/rewards', { credentials: 'include' }), 'Unable to load rewards')
}

// Submit a claim request for the completion reward certificate
export async function claimReward() {
  return handleResponse(await fetch('/api/rewards/claim', { method: 'POST', credentials: 'include' }), 'Unable to claim reward')
}

