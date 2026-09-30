// Shared by src/services/* API clients. Keep HTTP status on errors so pages such
// as camera/CameraPage.jsx can distinguish expired sessions from scan failures.
export async function handleResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(typeof data?.detail === 'string' ? data.detail : fallbackMessage)
    error.status = response.status
    throw error
  }
  if (data === null) {
    throw new Error('The server returned an invalid response. Please try again.')
  }
  return data
}
