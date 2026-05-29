'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Users, MapPin, Calendar, ChevronRight, Trash2,
  Copy, ExternalLink, Settings, LayoutGrid,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useGetToy, useDeleteToy } from '@/hooks/useToys'
import { useGetGuests } from '@/hooks/useGuests'
import { useAuthStore } from '@/store/auth.store'
import { formatEventDate, isPastEvent, daysUntilDelete } from '@/lib/formatters'
import toast from 'react-hot-toast'

const TEMPLATE_LABELS: Record<string, string> = {
  ELEGANT: 'Элегантный', FESTIVE: 'Праздничный', MINIMALIST: 'Минималистичный',
  ROMANTIC: 'Романтичный', MODERN: 'Современный',
}

export default function EventPage() {
  const { toyId } = useParams<{ toyId: string }>()
  const router = useRouter()
  const { userId } = useAuthStore()
  const { data: toy, isLoading } = useGetToy(toyId)
  const { data: guests } = useGetGuests(toyId)
  const deleteToy = useDeleteToy(userId ?? 0)
  const [showDelete, setShowDelete] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (!toy) return <div className="text-center py-12 text-gray-500">Мероприятие не найдено</div>

  const past = isPastEvent(toy.eventDate)
  const daysLeft = past ? daysUntilDelete(toy.eventDate) : null
  const accepted = guests?.filter((g) => g.status === 'ACCEPTED').length ?? 0
  const declined = guests?.filter((g) => g.status === 'DECLINED').length ?? 0
  const pending = guests?.filter((g) => g.status === 'PENDING').length ?? 0
  const total = guests?.length ?? 0
  const eventUrl = `https://toyla.app/${userId}/${toy.id}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl)
    toast.success('Ссылка скопирована')
  }

  const handleDelete = async () => {
    await deleteToy.mutateAsync(toy.id)
    setShowDelete(false)
    router.push('/dashboard')
  }

  const navCards = [
    { href: `/events/${toyId}/guests`, icon: Users, label: 'Гости', value: `${total}`, color: 'text-violet-600 bg-violet-50' },
    { href: `/events/${toyId}/seating`, icon: LayoutGrid, label: 'Рассадка', value: '', color: 'text-blue-600 bg-blue-50' },
    { href: `/events/${toyId}/template`, icon: Settings, label: 'Шаблон', value: TEMPLATE_LABELS[toy.templateId], color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600">Главная</Link>
            <span className="text-xs text-gray-300">/</span>
            <span className="text-xs text-gray-600 truncate max-w-[200px]">{toy.title}</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 leading-tight">{toy.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">{TEMPLATE_LABELS[toy.templateId]}</Badge>
            {past && <Badge className="text-xs bg-gray-100 text-gray-600">Прошедшее</Badge>}
            {past && daysLeft !== null && daysLeft <= 7 && (
              <Badge className={`text-xs ${daysLeft <= 2 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                Удаление через {daysLeft} дн.
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Copy size={14} />
            <span className="hidden sm:block">Ссылка</span>
          </button>
          <a
            href={eventUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:block">Открыть</span>
          </a>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-100 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
              <Calendar size={16} className="text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Дата</p>
              <p className="text-sm font-medium text-gray-900">{formatEventDate(toy.eventDate)}</p>
            </div>
          </div>
          {toy.locationName && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <MapPin size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Место</p>
                {toy.gisLink ? (
                  <a href={toy.gisLink} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 underline underline-offset-2">
                    {toy.locationName}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-gray-900">{toy.locationName}</p>
                )}
              </div>
            </div>
          )}
        </div>
        {toy.description && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-sm text-gray-600 leading-relaxed">{toy.description}</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Всего гостей', value: total, color: 'text-gray-900' },
          { label: 'Приняли', value: accepted, color: 'text-green-600' },
          { label: 'Отказали', value: declined, color: 'text-red-500' },
          { label: 'Ожидают', value: pending, color: 'text-amber-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Navigation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {navCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900">{card.label}</div>
                <div className="text-xs text-gray-400">{card.value}</div>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </Link>
          )
        })}
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Удалить мероприятие?"
        description="Это действие необратимо. Все данные о гостях и рассадке будут удалены."
        confirmLabel="Удалить"
        onConfirm={handleDelete}
        loading={deleteToy.isPending}
      />
    </div>
  )
}
