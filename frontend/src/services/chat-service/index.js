import { handleResponse } from '../../utils/response.js'

export async function getChatHistory(locationId) {
  const response = await fetch(
    `/api/chat/${encodeURIComponent(locationId)}`,
  )
  return handleResponse(response, 'Unable to load chat history')
}

export async function askHeritageGuide(locationId, question) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location_id: locationId, question }),
  })
  return handleResponse(response, 'Unable to send the question')
}
