'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { EventCard } from '@/components/dashboard/EventCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { useGetToys } from '@/hooks/useToys'
import { useGetGuests } from '@/hooks/useGuests'
import { useAuthStore } from '@/store/auth.store'
import { ToyResponse } from '@/types'

function EventCardWithStats({ toy }: { toy: ToyResponse }) {
  const { data: guests } = useGetGuests(toy.id)
  const stats = guests
    ? {
        total: guests.length,
        accepted: guests.filter((g) => g.status === 'ACCEPTED').length,
        declined: guests.filter((g) => g.status === 'DECLINED').length,
        pending: guests.filter((g) => g.status === 'PENDING').length,
      }
    : undefined
  return <EventCard toy={toy} guestStats={stats} />
}

export default function DashboardPage() {
  const { userId } = useAuthStore()
  const organizerId = userId ?? 0
  const { data: toys, isLoading } = useGetToys(organizerId)
  const [search, setSearch] = useState('')

  const filtered = (toys ?? []).filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.locationName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Мои мероприятия</h1>
          <p className="text-sm text-gray-500 mt-1">
            {toys ? `${toys.length} мероприятий` : 'Загрузка...'}
          </p>
        </div>
        <Link
          href="/events/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-violet-200"
        >
          <Plus size={16} />
          Создать мероприятие
        </Link>
      </div>

      {(toys?.length ?? 0) > 0 || isLoading ? (
        <div className="mb-6">
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border-gray-200"
            />
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3.5 w-36" />
              <Skeleton className="h-3.5 w-28" />
              <div className="pt-2 space-y-2">
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        search ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            По запросу «{search}» ничего не найдено
          </div>
        ) : (
          <EmptyState
            title="Нет мероприятий"
            description="Создайте своё первое мероприятие и начните приглашать гостей"
            action={{
              label: 'Создать мероприятие',
              onClick: () => (window.location.href = '/events/new'),
            }}
          />
        )
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((toy) => (
            <EventCardWithStats key={toy.id} toy={toy} />
          ))}
        </div>
      )}
    </div>
  )
}
