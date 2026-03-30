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
    let message = `Request failed: ${response.status}`

    try {
      const errorPayload = await response.json()
      if (errorPayload?.message) {
        message = errorPayload.message
      }
    } catch {
      // Fall back to the HTTP status when the response body is not JSON.
    }

    throw new Error(message)
  }

  return response.json()
}
