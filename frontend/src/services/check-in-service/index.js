import { handleResponse } from '../../utils/response.js'

export async function verifyCheckin({ imageDataUrl, locationId, latitude, longitude, testMode = false }) {
  if (testMode) {
    return handleResponse(await fetch('/api/camera-test/capture', {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location_id: locationId }),
    }), 'Unable to save test capture')
  }
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
