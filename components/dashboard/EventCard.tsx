'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Users, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ToyResponse } from '@/types'
import { formatEventDate, daysUntilDelete, isPastEvent } from '@/lib/formatters'

const TEMPLATE_LABELS: Record<string, string> = {
  ELEGANT: 'Элегантный',
  FESTIVE: 'Праздничный',
  MINIMALIST: 'Минималистичный',
  ROMANTIC: 'Романтичный',
  MODERN: 'Современный',
}

const TEMPLATE_COLORS: Record<string, string> = {
  ELEGANT: 'bg-amber-100 text-amber-700',
  FESTIVE: 'bg-pink-100 text-pink-700',
  MINIMALIST: 'bg-gray-100 text-gray-700',
  ROMANTIC: 'bg-rose-100 text-rose-700',
  MODERN: 'bg-violet-100 text-violet-700',
}

interface EventCardProps {
  toy: ToyResponse
  guestStats?: {
    total: number
    partyTotal: number
  }
}

export function EventCard({ toy, guestStats }: EventCardProps) {
  const past = isPastEvent(toy.eventDate)
  const daysLeft = past ? daysUntilDelete(toy.eventDate) : null
  const total = guestStats?.total ?? 0
  const partyTotal = guestStats?.partyTotal ?? 0

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
    >
      <Link href={`/events/${toy.id}`} className="block">
        <div className="bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
          {past && daysLeft !== null && daysLeft <= 7 && (
            <div className={`px-4 py-2 flex items-center gap-2 text-xs font-medium ${daysLeft <= 2 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
              <AlertTriangle size={13} />
              {daysLeft <= 0
                ? 'Будет удалено сегодня'
                : `Будет удалено через ${daysLeft} дн.`}
            </div>
          )}

          <div className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <span
                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${TEMPLATE_COLORS[toy.templateId] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {TEMPLATE_LABELS[toy.templateId] ?? toy.templateId}
                </span>
                <h3 className="text-base font-semibold text-gray-900 truncate leading-tight">{toy.title}</h3>
              </div>
              {past && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                  Прошло
                </Badge>
              )}
            </div>

            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar size={12} className="shrink-0" />
                <span className="truncate">{formatEventDate(toy.eventDate)}</span>
              </div>
              {toy.locationName && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{toy.locationName}</span>
                </div>
              )}
            </div>

            {guestStats && (
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Users size={12} />
                  <span>{total} гостей</span>
                </div>
                {partyTotal > total && (
                  <span style={{ color: 'var(--ink-soft)' }}>
                    · {partyTotal} мест
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
