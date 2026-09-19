const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
const tokenStorageKey = 'explore-van-mieu:access-token'

export function getAccessToken() {
  return window.localStorage.getItem(tokenStorageKey)
}

export function clearAccessToken() {
  window.localStorage.removeItem(tokenStorageKey)
}

async function request(path, options = {}) {
  const token = getAccessToken()
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.detail || 'Không thể kết nối máy chủ.')
  return body
}

export async function authenticate(mode, credentials) {
  const result = await request(`/api/auth/${mode === 'signup' ? 'register' : 'login'}`, {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
  window.localStorage.setItem(tokenStorageKey, result.token)
  return result.account
}

export function getAccountStatus() {
  return request('/api/auth/status')
}

export function getLocationStatuses() {
  return request('/api/locations')
}

export function unlockLocation(locationId) {
  return request(`/api/locations/${encodeURIComponent(locationId)}/unlock`, { method: 'PUT' })
}
