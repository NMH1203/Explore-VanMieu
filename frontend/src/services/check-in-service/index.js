import { handleResponse } from '../../utils/response.js'

// Send captured photo and current GPS coordinates to verify location check-in
export async function verifyCheckin({ imageDataUrl, locationId, latitude, longitude }) {
  // Convert captured base64 data URL into a binary Blob
  const imageBlob = await fetch(imageDataUrl).then((response) => response.blob())

  // Pack GPS coordinates and photo into multipart/form-data payload
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
