'use client'
import { motion } from 'framer-motion'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'
import { TemplateSettings } from '@/types'
import { formatDateFull } from '@/lib/formatters'
import { BackgroundMusicPlayer } from '@/components/shared/BackgroundMusicPlayer'
import { EventCountdown } from '@/components/shared/EventCountdown'
import type { TemplateProps } from './ElegantTemplate'

export function ModernTemplate({
  event,
  rsvpToken,
  onAccept,
  onDecline,
  rsvpLoading,
  rsvpDone,
}: TemplateProps) {
  const s: TemplateSettings = event.templateSettings ?? {}
  const bg = s.backgroundColor ?? '#0F0F0F'
  const primary = s.primaryColor ?? '#8B5CF6'
  const accent = s.accentColor ?? '#A78BFA'
  const greeting = s.greetingText ?? event.organizerDisplayName

  const slideUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
    }),
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: bg, color: '#F9FAFB', fontFamily: '"Space Grotesk", "Inter", sans-serif' }}
    >
      {/* Geometric shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute top-0 right-0 opacity-20" width="400" height="400" viewBox="0 0 400 400">
          <polygon points="200,20 380,380 20,380" fill="none" stroke={primary} strokeWidth="1" />
          <polygon points="200,60 340,360 60,360" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.6" />
        </svg>
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: primary }}
        />
        <div
          className="absolute top-1/3 right-0 w-48 h-48 rounded-full opacity-10 blur-2xl"
          style={{ backgroundColor: accent }}
        />
      </div>

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

      <main className="relative z-10 max-w-xl mx-auto px-6 py-12">
        <motion.div
          custom={0}
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="mb-2"
        >
          <span
            className="inline-block text-xs font-semibold uppercase tracking-[0.3em] px-3 py-1 rounded-full border"
            style={{ borderColor: `${primary}50`, color: accent }}
          >
            {greeting}
          </span>
        </motion.div>

        {s.coverImageUrl && (
          <motion.img
            custom={1}
            variants={slideUp}
            initial="hidden"
            animate="visible"
            src={s.coverImageUrl}
            alt="Обложка"
            className="w-full rounded-2xl object-cover max-h-64 my-6 shadow-2xl"
          />
        )}

        <motion.h1
          custom={2}
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-5xl font-bold leading-tight mb-6"
          style={{ color: '#F9FAFB' }}
        >
          {event.title.split(' ').map((word, i) => (
            <span key={i}>
              {i % 3 === 1 ? (
                <span style={{ color: primary }}>{word}</span>
              ) : word}
              {' '}
            </span>
          ))}
        </motion.h1>

        <motion.div
          custom={3}
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="h-px mb-6"
          style={{ background: `linear-gradient(90deg, ${primary}, transparent)` }}
        />

        <motion.p
          custom={4}
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="text-sm leading-relaxed text-gray-400 mb-8 whitespace-pre-line"
        >
          {event.description}
        </motion.p>

        <motion.div
          custom={5}
          variants={slideUp}
          initial="hidden"
          animate="visible"
          className="space-y-3 mb-8"
        >
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primary}20` }}>
              <Calendar size={14} style={{ color: primary }} />
            </div>
            <span className="text-gray-300">{formatDateFull(event.eventDate)}</span>
          </div>
          {event.locationName && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primary}20` }}>
                <MapPin size={14} style={{ color: primary }} />
              </div>
              {event.gisLink ? (
                <a href={event.gisLink} target="_blank" rel="noopener noreferrer" style={{ color: accent }} className="underline underline-offset-2">
                  {event.locationName}
                </a>
              ) : (
                <span className="text-gray-300">{event.locationName}</span>
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
            custom={7}
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col sm:flex-row gap-3 mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAccept}
              disabled={rsvpLoading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}
            >
              Принять приглашение
              <ArrowRight size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDecline}
              disabled={rsvpLoading}
              className="px-6 py-3.5 text-sm font-medium rounded-xl border transition-all disabled:opacity-50 text-gray-400 hover:text-gray-200"
              style={{ borderColor: '#333' }}
            >
              Отказаться
            </motion.button>
          </motion.div>
        )}

        {rsvpDone === 'accepted' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="mt-8 p-6 rounded-2xl text-center border"
            style={{ borderColor: `${primary}40`, backgroundColor: `${primary}10` }}
          >
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-xl font-bold" style={{ color: accent }}>
              Отлично! Ждём вас на празднике!
            </p>
          </motion.div>
        )}

        {rsvpDone === 'declined' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-6 rounded-2xl text-center border border-gray-700 bg-gray-900"
          >
            <div className="text-4xl mb-3">💙</div>
            <p className="text-gray-400">Жаль, что не получится. Спасибо за ответ</p>
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
