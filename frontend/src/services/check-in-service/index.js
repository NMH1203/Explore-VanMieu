import { handleResponse } from '../../utils/response.js'

// App.jsx calls this after CameraPage.jsx captures a frame. Send the session
// cookie plus image/GPS to backend/src/routes/checkins.py; the client never
// chooses or grants the unlock. The server returns the verified database ID.
export async function verifyCheckin({ imageDataUrl, latitude, longitude }) {
  const imageBlob = await fetch(imageDataUrl).then((response) => response.blob())
  const formData = new FormData()
  formData.append('latitude', String(latitude))
  formData.append('longitude', String(longitude))
  formData.append('image', imageBlob, 'checkin.jpg')

  const response = await fetch('/api/checkins/verify', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  return handleResponse(response, 'Unable to verify check-in')
}

export async function getCheckinHistory(limit = 20) {
  const response = await fetch(
    `/api/checkins/history?limit=${encodeURIComponent(limit)}`,
    { credentials: 'include' },
  )
  return handleResponse(response, 'Unable to load check-in history')
}
