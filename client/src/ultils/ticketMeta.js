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

export const factoryOptions = [
  { code: 'NM01', name: 'Nhà máy Luyện Gang 1' },
  { code: 'NM02', name: 'Nhà máy Luyện Gang 2' },
  { code: 'NM03', name: 'Nhà máy Nhiệt Điện 1' },
  { code: 'NM04', name: 'Nhà máy Nhiệt Điện 2' },
  { code: 'NM05', name: 'Xưởng Năng Lượng' },
]

function normalize(value) {
  return (value || '').toLowerCase()
}

function extractMaintenanceCode(ticket) {
  const candidates = [ticket?.type, ticket?.title, ticket?.description]

  for (const value of candidates) {
    const raw = String(value || '').trim()
    if (!raw) continue

    const pipeMatch = raw.match(/\|\s*([A-Z0-9]{4,5})/i)
    if (pipeMatch?.[1]) return pipeMatch[1].toUpperCase()

    const bracketMatch = raw.match(/\[.*?\]\s*([A-Z0-9]{4,5})/i)
    if (bracketMatch?.[1]) return bracketMatch[1].toUpperCase()

    const directMatch = raw.match(/\b(PM0[1-5]|ZPM[567]|QMTD)\b/i)
    if (directMatch?.[1]) return directMatch[1].toUpperCase()
  }

  return ''
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
  const categoryCode = extractMaintenanceCode(ticket)
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

export function getFactoryLabel(factoryValue) {
  const normalizedFactory = String(factoryValue || '').trim()
  if (!normalizedFactory) return 'Chua chon nha may'

  const matchedFactory = factoryOptions.find(
    (item) => item.code.toLowerCase() === normalizedFactory.toLowerCase() || item.name.toLowerCase() === normalizedFactory.toLowerCase(),
  )

  return matchedFactory ? `${matchedFactory.code} - ${matchedFactory.name}` : normalizedFactory
}

export function getOrderCodeDisplay(ticket) {
  if (!isMaintenanceTicket(ticket)) {
    return 'Khong ap dung'
  }

  return ticket?.orderCode || 'Chờ cấp Order Code'
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
