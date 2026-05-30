'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { useAuthStore } from '@/store/auth.store'
import { useProfile } from '@/hooks/useProfile'
import { Logo } from '@/components/shared/Logo'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token, clearAuth } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !token) {
      router.replace('/login')
    }
  }, [mounted, token, router])

  const { data: profile, isLoading: profileLoading } = useProfile()

  if (!mounted || !token) return null

  if (!profileLoading && profile && !profile.enabled) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4" style={{ background: 'var(--bone)' }}>
        <div className="text-center max-w-sm w-full px-8 py-10 rounded-2xl" style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}>
          <div className="flex justify-center mb-6">
            <Logo size="md" href="/" />
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--clay-light)' }}>
            <Clock size={22} style={{ color: 'var(--clay)' }} />
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--ink)', fontFamily: 'var(--font-spectral)' }}>
            Аккаунт ожидает подтверждения
          </h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--ink-soft)' }}>
            Администратор скоро рассмотрит вашу заявку. Как только вас подтвердят — вы сможете начать работу.
          </p>
          <button
            onClick={() => {
              clearAuth()
              router.push('/login')
            }}
            className="text-sm font-medium underline underline-offset-2"
            style={{ color: 'var(--clay)' }}
          >
            Выйти из аккаунта
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bone)' }}>
      <Sidebar />
      <main className="flex-1 lg:pl-64 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  )
}
