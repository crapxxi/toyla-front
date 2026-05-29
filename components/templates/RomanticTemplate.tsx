'use client'
import { motion } from 'framer-motion'
import { MapPin, Calendar } from 'lucide-react'
import { TemplateSettings } from '@/types'
import { formatDateFull } from '@/lib/formatters'
import { BackgroundMusicPlayer } from '@/components/shared/BackgroundMusicPlayer'
import { EventCountdown } from '@/components/shared/EventCountdown'
import type { TemplateProps } from './ElegantTemplate'

function WatercolorFlower({ color }: { color: string }) {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="30" rx="18" ry="26" fill={color} opacity="0.35" transform="rotate(0 60 60)" />
      <ellipse cx="60" cy="30" rx="18" ry="26" fill={color} opacity="0.3" transform="rotate(45 60 60)" />
      <ellipse cx="60" cy="30" rx="18" ry="26" fill={color} opacity="0.3" transform="rotate(90 60 60)" />
      <ellipse cx="60" cy="30" rx="18" ry="26" fill={color} opacity="0.3" transform="rotate(135 60 60)" />
      <ellipse cx="60" cy="30" rx="18" ry="26" fill={color} opacity="0.28" transform="rotate(180 60 60)" />
      <ellipse cx="60" cy="30" rx="18" ry="26" fill={color} opacity="0.28" transform="rotate(225 60 60)" />
      <ellipse cx="60" cy="30" rx="18" ry="26" fill={color} opacity="0.28" transform="rotate(270 60 60)" />
      <ellipse cx="60" cy="30" rx="18" ry="26" fill={color} opacity="0.28" transform="rotate(315 60 60)" />
      <circle cx="60" cy="60" r="12" fill={color} opacity="0.5" />
    </svg>
  )
}

export function RomanticTemplate({
  event,
  rsvpToken,
  onAccept,
  onDecline,
  rsvpLoading,
  rsvpDone,
}: TemplateProps) {
  const s: TemplateSettings = event.templateSettings ?? {}
  const bg = s.backgroundColor ?? '#FFF5F7'
  const primary = s.primaryColor ?? '#C06080'
  const accent = s.accentColor ?? '#E8B4C4'
  const greeting = s.greetingText ?? `${event.organizerDisplayName} приглашает вас`

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(160deg, ${bg} 0%, #FDE8F0 50%, ${bg} 100%)`,
        fontFamily: '"Cormorant Garamond", "Georgia", serif',
        color: '#4A1A2C',
      }}
    >
      {/* Watercolor flower decorations */}
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 opacity-40">
        <WatercolorFlower color={accent} />
      </div>
      <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 opacity-40 scale-110">
        <WatercolorFlower color={primary} />
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/4 opacity-30 scale-150">
        <WatercolorFlower color={accent} />
      </div>

      {s.backgroundImageUrl && (
        <div
          className="absolute inset-0 opacity-8"
          style={{
            backgroundImage: `url(${s.backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}

      <main className="relative z-10 max-w-md mx-auto px-6 py-12 text-center">
        {s.coverImageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <img
              src={s.coverImageUrl}
              alt="Обложка"
              className="w-full rounded-full shadow-xl object-cover h-48 mx-auto"
              style={{ maxWidth: '192px' }}
            />
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm italic mb-3"
          style={{ color: primary }}
        >
          {greeting}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-4xl sm:text-5xl mb-4 leading-tight font-light"
          style={{ color: primary }}
        >
          {event.title}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <div className="h-px flex-1" style={{ backgroundColor: accent }} />
          <span style={{ color: accent }}>♥</span>
          <div className="h-px flex-1" style={{ backgroundColor: accent }} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-base leading-relaxed mb-8 whitespace-pre-line"
          style={{ color: '#6B3047' }}
        >
          {event.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-2 mb-8"
        >
          <div className="flex items-center justify-center gap-2 text-sm">
            <Calendar size={14} style={{ color: primary }} />
            <span style={{ color: '#6B3047' }}>{formatDateFull(event.eventDate)}</span>
          </div>
          {event.locationName && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <MapPin size={14} style={{ color: primary }} />
              {event.gisLink ? (
                <a href={event.gisLink} target="_blank" rel="noopener noreferrer" style={{ color: primary }} className="underline underline-offset-2">
                  {event.locationName}
                </a>
              ) : (
                <span style={{ color: '#6B3047' }}>{event.locationName}</span>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="flex flex-col sm:flex-row gap-3 justify-center mt-8"
          >
            <button
              onClick={onAccept}
              disabled={rsvpLoading}
              className="px-8 py-3 text-white text-sm rounded-full transition-all hover:opacity-90 disabled:opacity-50 shadow-md"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
            >
              Принять приглашение ♥
            </button>
            <button
              onClick={onDecline}
              disabled={rsvpLoading}
              className="px-8 py-3 text-sm rounded-full border transition-all hover:bg-pink-50 disabled:opacity-50"
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
            transition={{ type: 'spring', damping: 14 }}
            className="mt-8 p-6 rounded-2xl text-center"
            style={{ backgroundColor: `${accent}30` }}
          >
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-lg font-light" style={{ color: primary }}>
              Отлично! Ждём вас на празднике!
            </p>
          </motion.div>
        )}

        {rsvpDone === 'declined' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-6 rounded-2xl text-center bg-pink-50"
          >
            <div className="text-4xl mb-3">💙</div>
            <p className="text-base font-light" style={{ color: '#6B3047' }}>
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
