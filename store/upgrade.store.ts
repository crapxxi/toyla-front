import { create } from 'zustand'

interface UpgradeStore {
  open: boolean
  /** Optional message — usually the тариф-related error text from the backend. */
  message: string | null
  openUpgrade: (message?: string) => void
  closeUpgrade: () => void
}

export const useUpgradeStore = create<UpgradeStore>((set) => ({
  open: false,
  message: null,
  openUpgrade: (message) => set({ open: true, message: message ?? null }),
  closeUpgrade: () => set({ open: false, message: null }),
}))
