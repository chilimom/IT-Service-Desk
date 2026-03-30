import { buildApiUrl } from './api'

const AUTH_API_URL = buildApiUrl('/api/auth')

export async function loginRequest(payload) {
  const response = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json()
}
