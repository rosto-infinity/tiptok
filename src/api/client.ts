import axios, { type AxiosInstance, type AxiosError } from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8006'

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// Inject Bearer token from localStorage if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('tiptok_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 global responses
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const isAuthRoute =
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register')

      if (!isAuthRoute) {
        localStorage.removeItem('tiptok_token')
        localStorage.removeItem('tiptok_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default apiClient
