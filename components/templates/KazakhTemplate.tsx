'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import Image from 'next/image'
import { PublicToyResponse, TemplateSettings } from '@/types'
import { GuestRegisterForm } from './GuestRegisterForm'
import { bi } from './strings'
import { BackgroundMusicPlayer } from '@/components/shared/BackgroundMusicPlayer'

export interface TemplateProps {
  event: PublicToyResponse
  rsvpToken?: string
  onAccept?: () => void
  onDecline?: () => void
  rsvpLoading?: boolean
  rsvpDone?: 'accepted' | 'declined' | null
}

const KK_MONTHS = [
  'Қаңтар','Ақпан','Наурыз','Сәуір','Мамыр','Маусым',
  'Шілде','Тамыз','Қыркүйек','Қазан','Қараша','Желтоқсан',
]
const KK_DAYS = ['Жексенбі','Дүйсенбі','Сейсенбі','Сәрсенбі','Бейсенбі','Жұма','Сенбі']

function formatDateKk(dateStr: string) {
  const d = new Date(dateStr)
  return {
    day: KK_DAYS[d.getDay()],
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
    <div className="flex gap-1.5 justify-center flex-wrap">
      {units.map(({ v, label }, i) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <div
              className="w-[58px] h-[58px] flex items-center justify-center rounded-xl text-[22px]"
              style={{
                border: `1px solid ${accent}45`,
                background: `linear-gradient(145deg, ${accent}14, ${accent}05)`,
                color: primary,
                fontFamily: '"Georgia", serif',
                fontWeight: 300,
                letterSpacing: '0.04em',
              }}
            >
              {pad(v)}
            </div>
            <span
              className="text-[9px] uppercase tracking-[0.18em] mt-1.5"
              style={{ color: accent, fontFamily: 'Inter, sans-serif' }}
            >
              {label}
            </span>
          </div>
          {i < 3 && (
            <span className="text-xl -mt-5 select-none" style={{ color: `${accent}55` }}>·</span>
          )}
        </div>
      ))}
    </div>
  )
}

function FloralBanner({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 480 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      style={{ maxHeight: 96, display: 'block', transform: flip ? 'scaleY(-1)' : undefined }}
    >
      {/* Left main branches */}
      <path d="M240 108 Q178 84 118 44" stroke="#7A8F55" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M240 108 Q194 79 152 53" stroke="#7A8F55" strokeWidth="0.75" fill="none" strokeLinecap="round"/>
      <path d="M240 108 Q162 70 88 20" stroke="#7A8F55" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Right main branches */}
      <path d="M240 108 Q302 84 362 44" stroke="#7A8F55" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M240 108 Q286 79 328 53" stroke="#7A8F55" strokeWidth="0.75" fill="none" strokeLinecap="round"/>
      <path d="M240 108 Q318 70 392 20" stroke="#7A8F55" strokeWidth="1" fill="none" strokeLinecap="round"/>

      {/* Left leaves */}
      <ellipse cx="174" cy="60" rx="22" ry="7" transform="rotate(-38 174 60)" fill="#8A9E5A" opacity="0.70"/>
      <ellipse cx="147" cy="44" rx="18" ry="6" transform="rotate(-50 147 44)" fill="#7A8F55" opacity="0.63"/>
      <ellipse cx="114" cy="28" rx="15" ry="5" transform="rotate(-60 114 28)" fill="#6B7C3E" opacity="0.56"/>
      <ellipse cx="89"  cy="16" rx="12" ry="4" transform="rotate(-66 89  16)" fill="#5C6B3A" opacity="0.48"/>
      <ellipse cx="200" cy="75" rx="14" ry="5" transform="rotate(-22 200 75)" fill="#9AAF6A" opacity="0.58"/>
      <ellipse cx="220" cy="88" rx="11" ry="4" transform="rotate(-12 220 88)" fill="#8A9E5A" opacity="0.48"/>
      {/* Right leaves */}
      <ellipse cx="306" cy="60" rx="22" ry="7" transform="rotate(38  306 60)" fill="#8A9E5A" opacity="0.70"/>
      <ellipse cx="333" cy="44" rx="18" ry="6" transform="rotate(50  333 44)" fill="#7A8F55" opacity="0.63"/>
      <ellipse cx="366" cy="28" rx="15" ry="5" transform="rotate(60  366 28)" fill="#6B7C3E" opacity="0.56"/>
      <ellipse cx="391" cy="16" rx="12" ry="4" transform="rotate(66  391 16)" fill="#5C6B3A" opacity="0.48"/>
      <ellipse cx="280" cy="75" rx="14" ry="5" transform="rotate(22  280 75)" fill="#9AAF6A" opacity="0.58"/>
      <ellipse cx="260" cy="88" rx="11" ry="4" transform="rotate(12  260 88)" fill="#8A9E5A" opacity="0.48"/>

      {/* Gold accent buds */}
      <circle cx="147" cy="41" r="3.5" fill="#C4943A" opacity="0.68"/>
      <circle cx="113" cy="26" r="3"   fill="#C4943A" opacity="0.58"/>
      <circle cx="333" cy="41" r="3.5" fill="#C4943A" opacity="0.68"/>
      <circle cx="366" cy="26" r="3"   fill="#C4943A" opacity="0.58"/>
      {/* Center bloom */}
      <circle cx="240" cy="105" r="7"   fill="#C4943A" opacity="0.18"/>
      <circle cx="240" cy="105" r="4"   fill="#C4943A" opacity="0.75"/>
      <circle cx="240" cy="105" r="1.8" fill="#9A6A1A"/>
    </svg>
  )
}

function GoldDividerSmall({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px w-14" style={{ background: `linear-gradient(to right, transparent, ${accent}75)` }}/>
      <svg width="9" height="9" viewBox="0 0 9 9">
        <polygon points="4.5,0 9,4.5 4.5,9 0,4.5" fill={accent} opacity="0.85"/>
      </svg>
      <div className="h-px w-14" style={{ background: `linear-gradient(to left, transparent, ${accent}75)` }}/>
    </div>
  )
}

function GoldDividerFull({ accent }: { accent: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${accent}48)` }}/>
      <svg width="13" height="13" viewBox="0 0 13 13">
        <polygon points="6.5,1 12,6.5 6.5,12 1,6.5" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.65"/>
        <polygon points="6.5,4 9.5,6.5 6.5,9 3.5,6.5" fill={accent} opacity="0.7"/>
      </svg>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${accent}48)` }}/>
    </div>
  )
}

export function KazakhTemplate({ event, rsvpToken, onAccept, onDecline, rsvpLoading, rsvpDone }: TemplateProps) {
  const s: TemplateSettings = event.templateSettings ?? {}
  const bg      = s.backgroundColor ?? '#FDFAF3'
  const primary = s.primaryColor    ?? '#3D2B1F'
  const accent  = s.accentColor     ?? '#C4943A'
  const green   = '#5C6B3A'
  const dateInfo = formatDateKk(event.eventDate)

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ backgroundColor: bg, fontFamily: '"Georgia", "Times New Roman", serif', color: primary }}
    >
      {/* Subtle dot texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0.018,
          backgroundImage: `radial-gradient(circle at 1px 1px, ${primary} 0.8px, transparent 0)`,
          backgroundSize: '22px 22px',
        }}
      />

      <div className="relative z-10 max-w-md mx-auto">

        {/* ── Top botanical ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1 }}>
          <FloralBanner />
        </motion.div>

        <div className="px-6 pb-10 space-y-8">

          {/* ── Greeting + organizer ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="text-center space-y-2.5"
          >
            <p className="text-[11px] uppercase tracking-[0.5em]" style={{ color: accent, fontFamily: 'Inter, sans-serif' }}>
              Құрметті қонақтар!
            </p>
            <GoldDividerSmall accent={accent} />
            <p className="text-xl leading-snug" style={{ color: primary }}>
              {event.organizerDisplayName}
            </p>
            <p className="text-[10px] italic tracking-[0.3em]" style={{ color: green, fontFamily: 'Inter, sans-serif' }}>
              шақырады
            </p>
          </motion.div>

          {/* ── Event title ── */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-center text-4xl sm:text-5xl leading-snug font-normal"
            style={{ color: primary }}
          >
            {event.title}
          </motion.h1>

          <GoldDividerFull accent={accent} />

          {/* ── Description ── */}
          {event.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.68 }}
              className="text-center text-sm leading-[2] italic whitespace-pre-line"
              style={{ color: '#6A4E38' }}
            >
              {event.description}
            </motion.p>
          )}

          {/* ── Countdown + date ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.82 }}
            className="rounded-2xl py-6 px-4 space-y-5"
            style={{
              background: `linear-gradient(150deg, ${accent}08, ${accent}03)`,
              border: `1px solid ${accent}22`,
            }}
          >
            <Countdown targetDate={event.eventDate} primary={primary} accent={accent} />

            {/* Date row */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-10" style={{ background: `${accent}40` }}/>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.28em] mb-1" style={{ color: accent, fontFamily: 'Inter, sans-serif' }}>
                  {dateInfo.day}
                </p>
                <div className="flex items-baseline gap-2.5 justify-center">
                  <span className="text-[42px] leading-none font-light" style={{ color: primary }}>
                    {dateInfo.date}
                  </span>
                  <div className="text-left">
                    <p className="text-sm leading-tight" style={{ color: primary }}>{dateInfo.month}</p>
                    <p className="text-xs leading-tight opacity-55" style={{ color: primary }}>
                      {dateInfo.year} · {dateInfo.time}
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-px w-10" style={{ background: `${accent}40` }}/>
            </div>
          </motion.div>

          {/* ── Location ── */}
          {event.locationName && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.98 }}
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${accent}28` }}
            >
              {/* Header bar */}
              <div className="flex items-center gap-2 px-5 py-2.5" style={{ backgroundColor: `${accent}14` }}>
                <MapPin size={12} style={{ color: accent }} />
                <span className="text-[9px] uppercase tracking-[0.42em]" style={{ color: accent, fontFamily: 'Inter, sans-serif' }}>
                  Мекенжай
                </span>
              </div>
              {/* Body */}
              <div className="px-5 py-4 text-center space-y-3" style={{ backgroundColor: `${accent}05` }}>
                <p className="text-base leading-snug" style={{ color: primary }}>{event.locationName}</p>
                {event.gisLink && (
                  <a
                    href={event.gisLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-5 py-2 rounded-full transition-all hover:opacity-80 active:scale-95"
                    style={{
                      backgroundColor: accent,
                      color: '#FFF7E8',
                      fontFamily: 'Inter, sans-serif',
                      letterSpacing: '0.04em',
                    }}
                  >
                    <MapPin size={11} />
                    Картада ашу
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {/* ── RSVP / Guest registration ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.08 }}
            className="space-y-4"
          >
            <GoldDividerFull accent={accent} />

            {rsvpToken && !rsvpDone && (
              <div className="flex flex-col gap-3 pt-1">
                <button
                  onClick={onAccept}
                  disabled={rsvpLoading}
                  className="w-full py-3.5 text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: primary, color: '#FFF7E8', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}
                >
                  {bi.acceptFull}
                </button>
                <button
                  onClick={onDecline}
                  disabled={rsvpLoading}
                  className="w-full py-3.5 text-sm rounded-xl border transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ borderColor: `${accent}48`, color: primary, backgroundColor: `${accent}07`, fontFamily: 'Inter, sans-serif' }}
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
                textColor={primary}
              />
            )}

            {rsvpDone === 'accepted' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="rounded-2xl p-6 text-center"
                style={{ backgroundColor: `${accent}10`, border: `1px solid ${accent}28` }}
              >
                <div className="text-4xl mb-3">🎉</div>
                <p style={{ color: primary }}>{bi.waitingCelebration}</p>
              </motion.div>
            )}

            {rsvpDone === 'declined' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-2xl p-6 text-center"
                style={{ backgroundColor: `${accent}06` }}
              >
                <div className="text-4xl mb-3">💙</div>
                <p className="text-sm" style={{ color: primary }}>{bi.declinedMsg}</p>
              </motion.div>
            )}
          </motion.div>

          {/* ── Made with Toyla ── */}
          <div className="flex justify-center pt-2">
            <Image
              src="/made-with-toyla.png"
              alt="Made with Toyla"
              width={130}
              height={40}
              className="opacity-50 hover:opacity-85 transition-opacity duration-300"
            />
          </div>

        </div>

        {/* ── Bottom botanical (flipped) ── */}
        <div style={{ transform: 'scaleY(-1)' }}>
          <FloralBanner />
        </div>
      </div>

      {s.musicUrl && (
        <BackgroundMusicPlayer musicUrl={s.musicUrl} autoplay={s.musicAutoplay} loop={s.musicLoop} volume={s.musicVolume} />
      )}
    </div>
  )
}
