import { buildApiUrl } from './api'

const USER_API_URL = buildApiUrl('/api/users')

export async function getUsers() {
  const response = await fetch(USER_API_URL)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json()
}

export async function createUser(payload) {
  const response = await fetch(USER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || `Request failed: ${response.status}`)
  }

  return response.json()
}

export async function updateUser(userId, payload) {
  const response = await fetch(`${USER_API_URL}/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || `Request failed: ${response.status}`)
  }

  return response.json()
}

export async function resetUserPassword(userId, password) {
  const response = await fetch(`${USER_API_URL}/${userId}/reset-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || `Request failed: ${response.status}`)
  }

  return response.json()
}

export async function deleteUser(userId) {
  const response = await fetch(`${USER_API_URL}/${userId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message || `Request failed: ${response.status}`)
  }

  return response.json()
}
