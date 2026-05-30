import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { handleApiError } from '@/lib/handleApiError'
import { AdminUserResponse, Role, queryKeys } from '@/types'
import { useLangStore } from '@/store/lang.store'
import i18n from '@/lib/i18n'

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
  const { lang } = useLangStore()
  return useMutation({
    mutationFn: async (userId: number) => {
      const { data } = await api.patch<AdminUserResponse>(`/api/v1/admin/users/${userId}/enable`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() })
      toast.success(i18n[lang].userApproved)
    },
    onError: (err) => handleApiError(err),
  })
}

export function useDisableUser() {
  const queryClient = useQueryClient()
  const { lang } = useLangStore()
  return useMutation({
    mutationFn: async (userId: number) => {
      const { data } = await api.patch<AdminUserResponse>(`/api/v1/admin/users/${userId}/disable`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() })
      toast.success(i18n[lang].accessBlocked)
    },
    onError: (err) => handleApiError(err),
  })
}

export function useSetRole() {
  const queryClient = useQueryClient()
  const { lang } = useLangStore()
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: Role }) => {
      const { data } = await api.patch<AdminUserResponse>(`/api/v1/admin/users/${userId}/role`, null, {
        params: { role },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() })
      toast.success(i18n[lang].roleUpdated)
    },
    onError: (err) => handleApiError(err),
  })
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient()
  const { lang } = useLangStore()
  return useMutation({
    mutationFn: async (userId: number) => {
      await api.delete(`/api/v1/admin/users/${userId}`)
      return userId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers() })
      toast.success(i18n[lang].userDeleted)
    },
    onError: (err) => handleApiError(err),
  })
}
