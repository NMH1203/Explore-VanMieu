async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.detail || 'Không thể kết nối máy chủ.')
  return body
}

export function getLocationStatuses() {
  return request('/api/locations')
}

export function unlockLocation(locationId) {
  return request(`/api/locations/${encodeURIComponent(locationId)}/unlock`, { method: 'PUT' })
}
