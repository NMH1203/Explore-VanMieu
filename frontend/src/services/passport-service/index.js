import { handleResponse } from '../../utils/response.js'

// Fetch the visitor's heritage exploration progress (completed locations & status)
export async function getProgress() {
  const response = await fetch('/api/progress')
  return handleResponse(response, 'Unable to load progress')
}

