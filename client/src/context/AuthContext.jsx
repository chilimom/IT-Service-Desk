import { createContext, useContext, useMemo, useState } from 'react'
const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'itservice_auth_user'

function getStoredUser() {
  try {
    const rawUser = window.sessionStorage.getItem(AUTH_STORAGE_KEY)
    return rawUser ? JSON.parse(rawUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())

  const value = useMemo(() => {
    return {
      user,
      isAuthenticated: Boolean(user),
      login(authUser) {
        window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser))
        setUser(authUser)
      },
      logout() {
        window.sessionStorage.removeItem(AUTH_STORAGE_KEY)
        setUser(null)
      },
    }
  }, [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
