import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { handleApiError } from '@/lib/handleApiError'
import { AdminUserResponse, Role, queryKeys } from '@/types'

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.adminUsers(),
    queryFn: async () => {
      const { data } = await api.get<AdminUserResponse[]>('/api/v1/admin/users')
      return data
    },
  })
}

export function useEnableUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      const { data } = await api.patch<AdminUserResponse>(`/api/v1/admin/users/${userId}/enable`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() })
      toast.success('Пользователь одобрен')
    },
    onError: (err) => handleApiError(err),
  })
}

export function useDisableUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      const { data } = await api.patch<AdminUserResponse>(`/api/v1/admin/users/${userId}/disable`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() })
      toast.success('Доступ закрыт')
    },
    onError: (err) => handleApiError(err),
  })
}

export function useSetRole() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: Role }) => {
      const { data } = await api.patch<AdminUserResponse>(`/api/v1/admin/users/${userId}/role`, null, {
        params: { role },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() })
      toast.success('Роль обновлена')
    },
    onError: (err) => handleApiError(err),
  })
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: number) => {
      await api.delete(`/api/v1/admin/users/${userId}`)
      return userId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() })
      toast.success('Пользователь удалён')
    },
    onError: (err) => handleApiError(err),
  })
}
