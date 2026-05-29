'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar } from 'lucide-react'
import { PublicToyResponse, TemplateSettings } from '@/types'
import { formatDateFull } from '@/lib/formatters'
import { BackgroundMusicPlayer } from '@/components/shared/BackgroundMusicPlayer'
import { EventCountdown } from '@/components/shared/EventCountdown'
import type { TemplateProps } from './ElegantTemplate'

function ConfettiCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const pieces = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -100,
      r: Math.random() * 6 + 3,
      dx: (Math.random() - 0.5) * 3,
      dy: Math.random() * 3 + 2,
      color: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF8E53', '#A78BFA', '#34D399'][
        Math.floor(Math.random() * 6)
      ],
      rotation: Math.random() * 360,
      rotDelta: (Math.random() - 0.5) * 8,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach((p) => {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 2)
        ctx.restore()
        p.x += p.dx
        p.y += p.dy
        p.rotation += p.rotDelta
        if (p.y > canvas.height) {
          p.y = -10
          p.x = Math.random() * canvas.width
        }
      })
      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ display: active ? 'block' : 'none' }}
    />
  )
}

export function FestiveTemplate({
  event,
  rsvpToken,
  onAccept,
  onDecline,
  rsvpLoading,
  rsvpDone,
}: TemplateProps) {
  const s: TemplateSettings = event.templateSettings ?? {}
  const primary = s.primaryColor ?? '#FF6B6B'
  const bg1 = s.backgroundColor ?? '#1a0533'
  const accent = s.accentColor ?? '#FFE66D'
  const greeting = s.greetingText ?? `${event.organizerDisplayName} приглашает вас!`

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, damping: 18 } },
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${bg1} 0%, #2d0a5c 50%, #1a0533 100%)`,
        color: '#fff',
      }}
    >
      <ConfettiCanvas active={rsvpDone === 'accepted'} />

      {/* Stars background */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              opacity: Math.random() * 0.6 + 0.2,
              animation: `pulse ${1.5 + Math.random() * 2}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-lg mx-auto px-6 py-12 text-center"
      >
        {s.coverImageUrl && (
          <motion.img
            variants={itemVariants}
            src={s.coverImageUrl}
            alt="Обложка"
            className="w-full rounded-2xl shadow-2xl object-cover max-h-64 mb-8"
          />
        )}

        <motion.p
          variants={itemVariants}
          className="text-xs uppercase tracking-[0.3em] mb-3 opacity-80"
          style={{ color: accent }}
        >
          {greeting}
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-4xl font-bold mb-6 leading-tight"
          style={{
            background: `linear-gradient(135deg, ${accent}, ${primary})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {event.title}
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-sm leading-relaxed opacity-80 mb-8 whitespace-pre-line"
        >
          {event.description}
        </motion.p>

        <motion.div variants={itemVariants} className="space-y-2 mb-8">
          <div className="flex items-center justify-center gap-2 text-sm opacity-90">
            <Calendar size={14} style={{ color: accent }} />
            <span>{formatDateFull(event.eventDate)}</span>
          </div>
          {event.locationName && (
            <div className="flex items-center justify-center gap-2 text-sm opacity-90">
              <MapPin size={14} style={{ color: accent }} />
              {event.gisLink ? (
                <a href={event.gisLink} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
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
            style={s.countdownStyle ?? 'festive'}
            position={s.countdownPosition ?? 'bottom'}
          />
        )}

        {rsvpToken && !rsvpDone && (
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 justify-center mt-8"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAccept}
              disabled={rsvpLoading}
              className="px-8 py-3 text-sm font-semibold rounded-full transition-all disabled:opacity-50 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${primary}, ${accent})`, color: '#1a0533' }}
            >
              Принять приглашение 🎉
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDecline}
              disabled={rsvpLoading}
              className="px-8 py-3 text-sm font-medium rounded-full border border-white/30 text-white hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Отказаться
            </motion.button>
          </motion.div>
        )}

        {rsvpDone === 'accepted' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 12 }}
            className="mt-8 p-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm text-center"
          >
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-xl font-bold">Отлично! Ждём вас на празднике!</p>
          </motion.div>
        )}

        {rsvpDone === 'declined' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 p-6 rounded-2xl border border-white/20 bg-white/5 text-center"
          >
            <div className="text-4xl mb-3">💙</div>
            <p className="opacity-80">Жаль, что не получится. Спасибо за ответ</p>
          </motion.div>
        )}
      </motion.main>

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
