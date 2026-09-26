import { handleResponse } from './response.js'

export async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  return handleResponse(response, 'Unable to sign in')
}
export async function register(email, password, username) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username }),
  })

  return handleResponse(response, 'Unable to register')
}
export async function getCurrentUser() {
  const response = await fetch('/api/auth/me')

  if (!response.ok) {
    throw new Error('Not signed in')
  }

  return handleResponse(response, 'Unable to load your account')
}

export async function logout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error('Unable to sign out')
  }
}