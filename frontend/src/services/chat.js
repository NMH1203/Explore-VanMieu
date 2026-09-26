async function readJson(response) {
  const text = await response.text()
  return text ? JSON.parse(text) : null
}

async function handleResponse(response, fallbackMessage) {
  const data = await readJson(response)
  if (!response.ok) {
    throw new Error(
      typeof data?.detail === 'string' ? data.detail : fallbackMessage,
    )
  }
  return data
}

export async function getChatHistory(locationId) {
  const response = await fetch(
    `/api/chat/${encodeURIComponent(locationId)}`,
  )
  return handleResponse(response, 'Không thể tải lịch sử trò chuyện')
}

export async function askHeritageGuide(locationId, question) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location_id: locationId, question }),
  })
  return handleResponse(response, 'Không thể gửi câu hỏi')
}
