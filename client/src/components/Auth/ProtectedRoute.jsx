import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import path from '../../ultils/path'

function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={path.LOGIN} replace />
  }

  if (allowedRoles && !allowedRoles.includes((user?.role || '').toLowerCase())) {
    const fallbackPath =
      (user?.role || '').toLowerCase() === 'admin'
        ? `/${path.ADMIN}/${path.ADMIN_DASHBOARD}`
        : `/${path.USER}/${path.USER_TICKETS}/${path.USER_TICKETS_CREATE}`

    return <Navigate to={fallbackPath} replace />
  }

  return children
}

export default ProtectedRoute
