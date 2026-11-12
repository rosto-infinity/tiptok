import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retryCsrf?: boolean
}

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8006'

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

let csrfRefreshPromise: Promise<void> | null = null

const refreshCsrfCookie = async (): Promise<void> => {
  if (!csrfRefreshPromise) {
    csrfRefreshPromise = axios
      .get(`${baseURL}/sanctum/csrf-cookie`, {
        withCredentials: true,
        withXSRFToken: true,
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
      .then(() => undefined)
      .finally(() => {
        csrfRefreshPromise = null
      })
  }

  return csrfRefreshPromise
}

// Inject Bearer token from localStorage if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('tiptok_token')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 419 CSRF retry and 401 global responses
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined

    if (error.response?.status === 419 && originalRequest && !originalRequest._retryCsrf) {
      originalRequest._retryCsrf = true
      await refreshCsrfCookie()
      return apiClient(originalRequest)
    }

    if (error.response?.status === 401) {
      const isAuthRoute =
        window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register') ||
        window.location.pathname.startsWith('/two-factor-challenge')

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
