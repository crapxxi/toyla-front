import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { handleApiError } from '@/lib/handleApiError'
import { NotificationLog, queryKeys } from '@/types'

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
  return useMutation({
    mutationFn: async () => {
      await api.post(`/api/v1/toys/${toyId}/notifications/send-invites`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.logs(toyId) })
      toast.success('Приглашения отправлены')
    },
    onError: (err) => handleApiError(err),
  })
}
