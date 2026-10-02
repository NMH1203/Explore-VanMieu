import { handleResponse } from '../../utils/response.js'

// Send user credentials to login endpoint and establish a session cookie
export async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  return handleResponse(response, 'Unable to sign in')
}

// Register a new user account with email, password, and username
export async function register(email, password, username) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, username }),
  })

  return handleResponse(response, 'Unable to register')
}

// Retrieve currently authenticated user profile from backend session
export async function getCurrentUser() {
  const response = await fetch('/api/auth/me', { credentials: 'include' })

  if (!response.ok) {
    throw new Error('Not signed in')
  }

  return handleResponse(response, 'Unable to load your account')
}

// Log out the current user session and invalidate session cookie
export async function logout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Unable to sign out')
  }
}

