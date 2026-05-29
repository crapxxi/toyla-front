'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Phone } from 'lucide-react'
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

function GoldOrnament({ flip }: { flip?: boolean }) {
  return (
    <svg width="320" height="32" viewBox="0 0 320 32" fill="none" style={{ transform: flip ? 'scaleY(-1)' : undefined }}>
      <line x1="0" y1="16" x2="130" y2="16" stroke="#C9A84C" strokeWidth="0.6" />
      <line x1="190" y1="16" x2="320" y2="16" stroke="#C9A84C" strokeWidth="0.6" />
      <polygon points="160,4 168,16 160,28 152,16" fill="none" stroke="#C9A84C" strokeWidth="0.8" />
      <circle cx="160" cy="16" r="3" fill="#C9A84C" />
      <circle cx="140" cy="16" r="1.5" fill="#C9A84C" opacity="0.5" />
      <circle cx="180" cy="16" r="1.5" fill="#C9A84C" opacity="0.5" />
      <circle cx="125" cy="16" r="1" fill="#C9A84C" opacity="0.3" />
      <circle cx="195" cy="16" r="1" fill="#C9A84C" opacity="0.3" />
    </svg>
  )
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
  const bg = s.backgroundColor ?? '#FFFEF8'
  const primary = s.primaryColor ?? '#8B6914'
  const accent = s.accentColor ?? '#C9A84C'
  const font = s.fontFamily === 'sans-serif' ? 'Inter, sans-serif' : s.fontFamily === 'cursive' ? '"Cormorant Garamond", cursive' : '"Georgia", "Times New Roman", serif'
  const greeting = s.greetingText ?? `${event.organizerDisplayName} приглашает вас`

  const [guestPhone, setGuestPhone] = useState('')
  const [phoneSent, setPhoneSent] = useState(false)

  return (
    <div
      className="min-h-screen relative"
      style={{ backgroundColor: bg, fontFamily: font, color: '#2C1810' }}
    >
      {/* Subtle texture pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${primary} 0, ${primary} 1px, transparent 0, transparent 50%)`,
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 max-w-lg mx-auto px-6 py-10">
        {/* Top ornament */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex justify-center mb-8"
        >
          <GoldOrnament />
        </motion.div>

        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center text-xs uppercase tracking-[0.4em] mb-4"
          style={{ color: accent, fontFamily: 'Inter, sans-serif' }}
        >
          {greeting}
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="text-center text-4xl sm:text-5xl leading-tight mb-3"
          style={{ color: primary, fontFamily: '"Georgia", "Times New Roman", serif', fontWeight: 400 }}
        >
          {event.title}
        </motion.h1>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.65, duration: 0.7 }}
          className="flex items-center justify-center gap-3 mb-6"
          style={{ transformOrigin: 'center' }}
        >
          <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(to right, transparent, ${accent})` }} />
          <svg width="16" height="16" viewBox="0 0 16 16"><polygon points="8,1 15,8 8,15 1,8" fill={accent} /></svg>
          <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(to left, transparent, ${accent})` }} />
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.6 }}
          className="text-center text-sm leading-relaxed mb-8 whitespace-pre-line italic"
          style={{ color: '#5C3D2A' }}
        >
          {event.description}
        </motion.p>

        {/* Date & location */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="border rounded-xl p-5 mb-8 space-y-3 text-center"
          style={{ borderColor: `${accent}40`, backgroundColor: `${accent}08` }}
        >
          <div className="flex items-center justify-center gap-2.5 text-sm">
            <Calendar size={15} style={{ color: accent }} />
            <span style={{ color: primary }} className="font-medium">{formatDateFull(event.eventDate)}</span>
          </div>
          {event.locationName && (
            <div className="flex items-center justify-center gap-2.5 text-sm">
              <MapPin size={15} style={{ color: accent }} />
              {event.gisLink ? (
                <a href={event.gisLink} target="_blank" rel="noopener noreferrer"
                  className="underline underline-offset-2" style={{ color: primary }}>
                  {event.locationName}
                </a>
              ) : (
                <span style={{ color: primary }}>{event.locationName}</span>
              )}
            </div>
          )}
        </motion.div>

        {s.countdownEnabled && s.countdownTargetDate && (
          <EventCountdown targetDate={s.countdownTargetDate} style={s.countdownStyle ?? 'elegant'} position={s.countdownPosition ?? 'bottom'} />
        )}

        {/* RSVP section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {rsvpToken && !rsvpDone && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onAccept}
                disabled={rsvpLoading}
                className="px-8 py-3.5 text-white text-sm font-medium rounded-full transition-all hover:opacity-90 disabled:opacity-50 shadow-md"
                style={{ backgroundColor: primary }}
              >
                Принять приглашение
              </button>
              <button
                onClick={onDecline}
                disabled={rsvpLoading}
                className="px-8 py-3.5 text-sm font-medium rounded-full border transition-all hover:opacity-80 disabled:opacity-50"
                style={{ borderColor: accent, color: primary, backgroundColor: `${accent}10` }}
              >
                Отказаться
              </button>
            </div>
          )}

          {!rsvpToken && !phoneSent && (
            <div className="border rounded-2xl p-6" style={{ borderColor: `${accent}40`, backgroundColor: `${accent}06` }}>
              <p className="text-center text-xs uppercase tracking-widest mb-4" style={{ color: accent, fontFamily: 'Inter, sans-serif' }}>
                Подтвердите присутствие
              </p>
              <p className="text-center text-sm mb-4" style={{ color: '#5C3D2A' }}>
                Введите ваш номер телефона
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: accent }} />
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                    className="w-full pl-9 pr-3 py-3 text-sm rounded-xl border outline-none transition-all"
                    style={{ borderColor: `${accent}60`, backgroundColor: 'white', color: '#2C1810' }}
                  />
                </div>
                <button
                  onClick={() => setPhoneSent(true)}
                  disabled={guestPhone.length < 10}
                  className="px-4 py-3 text-white text-sm rounded-xl transition-all hover:opacity-90 disabled:opacity-40 whitespace-nowrap"
                  style={{ backgroundColor: primary }}
                >
                  Найти →
                </button>
              </div>
            </div>
          )}

          {!rsvpToken && phoneSent && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-6 text-center border"
              style={{ borderColor: `${accent}40`, backgroundColor: `${accent}08` }}
            >
              <div className="text-3xl mb-3">📱</div>
              <p className="font-medium mb-1" style={{ color: primary }}>Проверьте WhatsApp</p>
              <p className="text-sm" style={{ color: '#5C3D2A' }}>Мы отправили ссылку на ваше приглашение</p>
            </motion.div>
          )}

          {rsvpDone === 'accepted' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 14 }}
              className="rounded-2xl p-6 text-center"
              style={{ backgroundColor: `${primary}12` }}
            >
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-lg" style={{ color: primary }}>Ждём вас на торжестве!</p>
            </motion.div>
          )}

          {rsvpDone === 'declined' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl p-6 text-center"
              style={{ backgroundColor: '#F5F0EC' }}
            >
              <div className="text-4xl mb-3">💙</div>
              <p className="text-sm" style={{ color: '#5C3D2A' }}>Жаль, что не получится. Спасибо за ответ</p>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom ornament */}
        <div className="flex justify-center mt-10">
          <GoldOrnament flip />
        </div>
      </div>

      {s.musicUrl && (
        <BackgroundMusicPlayer musicUrl={s.musicUrl} autoplay={s.musicAutoplay} loop={s.musicLoop} volume={s.musicVolume} />
      )}
    </div>
  )
}
