import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

export const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isLoggingOut = false

async function logout401() {
  if (isLoggingOut) return
  isLoggingOut = true
  useAuthStore.getState().clearAuth()
  try {
    await fetch('/internal/logout', { method: 'POST' })
  } catch {
    // ignore — cookie deletion is best-effort
  }
  window.location.href = '/login'
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      logout401()
      return new Promise(() => {})
    }
    return Promise.reject(err)
  }
)
