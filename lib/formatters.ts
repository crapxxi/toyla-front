import { format, differenceInDays } from 'date-fns'
import { ru, kk as kkLocale } from 'date-fns/locale'
import { NotificationType, DeliveryStatus } from '@/types'
import type { Lang } from '@/store/lang.store'
import i18n from '@/lib/i18n'

export function formatEventDate(dateStr: string, lang: Lang = 'kk'): string {
  return format(new Date(dateStr), 'd MMMM yyyy, HH:mm', { locale: lang === 'kk' ? kkLocale : ru })
}

export function formatDateShort(dateStr: string): string {
  return format(new Date(dateStr), 'dd.MM.yyyy / HH:mm')
}

export function formatDateFull(dateStr: string, lang: Lang = 'kk'): string {
  return format(new Date(dateStr), 'EEEE, d MMMM yyyy HH:mm', { locale: lang === 'kk' ? kkLocale : ru })
}

export function formatDateOnly(dateStr: string, lang: Lang = 'kk'): string {
  return format(new Date(dateStr), 'd MMMM yyyy', { locale: lang === 'kk' ? kkLocale : ru })
}

/** Whole days from now until `dateStr` (negative if already past). */
export function daysUntil(dateStr: string): number {
  return differenceInDays(new Date(dateStr), new Date())
}

/** `6 990 ₸` — tenge with a thin-space thousands separator. */
export function formatTenge(amount: number): string {
  return `${amount.toLocaleString('ru-RU').replace(/ /g, ' ')} ₸`
}

export function formatPhone(phone: string): string {
  return '+' + phone
}

export function daysUntilDelete(eventDate: string): number {
  const event = new Date(eventDate)
  const deleteDate = new Date(event)
  deleteDate.setDate(deleteDate.getDate() + 7)
  return differenceInDays(deleteDate, new Date())
}

export function isPastEvent(eventDate: string): boolean {
  return new Date(eventDate) < new Date()
}

export function notificationTypeLabel(type: NotificationType, lang: Lang = 'kk'): string {
  const t = i18n[lang]
  const map: Record<NotificationType, string> = {
    INITIAL_INVITE:  t.notifInvite,
    REMINDER_24H:    t.notifReminder,
    MORNING_SEATING: t.notifSeating,
  }
  return map[type]
}

export function deliveryStatusLabel(status: DeliveryStatus, lang: Lang = 'kk'): string {
  const t = i18n[lang]
  const map: Record<DeliveryStatus, string> = {
    DELIVERED: t.deliveredL,
    FAILED:    t.failedL,
    PENDING:   t.pendingL,
    ERROR:     t.errorL,
  }
  return map[status]
}
