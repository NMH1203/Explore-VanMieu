async function parseResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.detail || 'Không thể xác minh lượt check-in')
  }
  return data
}

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
  return parseResponse(response)
}
