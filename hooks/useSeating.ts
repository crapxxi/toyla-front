import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { handleApiError } from '@/lib/handleApiError'
import { SeatingTable, queryKeys } from '@/types'

export function useGetTables(toyId: string) {
  return useQuery({
    queryKey: queryKeys.tables(toyId),
    queryFn: async () => {
      const { data } = await api.get<SeatingTable[]>(`/api/v1/toys/${toyId}/tables`)
      return data
    },
    enabled: !!toyId,
  })
}

export function useCreateTable(toyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { name: string; capacity: number }) => {
      const { data } = await api.post<SeatingTable>(`/api/v1/toys/${toyId}/tables`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables(toyId) })
      toast.success('Стол создан')
    },
    onError: (err) => handleApiError(err),
  })
}

export function useAssignGuest(toyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ tableId, guestId }: { tableId: number; guestId: number }) => {
      await api.post(`/api/v1/tables/${tableId}/guests/${guestId}`)
    },
    onMutate: async ({ tableId, guestId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tables(toyId) })
      const previous = queryClient.getQueryData<SeatingTable[]>(queryKeys.tables(toyId))
      if (previous) {
        const guest = previous.flatMap((t) => t.guests).find((g) => g.id === guestId)
        const updated = previous.map((table) => {
          const withoutGuest = table.guests.filter((g) => g.id !== guestId)
          if (table.id === tableId && guest) {
            return { ...table, guests: [...withoutGuest, { ...guest, seatingTable: table }] }
          }
          return { ...table, guests: withoutGuest }
        })
        queryClient.setQueryData(queryKeys.tables(toyId), updated)
      }
      return { previous }
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.tables(toyId), context.previous)
      }
      handleApiError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables(toyId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.guests(toyId) })
    },
  })
}

export function useRemoveGuest(toyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ tableId, guestId }: { tableId: number; guestId: number }) => {
      await api.delete(`/api/v1/tables/${tableId}/guests/${guestId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables(toyId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.guests(toyId) })
      toast.success('Гость откреплён')
    },
    onError: (err) => handleApiError(err),
  })
}

export function useDeleteTable(toyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (tableId: number) => {
      await api.delete(`/api/v1/tables/${tableId}`)
      return tableId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tables(toyId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.guests(toyId) })
      toast.success('Стол удалён')
    },
    onError: (err) => handleApiError(err),
  })
}
