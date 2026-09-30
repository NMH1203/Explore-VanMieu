import { handleResponse } from '../../utils/response.js'

// backend/src/routes/progress.py returns only this session's persisted unlocks.
// hooks/useLocationProgress.js cancels this read when the active account changes.
export async function getProgress({ signal } = {}) {
  const response = await fetch('/api/progress', { credentials: 'include', signal })
  return handleResponse(response, 'Unable to load progress')
}
