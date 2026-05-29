'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Phone } from 'lucide-react'
import { TemplateSettings } from '@/types'
import { formatDateFull } from '@/lib/formatters'
import { BackgroundMusicPlayer } from '@/components/shared/BackgroundMusicPlayer'
import { EventCountdown } from '@/components/shared/EventCountdown'
import type { TemplateProps } from './ElegantTemplate'

export function MinimalistTemplate({ event, rsvpToken, onAccept, onDecline, rsvpLoading, rsvpDone }: TemplateProps) {
  const s: TemplateSettings = event.templateSettings ?? {}
  const bg = s.backgroundColor ?? '#FFFFFF'
  const primary = s.primaryColor ?? '#111827'
  const accent = s.accentColor ?? '#9CA3AF'
  const greeting = s.greetingText ?? event.organizerDisplayName
  const fontFamily = s.fontFamily === 'serif' ? '"Georgia", serif' : s.fontFamily === 'cursive' ? 'cursive' : 'Inter, sans-serif'

  const [guestPhone, setGuestPhone] = useState('')
  const [phoneSent, setPhoneSent] = useState(false)

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
                Принять
              </button>
              <button
                onClick={onDecline} disabled={rsvpLoading}
                className="flex-1 py-3.5 text-sm font-medium border transition-colors disabled:opacity-50 hover:bg-gray-50"
                style={{ borderColor: primary, color: primary }}
              >
                Отказаться
              </button>
            </div>
          )}

          {!rsvpToken && !phoneSent && (
            <div>
              <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: accent }}>Подтвердить участие</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: accent }} />
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="Номер телефона"
                    className="w-full pl-8 pr-3 py-3 text-sm border outline-none transition-colors"
                    style={{ borderColor: `${primary}20`, color: primary, backgroundColor: bg }}
                    onFocus={(e) => { e.target.style.borderColor = primary }}
                    onBlur={(e) => { e.target.style.borderColor = `${primary}20` }}
                  />
                </div>
                <button
                  onClick={() => setPhoneSent(true)}
                  disabled={guestPhone.length < 10}
                  className="px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-30"
                  style={{ backgroundColor: primary }}
                >
                  →
                </button>
              </div>
            </div>
          )}

          {!rsvpToken && phoneSent && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6">
              <p className="text-sm font-medium mb-1" style={{ color: primary }}>Проверьте WhatsApp</p>
              <p className="text-sm" style={{ color: accent }}>Ссылка на приглашение отправлена</p>
            </motion.div>
          )}

          {rsvpDone === 'accepted' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 text-center">
              <p className="text-xl font-light" style={{ color: primary }}>Ждём вас</p>
            </motion.div>
          )}

          {rsvpDone === 'declined' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8">
              <p className="text-sm" style={{ color: accent }}>Жаль, что не получится. Спасибо за ответ</p>
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
