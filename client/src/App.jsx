import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import AdminTickets from './pages/AdminTickets'
import AccountProfile from './pages/AccountProfile'
import CreateTicket from './pages/CreateTicket'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import MyRequests from './pages/MyRequests'
import TicketDetails from './pages/TicketDetails'
import UserManagement from './pages/UserManagement'
import Layout from './styles/Layout'
import { isAdminRole, isProcessorRole } from './ultils/auth'
import path from './ultils/path'

function RootRedirect() {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={path.LOGIN} replace />
  }

  if (isAdminRole(user?.role) || isProcessorRole(user?.role)) {
    return <Navigate to={`/${path.ADMIN}/${path.ADMIN_DASHBOARD}`} replace />
  }

  return <Navigate to={`/${path.USER}/${path.USER_TICKETS}/${path.USER_TICKETS_DASHBOARD}`} replace />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={path.ROOT} element={<RootRedirect />} />
        <Route path={path.LOGIN} element={<Login />} />

        <Route
          path={path.USER}
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={`${path.USER_TICKETS}/${path.USER_TICKETS_DASHBOARD}`} replace />} />
          <Route path={path.ACCOUNT_PROFILE} element={<AccountProfile />} />
          <Route path={path.USER_TICKETS}>
            <Route index element={<Navigate to={path.USER_TICKETS_DASHBOARD} replace />} />
            <Route path={path.USER_TICKETS_DASHBOARD} element={<Dashboard />} />
            <Route path={path.USER_TICKETS_CREATE} element={<CreateTicket />} />
            <Route path={path.USER_TICKETS_REQUESTS} element={<MyRequests />} />
            <Route path={path.USER_TICKETS_REQUEST_DETAIL} element={<TicketDetails />} />
          </Route>
        </Route>

        <Route
          path={path.ADMIN}
          element={
            <ProtectedRoute allowedRoles={['admin', 'processor']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={path.ADMIN_DASHBOARD} replace />} />
          <Route path={path.ACCOUNT_PROFILE} element={<AccountProfile />} />
          <Route path={path.ADMIN_DASHBOARD} element={<Dashboard />} />
          <Route path={path.ADMIN_TICKETS} element={<AdminTickets />} />
          <Route
            path={path.ADMIN_USERS}
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route path={path.ADMIN_TICKET_DETAIL} element={<TicketDetails />} />
        </Route>

        <Route path="*" element={<Navigate to={path.ROOT} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
