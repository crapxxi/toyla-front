import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth.store'
import { EventTemplate, TariffMeResponse, TariffPlanInfo, queryKeys } from '@/types'

/** Catalogue of all plans (public — used on the pricing page). */
export function useTariffs() {
  return useQuery({
    queryKey: queryKeys.tariffs(),
    queryFn: async () => {
      const { data } = await api.get<TariffPlanInfo[]>('/api/v1/tariffs')
      return data
    },
    staleTime: 5 * 60_000,
  })
}

/**
 * Current user's effective tariff — the single source of truth for gating.
 * Enabled only when authenticated. Backend already rolls expired plans back
 * to FREE via `effectiveTariffPlan`, so just read `plan.code`.
 */
export function useTariff() {
  const token = useAuthStore((s) => s.token)
  return useQuery({
    queryKey: queryKeys.tariffMe(),
    queryFn: async () => {
      const { data } = await api.get<TariffMeResponse>('/api/v1/tariff/me')
      return data
    },
    enabled: !!token,
  })
}

export interface TariffGate {
  tariff: TariffMeResponse | undefined
  isLoading: boolean
  isFree: boolean
  canMedia: boolean
  canRemind: boolean
  allTemplates: boolean
  /** Whether the event-creation limit has been reached. */
  eventsReached: boolean
  eventsUsed: number
  eventsLimit: number
  guestsLimitPerEvent: number
  /** Whether a given template is available on the current plan. */
  canTpl: (t: EventTemplate) => boolean
}

/** Convenience hook exposing the derived gating flags from the spec. */
export function useTariffGate(): TariffGate {
  const { data: tariff, isLoading } = useTariff()
  const plan = tariff?.plan
  return {
    tariff,
    isLoading,
    isFree: plan?.code === 'FREE',
    canMedia: plan?.mediaAllowed ?? false,
    canRemind: plan?.remindersAllowed ?? false,
    allTemplates: plan?.allTemplates ?? false,
    eventsReached: tariff ? tariff.eventsUsed >= tariff.eventsLimit : false,
    eventsUsed: tariff?.eventsUsed ?? 0,
    eventsLimit: tariff?.eventsLimit ?? 0,
    guestsLimitPerEvent: tariff?.guestsLimitPerEvent ?? 0,
    canTpl: (t: EventTemplate) => (plan?.allTemplates ?? false) || t === 'ELEGANT',
  }
}
