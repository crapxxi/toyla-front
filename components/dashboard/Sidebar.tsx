'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Settings, LogOut, Menu, X, ShieldCheck, Crown } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { useLangStore } from '@/store/lang.store'
import { useProfile } from '@/hooks/useProfile'
import { useAdminUsers } from '@/hooks/useAdmin'
import { Logo } from '@/components/shared/Logo'
import i18n from '@/lib/i18n'
import { cn } from '@/lib/utils'

function formatPhoneDisplay(phone: string | null): string {
  if (!phone) return 'Профиль'
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 11) {
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
  }
  return `+${digits}`
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { phoneNumber, clearAuth } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { lang, setLang } = useLangStore()
  const t = i18n[lang]
  const { data: profile } = useProfile()
  const isAdmin = profile?.role === 'ADMIN'

  const { data: adminUsers } = useAdminUsers()
  const pendingCount = isAdmin ? (adminUsers?.filter((u) => !u.enabled).length ?? 0) : 0

  const handleLogout = async () => {
    await fetch('/internal/logout', { method: 'POST' })
    clearAuth()
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', label: t.home, icon: LayoutDashboard },
    { href: '/pricing', label: t.pricingNav, icon: Crown },
    { href: '/settings', label: t.settings, icon: Settings },
    ...(isAdmin
      ? [{ href: '/admin/users', label: t.users, icon: ShieldCheck, badge: pendingCount }]
      : []),
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: 'var(--paper)' }}>
      <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid var(--line)' }}>
        <Logo size="sm" href="/dashboard" />
        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="flex items-center gap-0.5 rounded-full px-1.5 py-1" style={{ background: 'var(--bone-2)', border: '1px solid var(--line)' }}>
            {(['kk', 'ru'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-full transition-all"
                style={lang === l
                  ? { background: 'var(--clay)', color: 'var(--paper)' }
                  : { color: 'var(--ink-soft)' }
                }
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            className="lg:hidden"
            style={{ color: 'var(--ink-soft)' }}
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150')}
              style={isActive
                ? { background: 'var(--clay-light)', color: 'var(--clay)' }
                : { color: 'var(--ink-soft)' }
              }
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bone-2)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
              }}
            >
              <Icon size={17} />
              <span className="flex-1">{item.label}</span>
              {'badge' in item && (item.badge ?? 0) > 0 && (
                <span className="min-w-[18px] h-[18px] rounded-full text-[10px] font-semibold flex items-center justify-center px-1"
                  style={{ background: 'var(--clay)', color: 'var(--paper)' }}>
                  {(item as { badge: number }).badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--line)' }}>
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{ background: 'var(--clay-light)', color: 'var(--clay)' }}>
            {phoneNumber?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{formatPhoneDisplay(phoneNumber)}</p>
            <p className="text-xs truncate" style={{ color: 'var(--ink-soft)' }}>
              {isAdmin ? t.adminRole : t.organizerRole}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
          style={{ color: 'var(--ink-soft)' }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = '#FEF2F2'
            el.style.color = '#DC2626'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement
            el.style.background = 'transparent'
            el.style.color = 'var(--ink-soft)'
          }}
        >
          <LogOut size={17} />
          {t.logout}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-30"
        style={{ background: 'var(--paper)', borderRight: '1px solid var(--line)' }}>
        <SidebarContent />
      </aside>

      <button
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
        style={{ background: 'var(--paper)', border: '1px solid var(--line)', color: 'var(--ink)' }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {pendingCount > 0 ? (
          <div className="relative">
            <Menu size={20} />
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center"
              style={{ background: 'var(--clay)', color: 'var(--paper)' }}>
              {pendingCount}
            </span>
          </div>
        ) : (
          <Menu size={20} />
        )}
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 z-50 shadow-xl"
              style={{ background: 'var(--paper)' }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
