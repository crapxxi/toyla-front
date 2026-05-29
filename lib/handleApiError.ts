import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth.store'

async function logout401() {
  useAuthStore.getState().clearAuth()
  try {
    await fetch('/internal/logout', { method: 'POST' })
  } catch {
    // ignore
  }
  window.location.href = '/login'
}

export function handleApiError(err: unknown) {
  if (!axios.isAxiosError(err)) return
  const { status, data, headers } = err.response ?? {}

  if (status === 401) {
    logout401()
    return
  }
  if (status === 403) { toast.error('Доступ запрещён'); return }
  if (status === 404) { toast.error('Не найдено'); return }
  if (status === 409) { toast.error(data?.error ?? 'Конфликт'); return }
  if (status === 429) {
    toast.error(`Лимит. Повторите через ${headers?.['retry-after'] ?? 60}с`)
    return
  }
  if (data?.errors) {
    Object.values(data.errors).forEach((m) => toast.error(m as string))
    return
  }
  toast.error(data?.error ?? 'Что-то пошло не так')
}
