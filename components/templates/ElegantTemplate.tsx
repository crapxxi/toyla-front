'use client'
import { motion } from 'framer-motion'
import { MapPin, Calendar } from 'lucide-react'
import { PublicToyResponse, TemplateSettings } from '@/types'
import { formatDateFull } from '@/lib/formatters'
import { BackgroundMusicPlayer } from '@/components/shared/BackgroundMusicPlayer'
import { EventCountdown } from '@/components/shared/EventCountdown'

export interface TemplateProps {
  event: PublicToyResponse
  rsvpToken?: string
  onAccept?: () => void
  onDecline?: () => void
  rsvpLoading?: boolean
  rsvpDone?: 'accepted' | 'declined' | null
}

export function ElegantTemplate({
  event,
  rsvpToken,
  onAccept,
  onDecline,
  rsvpLoading,
  rsvpDone,
}: TemplateProps) {
  const s: TemplateSettings = event.templateSettings ?? {}
  const bg = s.backgroundColor ?? '#FFFDF7'
  const primary = s.primaryColor ?? '#B8860B'
  const accent = s.accentColor ?? '#C9A84C'
  const font = s.fontFamily === 'sans-serif' ? 'sans-serif' : 'Georgia, serif'
  const greeting = s.greetingText ?? `Вас приглашает ${event.organizerDisplayName}`

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: bg, fontFamily: font, color: '#3D2B00' }}
    >
      {s.backgroundImageUrl && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${s.backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      {/* Ornamental top border */}
      <div className="relative z-10 flex justify-center pt-8 px-4">
        <svg width="280" height="24" viewBox="0 0 280 24">
          <line x1="0" y1="12" x2="110" y2="12" stroke={accent} strokeWidth="0.8" />
          <circle cx="140" cy="12" r="6" fill="none" stroke={accent} strokeWidth="0.8" />
          <circle cx="140" cy="12" r="3" fill={accent} />
          <circle cx="120" cy="12" r="2" fill={accent} opacity="0.6" />
          <circle cx="160" cy="12" r="2" fill={accent} opacity="0.6" />
          <line x1="170" y1="12" x2="280" y2="12" stroke={accent} strokeWidth="0.8" />
        </svg>
      </div>

      {/* Main content */}
      <main className="relative z-10 max-w-lg mx-auto px-6 py-8 text-center">
        {s.coverImageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8"
          >
            <img
              src={s.coverImageUrl}
              alt="Обложка"
              className="w-full rounded-xl shadow-lg object-cover max-h-64"
            />
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-sm uppercase tracking-[0.3em] mb-4"
          style={{ color: accent }}
        >
          {greeting}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-3xl sm:text-4xl mb-2 leading-tight"
          style={{ color: primary, fontFamily: 'Georgia, serif' }}
        >
          {event.title}
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mx-auto mb-6 h-px w-48"
          style={{ backgroundColor: accent }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-sm leading-relaxed text-stone-600 mb-8 whitespace-pre-line"
        >
          {event.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="space-y-3 mb-8"
        >
          <div className="flex items-center justify-center gap-2 text-sm">
            <Calendar size={15} style={{ color: accent }} />
            <span className="text-stone-700">{formatDateFull(event.eventDate)}</span>
          </div>
          {event.locationName && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <MapPin size={15} style={{ color: accent }} />
              {event.gisLink ? (
                <a
                  href={event.gisLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-700 underline underline-offset-2"
                >
                  {event.locationName}
                </a>
              ) : (
                <span className="text-stone-700">{event.locationName}</span>
              )}
            </div>
          )}
        </motion.div>

        {s.countdownEnabled && s.countdownTargetDate && (
          <EventCountdown
            targetDate={s.countdownTargetDate}
            style={s.countdownStyle ?? 'elegant'}
            position={s.countdownPosition ?? 'bottom'}
          />
        )}

        {rsvpToken && !rsvpDone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mt-8"
          >
            <button
              onClick={onAccept}
              disabled={rsvpLoading}
              className="px-8 py-3 text-white text-sm font-medium rounded-full transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: primary }}
            >
              Принять приглашение
            </button>
            <button
              onClick={onDecline}
              disabled={rsvpLoading}
              className="px-8 py-3 text-sm font-medium rounded-full border transition-all hover:bg-stone-50 disabled:opacity-50"
              style={{ borderColor: accent, color: primary }}
            >
              Отказаться
            </button>
          </motion.div>
        )}

        {rsvpDone === 'accepted' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 rounded-2xl text-center"
            style={{ backgroundColor: `${primary}15` }}
          >
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-lg font-medium" style={{ color: primary }}>
              Отлично! Ждём вас на празднике!
            </p>
          </motion.div>
        )}

        {rsvpDone === 'declined' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-6 rounded-2xl text-center bg-stone-50"
          >
            <div className="text-4xl mb-3">💙</div>
            <p className="text-lg font-medium text-stone-600">
              Жаль, что не получится. Спасибо за ответ
            </p>
          </motion.div>
        )}
      </main>

      {/* Ornamental bottom border */}
      <div className="relative z-10 flex justify-center pb-8 px-4">
        <svg width="280" height="24" viewBox="0 0 280 24">
          <line x1="0" y1="12" x2="110" y2="12" stroke={accent} strokeWidth="0.8" />
          <circle cx="140" cy="12" r="6" fill="none" stroke={accent} strokeWidth="0.8" />
          <circle cx="140" cy="12" r="3" fill={accent} />
          <circle cx="120" cy="12" r="2" fill={accent} opacity="0.6" />
          <circle cx="160" cy="12" r="2" fill={accent} opacity="0.6" />
          <line x1="170" y1="12" x2="280" y2="12" stroke={accent} strokeWidth="0.8" />
        </svg>
      </div>

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
