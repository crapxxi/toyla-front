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
    <div className="flex gap-1.5 justify-center flex-wrap mb-4">
      {units.map(({ v, label }, i) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <div
              className="w-[54px] h-[54px] flex items-center justify-center rounded-xl text-[20px]"
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
            <span className="text-[9px] uppercase tracking-[0.18em] mt-1.5" style={{ color: accent, fontFamily: 'Inter, sans-serif' }}>
              {label}
            </span>
          </div>
          {i < 3 && <span className="text-xl -mt-5 select-none" style={{ color: `${accent}55` }}>·</span>}
        </div>
      ))}
    </div>
  )
}

// ── Botanical floral banner ────────────────────────────────────────────────────
function FloralBanner({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 480 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      style={{ maxHeight: 100, display: 'block', transform: flip ? 'scaleY(-1)' : undefined }}
    >
      {/* Left branches */}
      <path d="M240 108 Q178 84 118 44" stroke="#7A8F55" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M240 108 Q194 79 152 53" stroke="#7A8F55" strokeWidth="0.75" fill="none" strokeLinecap="round"/>
      <path d="M240 108 Q162 70 88 20" stroke="#7A8F55" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Right branches */}
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

      {/* Flowers — left cluster */}
      {/* Big flower left */}
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const r = angle * Math.PI / 180
        return <ellipse key={`fl-${i}`} cx={88 + Math.cos(r)*13} cy={16 + Math.sin(r)*13} rx="9" ry="14"
          fill="#F4EFE3" opacity="0.82" transform={`rotate(${angle} ${88 + Math.cos(r)*13} ${16 + Math.sin(r)*13})`} />
      })}
      <circle cx="88" cy="16" r="8" fill="#F0E8CF" opacity="0.92"/>
      <circle cx="88" cy="16" r="4" fill="#DBC98A" opacity="0.85"/>
      {/* Small flower left */}
      {[0,60,120,180,240,300].map((angle, i) => {
        const r = angle * Math.PI / 180
        return <ellipse key={`fls-${i}`} cx={114 + Math.cos(r)*9} cy={28 + Math.sin(r)*9} rx="6" ry="9"
          fill="#F4EFE3" opacity="0.75" transform={`rotate(${angle} ${114 + Math.cos(r)*9} ${28 + Math.sin(r)*9})`} />
      })}
      <circle cx="114" cy="28" r="5.5" fill="#F0E8CF" opacity="0.88"/>
      <circle cx="114" cy="28" r="2.5" fill="#DBC98A" opacity="0.8"/>

      {/* Flowers — right cluster */}
      {[0,45,90,135,180,225,270,315].map((angle, i) => {
        const r = angle * Math.PI / 180
        return <ellipse key={`fr-${i}`} cx={391 + Math.cos(r)*13} cy={16 + Math.sin(r)*13} rx="9" ry="14"
          fill="#F4EFE3" opacity="0.82" transform={`rotate(${angle} ${391 + Math.cos(r)*13} ${16 + Math.sin(r)*13})`} />
      })}
      <circle cx="391" cy="16" r="8" fill="#F0E8CF" opacity="0.92"/>
      <circle cx="391" cy="16" r="4" fill="#DBC98A" opacity="0.85"/>
      {[0,60,120,180,240,300].map((angle, i) => {
        const r = angle * Math.PI / 180
        return <ellipse key={`frs-${i}`} cx={366 + Math.cos(r)*9} cy={28 + Math.sin(r)*9} rx="6" ry="9"
          fill="#F4EFE3" opacity="0.75" transform={`rotate(${angle} ${366 + Math.cos(r)*9} ${28 + Math.sin(r)*9})`} />
      })}
      <circle cx="366" cy="28" r="5.5" fill="#F0E8CF" opacity="0.88"/>
      <circle cx="366" cy="28" r="2.5" fill="#DBC98A" opacity="0.8"/>

      {/* Gold buds */}
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

        {/* ── Top botanical banner ── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1 }}>
          <FloralBanner />
        </motion.div>

        <div className="px-6 pb-10 space-y-7">

          {/* ── Greeting ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-center space-y-2.5"
          >
            <p className="text-[11px] uppercase tracking-[0.5em]" style={{ color: accent, fontFamily: 'Inter, sans-serif' }}>
              Құрметті қонақтар!
            </p>
            <GoldDividerSmall accent={accent} />
            <p className="text-base leading-snug" style={{ color: primary }}>
              {event.organizerDisplayName}
            </p>
            <p className="text-[10px] italic tracking-[0.3em]" style={{ color: green, fontFamily: 'Inter, sans-serif' }}>
              шақырады
            </p>
          </motion.div>

          {/* ── Event title — large gold ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46, duration: 0.8 }}
            className="text-center"
          >
            <h1
              className="leading-[1.05] mb-1 whitespace-pre-line"
              style={{
                fontSize: 'clamp(3.2rem, 14vw, 5.5rem)',
                background: `linear-gradient(160deg, #B8960A 0%, #E8C840 35%, #C4943A 65%, #8B6010 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700,
              }}
            >
              {event.title}
            </h1>
          </motion.div>

          <GoldDividerFull accent={accent} />

          {/* ── Description ── */}
          {event.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="text-center text-sm leading-[2] italic whitespace-pre-line"
              style={{ color: '#6A4E38' }}
            >
              {event.description}
            </motion.p>
          )}

          {/* ── Date info — three boxes ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            {s.countdownEnabled && s.countdownTargetDate && (
              <div className="mb-5">
                <Countdown targetDate={s.countdownTargetDate} primary={primary} accent={accent} />
              </div>
            )}

            <div className="flex items-stretch justify-center">
              {/* Time */}
              <div
                className="flex-1 flex flex-col items-center justify-center py-5 px-3"
                style={{ border: `1px solid ${accent}50`, borderRight: 'none', borderRadius: '14px 0 0 14px', backgroundColor: `${accent}05` }}
              >
                <span
                  className="text-3xl font-semibold leading-none"
                  style={{ color: primary }}
                >
                  {dateInfo.time}
                </span>
                <span
                  className="text-[9px] uppercase tracking-[0.3em] mt-2"
                  style={{ color: accent, fontFamily: 'Inter, sans-serif' }}
                >
                  уақыт
                </span>
              </div>

              {/* Day — highlighted center */}
              <div
                className="flex flex-col items-center justify-center py-5 px-6"
                style={{ backgroundColor: `${accent}18`, border: `1px solid ${accent}55` }}
              >
                <span
                  className="leading-none"
                  style={{ fontSize: '3.2rem', fontWeight: 300, color: primary, letterSpacing: '-0.02em' }}
                >
                  {dateInfo.date}
                </span>
                <span
                  className="text-[9px] uppercase tracking-[0.3em] mt-2"
                  style={{ color: accent, fontFamily: 'Inter, sans-serif' }}
                >
                  күні
                </span>
              </div>

              {/* Month + Year */}
              <div
                className="flex-1 flex flex-col items-center justify-center py-5 px-3"
                style={{ border: `1px solid ${accent}50`, borderLeft: 'none', borderRadius: '0 14px 14px 0', backgroundColor: `${accent}05` }}
              >
                <span
                  className="text-sm font-semibold leading-tight text-center"
                  style={{ color: primary }}
                >
                  {dateInfo.year}
                </span>
                <span
                  className="text-sm font-semibold leading-tight text-center mt-0.5"
                  style={{ color: primary }}
                >
                  {dateInfo.month}
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── Location ── */}
          {event.locationName && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95 }}
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${accent}28` }}
            >
              <div className="flex items-center gap-2 px-5 py-2.5" style={{ backgroundColor: `${accent}14` }}>
                <MapPin size={12} style={{ color: accent }} />
                <span className="text-[9px] uppercase tracking-[0.42em]" style={{ color: accent, fontFamily: 'Inter, sans-serif' }}>
                  Мекенжай
                </span>
              </div>
              <div className="px-5 py-4 text-center space-y-3" style={{ backgroundColor: `${accent}05` }}>
                <p className="text-base leading-snug" style={{ color: primary }}>{event.locationName}</p>
                {event.gisLink && (
                  <a
                    href={event.gisLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-5 py-2 rounded-full transition-all hover:opacity-80 active:scale-95"
                    style={{ backgroundColor: accent, color: '#FFF7E8', fontFamily: 'Inter, sans-serif', letterSpacing: '0.04em' }}
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
            transition={{ delay: 1.05 }}
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
