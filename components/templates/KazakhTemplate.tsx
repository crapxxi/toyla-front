'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import Image from 'next/image'
import { PublicToyResponse, TemplateSettings } from '@/types'
import { GuestRegisterForm } from './GuestRegisterForm'
import { bi } from './strings'
import { BackgroundMusicPlayer } from '@/components/shared/BackgroundMusicPlayer'

/* A single hand-drawn leaf, tip pointing up (toward -y), pivot at its base (0,0). */
function Leaf({ fill, o = 0.6 }: { fill: string; o?: number }) {
  return (
    <>
      <path d="M0 0 C -4.6 -8 -4.6 -22 0 -31 C 4.6 -22 4.6 -8 0 0 Z" fill={fill} opacity={o} />
      <path d="M0 -3 L0 -28" stroke={fill} strokeWidth="0.7" opacity={o * 0.5} fill="none" strokeLinecap="round" />
    </>
  )
}

/* A five-petal blossom centred at (0,0). */
function Bloom({ accent }: { accent: string }) {
  return (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-6.5" rx="3.1" ry="6" transform={`rotate(${a})`} fill={accent} opacity="0.5" />
      ))}
      <circle r="2.6" fill={accent} opacity="0.9" />
    </g>
  )
}

/* One arching branch — leaves along the stem, blossoms at the tips. Grows up-right. */
function Spray({ primary, accent }: { primary: string; accent: string }) {
  return (
    <g>
      <path d="M0 -2 C 14 -28 34 -50 52 -74" stroke={primary} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M6 -10 C 18 -22 30 -30 44 -40" stroke={primary} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.42" />
      <g transform="translate(9 -13) rotate(34)"><Leaf fill={primary} o={0.58} /></g>
      <g transform="translate(18 -27) rotate(30) scale(1.05)"><Leaf fill={primary} o={0.6} /></g>
      <g transform="translate(28 -41) rotate(26) scale(0.95)"><Leaf fill={primary} o={0.54} /></g>
      <g transform="translate(38 -55) rotate(22) scale(0.82)"><Leaf fill={primary} o={0.46} /></g>
      <g transform="translate(47 -68) rotate(18) scale(0.66)"><Leaf fill={primary} o={0.38} /></g>
      <g transform="translate(16 -16) rotate(72) scale(0.9)"><Leaf fill={primary} o={0.48} /></g>
      <g transform="translate(27 -28) rotate(78) scale(0.78)"><Leaf fill={primary} o={0.42} /></g>
      <g transform="translate(37 -38) rotate(84) scale(0.6)"><Leaf fill={primary} o={0.34} /></g>
      <g transform="translate(53 -76)"><Bloom accent={accent} /></g>
      <g transform="translate(45 -41) scale(0.72)"><Bloom accent={accent} /></g>
      <circle cx="33" cy="-20" r="2.2" fill={accent} opacity="0.65" />
      <circle cx="22" cy="-10" r="1.8" fill={accent} opacity="0.5" />
    </g>
  )
}

/* Central upright stalk with symmetric leaf pairs and a crowning blossom. */
function CenterStalk({ primary, accent }: { primary: string; accent: string }) {
  return (
    <g>
      <path d="M0 0 C -3 -30 3 -60 0 -92" stroke={primary} strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.55" />
      <g transform="translate(0 -24) rotate(-42) scale(0.7)"><Leaf fill={primary} o={0.44} /></g>
      <g transform="translate(0 -24) rotate(42) scale(0.7)"><Leaf fill={primary} o={0.44} /></g>
      <g transform="translate(0 -46) rotate(-34) scale(0.6)"><Leaf fill={primary} o={0.38} /></g>
      <g transform="translate(0 -46) rotate(34) scale(0.6)"><Leaf fill={primary} o={0.38} /></g>
      <g transform="translate(0 -100) scale(1.3)"><Bloom accent={accent} /></g>
    </g>
  )
}

/* High-detail botanical spray — green foliage with golden blossoms, mirrored for symmetry. */
function BotanicalPlaceholder({ accent, primary }: { accent: string; primary: string }) {
  return (
    <div className="w-full flex items-center justify-center py-3">
      <svg viewBox="0 0 300 210" fill="none" className="w-full" style={{ maxWidth: 270, maxHeight: 210 }}>
        <g transform="translate(150 184)">
          <CenterStalk primary={primary} accent={accent} />
          <Spray primary={primary} accent={accent} />
          <g transform="scale(-1 1)"><Spray primary={primary} accent={accent} /></g>
          <circle cx="0" cy="0" r="3" fill={accent} opacity="0.7" />
          <circle cx="0" cy="0" r="1.4" fill={accent} />
        </g>
      </svg>
    </div>
  )
}

export interface TemplateProps {
  event: PublicToyResponse
  rsvpToken?: string
  onAccept?: () => void
  onDecline?: () => void
  rsvpLoading?: boolean
  rsvpDone?: 'accepted' | 'declined' | null
}

const KK_MONTHS = [
  'ҚАҢТАР','АҚПАН','НАУРЫЗ','СӘУІР','МАМЫР','МАУСЫМ',
  'ШІЛДЕ','ТАМЫЗ','ҚЫРКҮЙЕК','ҚАЗАН','ҚАРАША','ЖЕЛТОҚСАН',
]

function formatDateKk(dateStr: string) {
  const d = new Date(dateStr)
  return {
    date: d.getDate(),
    month: KK_MONTHS[d.getMonth()],
    year: d.getFullYear(),
    time: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,
  }
}

function getTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number) { return String(n).padStart(2, '0') }

function Countdown({ targetDate, primary, accent }: { targetDate: string; primary: string; accent: string }) {
  const [t, setT] = useState(() => getTimeLeft(targetDate))
  useEffect(() => {
    const id = setInterval(() => setT(getTimeLeft(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])
  if (!t) return null
  const units = [
    { v: t.days,    label: 'Күн' },
    { v: t.hours,   label: 'Сағат' },
    { v: t.minutes, label: 'Минут' },
    { v: t.seconds, label: 'Секунд' },
  ]
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {units.map(({ v, label }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div
              className="w-[58px] h-[58px] flex items-center justify-center rounded-2xl"
              style={{ border: `1px solid ${accent}50`, background: `linear-gradient(145deg, ${accent}14, ${accent}04)`, color: primary, fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600 }}
            >
              {pad(v)}
            </div>
            <span className="mt-1.5" style={{ fontSize: 11, color: accent, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-label)', fontWeight: 600 }}>{label}</span>
          </div>
          {i < 3 && <span className="text-lg -mt-5 opacity-20" style={{ color: accent }}>·</span>}
        </div>
      ))}
    </div>
  )
}

function Divider({ accent, full }: { accent: string; full?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px" style={{ width: full ? undefined : 48, flex: full ? 1 : undefined, background: `linear-gradient(to right, transparent, ${accent}60)` }} />
      <svg width="7" height="7" viewBox="0 0 7 7"><polygon points="3.5,0 7,3.5 3.5,7 0,3.5" fill={accent} opacity="0.7" /></svg>
      <div className="h-px" style={{ width: full ? undefined : 48, flex: full ? 1 : undefined, background: `linear-gradient(to left, transparent, ${accent}60)` }} />
    </div>
  )
}

function DateCircles({ dateInfo, accent, primary }: { dateInfo: ReturnType<typeof formatDateKk>; accent: string; primary: string }) {
  const circleBase: React.CSSProperties = {
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  }
  const inner = (inset = 5): React.CSSProperties => ({
    position: 'absolute', inset,
    borderRadius: '50%',
    border: `0.75px dashed ${accent}35`,
  })

  return (
    <div className="flex items-end justify-center gap-5">
      {/* Time */}
      <div className="flex flex-col items-center gap-2">
        <div style={{ ...circleBase, width: 84, height: 84, border: `1.5px solid ${accent}45`, backgroundColor: `${accent}06` }}>
          <div style={inner()} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: primary }}>{dateInfo.time}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-label)', fontSize: 11, color: accent, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600 }}>уақыт</span>
      </div>

      {/* Day + Month — centre, prominent */}
      <div className="flex flex-col items-center gap-2">
        <div style={{ ...circleBase, width: 110, height: 110, border: `2px solid ${accent}`, background: `radial-gradient(circle, ${accent}18 0%, ${accent}05 100%)`, boxShadow: `0 0 0 6px ${accent}0C, 0 6px 22px ${accent}14`, flexDirection: 'column' }}>
          <div style={inner(7)} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.9rem', fontWeight: 500, color: primary, lineHeight: 1 }}>{dateInfo.date}</span>
          <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.74rem', color: accent, letterSpacing: '0.12em', marginTop: 2, fontWeight: 600 }}>{dateInfo.month}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-label)', fontSize: 11, color: accent, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600 }}>күні</span>
      </div>

      {/* Year only */}
      <div className="flex flex-col items-center gap-2">
        <div style={{ ...circleBase, width: 84, height: 84, border: `1.5px solid ${accent}45`, backgroundColor: `${accent}06` }}>
          <div style={inner()} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 600, color: primary }}>{dateInfo.year}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-label)', fontSize: 11, color: accent, letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600 }}>жыл</span>
      </div>
    </div>
  )
}

export function KazakhTemplate({ event, rsvpToken, onAccept, onDecline, rsvpLoading, rsvpDone }: TemplateProps) {
  const s: TemplateSettings = event.templateSettings ?? {}
  const bg      = s.backgroundColor ?? '#FFFFFF'
  const primary = s.primaryColor    ?? '#2D4A1E'
  const accent  = s.accentColor     ?? '#B8963C'
  const dateInfo = formatDateKk(event.eventDate)

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: bg, color: primary }}>

      {/* ── Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Cormorant+SC:wght@400;500;600;700&display=swap');
        :root {
          --font-display: 'Cormorant Garamond', Georgia, serif;
          --font-sc:      'Cormorant SC', Georgia, serif;
          --font-label:   'Cormorant SC', Georgia, serif;
        }
      `}</style>

      <div className="relative z-10 max-w-md mx-auto">

        {/* ── "МЕРЕЙ ТОЙҒА ШАҚЫРУ" top label ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.9 }}
          className="text-center pt-9 pb-1">
          <p style={{ fontFamily: 'var(--font-sc)', fontSize: '0.78rem', letterSpacing: '0.5em', color: accent, fontWeight: 600 }}>
            МЕРЕЙ ТОЙҒА ШАҚЫРУ
          </p>
        </motion.div>

        {/* ── Cover image or botanical placeholder ── */}
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.18, duration: 1.1 }}
          className="px-6">
          {event.images && event.images.length > 0 ? (
            <Image
              src={event.images[0].url}
              alt={event.title}
              width={700}
              height={700}
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 12 }}
              priority
            />
          ) : (
            <BotanicalPlaceholder accent={accent} primary={primary} />
          )}
        </motion.div>

        {/* ── Event title — standing alone, beautiful ── */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.9 }}
          className="text-center px-6 -mt-4">
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 11vw, 3.9rem)',
            fontWeight: 600,
            fontStyle: 'italic',
            color: primary,
            lineHeight: 1.2,
            whiteSpace: 'pre-line',
          }}>
            {event.title}
          </h1>
        </motion.div>

        <div className="px-7 pb-12 space-y-8 mt-6">

          <Divider accent={accent} full />

          {/* ── Greeting ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52, duration: 0.8 }}
            className="text-center">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 8.5vw, 2.9rem)', fontStyle: 'italic', fontWeight: 700, color: primary, lineHeight: 1.2 }}>
              Құрметті қонақтар!
            </p>
          </motion.div>

          {/* ── Description ── */}
          {event.description && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
              className="space-y-4">
              <Divider accent={accent} full />
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontStyle: 'italic', fontWeight: 500, color: primary, lineHeight: 1.85, textAlign: 'center', whiteSpace: 'pre-line', opacity: 0.9 }}>
                {event.description}
              </p>
            </motion.div>
          )}

          {/* ── Той иесі (host) — below the text, above the date ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8 }}
            className="text-center space-y-2.5">
            <Divider accent={accent} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontStyle: 'italic', fontWeight: 500, color: primary, opacity: 0.85 }}>
              той иесі
            </p>
            <p style={{ fontFamily: 'var(--font-sc)', fontSize: '1.4rem', fontWeight: 600, color: primary, letterSpacing: '0.05em' }}>
              {event.organizerDisplayName}
            </p>
          </motion.div>

          <Divider accent={accent} full />

          {/* ── Countdown ── */}
          {s.countdownEnabled && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.72 }}
              className="rounded-3xl py-6 px-4"
              style={{ background: `linear-gradient(150deg, ${accent}08, ${accent}03)`, border: `1px solid ${accent}20` }}>
              <p className="text-center mb-4" style={{ fontFamily: 'var(--font-sc)', fontSize: '0.78rem', letterSpacing: '0.35em', color: accent, fontWeight: 600 }}>
                ДЕЙІН ҚАЛДЫ
              </p>
              <Countdown targetDate={s.countdownTargetDate ?? event.eventDate} primary={primary} accent={accent} />
            </motion.div>
          )}

          {/* ── Date circles ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
            <DateCircles dateInfo={dateInfo} accent={accent} primary={primary} />
          </motion.div>

          {/* ── Location ── */}
          {event.locationName && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
              className="rounded-3xl overflow-hidden" style={{ border: `1px solid ${accent}28` }}>
              <div className="flex items-center justify-center gap-2 px-5 py-2.5" style={{ backgroundColor: `${accent}0E` }}>
                <MapPin size={11} style={{ color: accent }} />
                <span style={{ fontFamily: 'var(--font-sc)', fontSize: '0.74rem', letterSpacing: '0.4em', color: accent, fontWeight: 600 }}>
                  МЕКЕНЖАЙ
                </span>
              </div>
              <div className="px-5 py-5 text-center space-y-3" style={{ backgroundColor: `${accent}04` }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontStyle: 'italic', fontWeight: 600, color: primary, lineHeight: 1.45 }}>
                  {event.locationName}
                </p>
                {event.gisLink && (
                  <a href={event.gisLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full transition-all hover:opacity-80"
                    style={{ backgroundColor: accent, color: '#FFF8EC', fontFamily: 'var(--font-sc)', fontSize: '0.85rem', letterSpacing: '0.12em', padding: '0.65rem 1.6rem', fontWeight: 600 }}>
                    <MapPin size={10} /> Картада ашу
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {/* ── RSVP ── */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="space-y-4">
            <Divider accent={accent} full />

            {rsvpToken && !rsvpDone && (
              <div className="flex flex-col gap-3 pt-1">
                <button onClick={onAccept} disabled={rsvpLoading}
                  className="w-full py-4 rounded-2xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: primary, color: '#F8F3E8', fontFamily: 'var(--font-sc)', fontSize: '0.95rem', letterSpacing: '0.14em', fontWeight: 600 }}>
                  {bi.acceptFull}
                </button>
                <button onClick={onDecline} disabled={rsvpLoading}
                  className="w-full py-4 rounded-2xl border transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ borderColor: `${accent}45`, color: primary, backgroundColor: `${accent}06`, fontFamily: 'var(--font-sc)', fontSize: '0.95rem', letterSpacing: '0.14em', fontWeight: 600 }}>
                  {bi.decline}
                </button>
              </div>
            )}

            {!rsvpToken && (
              <GuestRegisterForm toyId={event.id} primaryColor={primary} accentColor={accent} variant="light" textColor={primary} />
            )}

            {rsvpDone === 'accepted' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 15 }}
                className="rounded-3xl p-7 text-center" style={{ backgroundColor: `${accent}0A`, border: `1px solid ${accent}25` }}>
                <div className="text-4xl mb-3">🎉</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontStyle: 'italic', fontWeight: 600, color: primary }}>{bi.waitingCelebration}</p>
              </motion.div>
            )}

            {rsvpDone === 'declined' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-3xl p-7 text-center" style={{ backgroundColor: `${accent}05` }}>
                <div className="text-4xl mb-3">💙</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontStyle: 'italic', fontWeight: 500, color: primary, opacity: 0.75 }}>{bi.declinedMsg}</p>
              </motion.div>
            )}
          </motion.div>

          {/* ── Closing invitation ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.9 }}
            className="text-center space-y-4 pt-2">
            <Divider accent={accent} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 6.4vw, 1.95rem)', fontStyle: 'italic', fontWeight: 600, color: primary, lineHeight: 1.4 }}>
              Сіздерді салтанатты мерекемізде асыға күтеміз!
            </p>
          </motion.div>

          {event.showWatermark !== false && (
          <div className="flex justify-center pt-2 pb-6">
            <a href="https://toyla.app" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 opacity-30 hover:opacity-60 transition-opacity duration-300 select-none"
              style={{ textDecoration: 'none' }}>
              <svg width="14" height="14" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.9">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const a = (i * Math.PI * 2) / 14
                    const r1 = 12, r2 = 19
                    return <line key={i} x1={20 + r1 * Math.cos(a)} y1={20 + r1 * Math.sin(a)} x2={20 + r2 * Math.cos(a)} y2={20 + r2 * Math.sin(a)} stroke="#261B11" strokeWidth="1.4" strokeLinecap="round" />
                  })}
                  <circle cx="20" cy="20" r="11.5" stroke="#261B11" strokeWidth="1.4" fill="none" />
                  <circle cx="20" cy="20" r="9" stroke="#261B11" strokeWidth="1" fill="none" />
                  <circle cx="20" cy="20" r="2.5" fill="#261B11" />
                </g>
              </svg>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-spectral, Georgia, serif)', fontWeight: 500, color: '#261B11', letterSpacing: '0.02em' }}>
                Toyla
              </span>
            </a>
          </div>
          )}
        </div>
      </div>

      {(s.musicUrl ?? event.musicUrl) && (
        <BackgroundMusicPlayer musicUrl={(s.musicUrl ?? event.musicUrl)!} autoplay={s.musicAutoplay} loop={s.musicLoop} volume={s.musicVolume} />
      )}
    </div>
  )
}
