'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { EventCard } from '@/components/dashboard/EventCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { TariffWidget } from '@/components/dashboard/TariffWidget'
import { useGetToys } from '@/hooks/useToys'
import { useGetGuests } from '@/hooks/useGuests'
import { useTariffGate } from '@/hooks/useTariff'
import { useAuthStore } from '@/store/auth.store'
import { useLangStore } from '@/store/lang.store'
import { useUpgradeStore } from '@/store/upgrade.store'
import { ToyResponse } from '@/types'
import i18n from '@/lib/i18n'

function EventCardWithStats({ toy }: { toy: ToyResponse }) {
  const { data: guests } = useGetGuests(toy.id)
  const stats = guests
    ? { total: guests.length, partyTotal: guests.reduce((s, g) => s + g.partySize, 0) }
    : undefined
  return <EventCard toy={toy} guestStats={stats} />
}

export default function DashboardPage() {
  const { userId } = useAuthStore()
  const { lang } = useLangStore()
  const t = i18n[lang]
  const { data: toys, isLoading } = useGetToys(userId ?? 0)
  const { eventsReached } = useTariffGate()
  const openUpgrade = useUpgradeStore((s) => s.openUpgrade)
  const [search, setSearch] = useState('')

  const filtered = (toys ?? []).filter(
    (toy) =>
      toy.title.toLowerCase().includes(search.toLowerCase()) ||
      toy.locationName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--ink)' }}>{t.myEvents}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
            {toys ? t.eventsCount(toys.length) : t.loading}
          </p>
        </div>
        {eventsReached ? (
          <button
            onClick={() => openUpgrade(t.limitEventsReached)}
            title={t.limitEventsReached}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl shadow-sm opacity-60 cursor-not-allowed"
            style={{ background: 'var(--clay)' }}
          >
            <Plus size={16} />
            {t.createEvent}
          </button>
        ) : (
          <Link
            href="/events/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            style={{ background: 'var(--clay)' }}
          >
            <Plus size={16} />
            {t.createEvent}
          </Link>
        )}
      </div>

      <TariffWidget />

      {(toys?.length ?? 0) > 0 || isLoading ? (
        <div className="mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <Input
              placeholder={t.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-11 text-base md:text-base rounded-xl"
            />
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] p-5 space-y-3">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3.5 w-28" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        search ? (
          <div className="text-center py-12 text-gray-500 text-sm">{t.noResultsFor(search)}</div>
        ) : (
          <EmptyState
            title={t.noEvents}
            description={t.noEventsDesc}
            action={{ label: t.createEvent, onClick: () => (window.location.href = '/events/new') }}
          />
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((toy) => <EventCardWithStats key={toy.id} toy={toy} />)}
        </div>
      )}
    </div>
  )
}
