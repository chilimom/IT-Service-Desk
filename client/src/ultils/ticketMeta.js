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
  { code: 'NM01', name: 'Nha may Luyen Gang 1' },
  { code: 'NM02', name: 'Nha may Luyen Gang 2' },
  { code: 'NM03', name: 'Nha may Nhiet Dien 1' },
  { code: 'NM04', name: 'Nha may Nhiet Dien 2' },
  { code: 'NM05', name: 'Xuong Nang Luong' },
]

function normalize(value) {
  return (value || '').toLowerCase()
}

export function getStatusDisplayLabel(status) {
  const normalizedStatus = normalize(status)

  if (normalizedStatus === 'submitted') return 'Chờ xử lý'
  if (normalizedStatus === 'inprogress') return 'Đang xử lý'
  if (normalizedStatus === 'done') return 'Hoàn thành'

  return status || 'Unknown'
}

function getTicketTypeSource(ticketOrType) {
  if (typeof ticketOrType === 'string') {
    return ticketOrType
  }

  return ticketOrType?.categoryType || ticketOrType?.categoryName || ticketOrType?.type || ''
}

function extractMaintenanceCode(ticket) {
  const candidates = [
    ticket?.maintenanceTypeCode,
    ticket?.maintenanceTypeName,
    ticket?.categoryType,
    ticket?.categoryName,
    ticket?.type,
    ticket?.title,
    ticket?.description,
  ]

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
  const rawType = getTicketTypeSource(ticketOrType)
  const type = normalize(rawType)
  return type.includes('maintenance') || type.includes('bao tri')
}

export function isSupportTicket(ticketOrType) {
  const rawType = getTicketTypeSource(ticketOrType)
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

  return ticket?.categoryName || ticket?.categoryType || ticket?.type || 'Chua xac dinh'
}

export const getFactoryLabel = (factoryId) => {
  if (!factoryId) return 'Chua co nha may'

  const normalizedFactoryId = String(factoryId).trim()
  const factory = factoryOptions.find(
    (item) => item.code === normalizedFactoryId || String(item.id || '') === normalizedFactoryId,
  )

  if (factory) {
    return factory.name
  }

  return normalizedFactoryId
}

export function getOrderCodeDisplay(ticket) {
  if (!isMaintenanceTicket(ticket)) {
    return 'Không áp dụng'
  }

  const orderCode = String(ticket?.orderCode || '').trim()
  if (orderCode) {
    return orderCode
  }

  const normalizedStatus = normalize(ticket?.status)
  const isAccepted =
    Boolean(ticket?.assignedTo) ||
    Number(ticket?.statusId) === 2 ||
    Number(ticket?.statusId) === 1 ||
    normalizedStatus === 'inprogress' ||
    normalizedStatus === 'done'

  return isAccepted ? 'Dang cho cap order' : 'Chờ tiếp nhận'
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
