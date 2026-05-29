import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { handleApiError } from '@/lib/handleApiError'
import { GuestResponse, GuestRequest, RsvpStatus, queryKeys } from '@/types'

export function useGetGuests(toyId: string, status?: RsvpStatus) {
  return useQuery({
    queryKey: status ? queryKeys.guestsByStatus(toyId, status) : queryKeys.guests(toyId),
    queryFn: async () => {
      const params = status ? { status } : {}
      const { data } = await api.get<GuestResponse[]>(`/api/v1/toys/${toyId}/guests`, { params })
      return data
    },
    enabled: !!toyId,
  })
}

export function useAddGuest(toyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: GuestRequest) => {
      const { data } = await api.post<GuestResponse>(`/api/v1/toys/${toyId}/guests`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests(toyId) })
      toast.success('Гость добавлен')
    },
    onError: (err) => handleApiError(err),
  })
}

export function useUpdateGuest(toyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ guestId, payload }: { guestId: number; payload: Partial<GuestRequest> }) => {
      const { data } = await api.put<GuestResponse>(`/api/v1/guests/${guestId}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests(toyId) })
      toast.success('Гость обновлён')
    },
    onError: (err) => handleApiError(err),
  })
}

export function useDeleteGuest(toyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (guestId: number) => {
      await api.delete(`/api/v1/guests/${guestId}`)
      return guestId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests(toyId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tables(toyId) })
      toast.success('Гость удалён')
    },
    onError: (err) => handleApiError(err),
  })
}
