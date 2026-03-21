export const maintenanceOptions = [
  { code: 'PM01', name: 'Bao tri su co' },
  { code: 'PM02', name: 'Bao tri nguoi co hoi' },
  { code: 'PM03', name: 'Bao tri chien luoc' },
  { code: 'PM05', name: 'Bao tri CBM' },
  { code: 'ZPM5', name: 'Cai tao, cai tien' },
  { code: 'ZPM6', name: 'Trung tu, dai tu' },
  { code: 'ZPM7', name: 'Bao tri phuc hoi' },
  { code: 'QMTD', name: 'Hieu chuan - kiem dinh' },
]

function normalize(value) {
  return (value || '').toLowerCase()
}

export function isMaintenanceTicket(ticketOrType) {
  const rawType = typeof ticketOrType === 'string' ? ticketOrType : ticketOrType?.type
  const type = normalize(rawType)
  return type.includes('maintenance') || type.includes('bao tri')
}

export function isSupportTicket(ticketOrType) {
  const rawType = typeof ticketOrType === 'string' ? ticketOrType : ticketOrType?.type
  const type = normalize(rawType)
  return type.includes('it') || type.includes('support') || type.includes('ho tro')
}

export function getMaintenanceCategory(ticket) {
  const rawType = ticket?.type || ''
  const [, categoryCode = ''] = rawType.split('|')
  return maintenanceOptions.find((item) => item.code === categoryCode) || null
}

export function getTicketTypeLabel(ticket) {
  if (isMaintenanceTicket(ticket)) {
    const category = getMaintenanceCategory(ticket)
    return category ? `Lenh bao tri - ${category.code} - ${category.name}` : 'Lenh bao tri'
  }

  if (isSupportTicket(ticket)) {
    return 'Ho tro CNTT'
  }

  return ticket?.type || 'Chua xac dinh'
}

export function getOrderCodeDisplay(ticket) {
  if (!isMaintenanceTicket(ticket)) {
    return 'Khong ap dung'
  }

  return ticket?.orderCode || 'Admin chua cap nhat'
}

export function formatTicketCode(ticket) {
  const numericPart =
    ticket?.id ||
    (ticket?.code ? Number((ticket.code.match(/\d+/g) || []).join('').slice(-5)) : 0) ||
    0

  if (isMaintenanceTicket(ticket)) return `LBT-${numericPart}`
  if (isSupportTicket(ticket)) return `SP-${numericPart}`
  return `TKT-${numericPart}`
}
