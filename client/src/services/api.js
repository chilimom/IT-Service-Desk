const LOCAL_API_ORIGIN = 'http://localhost:5017'
const IIS_API_ORIGIN = 'http://10.192.72.45:5015'

function getDefaultApiOrigin() {
  if (typeof window !== 'undefined' && window.location.hostname === '10.192.72.45') {
    return IIS_API_ORIGIN
  }

  return LOCAL_API_ORIGIN
}

export const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || getDefaultApiOrigin()

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_ORIGIN}${normalizedPath}`
}
