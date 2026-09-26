import { handleResponse } from './response.js'

export async function verifyCheckin({ imageDataUrl, locationId, latitude, longitude }) {
  const imageBlob = await fetch(imageDataUrl).then((response) => response.blob())
  const formData = new FormData()
  formData.append('location_id', locationId)
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
