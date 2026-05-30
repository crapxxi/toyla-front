'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar } from 'lucide-react'
import { TemplateSettings } from '@/types'
import { formatDateFull } from '@/lib/formatters'
import { BackgroundMusicPlayer } from '@/components/shared/BackgroundMusicPlayer'
import { EventCountdown } from '@/components/shared/EventCountdown'
import type { TemplateProps } from './ElegantTemplate'
import { bi } from './strings'
import { GuestRegisterForm } from './GuestRegisterForm'

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
    const pieces = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * -100,
      r: Math.random() * 7 + 3, dx: (Math.random() - 0.5) * 3,
      dy: Math.random() * 3 + 1.5,
      color: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF8E53', '#A78BFA', '#34D399', '#F472B6'][Math.floor(Math.random() * 7)],
      rotation: Math.random() * 360, rotDelta: (Math.random() - 0.5) * 8,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach((p) => {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.8)
        ctx.restore()
        p.x += p.dx; p.y += p.dy; p.rotation += p.rotDelta
        if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width }
      })
      animFrameRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [active])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ display: active ? 'block' : 'none' }} />
}

export function FestiveTemplate({ event, rsvpToken, onAccept, onDecline, rsvpLoading, rsvpDone }: TemplateProps) {
  const s: TemplateSettings = event.templateSettings ?? {}
  const primary = s.primaryColor ?? '#FF6B6B'
  const bg = s.backgroundColor ?? '#0D0221'
  const accent = s.accentColor ?? '#FFE66D'
  const greeting = s.greetingText ?? `${event.organizerDisplayName} ${bi.invitesFestive}`

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
  const itemVariants = {
    hidden: { opacity: 0, y: 28, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, damping: 18 } },
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${bg} 0%, #1E0547 50%, ${bg} 100%)`, color: '#fff' }}
    >
      <ConfettiCanvas active={rsvpDone === 'accepted'} />

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 1}px`, height: `${Math.random() * 2 + 1}px`,
              left: `${Math.random() * 100}%`, top: `${Math.random() * 70}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `pulse ${1.5 + Math.random() * 2.5}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Gradient glow blobs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${primary}, transparent)` }} />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}, transparent)` }} />

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-lg mx-auto px-6 py-12 text-center"
      >
        {/* Emoji decorations */}
        <motion.div variants={itemVariants} className="text-3xl mb-4 select-none">🎉 🎊 ✨</motion.div>

        <motion.p variants={itemVariants} className="text-xs uppercase tracking-[0.3em] mb-3 opacity-80" style={{ color: accent }}>
          {greeting}
        </motion.p>

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight"
          style={{ background: `linear-gradient(135deg, ${accent} 0%, ${primary} 60%, #F472B6 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          {event.title}
        </motion.h1>

        <motion.p variants={itemVariants} className="text-sm leading-relaxed opacity-75 mb-8 whitespace-pre-line">
          {event.description}
        </motion.p>

        {/* Date/location card */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-5 mb-8 space-y-3 text-left backdrop-blur-sm"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}25` }}>
              <Calendar size={14} style={{ color: accent }} />
            </div>
            <span className="opacity-90">{formatDateFull(event.eventDate)}</span>
          </div>
          {event.locationName && (
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primary}25` }}>
                <MapPin size={14} style={{ color: primary }} />
              </div>
              {event.gisLink ? (
                <a href={event.gisLink} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 opacity-90">{event.locationName}</a>
              ) : (
                <span className="opacity-90">{event.locationName}</span>
              )}
            </div>
          )}
        </motion.div>

        {s.countdownEnabled && s.countdownTargetDate && (
          <EventCountdown targetDate={s.countdownTargetDate} style={s.countdownStyle ?? 'festive'} position={s.countdownPosition ?? 'bottom'} />
        )}

        {/* RSVP */}
        <motion.div variants={itemVariants}>
          {rsvpToken && !rsvpDone && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onAccept} disabled={rsvpLoading}
                className="px-8 py-3.5 text-sm font-bold rounded-full transition-all disabled:opacity-50 shadow-lg"
                style={{ background: `linear-gradient(135deg, ${primary}, ${accent})`, color: '#0D0221' }}
              >
                {bi.acceptFestive}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onDecline} disabled={rsvpLoading}
                className="px-8 py-3.5 text-sm font-medium rounded-full border border-white/25 text-white hover:bg-white/10 transition-all disabled:opacity-50"
              >
                {bi.cantMake}
              </motion.button>
            </div>
          )}

          {!rsvpToken && (
            <GuestRegisterForm
              toyId={event.id}
              primaryColor={primary}
              accentColor={accent}
              variant="glass"
            />
          )}

          {rsvpDone === 'accepted' && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 12 }}
              className="p-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm text-center">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-xl font-bold">{bi.waitingFestive}</p>
            </motion.div>
          )}

          {rsvpDone === 'declined' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="p-6 rounded-2xl border border-white/15 bg-white/5 text-center">
              <div className="text-4xl mb-3">💙</div>
              <p className="opacity-75">{bi.declinedMsg}</p>
            </motion.div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="text-2xl mt-10 select-none opacity-40">✦ ✦ ✦</motion.div>
      </motion.main>

      {s.musicUrl && <BackgroundMusicPlayer musicUrl={s.musicUrl} autoplay={s.musicAutoplay} loop={s.musicLoop} volume={s.musicVolume} />}
    </div>
  )
}
