import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Lang = 'kk' | 'ru'

interface LangStore {
  lang: Lang
  setLang: (lang: Lang) => void
}

export const useLangStore = create<LangStore>()(
  persist(
    (set) => ({
      lang: 'kk',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'toyla-lang' }
  )
)
