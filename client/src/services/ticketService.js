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

// export async function createTicket(payload) {
//   const response = await fetch(API_URL, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(payload),
//   })

//   if (!response.ok) {
//      const error = await response.json() // 🔥 lấy lỗi backend
//     console.error("SERVER ERROR:", error)
//     throw new Error(`Request failed: ${response.status}`)
//   }

//   return response.json()
// }
// ticketService.js
export const createTicket = async (ticketData) => {
  try {
    console.log('📤 Sending ticket data:', JSON.stringify(ticketData, null, 2));
    
    const response = await fetch('http://localhost:5017/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData),
    });

    if (!response.ok) {
      // Lấy chi tiết lỗi từ response
      const errorText = await response.text();
      console.error('❌ Server response error:', errorText);
      
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.title || errorText;
        console.error('❌ Error details:', errorJson);
      } catch (e) {
        errorMessage = errorText;
      }
      
      throw new Error(`Request failed: ${response.status} - ${errorMessage}`);
    }

    const result = await response.json();
    console.log('✅ Ticket created successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ SERVER ERROR:', error);
    throw error;
  }
};
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
