import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'
import { useUpgradeStore } from '@/store/upgrade.store'

export const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

/** A 403 whose message mentions the tariff means a plan limit was hit. */
export const isTariffForbidden = (status?: number, message?: unknown) =>
  status === 403 && typeof message === 'string' && /тариф|tariff/i.test(message)

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isLoggingOut = false

async function logout401() {
  if (isLoggingOut) return
  isLoggingOut = true
  try {
    useAuthStore.getState().clearAuth()
    await fetch('/internal/logout', { method: 'POST' })
  } catch {
    // ignore
  } finally {
    window.location.href = '/login'
  }
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    if (status === 401 && typeof window !== 'undefined') {
      logout401()
      return new Promise(() => {})
    }
    // Even with UI gating, the backend is the source of truth — surface the
    // upgrade modal whenever it rejects an action because of the tariff.
    if (typeof window !== 'undefined' && isTariffForbidden(status, err.response?.data?.error)) {
      useUpgradeStore.getState().openUpgrade(err.response.data.error)
    }
    return Promise.reject(err)
  }
)
