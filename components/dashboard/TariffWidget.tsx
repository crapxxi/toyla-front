'use client'
import Link from 'next/link'
import { Crown, AlertTriangle, ChevronRight } from 'lucide-react'
import { useTariff } from '@/hooks/useTariff'
import { useLangStore } from '@/store/lang.store'
import { formatDateOnly, formatTenge, daysUntil } from '@/lib/formatters'
import { Skeleton } from '@/components/ui/skeleton'
import i18n from '@/lib/i18n'

export function TariffWidget() {
  const { lang } = useLangStore()
  const t = i18n[lang]
  const { data: tariff, isLoading } = useTariff()

  if (isLoading) return <Skeleton className="h-[88px] rounded-2xl mb-6" />
  if (!tariff) return null

  const { plan, expiresAt, eventsUsed, eventsLimit } = tariff
  const isFree = plan.code === 'FREE'
  const days = expiresAt ? daysUntil(expiresAt) : null
  const expired = days !== null && days < 0
  const expiringSoon = days !== null && days >= 0 && days <= 7
  const usagePct = eventsLimit > 0 ? Math.min(100, Math.round((eventsUsed / eventsLimit) * 100)) : 0

  return (
    <div className="mb-6 space-y-2.5">
      {/* Expiry banner */}
      {expired ? (
        <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm bg-red-50 text-red-700 border border-red-100">
          <AlertTriangle size={15} className="flex-shrink-0" />
          <span>{t.tariffExpired}</span>
        </div>
      ) : expiringSoon ? (
        <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm border"
          style={{ background: 'rgba(176,132,58,0.10)', color: 'var(--gold)', borderColor: 'rgba(176,132,58,0.28)' }}>
          <AlertTriangle size={15} className="flex-shrink-0" />
          <span>{t.tariffExpiringSoon(formatDateOnly(expiresAt!, lang))}</span>
        </div>
      ) : null}

      <Link href="/pricing"
        className="group flex items-center gap-4 bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] p-4 hover:shadow-md transition-shadow">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--clay-light)', color: 'var(--clay)' }}>
          <Crown size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>{t.tariffWidgetTitle}</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{plan.displayName}</span>
            <span className="text-xs font-medium" style={{ color: 'var(--clay)' }}>
              {isFree ? t.freePrice : formatTenge(plan.priceTenge)}
            </span>
            {!isFree && expiresAt && !expired && (
              <span className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                · {t.tariffValidUntil(formatDateOnly(expiresAt, lang))}
              </span>
            )}
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>
              <span>{t.tariffEventsUsed(eventsUsed, eventsLimit)}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bone-2)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${usagePct}%`, background: usagePct >= 100 ? '#DC2626' : 'var(--clay)' }} />
            </div>
          </div>
        </div>

        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
      </Link>
    </div>
  )
}
