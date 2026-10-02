import { handleResponse } from '../../utils/response.js'

// Fetch existing question-and-answer chat history for a specific heritage location
export async function getChatHistory(locationId) {
  const response = await fetch(
    `/api/chat/${encodeURIComponent(locationId)}`,
  )
  return handleResponse(response, 'Unable to load chat history')
}

// Ask the AI Heritage Guide a question about a specific location
export async function askHeritageGuide(locationId, question) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location_id: locationId, question }),
  })
  return handleResponse(response, 'Unable to send the question')
}

