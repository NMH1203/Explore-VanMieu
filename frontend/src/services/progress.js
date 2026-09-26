import { handleResponse } from './response.js'

export async function getProgress() {
  const response = await fetch('/api/progress')
  return handleResponse(response, 'Unable to load progress')
}
