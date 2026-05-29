import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth.store'

export function handleApiError(err: unknown, fallback = 'Что-то пошло не так') {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const data = err.response?.data

    if (status === 401) {
      useAuthStore.getState().clearAuth()
      return
    }
    if (status === 403) {
      toast.error('Доступ запрещён')
      return
    }
    if (status === 404) {
      toast.error('Не найдено')
      return
    }
    if (status === 409) {
      toast.error(data?.error ?? 'Конфликт')
      return
    }
    if (status === 429) {
      const retryAfter = err.response?.headers['retry-after'] ?? 60
      toast.error(`Лимит запросов. Повторите через ${retryAfter}с`)
      return
    }
    if (data?.errors) {
      Object.values(data.errors).forEach((msg) => toast.error(msg as string))
      return
    }
    toast.error(data?.error ?? fallback)
  }
}
