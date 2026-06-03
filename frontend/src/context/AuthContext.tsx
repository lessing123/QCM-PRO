import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types'
import { authService } from '../services/authService'
import { connectSocket, disconnectSocket, getSocket } from '../services/socketService'
import api from '../services/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  refreshUser: () => Promise<void>
  changePassword: (currentPassword: string | null, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token      = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      const u = JSON.parse(storedUser) as User
      setUser(u)
      connectSocket(token)
    }
    setIsLoading(false)
  }, [])

  // Déconnexion forcée si une autre session ouvre le même compte étudiant
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const handler = () => {
      disconnectSocket()
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      setUser(null)
      window.location.href = '/login?reason=session_expired'
    }
    socket.on('session:invalidated', handler)
    return () => { socket.off('session:invalidated', handler) }
  })

  const login = async (email: string, password: string): Promise<User> => {
    const response = await authService.login(email, password)
    localStorage.setItem('accessToken',  response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    localStorage.setItem('user',         JSON.stringify(response.user))
    setUser(response.user)
    connectSocket(response.accessToken)
    return response.user
  }

  const logout = () => {
    disconnectSocket()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    sessionStorage.removeItem('_qk')
    window.dispatchEvent(new Event('auth:logout'))
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const response = await authService.getMe()
      setUser(response.user)
      localStorage.setItem('user', JSON.stringify(response.user))
    } catch {
      logout()
    }
  }

  const changePassword = async (currentPassword: string | null, newPassword: string) => {
    await api.post('/auth/change-password', { currentPassword, newPassword })
    // Mettre à jour le user local pour enlever must_change_password
    const updated = { ...user!, must_change_password: false }
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
