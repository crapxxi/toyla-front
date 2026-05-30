import { format, differenceInDays } from 'date-fns'
import { ru } from 'date-fns/locale'
import { NotificationType, DeliveryStatus } from '@/types'

type RsvpStatus = 'ACCEPTED' | 'DECLINED' | 'PENDING'

export function formatEventDate(dateStr: string): string {
  return format(new Date(dateStr), 'd MMMM yyyy, HH:mm', { locale: ru })
}

export function formatDateShort(dateStr: string): string {
  return format(new Date(dateStr), 'dd.MM.yyyy / HH:mm')
}

export function formatDateFull(dateStr: string): string {
  return format(new Date(dateStr), 'EEEE, d MMMM yyyy в HH:mm', { locale: ru })
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

export function rsvpStatusLabel(status: RsvpStatus): string {
  const map: Record<RsvpStatus, string> = {
    ACCEPTED: 'Принял',
    DECLINED: 'Отказал',
    PENDING: 'Ожидает',
  }
  return map[status]
}

export function notificationTypeLabel(type: NotificationType): string {
  const map: Record<NotificationType, string> = {
    INITIAL_INVITE: 'Приглашение',
    REMINDER_24H: 'Напоминание (24ч)',
    MORNING_SEATING: 'Место за столом',
  }
  return map[type]
}

export function deliveryStatusLabel(status: DeliveryStatus): string {
  const map: Record<DeliveryStatus, string> = {
    DELIVERED: 'Доставлено',
    FAILED: 'Не доставлено',
    PENDING: 'Ожидает',
    ERROR: 'Ошибка',
  }
  return map[status]
}
