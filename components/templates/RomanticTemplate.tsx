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

function PetalDecor({ color, size = 100, opacity = 0.3 }: { color: string; size?: number; opacity?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ opacity }}>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <ellipse key={i} cx="50" cy="28" rx="14" ry="22" fill={color}
          transform={`rotate(${angle} 50 50)`} opacity={0.4 - i * 0.02} />
      ))}
      <circle cx="50" cy="50" r="10" fill={color} opacity="0.6" />
    </svg>
  )
}

export function RomanticTemplate({ event, rsvpToken, onAccept, onDecline, rsvpLoading, rsvpDone }: TemplateProps) {
  const s: TemplateSettings = event.templateSettings ?? {}
  const bg = s.backgroundColor ?? '#FFF0F5'
  const primary = s.primaryColor ?? '#BE4B7A'
  const accent = s.accentColor ?? '#F5A7C7'
  const greeting = s.greetingText ?? `${event.organizerDisplayName} ${bi.invites}`

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${bg} 0%, #FFE4F0 50%, ${bg} 100%)`, color: '#3D0A1E', fontFamily: '"Cormorant Garamond", "Georgia", serif' }}
    >
      {/* Petal decorations */}
      <div className="absolute -top-8 -left-8 pointer-events-none">
        <PetalDecor color={accent} size={160} opacity={0.35} />
      </div>
      <div className="absolute -top-8 -right-8 pointer-events-none" style={{ transform: 'scaleX(-1)' }}>
        <PetalDecor color={primary} size={140} opacity={0.25} />
      </div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none">
        <PetalDecor color={accent} size={200} opacity={0.2} />
      </div>

      <main className="relative z-10 max-w-md mx-auto px-6 py-12 text-center">

        {/* Decorative top */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          {['❀', '✿', '❀'].map((f, i) => (
            <span key={i} className="text-lg" style={{ color: accent, opacity: 0.6 + i * 0.1 }}>{f}</span>
          ))}
        </motion.div>

        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm italic mb-3"
          style={{ color: primary }}
        >
          {greeting}
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="text-5xl sm:text-6xl font-light leading-tight mb-5"
          style={{ color: primary }}
        >
          {event.title}
        </motion.h1>

        {/* Heart divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3 mb-6"
        >
          <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(to right, transparent, ${accent})` }} />
          <span className="text-xl" style={{ color: primary }}>♥</span>
          <div className="h-px flex-1 max-w-[80px]" style={{ background: `linear-gradient(to left, transparent, ${accent})` }} />
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-base leading-relaxed mb-8 whitespace-pre-line"
          style={{ color: '#6B2040' }}
        >
          {event.description}
        </motion.p>

        {/* Date/location */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="rounded-2xl p-5 mb-8 space-y-3"
          style={{ backgroundColor: `${accent}20`, border: `1px solid ${accent}50` }}
        >
          <div className="flex items-center justify-center gap-2.5 text-sm">
            <Calendar size={14} style={{ color: primary }} />
            <span style={{ color: '#4A1A2C' }}>{formatDateFull(event.eventDate)}</span>
          </div>
          {event.locationName && (
            <div className="flex items-center justify-center gap-2.5 text-sm">
              <MapPin size={14} style={{ color: primary }} />
              {event.gisLink ? (
                <a href={event.gisLink} target="_blank" rel="noopener noreferrer"
                  style={{ color: primary }} className="underline underline-offset-2">{event.locationName}</a>
              ) : (
                <span style={{ color: '#4A1A2C' }}>{event.locationName}</span>
              )}
            </div>
          )}
        </motion.div>

        {s.countdownEnabled && s.countdownTargetDate && (
          <EventCountdown targetDate={s.countdownTargetDate} style={s.countdownStyle ?? 'elegant'} position={s.countdownPosition ?? 'bottom'} />
        )}

        {/* RSVP */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
        >
          {rsvpToken && !rsvpDone && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onAccept} disabled={rsvpLoading}
                className="px-8 py-3.5 text-white text-sm rounded-full transition-all hover:opacity-90 disabled:opacity-50 shadow-md"
                style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
              >
                {bi.acceptRomantic}
              </button>
              <button
                onClick={onDecline} disabled={rsvpLoading}
                className="px-8 py-3.5 text-sm rounded-full border transition-all hover:bg-pink-50 disabled:opacity-50"
                style={{ borderColor: accent, color: primary }}
              >
                {bi.cantMake}
              </button>
            </div>
          )}

          {!rsvpToken && (
            <GuestRegisterForm
              toyId={event.id}
              primaryColor={primary}
              accentColor={accent}
              variant="light"
              textColor="#6B2040"
            />
          )}

          {rsvpDone === 'accepted' && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 14 }}
              className="p-6 rounded-2xl text-center" style={{ backgroundColor: `${accent}25` }}>
              <div className="text-4xl mb-3">🌸</div>
              <p className="text-lg font-light" style={{ color: primary }}>{bi.waitingRomantic}</p>
            </motion.div>
          )}

          {rsvpDone === 'declined' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 rounded-2xl text-center bg-pink-50">
              <div className="text-4xl mb-3">💙</div>
              <p className="text-base font-light" style={{ color: '#6B2040' }}>{bi.declinedMsg}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom flowers */}
        <div className="flex items-center justify-center gap-3 mt-10 opacity-40">
          {['❀', '✿', '❀', '✿', '❀'].map((f, i) => (
            <span key={i} style={{ color: i % 2 === 0 ? accent : primary }}>{f}</span>
          ))}
        </div>
      </main>

      {s.musicUrl && <BackgroundMusicPlayer musicUrl={s.musicUrl} autoplay={s.musicAutoplay} loop={s.musicLoop} volume={s.musicVolume} />}
    </div>
  )
}
