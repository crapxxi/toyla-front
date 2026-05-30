import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { UserResponse } from '@/types'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<UserResponse>('/api/v1/profile')
      return data
    },
  })
}
