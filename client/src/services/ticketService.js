const API_URL = 'http://localhost:5017/api/tickets'

async function request(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.json()
}

export async function getTickets() {
  return request(API_URL)
}

export async function getTicketById(ticketId) {
  return request(`${API_URL}/${ticketId}`)
}

export async function getTicketLogs(ticketId) {
  return request(`${API_URL}/${ticketId}/logs`)
}
// export async function getCategoryId(Categories) {
//   return request(`${API_URL}/categories`)
// }

export async function getTicketDashboard() {
  return request(`${API_URL}/dashboard`)
}

export async function createTicket(payload) {
  const response = await fetch(API_URL, {
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

export async function updateUserTicket(ticketId, payload) {
  const response = await fetch(`${API_URL}/${ticketId}/user`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.text()
}

export async function updateAdminTicket(ticketId, payload) {
  const response = await fetch(`${API_URL}/${ticketId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.text()
}

export async function deleteTicket(ticketId) {
  const response = await fetch(`${API_URL}/${ticketId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return response.text()
}
