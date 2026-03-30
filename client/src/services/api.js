const LOCAL_API_ORIGIN = 'http://127.0.0.1:5016'
const LOCALHOST_API_ORIGIN = 'http://localhost:5016'
const IIS_API_PORT = '5016'

function getDefaultApiOrigin() {
  if (typeof window === 'undefined') {
    return LOCAL_API_ORIGIN
  }

  const { hostname, protocol } = window.location

  if (hostname === '127.0.0.1') {
    return LOCAL_API_ORIGIN
  }

  if (hostname === 'localhost') {
    return LOCALHOST_API_ORIGIN
  }

  return `${protocol}//${hostname}:${IIS_API_PORT}`
}

export const API_ORIGIN =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URI ||
  getDefaultApiOrigin()

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_ORIGIN}${normalizedPath}`
}
