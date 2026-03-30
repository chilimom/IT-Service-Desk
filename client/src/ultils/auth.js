export function normalizeRole(role) {
  return String(role || '').trim().toLowerCase()
}

export function isAdminRole(role) {
  return normalizeRole(role) === 'admin'
}

export function isProcessorRole(role) {
  return normalizeRole(role) === 'processor'
}

export function isRequesterRole(role) {
  return normalizeRole(role) === 'user'
}

export function canManageTickets(user) {
  const role = normalizeRole(user?.role)
  return role === 'admin' || role === 'processor'
}

export function parseAuthorizedFactoryIds(userOrValue) {
  const source =
    Array.isArray(userOrValue?.authorizedFactoryIdList)
      ? userOrValue.authorizedFactoryIdList
      : userOrValue?.authorizedFactoryIds ?? userOrValue

  if (Array.isArray(source)) {
    return source
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0)
  }

  return String(source || '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value) && value > 0)
}

export function canAccessFactory(user, factoryId) {
  if (isAdminRole(user?.role)) return true
  if (!isProcessorRole(user?.role)) return false

  const normalizedFactoryId = Number(factoryId)
  if (!Number.isInteger(normalizedFactoryId) || normalizedFactoryId <= 0) return false

  return parseAuthorizedFactoryIds(user).includes(normalizedFactoryId)
}

export function filterTicketsByAccess(tickets, user) {
  if (!Array.isArray(tickets)) return []
  if (isAdminRole(user?.role)) return tickets
  if (isRequesterRole(user?.role)) {
    const userId = Number(user?.id)
    if (!Number.isInteger(userId) || userId <= 0) return []

    return tickets.filter((ticket) => Number(ticket?.requestedBy) === userId)
  }
  if (!isProcessorRole(user?.role)) return []

  return tickets.filter((ticket) => canAccessFactory(user, ticket?.factoryId))
}
