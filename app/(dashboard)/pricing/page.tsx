'use client'
import { Check, X, Crown, MessageCircle, AlertTriangle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useTariffs, useTariff } from '@/hooks/useTariff'
import { ADMIN_WHATSAPP } from '@/components/shared/UpgradeModal'
import { useLangStore } from '@/store/lang.store'
import { formatTenge } from '@/lib/formatters'
import { TariffPlanInfo } from '@/types'
import i18n from '@/lib/i18n'

interface Feature { label: string; ok: boolean }

function PlanCard({ plan, current }: { plan: TariffPlanInfo; current: boolean }) {
  const { lang } = useLangStore()
  const t = i18n[lang]
  const isFree = plan.code === 'FREE'

  const features: Feature[] = [
    { label: t.featEvents(plan.maxEvents), ok: true },
    { label: t.featGuests(plan.maxGuestsPerEvent), ok: true },
    { label: plan.allTemplates ? t.featTemplatesAll : t.featTemplateElegant, ok: true },
    { label: plan.mediaAllowed ? t.featMedia : t.featNoMedia, ok: plan.mediaAllowed },
    { label: plan.remindersAllowed ? t.featReminders : t.featNoReminders, ok: plan.remindersAllowed },
    { label: plan.showWatermark ? t.featWatermark : t.featNoWatermark, ok: !plan.showWatermark },
  ]

  return (
    <div
      className="relative flex flex-col rounded-2xl border p-6 bg-[#FBF6EE]"
      style={{ borderColor: current ? 'var(--clay)' : 'var(--line)', borderWidth: current ? 2 : 1 }}
    >
      {current && (
        <span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-white"
          style={{ background: 'var(--clay)' }}>
          <Crown size={11} /> {t.currentPlanBadge}
        </span>
      )}

      <h3 className="text-lg font-semibold" style={{ color: 'var(--ink)' }}>{plan.displayName}</h3>
      <div className="mt-2 flex items-end gap-1">
        <span className="text-2xl font-bold" style={{ color: 'var(--clay)' }}>
          {isFree ? t.freePrice : formatTenge(plan.priceTenge)}
        </span>
        {!isFree && <span className="text-xs mb-1" style={{ color: 'var(--ink-soft)' }}>{plan.code === 'TOY' ? (lang === 'kk' ? '/ айына' : '/ месяц') : t.perEventLabel}</span>}
      </div>

      <ul className="mt-5 space-y-2.5 flex-1">
        {features.map((f) => (
          <li key={f.label} className="flex items-center gap-2.5 text-sm">
            {f.ok
              ? <Check size={16} className="text-emerald-600 flex-shrink-0" />
              : <X size={16} className="text-gray-300 flex-shrink-0" />}
            <span style={{ color: f.ok ? 'var(--ink)' : 'var(--ink-soft)' }}>{f.label}</span>
          </li>
        ))}
      </ul>

      {current ? (
        <div className="mt-6 w-full text-center py-2.5 rounded-xl text-sm font-medium"
          style={{ background: 'var(--clay-light)', color: 'var(--clay)' }}>
          {t.currentPlanBadge}
        </div>
      ) : (
        <a href={ADMIN_WHATSAPP} target="_blank" rel="noopener noreferrer"
          className="mt-6 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--clay)' }}>
          <MessageCircle size={15} />
          {t.choosePlanCta}
        </a>
      )}
    </div>
  )
}

export default function PricingPage() {
  const { lang } = useLangStore()
  const t = i18n[lang]
  const { data: plans, isLoading } = useTariffs()
  const { data: tariff } = useTariff()
  const currentCode = tariff?.plan.code

  const sorted = [...(plans ?? [])].sort((a, b) => a.priceTenge - b.priceTenge)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--ink)' }}>{t.pricingTitle}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>{t.pricingSubtitle}</p>
      </div>

      {tariff?.expired && (
        <div className="mb-6 max-w-4xl flex items-start gap-2.5 rounded-2xl border px-4 py-3 bg-red-50"
          style={{ borderColor: '#fecaca' }}>
          <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-red-700">{t.tariffExpired}</p>
            {tariff.storedPlan && (
              <p className="text-xs text-red-600 mt-0.5">{tariff.storedPlan.displayName}</p>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl">
          {sorted.map((plan) => (
            <PlanCard key={plan.code} plan={plan} current={plan.code === currentCode} />
          ))}
        </div>
      )}
    </div>
  )
}
