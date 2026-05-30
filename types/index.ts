export type RsvpStatus       = 'PENDING' | 'ACCEPTED' | 'DECLINED'
export type NotificationType = 'INITIAL_INVITE' | 'REMINDER_24H' | 'MORNING_SEATING'
export type DeliveryStatus   = 'PENDING' | 'DELIVERED' | 'FAILED' | 'ERROR'
export type EventTemplate    = 'ELEGANT' | 'FESTIVE' | 'MINIMALIST' | 'ROMANTIC' | 'MODERN'
export type MessageLanguage  = 'RUSSIAN' | 'KAZAKH'

export interface AuthResponse {
  id: number
  phoneNumber: string
  token: string
}

export interface UserResponse {
  id: number
  phoneNumber: string
  name: string | null
  lastName: string | null
}

export interface TemplateSettings {
  primaryColor?: string
  backgroundColor?: string
  backgroundImageUrl?: string
  coverImageUrl?: string
  galleryImages?: string[]
  fontFamily?: 'serif' | 'sans-serif' | 'cursive'
  greetingText?: string
  accentColor?: string
  musicUrl?: string
  musicAutoplay?: boolean
  musicLoop?: boolean
  musicVolume?: number
  countdownEnabled?: boolean
  countdownTargetDate?: string
  countdownStyle?: 'minimal' | 'elegant' | 'festive'
  countdownPosition?: 'top' | 'bottom' | 'floating'
}

export interface ToyImageResponse {
  id: number
  url: string
}

export interface ToyResponse {
  id: string
  title: string
  description: string
  eventDate: string
  locationName: string | null
  gisLink: string | null
  templateId: EventTemplate
  language: MessageLanguage
  templateSettings: TemplateSettings | null
  organizerName: string
  images: ToyImageResponse[]
  musicUrl: string | null
}

export interface GuestResponse {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  status: RsvpStatus
  partySize: number
  rsvpToken: string
  seatingTableId: number | null
}

export interface SeatingTableResponse {
  id: number
  name: string
  capacity: number
  toyId: string
  guests: GuestResponse[]
}

export interface NotificationLog {
  id: number
  type: NotificationType
  sentAt: string
  deliveryStatus: DeliveryStatus
}

export interface PublicToyResponse {
  id: string
  title: string
  description: string
  eventDate: string
  locationName: string | null
  gisLink: string | null
  templateId: EventTemplate
  templateSettings: TemplateSettings | null
  organizerDisplayName: string
  images: ToyImageResponse[]
  musicUrl: string | null
}

export interface ToyRequest {
  title: string
  description: string
  eventDate: string
  locationName?: string
  gisLink?: string
  organizerName?: string
  templateId: EventTemplate
  language?: MessageLanguage
  templateSettings?: Record<string, unknown>
}

export interface GuestRequest {
  firstName: string
  lastName: string
  phoneNumber: string
  partySize?: number
}

export const queryKeys = {
  toys:           (userId: number)                       => ['toys', userId],
  toy:            (id: string)                           => ['toy', id],
  guests:         (toyId: string)                        => ['guests', toyId],
  guestsByStatus: (toyId: string, s: RsvpStatus)         => ['guests', toyId, s],
  tables:         (toyId: string)                        => ['tables', toyId],
  logs:           (toyId: string)                        => ['logs', toyId],
  publicEvent:    (userId: number, toyId: string)         => ['public', userId, toyId],
}

export const statusColors: Record<DeliveryStatus, string> = {
  DELIVERED: 'bg-green-100 text-green-700',
  FAILED:    'bg-red-100 text-red-700',
  PENDING:   'bg-amber-100 text-amber-700',
  ERROR:     'bg-orange-100 text-orange-700',
}

export const rsvpColors: Record<RsvpStatus, string> = {
  ACCEPTED: 'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-700',
  PENDING:  'bg-amber-100 text-amber-700',
}
