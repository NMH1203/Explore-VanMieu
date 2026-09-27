export async function handleResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(typeof data?.detail === 'string' ? data.detail : fallbackMessage)
  }
  if (data === null) {
    throw new Error('The server returned an invalid response. Please try again.')
  }
  return data
}
