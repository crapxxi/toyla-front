import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { handleApiError } from '@/lib/handleApiError'
import { GuestResponse, GuestRequest, queryKeys } from '@/types'
import { useLangStore } from '@/store/lang.store'
import i18n from '@/lib/i18n'

export function useGetGuests(toyId: string) {
  return useQuery({
    queryKey: queryKeys.guests(toyId),
    queryFn: async () => {
      const { data } = await api.get<GuestResponse[]>(`/api/v1/toys/${toyId}/guests`)
      return data
    },
    enabled: !!toyId,
  })
}

export function useAddGuest(toyId: string) {
  const queryClient = useQueryClient()
  const { lang } = useLangStore()
  return useMutation({
    mutationFn: async (payload: GuestRequest) => {
      const { data } = await api.post<GuestResponse>(`/api/v1/toys/${toyId}/guests`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests(toyId) })
      toast.success(i18n[lang].guestAdded)
    },
    onError: (err) => handleApiError(err),
  })
}

export function useUpdateGuest(toyId: string) {
  const queryClient = useQueryClient()
  const { lang } = useLangStore()
  return useMutation({
    mutationFn: async ({ guestId, payload }: { guestId: number; payload: Partial<GuestRequest> }) => {
      const { data } = await api.put<GuestResponse>(`/api/v1/guests/${guestId}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests(toyId) })
      toast.success(i18n[lang].guestUpdated)
    },
    onError: (err) => handleApiError(err),
  })
}

export function useDeleteGuest(toyId: string) {
  const queryClient = useQueryClient()
  const { lang } = useLangStore()
  return useMutation({
    mutationFn: async (guestId: number) => {
      await api.delete(`/api/v1/guests/${guestId}`)
      return guestId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.guests(toyId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.tables(toyId) })
      toast.success(i18n[lang].guestDeleted)
    },
    onError: (err) => handleApiError(err),
  })
}
