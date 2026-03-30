import { createContext, useContext, useMemo, useState } from 'react'
const AuthContext = createContext(null)
const AUTH_STORAGE_KEY = 'itservice_auth_user'

function getStoredUser() {
  try {
    const rawUser = window.localStorage.getItem(AUTH_STORAGE_KEY)
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
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser))
        setUser(authUser)
      },
      logout() {
        window.localStorage.removeItem(AUTH_STORAGE_KEY)
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
