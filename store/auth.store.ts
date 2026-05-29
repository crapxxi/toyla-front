import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthResponse } from '@/types'

interface AuthStore {
  token: string | null
  userId: number | null
  phoneNumber: string | null
  setAuth: (res: AuthResponse) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      phoneNumber: null,
      setAuth: (res) =>
        set({ token: res.token, userId: res.id, phoneNumber: res.phoneNumber }),
      clearAuth: () => set({ token: null, userId: null, phoneNumber: null }),
    }),
    {
      name: 'toyla-auth',
      partialize: (state) => ({ token: state.token, userId: state.userId, phoneNumber: state.phoneNumber }),
    }
  )
)
