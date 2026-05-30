import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { handleApiError } from '@/lib/handleApiError'
import { ToyResponse, ToyRequest, TemplateSettings, ToyImageResponse, queryKeys } from '@/types'

export function useGetToys(organizerId: number) {
  return useQuery({
    queryKey: queryKeys.toys(organizerId),
    queryFn: async () => {
      const { data } = await api.get<ToyResponse[]>('/api/v1/toys', { params: { organizerId } })
      return data
    },
    enabled: organizerId > 0,
  })
}

export function useGetToy(toyId: string) {
  return useQuery({
    queryKey: queryKeys.toy(toyId),
    queryFn: async () => {
      const { data } = await api.get<ToyResponse>(`/api/v1/toys/${toyId}`)
      return data
    },
    enabled: !!toyId,
  })
}

export function useCreateToy(organizerId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ToyRequest) => {
      const { data } = await api.post<ToyResponse>('/api/v1/toys', payload, { params: { organizerId } })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.toys(organizerId) })
      toast.success('Мероприятие создано')
    },
    onError: (err) => handleApiError(err),
  })
}

export function useUpdateToy(toyId: string, organizerId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<ToyRequest>) => {
      const { data } = await api.put<ToyResponse>(`/api/v1/toys/${toyId}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.toy(toyId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.toys(organizerId) })
      toast.success('Мероприятие обновлено')
    },
    onError: (err) => handleApiError(err),
  })
}

export function useDeleteToy(organizerId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (toyId: string) => {
      await api.delete(`/api/v1/toys/${toyId}`)
      return toyId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.toys(organizerId) })
      toast.success('Мероприятие удалено')
    },
    onError: (err) => handleApiError(err),
  })
}

export function usePatchTemplate(toyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (settings: Partial<TemplateSettings>) => {
      const { data } = await api.patch<ToyResponse>(`/api/v1/toys/${toyId}/template`, settings)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.toy(toyId) })
      toast.success('Шаблон сохранён')
    },
    onError: (err) => handleApiError(err),
  })
}

export function useUploadMusic(toyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post<string>(`/api/v1/toys/${toyId}/music`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.toy(toyId) })
      toast.success('Музыка загружена')
    },
    onError: (err) => handleApiError(err),
  })
}

export function useDeleteMusic(toyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await api.delete(`/api/v1/toys/${toyId}/music`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.toy(toyId) })
      toast.success('Музыка удалена')
    },
    onError: (err) => handleApiError(err),
  })
}

export function useUploadImage(toyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post<ToyImageResponse>(`/api/v1/toys/${toyId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.toy(toyId) })
      toast.success('Изображение загружено')
    },
    onError: (err) => handleApiError(err),
  })
}

export function useDeleteImage(toyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (imageId: number) => {
      await api.delete(`/api/v1/toys/${toyId}/images/${imageId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.toy(toyId) })
      toast.success('Изображение удалено')
    },
    onError: (err) => handleApiError(err),
  })
}
