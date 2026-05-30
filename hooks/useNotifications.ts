import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { handleApiError } from '@/lib/handleApiError'
import { NotificationLog, queryKeys } from '@/types'
import { useLangStore } from '@/store/lang.store'
import i18n from '@/lib/i18n'

export function useGetLogs(toyId: string) {
  return useQuery({
    queryKey: queryKeys.logs(toyId),
    queryFn: async () => {
      const { data } = await api.get<NotificationLog[]>(`/api/v1/toys/${toyId}/notifications`)
      return data
    },
    enabled: !!toyId,
  })
}

export function useSendInvites(toyId: string) {
  const queryClient = useQueryClient()
  const { lang } = useLangStore()
  return useMutation({
    mutationFn: () => api.post(`/api/v1/toys/${toyId}/notifications/invites`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logs(toyId) })
      toast.success(i18n[lang].invitesSent)
    },
    onError: (err) => handleApiError(err),
  })
}

export function useSendReminders(toyId: string) {
  const queryClient = useQueryClient()
  const { lang } = useLangStore()
  return useMutation({
    mutationFn: () => api.post(`/api/v1/toys/${toyId}/notifications/reminders`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logs(toyId) })
      toast.success(i18n[lang].remindersSent)
    },
    onError: (err) => handleApiError(err),
  })
}

export function useSendSeating(toyId: string) {
  const queryClient = useQueryClient()
  const { lang } = useLangStore()
  return useMutation({
    mutationFn: () => api.post(`/api/v1/toys/${toyId}/notifications/seating`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logs(toyId) })
      toast.success(i18n[lang].seatingSent)
    },
    onError: (err) => handleApiError(err),
  })
}
