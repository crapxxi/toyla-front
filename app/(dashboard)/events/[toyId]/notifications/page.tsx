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
import { useLangStore } from '@/store/lang.store'
import i18n from '@/lib/i18n'

function LogItem({ log }: { log: NotificationLog }) {
  const { lang } = useLangStore()
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-[#FBF5F1] flex items-center justify-center flex-shrink-0 mt-0.5">
        <Bell size={15} className="text-[#A8492A]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-900">{notificationTypeLabel(log.type, lang)}</p>
          <Badge className={`text-xs ${statusColors[log.deliveryStatus]}`}>
            {deliveryStatusLabel(log.deliveryStatus, lang)}
          </Badge>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{formatDateShort(log.sentAt)}</p>
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const { toyId } = useParams<{ toyId: string }>()
  const { lang } = useLangStore()
  const t = i18n[lang]
  const { data: logs, isLoading } = useGetLogs(toyId)
  const sendInvites = useSendInvites(toyId)
  const [showSendConfirm, setShowSendConfirm] = useState(false)
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'ALL'>('ALL')
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'ALL'>('ALL')

  const filterTypes: { value: NotificationType | 'ALL'; label: string }[] = [
    { value: 'ALL', label: t.allLabel },
    { value: 'INITIAL_INVITE', label: t.invitesLabel },
    { value: 'REMINDER_24H', label: t.remindersLabel },
    { value: 'MORNING_SEATING', label: t.seatingLabel },
  ]

  const filterStatuses: { value: DeliveryStatus | 'ALL'; label: string }[] = [
    { value: 'ALL', label: t.allStatuses },
    { value: 'DELIVERED', label: t.deliveredL },
    { value: 'FAILED', label: t.failedL },
    { value: 'PENDING', label: t.pendingL },
    { value: 'ERROR', label: t.errorL },
  ]

  const filtered = (logs ?? []).filter((log) => {
    const matchType = typeFilter === 'ALL' || log.type === typeFilter
    const matchStatus = statusFilter === 'ALL' || log.deliveryStatus === statusFilter
    return matchType && matchStatus
  })

  const stats = (logs ?? []).reduce((acc, log) => {
    acc[log.deliveryStatus] = (acc[log.deliveryStatus] ?? 0) + 1
    return acc
  }, {} as Record<DeliveryStatus, number>)

  const handleSend = async () => {
    await sendInvites.mutateAsync()
    setShowSendConfirm(false)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/events/${toyId}`} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">{t.notifTitle}</h1>
          <p className="text-xs text-gray-500">{t.recordsN(logs?.length ?? 0)}</p>
        </div>
        <Button onClick={() => setShowSendConfirm(true)} className="bg-[#A8492A] hover:bg-[#8A3A20] rounded-xl gap-2 text-sm">
          <Send size={15} />
          <span className="hidden sm:block">{t.sendInvitesBtn}</span>
        </Button>
      </div>

      {(logs?.length ?? 0) > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {([
            { key: 'DELIVERED' as DeliveryStatus, label: t.deliveredL, color: 'text-green-600' },
            { key: 'FAILED' as DeliveryStatus,    label: t.failedL,    color: 'text-red-500' },
            { key: 'PENDING' as DeliveryStatus,   label: t.pendingL,   color: 'text-amber-500' },
            { key: 'ERROR' as DeliveryStatus,     label: t.errorL,     color: 'text-orange-500' },
          ]).map((s) => (
            <div key={s.key} className="bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{stats[s.key] ?? 0}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex gap-1 overflow-x-auto">
          {filterTypes.map((f) => (
            <button key={f.value} onClick={() => setTypeFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                typeFilter === f.value ? 'bg-[#A8492A] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {filterStatuses.map((f) => (
            <button key={f.value} onClick={() => setStatusFilter(f.value as DeliveryStatus | 'ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === f.value ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}>
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
            title={t.noNotif}
            description={t.noNotifDesc}
            icon={<Bell size={48} className="text-gray-300" />}
            action={{ label: t.sendInvitesBtn, onClick: () => setShowSendConfirm(true) }}
          />
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">{t.noRecords}</div>
        )
      ) : (
        <div className="bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] px-4">
          {filtered.map((log) => <LogItem key={log.id} log={log} />)}
        </div>
      )}

      <ConfirmDialog
        open={showSendConfirm}
        onOpenChange={setShowSendConfirm}
        title={t.sendInvitesQ}
        description={t.sendInvitesD}
        confirmLabel={t.send}
        variant="default"
        onConfirm={handleSend}
        loading={sendInvites.isPending}
      />
    </div>
  )
}
