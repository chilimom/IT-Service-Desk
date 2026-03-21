const USER_API_URL = 'http://localhost:5017/api/users'

export async function getUsers() {
  const response = await fetch(USER_API_URL)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json()
}
