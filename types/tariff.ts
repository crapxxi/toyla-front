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
  plan: TariffPlanInfo
  expiresAt: string | null
  eventsUsed: number
  eventsLimit: number
  guestsLimitPerEvent: number
}
