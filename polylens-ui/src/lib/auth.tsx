import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api, setAuthToken, isAuthenticated } from './api'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, name: string, password: string) => Promise<void>
  logout: () => void
  demoLogin: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated()) {
      api.auth.me()
        .then(setUser)
        .catch(() => setAuthToken(null))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.auth.login(email, password)
    setAuthToken(result.token)
    setUser(result.user)
  }, [])

  const register = useCallback(async (email: string, name: string, password: string) => {
    const result = await api.auth.register(email, name, password)
    setAuthToken(result.token)
    setUser(result.user)
  }, [])

  const logout = useCallback(() => {
    setAuthToken(null)
    setUser(null)
  }, [])

  const demoLogin = useCallback(() => {
    setUser({ id: 'demo', email: 'demo@polylens.ai', name: 'Demo User', role: 'analyst' })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
