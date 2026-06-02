import api from './api'
import { User, Role } from '../types'

interface LoginResponse {
  message: string
  user: User
  accessToken: string
  refreshToken: string
}

interface RegisterData {
  email: string
  password: string
  nom: string
  prenom: string
  role?: Role
}

export const authService = {
  // Connexion
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', { email, password })
    return response.data
  },

  // Inscription (admin uniquement)
  async register(data: RegisterData): Promise<{ message: string; user: User }> {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  // Obtenir le profil
  async getMe(): Promise<{ user: User }> {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Rafraîchir le token
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data
  },

  // Changer son mot de passe
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword })
    return response.data
  },
}