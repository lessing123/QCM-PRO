import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Ajoute le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Gestion des erreurs 401 — déconnexion automatique si le token est invalide ou l'utilisateur introuvable
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status          = error.response?.status
    const message         = error.response?.data?.error ?? ''
    const isAuthRoute     = originalRequest.url?.includes('/auth/login') ||
                            originalRequest.url?.includes('/auth/refresh')

    // Token expiré → essayer le refresh
    if (status === 401 && message === 'Token expiré' && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
            { refreshToken }
          )
          localStorage.setItem('accessToken',  data.accessToken)
          localStorage.setItem('refreshToken', data.refreshToken)
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
          return api(originalRequest)
        }
      } catch {
        forceLogout()
      }
    }

    // Utilisateur introuvable dans la DB (ex: DB réinitialisée, token obsolète) → déconnexion forcée
    if (status === 401 && !isAuthRoute && !originalRequest._retry) {
      forceLogout()
    }

    return Promise.reject(error)
  }
)

function forceLogout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

export default api
