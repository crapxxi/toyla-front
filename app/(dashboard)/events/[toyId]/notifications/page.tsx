'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Bell, Send } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { useGetLogs, useSendInvites } from '@/hooks/useNotifications'
import { DeliveryStatus, NotificationType, NotificationLog, statusColors } from '@/types'
import { notificationTypeLabel, deliveryStatusLabel, formatDateShort } from '@/lib/formatters'

const FILTER_TYPES: { value: NotificationType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Все' },
  { value: 'INITIAL_INVITE', label: 'Приглашения' },
  { value: 'REMINDER_24H', label: 'Напоминания' },
  { value: 'MORNING_SEATING', label: 'Рассадка' },
]

const FILTER_STATUSES: { value: DeliveryStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Все статусы' },
  { value: 'DELIVERED', label: 'Доставлено' },
  { value: 'FAILED', label: 'Не доставлено' },
  { value: 'PENDING', label: 'Ожидает' },
  { value: 'ERROR', label: 'Ошибка' },
]

function LogItem({ log }: { log: NotificationLog }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-[#FBF5F1] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bell size={15} className="text-[#A8492A]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-900">
            {notificationTypeLabel(log.type)}
          </p>
          <Badge className={`text-xs ${statusColors[log.deliveryStatus]}`}>
            {deliveryStatusLabel(log.deliveryStatus)}
          </Badge>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{formatDateShort(log.sentAt)}</p>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const { toyId } = useParams<{ toyId: string }>()
  const { data: logs, isLoading } = useGetLogs(toyId)
  const sendInvites = useSendInvites(toyId)
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'ALL'>('ALL')

  const filtered = (logs ?? []).filter((log) => {
    const matchType = typeFilter === 'ALL' || log.type === typeFilter
    const matchStatus = statusFilter === 'ALL' || log.deliveryStatus === statusFilter
    return matchType && matchStatus
  })

  const stats = (logs ?? []).reduce(
    (acc, log) => {
      acc[log.deliveryStatus] = (acc[log.deliveryStatus] ?? 0) + 1
      return acc
    },
    {} as Record<DeliveryStatus, number>
  )

  const handleSend = async () => {
    await sendInvites.mutateAsync()
    setShowSendConfirm(false)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/events/${toyId}`}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Уведомления</h1>
          <p className="text-xs text-gray-500">{logs?.length ?? 0} записей</p>
        </div>
        <Button
          onClick={() => setShowSendConfirm(true)}
          className="bg-[#A8492A] hover:bg-[#8A3A20] rounded-xl gap-2 text-sm"
        >
          <Send size={15} />
          <span className="hidden sm:block">Отправить приглашения</span>
        </Button>
      </div>

      {/* Stats */}
      {(logs?.length ?? 0) > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(
            [
              { key: 'DELIVERED' as DeliveryStatus, label: 'Доставлено', color: 'text-green-600' },
              { key: 'FAILED' as DeliveryStatus, label: 'Не доставлено', color: 'text-red-500' },
              { key: 'PENDING' as DeliveryStatus, label: 'Ожидает', color: 'text-amber-500' },
              { key: 'ERROR' as DeliveryStatus, label: 'Ошибка', color: 'text-orange-500' },
            ] as { key: DeliveryStatus; label: string; color: string }[]
          ).map((s) => (
            <div key={s.key} className="bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{stats[s.key] ?? 0}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {FILTER_TYPES.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                typeFilter === f.value
                  ? 'bg-[#A8492A] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {FILTER_STATUSES.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value as DeliveryStatus | 'ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === f.value
                  ? 'bg-gray-800 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        logs?.length === 0 ? (
          <EmptyState
            title="Нет уведомлений"
            description="Отправьте приглашения гостям, чтобы увидеть статусы доставки"
            icon={<Bell size={48} className="text-gray-300" />}
            action={{ label: 'Отправить приглашения', onClick: () => setShowSendConfirm(true) }}
          />
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">Нет записей по фильтру</div>
        )
      ) : (
        <div className="bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] px-4">
          {filtered.map((log) => (
            <LogItem key={log.id} log={log} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={showSendConfirm}
        onOpenChange={setShowSendConfirm}
        title="Отправить приглашения?"
        description="Все гости получат SMS-приглашение."
        confirmLabel="Отправить"
        variant="default"
        onConfirm={handleSend}
        loading={sendInvites.isPending}
      />
    </div>
  )
}
