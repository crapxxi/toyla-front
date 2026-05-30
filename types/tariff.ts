export type TariffPlan = 'FREE' | 'DARA' | 'TOY'

export interface TariffPlanInfo {
  code: TariffPlan
  displayName: string
  priceTenge: number
  maxEvents: number
  maxGuestsPerEvent: number
  allTemplates: boolean
  mediaAllowed: boolean
  remindersAllowed: boolean
  showWatermark: boolean
}

export interface TariffMeResponse {
  /** Effective tariff — already rolled back to FREE when expired. */
  plan: TariffPlanInfo
  /** Tariff assigned by the admin (what was bought); present from the new API. */
  storedPlan?: TariffPlanInfo
  /** True when the stored paid plan has expired and FREE limits now apply. */
  expired?: boolean
  expiresAt: string | null
  eventsUsed: number
  eventsLimit: number
  guestsLimitPerEvent: number
}
