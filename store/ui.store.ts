import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  activeEventId: string | null
  setSidebarOpen: (open: boolean) => void
  setActiveEvent: (id: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  activeEventId: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveEvent: (id) => set({ activeEventId: id }),
}))
