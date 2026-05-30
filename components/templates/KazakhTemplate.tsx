'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import Image from 'next/image'
import { PublicToyResponse, TemplateSettings } from '@/types'
import { GuestRegisterForm } from './GuestRegisterForm'
import { bi } from './strings'
import { BackgroundMusicPlayer } from '@/components/shared/BackgroundMusicPlayer'

function BotanicalPlaceholder({ accent }: { accent: string }) {
  return (
    <div className="w-full flex items-center justify-center py-4" style={{ opacity: 0.35 }}>
      <svg viewBox="0 0 300 160" fill="none" className="w-full max-w-xs" style={{ maxHeight: 160 }}>
        <path d="M150 158 Q112 130 72 90"  stroke={accent} strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M150 158 Q188 130 228 90" stroke={accent} strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M150 158 Q98 118 54 70"   stroke={accent} strokeWidth="0.9" strokeLinecap="round"/>
        <path d="M150 158 Q202 118 246 70"  stroke={accent} strokeWidth="0.9" strokeLinecap="round"/>
        <path d="M150 158 Q130 100 110 50"  stroke={accent} strokeWidth="0.7" strokeLinecap="round"/>
        <path d="M150 158 Q170 100 190 50"  stroke={accent} strokeWidth="0.7" strokeLinecap="round"/>
        <ellipse cx="108" cy="98"  rx="18" ry="6"  transform="rotate(-38 108 98)"  fill={accent} opacity="0.55"/>
        <ellipse cx="84"  cy="76"  rx="14" ry="4.5" transform="rotate(-52 84  76)"  fill={accent} opacity="0.45"/>
        <ellipse cx="60"  cy="54"  rx="10" ry="3.5" transform="rotate(-60 60  54)"  fill={accent} opacity="0.35"/>
        <ellipse cx="192" cy="98"  rx="18" ry="6"  transform="rotate( 38 192 98)"  fill={accent} opacity="0.55"/>
        <ellipse cx="216" cy="76"  rx="14" ry="4.5" transform="rotate( 52 216 76)"  fill={accent} opacity="0.45"/>
        <ellipse cx="240" cy="54"  rx="10" ry="3.5" transform="rotate( 60 240 54)"  fill={accent} opacity="0.35"/>
        <ellipse cx="130" cy="72"  rx="12" ry="4"  transform="rotate(-20 130 72)"  fill={accent} opacity="0.4"/>
        <ellipse cx="170" cy="72"  rx="12" ry="4"  transform="rotate( 20 170 72)"  fill={accent} opacity="0.4"/>
        <circle cx="84"  cy="72" r="3.5" fill={accent} opacity="0.6"/>
        <circle cx="216" cy="72" r="3.5" fill={accent} opacity="0.6"/>
        <circle cx="60"  cy="50" r="2.5" fill={accent} opacity="0.5"/>
        <circle cx="240" cy="50" r="2.5" fill={accent} opacity="0.5"/>
        <circle cx="150" cy="156" r="4" fill={accent} opacity="0.75"/>
        <circle cx="150" cy="156" r="2" fill={accent} opacity="0.9"/>
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
              style={{ border: `1px solid ${accent}50`, background: `linear-gradient(145deg, ${accent}14, ${accent}04)`, color: primary, fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300 }}
            >
              {pad(v)}
            </div>
            <span className="mt-1.5" style={{ fontSize: 11, color: accent, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-label)' }}>{label}</span>
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
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 500, color: primary }}>{dateInfo.time}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-label)', fontSize: 11, color: accent, letterSpacing: '0.28em', textTransform: 'uppercase' }}>уақыт</span>
      </div>

      {/* Day + Month — centre, prominent */}
      <div className="flex flex-col items-center gap-2">
        <div style={{ ...circleBase, width: 110, height: 110, border: `2px solid ${accent}`, background: `radial-gradient(circle, ${accent}18 0%, ${accent}05 100%)`, boxShadow: `0 0 0 6px ${accent}0C, 0 6px 22px ${accent}14`, flexDirection: 'column' }}>
          <div style={inner(7)} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: 300, color: primary, lineHeight: 1 }}>{dateInfo.date}</span>
          <span style={{ fontFamily: 'var(--font-label)', fontSize: '0.72rem', color: accent, letterSpacing: '0.12em', marginTop: 2 }}>{dateInfo.month}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-label)', fontSize: 11, color: accent, letterSpacing: '0.28em', textTransform: 'uppercase' }}>күні</span>
      </div>

      {/* Year only */}
      <div className="flex flex-col items-center gap-2">
        <div style={{ ...circleBase, width: 84, height: 84, border: `1.5px solid ${accent}45`, backgroundColor: `${accent}06` }}>
          <div style={inner()} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 500, color: primary }}>{dateInfo.year}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-label)', fontSize: 11, color: accent, letterSpacing: '0.28em', textTransform: 'uppercase' }}>жыл</span>
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500;1,600&family=Cormorant+SC:wght@300;400;500&display=swap');
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
          <p style={{ fontFamily: 'var(--font-sc)', fontSize: '0.74rem', letterSpacing: '0.5em', color: accent, fontWeight: 400 }}>
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
            <BotanicalPlaceholder accent={accent} />
          )}
        </motion.div>

        {/* ── Event title — standing alone, beautiful ── */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.9 }}
          className="text-center px-6 -mt-4">
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 11vw, 3.8rem)',
            fontWeight: 300,
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

          {/* ── Greeting / organizer ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.52, duration: 0.8 }}
            className="text-center space-y-3">
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.7rem, 7vw, 2.35rem)', fontStyle: 'italic', fontWeight: 400, color: primary, lineHeight: 1.3 }}>
              Құрметті қонақтар!
            </p>
            <Divider accent={accent} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.55rem', fontStyle: 'italic', fontWeight: 300, color: primary, opacity: 0.8 }}>
              той иесі
            </p>
            <p style={{ fontFamily: 'var(--font-sc)', fontSize: '1.2rem', fontWeight: 400, color: primary, letterSpacing: '0.06em' }}>
              {event.organizerDisplayName}
            </p>
          </motion.div>

          {/* ── Description ── */}
          {event.description && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}
              className="space-y-4">
              <Divider accent={accent} full />
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontStyle: 'italic', fontWeight: 300, color: primary, lineHeight: 1.9, textAlign: 'center', whiteSpace: 'pre-line', opacity: 0.82 }}>
                {event.description}
              </p>
            </motion.div>
          )}

          <Divider accent={accent} full />

          {/* ── Countdown ── */}
          {s.countdownEnabled && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.72 }}
              className="rounded-3xl py-6 px-4"
              style={{ background: `linear-gradient(150deg, ${accent}08, ${accent}03)`, border: `1px solid ${accent}20` }}>
              <p className="text-center mb-4" style={{ fontFamily: 'var(--font-sc)', fontSize: '0.74rem', letterSpacing: '0.35em', color: accent }}>
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
                <span style={{ fontFamily: 'var(--font-sc)', fontSize: '0.7rem', letterSpacing: '0.4em', color: accent }}>
                  МЕКЕНЖАЙ
                </span>
              </div>
              <div className="px-5 py-5 text-center space-y-3" style={{ backgroundColor: `${accent}04` }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontStyle: 'italic', fontWeight: 400, color: primary, lineHeight: 1.45 }}>
                  {event.locationName}
                </p>
                {event.gisLink && (
                  <a href={event.gisLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full transition-all hover:opacity-80"
                    style={{ backgroundColor: accent, color: '#FFF8EC', fontFamily: 'var(--font-sc)', fontSize: '0.8rem', letterSpacing: '0.12em', padding: '0.6rem 1.5rem' }}>
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
                  style={{ backgroundColor: primary, color: '#F8F3E8', fontFamily: 'var(--font-sc)', fontSize: '0.9rem', letterSpacing: '0.16em' }}>
                  {bi.acceptFull}
                </button>
                <button onClick={onDecline} disabled={rsvpLoading}
                  className="w-full py-4 rounded-2xl border transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ borderColor: `${accent}45`, color: primary, backgroundColor: `${accent}06`, fontFamily: 'var(--font-sc)', fontSize: '0.9rem', letterSpacing: '0.16em' }}>
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
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontStyle: 'italic', color: primary }}>{bi.waitingCelebration}</p>
              </motion.div>
            )}

            {rsvpDone === 'declined' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-3xl p-7 text-center" style={{ backgroundColor: `${accent}05` }}>
                <div className="text-4xl mb-3">💙</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.18rem', fontStyle: 'italic', color: primary, opacity: 0.75 }}>{bi.declinedMsg}</p>
              </motion.div>
            )}
          </motion.div>

          {/* ── Closing invitation ── */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.9 }}
            className="text-center space-y-4 pt-2">
            <Divider accent={accent} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.45rem, 6.2vw, 1.9rem)', fontStyle: 'italic', fontWeight: 400, color: primary, lineHeight: 1.45 }}>
              Келіңіздер,<br />біз сіздерді күтеміз!
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
