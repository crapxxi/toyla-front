import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth.store'
import { isTariffForbidden } from '@/lib/api'

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
  if (status === 403) {
    // Tariff-related 403s are handled by the global upgrade modal — don't double up.
    if (!isTariffForbidden(status, data?.error)) toast.error(data?.error ?? 'Доступ запрещён')
    return
  }
  if (status === 404) { toast.error('Не найдено'); return }
  if (status === 409) { toast.error(data?.error ?? 'Конфликт'); return }
  if (status === 429) {
    toast.error(`Лимит. Повторите через ${headers?.['retry-after'] ?? 60}с`)
    return
  }
  if (status === 413) { toast.error(data?.error ?? 'Файл слишком большой'); return }
  if (data?.errors) {
    Object.values(data.errors).forEach((m) => toast.error(m as string))
    return
  }
  toast.error(data?.error ?? 'Что-то пошло не так')
}
