'use client'
import { motion } from 'framer-motion'
import { MapPin, Calendar } from 'lucide-react'
import { TemplateSettings } from '@/types'
import { formatDateFull } from '@/lib/formatters'
import { BackgroundMusicPlayer } from '@/components/shared/BackgroundMusicPlayer'
import { EventCountdown } from '@/components/shared/EventCountdown'
import type { TemplateProps } from './ElegantTemplate'

export function MinimalistTemplate({
  event,
  rsvpToken,
  onAccept,
  onDecline,
  rsvpLoading,
  rsvpDone,
}: TemplateProps) {
  const s: TemplateSettings = event.templateSettings ?? {}
  const bg = s.backgroundColor ?? '#FFFFFF'
  const primary = s.primaryColor ?? '#111827'
  const accent = s.accentColor ?? '#6B7280'
  const greeting = s.greetingText ?? event.organizerDisplayName

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: bg, color: primary, fontFamily: 'Inter, sans-serif' }}
    >
      {s.backgroundImageUrl && (
        <div
          className="fixed inset-0 opacity-5"
          style={{
            backgroundImage: `url(${s.backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <main className="relative z-10 flex-1 max-w-md mx-auto w-full px-8 py-16">
        {s.coverImageUrl && (
          <motion.img
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            src={s.coverImageUrl}
            alt="Обложка"
            className="w-full rounded-lg object-cover max-h-56 mb-12 grayscale"
          />
        )}

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs uppercase tracking-[0.25em] mb-3"
          style={{ color: accent }}
        >
          {greeting}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-light mb-6 leading-snug"
          style={{ color: primary }}
        >
          {event.title}
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="h-px w-12 mb-6"
          style={{ backgroundColor: primary, transformOrigin: 'left' }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm leading-relaxed mb-8 whitespace-pre-line"
          style={{ color: accent }}
        >
          {event.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-2 mb-10"
        >
          <div className="flex items-center gap-2.5 text-sm" style={{ color: accent }}>
            <Calendar size={13} />
            <span>{formatDateFull(event.eventDate)}</span>
          </div>
          {event.locationName && (
            <div className="flex items-center gap-2.5 text-sm" style={{ color: accent }}>
              <MapPin size={13} />
              {event.gisLink ? (
                <a
                  href={event.gisLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: primary }}
                  className="underline underline-offset-2"
                >
                  {event.locationName}
                </a>
              ) : (
                <span>{event.locationName}</span>
              )}
            </div>
          )}
        </motion.div>

        {s.countdownEnabled && s.countdownTargetDate && (
          <EventCountdown
            targetDate={s.countdownTargetDate}
            style={s.countdownStyle ?? 'minimal'}
            position={s.countdownPosition ?? 'bottom'}
          />
        )}

        {rsvpToken && !rsvpDone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 mt-8"
          >
            <button
              onClick={onAccept}
              disabled={rsvpLoading}
              className="flex-1 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50 rounded-md"
              style={{ backgroundColor: primary }}
            >
              Принять
            </button>
            <button
              onClick={onDecline}
              disabled={rsvpLoading}
              className="flex-1 py-3 text-sm font-medium rounded-md border transition-colors hover:bg-gray-50 disabled:opacity-50"
              style={{ borderColor: primary, color: primary }}
            >
              Отказаться
            </button>
          </motion.div>
        )}

        {rsvpDone === 'accepted' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-6 rounded-lg bg-gray-50 text-center"
          >
            <p className="text-lg font-light" style={{ color: primary }}>
              Отлично! Ждём вас на празднике!
            </p>
          </motion.div>
        )}

        {rsvpDone === 'declined' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-6 rounded-lg bg-gray-50 text-center"
          >
            <p className="text-sm" style={{ color: accent }}>
              Жаль, что не получится. Спасибо за ответ
            </p>
          </motion.div>
        )}
      </main>

      {s.musicUrl && (
        <BackgroundMusicPlayer
          musicUrl={s.musicUrl}
          autoplay={s.musicAutoplay}
          loop={s.musicLoop}
          volume={s.musicVolume}
        />
      )}
    </div>
  )
}
