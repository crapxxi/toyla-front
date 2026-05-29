import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserRole } from '@/types'

interface AuthStore {
  token: string | null
  user: { username: string; role: UserRole; id: number } | null
  setAuth: (token: string, username: string, role: UserRole, id?: number) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, username, role, id = 0) =>
        set({ token, user: { username, role, id } }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    {
      name: 'toyla-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
)
