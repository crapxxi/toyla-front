'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, ArrowRight, Phone } from 'lucide-react'
import { TemplateSettings } from '@/types'
import { formatDateFull } from '@/lib/formatters'
import { BackgroundMusicPlayer } from '@/components/shared/BackgroundMusicPlayer'
import { EventCountdown } from '@/components/shared/EventCountdown'
import type { TemplateProps } from './ElegantTemplate'

export function ModernTemplate({ event, rsvpToken, onAccept, onDecline, rsvpLoading, rsvpDone }: TemplateProps) {
  const s: TemplateSettings = event.templateSettings ?? {}
  const bg = s.backgroundColor ?? '#09090F'
  const primary = s.primaryColor ?? '#8B5CF6'
  const accent = s.accentColor ?? '#C4B5FD'
  const greeting = s.greetingText ?? event.organizerDisplayName

  const [guestPhone, setGuestPhone] = useState('')
  const [phoneSent, setPhoneSent] = useState(false)

  const slideUp = {
    hidden: { opacity: 0, y: 32 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.55, ease: 'easeOut' as const } }),
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: bg, color: '#F1F0FF', fontFamily: '"Space Grotesk", "Inter", sans-serif' }}
    >
      {/* Glow blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-[120px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${primary}, transparent)` }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 blur-[100px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}, transparent)` }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5 blur-[80px] pointer-events-none"
        style={{ backgroundColor: primary }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: `linear-gradient(${primary} 1px, transparent 1px), linear-gradient(90deg, ${primary} 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <main className="relative z-10 max-w-xl mx-auto px-6 py-12">
        {/* Greeting badge */}
        <motion.div custom={0} variants={slideUp} initial="hidden" animate="visible" className="mb-6">
          <span
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] px-4 py-2 rounded-full"
            style={{ border: `1px solid ${primary}50`, color: accent, backgroundColor: `${primary}15` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
            {greeting}
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          custom={1} variants={slideUp} initial="hidden" animate="visible"
          className="text-5xl sm:text-6xl font-black leading-none mb-6 tracking-tight"
        >
          {event.title.split(' ').map((word, i) => (
            <span key={i}>
              <span style={{ color: i === 1 || i === 3 ? primary : '#F1F0FF' }}>{word}</span>
              {' '}
            </span>
          ))}
        </motion.h1>

        {/* Gradient rule */}
        <motion.div
          custom={2} variants={slideUp} initial="hidden" animate="visible"
          className="h-px mb-8" style={{ background: `linear-gradient(90deg, ${primary}, ${accent}, transparent)` }}
        />

        {/* Description */}
        <motion.p
          custom={3} variants={slideUp} initial="hidden" animate="visible"
          className="text-sm leading-relaxed mb-8 whitespace-pre-line"
          style={{ color: '#A0A0C0' }}
        >
          {event.description}
        </motion.p>

        {/* Date & location glass cards */}
        <motion.div custom={4} variants={slideUp} initial="hidden" animate="visible" className="space-y-3 mb-8">
          <div
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl"
            style={{ background: 'rgba(139,92,246,0.08)', border: `1px solid ${primary}25`, backdropFilter: 'blur(8px)' }}
          >
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primary}20` }}>
              <Calendar size={15} style={{ color: primary }} />
            </div>
            <p className="text-sm" style={{ color: '#D0CFFF' }}>{formatDateFull(event.eventDate)}</p>
          </div>
          {event.locationName && (
            <div
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl"
              style={{ background: 'rgba(139,92,246,0.08)', border: `1px solid ${primary}25` }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primary}20` }}>
                <MapPin size={15} style={{ color: primary }} />
              </div>
              {event.gisLink ? (
                <a href={event.gisLink} target="_blank" rel="noopener noreferrer"
                  className="text-sm underline underline-offset-2" style={{ color: accent }}>{event.locationName}</a>
              ) : (
                <p className="text-sm" style={{ color: '#D0CFFF' }}>{event.locationName}</p>
              )}
            </div>
          )}
        </motion.div>

        {s.countdownEnabled && s.countdownTargetDate && (
          <EventCountdown targetDate={s.countdownTargetDate} style={s.countdownStyle ?? 'minimal'} position={s.countdownPosition ?? 'bottom'} />
        )}

        {/* RSVP */}
        <motion.div custom={6} variants={slideUp} initial="hidden" animate="visible">
          {rsvpToken && !rsvpDone && (
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: `0 0 32px ${primary}60` }}
                whileTap={{ scale: 0.98 }}
                onClick={onAccept} disabled={rsvpLoading}
                className="flex-1 flex items-center justify-center gap-2 py-4 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
              >
                Принять приглашение <ArrowRight size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={onDecline} disabled={rsvpLoading}
                className="px-6 py-4 text-sm font-medium rounded-xl border transition-all disabled:opacity-50"
                style={{ borderColor: '#333', color: '#888' }}
              >
                Отказаться
              </motion.button>
            </div>
          )}

          {!rsvpToken && !phoneSent && (
            <div
              className="rounded-2xl p-6"
              style={{ background: 'rgba(139,92,246,0.08)', border: `1px solid ${primary}30`, backdropFilter: 'blur(8px)' }}
            >
              <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ color: accent }}>
                Найти моё приглашение
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: primary }} />
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+7 (___) ___-__-__"
                    className="w-full pl-9 pr-3 py-3.5 text-sm rounded-xl outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${primary}40`,
                      color: '#F1F0FF',
                    }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${primary}60` }}
                  onClick={() => setPhoneSent(true)}
                  disabled={guestPhone.length < 10}
                  className="px-4 py-3.5 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
                >
                  →
                </motion.button>
              </div>
            </div>
          )}

          {!rsvpToken && phoneSent && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl p-6 text-center"
              style={{ background: 'rgba(139,92,246,0.1)', border: `1px solid ${primary}30` }}>
              <div className="text-3xl mb-3">📱</div>
              <p className="font-bold mb-1" style={{ color: accent }}>Проверьте WhatsApp</p>
              <p className="text-sm" style={{ color: '#A0A0C0' }}>Ссылка на ваше приглашение отправлена</p>
            </motion.div>
          )}

          {rsvpDone === 'accepted' && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 15 }}
              className="p-6 rounded-2xl text-center border"
              style={{ borderColor: `${primary}40`, backgroundColor: `${primary}12` }}>
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-xl font-bold" style={{ color: accent }}>Ждём вас!</p>
            </motion.div>
          )}

          {rsvpDone === 'declined' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-6 rounded-2xl text-center border border-gray-800 bg-gray-900/50">
              <div className="text-4xl mb-3">💙</div>
              <p style={{ color: '#888' }}>Жаль, что не получится. Спасибо за ответ</p>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom accent */}
        <div className="mt-12 h-px" style={{ background: `linear-gradient(90deg, transparent, ${primary}50, transparent)` }} />
      </main>

      {s.musicUrl && <BackgroundMusicPlayer musicUrl={s.musicUrl} autoplay={s.musicAutoplay} loop={s.musicLoop} volume={s.musicVolume} />}
    </div>
  )
}
