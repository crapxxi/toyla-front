'use client'
import { motion } from 'framer-motion'
import { MapPin, Calendar } from 'lucide-react'
import { TemplateSettings } from '@/types'
import { formatDateFull } from '@/lib/formatters'
import { BackgroundMusicPlayer } from '@/components/shared/BackgroundMusicPlayer'
import { EventCountdown } from '@/components/shared/EventCountdown'
import type { TemplateProps } from './ElegantTemplate'
import { bi } from './strings'
import { GuestRegisterForm } from './GuestRegisterForm'

export function MinimalistTemplate({ event, rsvpToken, onAccept, onDecline, rsvpLoading, rsvpDone }: TemplateProps) {
  const s: TemplateSettings = event.templateSettings ?? {}
  const bg = s.backgroundColor ?? '#FFFFFF'
  const primary = s.primaryColor ?? '#111827'
  const accent = s.accentColor ?? '#9CA3AF'
  const greeting = s.greetingText ?? event.organizerDisplayName
  const fontFamily = s.fontFamily === 'serif' ? '"Georgia", serif' : s.fontFamily === 'cursive' ? 'cursive' : 'Inter, sans-serif'

  const fade = (delay: number) => ({ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } } })

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bg, color: primary, fontFamily }}>
      {/* Top accent line */}
      <div className="h-0.5 w-full" style={{ backgroundColor: primary }} />

      <main className="flex-1 max-w-md mx-auto w-full px-8 py-16">
        <motion.p
          variants={fade(0.1)} initial="hidden" animate="visible"
          className="text-[10px] uppercase tracking-[0.45em] mb-8"
          style={{ color: accent }}
        >
          {greeting}
        </motion.p>

        <motion.h1
          variants={fade(0.2)} initial="hidden" animate="visible"
          className="text-4xl sm:text-5xl font-light leading-tight mb-8"
          style={{ color: primary, letterSpacing: '-0.02em' }}
        >
          {event.title}
        </motion.h1>

        {/* Thin rule */}
        <motion.div
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.35, duration: 0.7 }}
          className="h-px mb-8" style={{ backgroundColor: primary, opacity: 0.15, transformOrigin: 'left' }}
        />

        <motion.p
          variants={fade(0.4)} initial="hidden" animate="visible"
          className="text-sm leading-loose mb-10 whitespace-pre-line"
          style={{ color: accent }}
        >
          {event.description}
        </motion.p>

        {/* Date & location */}
        <motion.div variants={fade(0.5)} initial="hidden" animate="visible" className="space-y-3 mb-12">
          <div className="flex items-start gap-3">
            <Calendar size={13} className="mt-0.5 flex-shrink-0" style={{ color: accent }} />
            <p className="text-sm" style={{ color: primary }}>{formatDateFull(event.eventDate)}</p>
          </div>
          {event.locationName && (
            <div className="flex items-start gap-3">
              <MapPin size={13} className="mt-0.5 flex-shrink-0" style={{ color: accent }} />
              {event.gisLink ? (
                <a href={event.gisLink} target="_blank" rel="noopener noreferrer"
                  className="text-sm underline underline-offset-2" style={{ color: primary }}>
                  {event.locationName}
                </a>
              ) : (
                <p className="text-sm" style={{ color: primary }}>{event.locationName}</p>
              )}
            </div>
          )}
        </motion.div>

        {s.countdownEnabled && s.countdownTargetDate && (
          <EventCountdown targetDate={s.countdownTargetDate} style={s.countdownStyle ?? 'minimal'} position={s.countdownPosition ?? 'bottom'} />
        )}

        {/* RSVP */}
        <motion.div variants={fade(0.65)} initial="hidden" animate="visible">
          {rsvpToken && !rsvpDone && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onAccept} disabled={rsvpLoading}
                className="flex-1 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: primary }}
              >
                {bi.accept}
              </button>
              <button
                onClick={onDecline} disabled={rsvpLoading}
                className="flex-1 py-3.5 text-sm font-medium border transition-colors disabled:opacity-50 hover:bg-gray-50"
                style={{ borderColor: primary, color: primary }}
              >
                {bi.decline}
              </button>
            </div>
          )}

          {!rsvpToken && (
            <GuestRegisterForm
              toyId={event.id}
              primaryColor={primary}
              accentColor={accent}
              variant="light"
              textColor={accent}
            />
          )}

          {rsvpDone === 'accepted' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
              <p className="text-xl font-light" style={{ color: primary }}>{bi.waitingMinimalist}</p>
            </motion.div>
          )}

          {rsvpDone === 'declined' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
              <p className="text-sm" style={{ color: accent }}>{bi.declinedMsg}</p>
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* Bottom line */}
      <div className="h-px w-full" style={{ backgroundColor: primary, opacity: 0.1 }} />

      {s.musicUrl && <BackgroundMusicPlayer musicUrl={s.musicUrl} autoplay={s.musicAutoplay} loop={s.musicLoop} volume={s.musicVolume} />}
    </div>
  )
}
