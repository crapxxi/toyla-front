'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { useAuthStore } from '@/store/auth.store'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { token } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !token) {
      router.replace('/login')
    }
  }, [mounted, token, router])

  if (!mounted || !token) return null

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
