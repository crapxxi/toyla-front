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
    <div className="flex gap-2 justify-center flex-wrap">
      {units.map(({ v, label }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div
              className="w-[56px] h-[56px] flex items-center justify-center rounded-2xl text-[20px]"
              style={{ border: `1px solid ${accent}55`, background: `linear-gradient(145deg, ${accent}18, ${accent}06)`, color: primary, fontFamily: '"Georgia", serif', fontWeight: 300 }}
            >
              {pad(v)}
            </div>
            <span className="text-[9px] uppercase tracking-[0.2em] mt-1.5" style={{ color: accent, fontFamily: 'Inter, sans-serif' }}>{label}</span>
          </div>
          {i < 3 && <span className="text-lg -mt-5 opacity-25" style={{ color: accent }}>·</span>}
        </div>
      ))}
    </div>
  )
}

function GoldDividerSmall({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px w-14" style={{ background: `linear-gradient(to right, transparent, ${accent}70)` }} />
      <svg width="8" height="8" viewBox="0 0 8 8"><polygon points="4,0 8,4 4,8 0,4" fill={accent} opacity="0.8" /></svg>
      <div className="h-px w-14" style={{ background: `linear-gradient(to left, transparent, ${accent}70)` }} />
    </div>
  )
}

function GoldDividerFull({ accent }: { accent: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${accent}45)` }} />
      <svg width="12" height="12" viewBox="0 0 12 12">
        <polygon points="6,1 11,6 6,11 1,6" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.6" />
        <polygon points="6,3.5 8.5,6 6,8.5 3.5,6" fill={accent} opacity="0.65" />
      </svg>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${accent}45)` }} />
    </div>
  )
}

function DateCircles({ dateInfo, accent, primary }: { dateInfo: ReturnType<typeof formatDateKk>; accent: string; primary: string }) {
  return (
    <div className="flex items-end justify-center gap-4">
      {/* Time */}
      <div className="flex flex-col items-center gap-2">
        <div style={{ width: 82, height: 82, borderRadius: '50%', border: `1.5px solid ${accent}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: `${accent}08` }}>
          <div style={{ position: 'absolute', inset: 5, borderRadius: '50%', border: `0.75px dashed ${accent}35` }} />
          <span style={{ fontSize: '1.05rem', fontWeight: 600, color: primary, fontFamily: '"Georgia", serif' }}>{dateInfo.time}</span>
        </div>
        <span style={{ fontSize: 9, color: accent, letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>уақыт</span>
      </div>

      {/* Day — center, larger */}
      <div className="flex flex-col items-center gap-2">
        <div style={{ width: 108, height: 108, borderRadius: '50%', border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: `radial-gradient(circle, ${accent}1A 0%, ${accent}06 100%)`, boxShadow: `0 0 0 5px ${accent}0F, 0 4px 18px ${accent}16` }}>
          <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', border: `0.75px dashed ${accent}45` }} />
          <span style={{ fontSize: '2.6rem', fontWeight: 300, color: primary, lineHeight: 1, fontFamily: '"Georgia", serif' }}>{dateInfo.date}</span>
        </div>
        <span style={{ fontSize: 9, color: accent, letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>күні</span>
      </div>

      {/* Month + Year */}
      <div className="flex flex-col items-center gap-2">
        <div style={{ width: 82, height: 82, borderRadius: '50%', border: `1.5px solid ${accent}50`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: `${accent}08` }}>
          <div style={{ position: 'absolute', inset: 5, borderRadius: '50%', border: `0.75px dashed ${accent}35` }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: primary, textAlign: 'center', lineHeight: 1.5, fontFamily: '"Georgia", serif' }}>
            {dateInfo.year}<br />{dateInfo.month}
          </span>
        </div>
        <span style={{ fontSize: 9, color: accent, letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>жыл</span>
      </div>
    </div>
  )
}

// ── Main template ──────────────────────────────────────────────────────────────
export function KazakhTemplate({ event, rsvpToken, onAccept, onDecline, rsvpLoading, rsvpDone }: TemplateProps) {
  const s: TemplateSettings = event.templateSettings ?? {}
  const bg      = s.backgroundColor ?? '#FAFAF7'
  const primary = s.primaryColor    ?? '#2D4A1E'
  const accent  = s.accentColor     ?? '#B8963C'
  const dateInfo = formatDateKk(event.eventDate)

  // Script font for all Kazakh text
  const script = '"Marck Script", Georgia, serif'
  const serif  = '"Georgia", "Times New Roman", serif'

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: bg, color: primary }}>
      {/* Marck Script — Cyrillic cursive */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Marck+Script&display=swap');`}</style>

      {/* Subtle texture */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.01, backgroundImage: `radial-gradient(circle at 1px 1px, ${primary} 0.8px, transparent 0)`, backgroundSize: '24px 24px' }} />

      <div className="relative z-10 max-w-md mx-auto">

        {/* ── МЕРЕЙ ТОЙҒА ШАҚЫРУ ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.8 }}
          className="text-center pt-8 pb-1">
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.58rem', letterSpacing: '0.55em', textTransform: 'uppercase', color: accent, fontWeight: 600 }}>
            МЕРЕЙ ТОЙҒА ШАҚЫРУ
          </p>
        </motion.div>

        {/* ── Real wreath image with event title overlaid ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="relative px-2"
          style={{ userSelect: 'none' }}
        >
          <Image
            src="/shablon-img.png"
            alt="Botanical wreath"
            width={700}
            height={700}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            priority
          />
          {/* Title centered inside the wreath ring */}
          <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: '6%' }}>
            <div className="text-center" style={{ width: '52%' }}>
              <p style={{
                fontFamily: script,
                fontSize: 'clamp(1.3rem, 6.5vw, 2rem)',
                color: primary,
                lineHeight: 1.35,
                whiteSpace: 'pre-line',
              }}>
                {event.title}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="px-6 pb-10 space-y-7">

          {/* ── Greeting / organizer ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
            className="text-center space-y-2.5">
            <p style={{ fontSize: 'clamp(1.5rem, 7vw, 2rem)', color: primary, fontFamily: script, lineHeight: 1.3 }}>
              Құрметті қонақтар!
            </p>
            <GoldDividerSmall accent={accent} />
            <p style={{ fontSize: '1.05rem', color: primary, fontFamily: serif }}>
              {event.organizerDisplayName}
            </p>
            <p style={{ fontFamily: script, fontSize: '1.35rem', color: primary, opacity: 0.85 }}>
              сізді шақырады
            </p>
          </motion.div>

          {/* ── Description ── */}
          {event.description && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.68 }}>
              <GoldDividerFull accent={accent} />
              <p className="text-center text-sm leading-[2.1] whitespace-pre-line mt-5"
                style={{ color: primary, opacity: 0.8, fontFamily: script, fontSize: '1rem' }}>
                {event.description}
              </p>
            </motion.div>
          )}

          {/* ── Countdown ── */}
          {s.countdownEnabled && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
              className="rounded-2xl py-5 px-3"
              style={{ background: `linear-gradient(150deg, ${accent}08, ${accent}03)`, border: `1px solid ${accent}22` }}>
              <p className="text-center text-[9px] uppercase tracking-[0.4em] mb-4"
                style={{ color: accent, fontFamily: 'Inter, sans-serif' }}>дейін қалды</p>
              <Countdown targetDate={s.countdownTargetDate ?? event.eventDate} primary={primary} accent={accent} />
            </motion.div>
          )}

          {/* ── Date circles ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.82 }}>
            <DateCircles dateInfo={dateInfo} accent={accent} primary={primary} />
          </motion.div>

          {/* ── Location ── */}
          {event.locationName && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}
              className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${accent}30` }}>
              <div className="flex items-center gap-2 px-5 py-2.5" style={{ backgroundColor: `${accent}12` }}>
                <MapPin size={12} style={{ color: accent }} />
                <span className="text-[9px] uppercase tracking-[0.42em]" style={{ color: accent, fontFamily: 'Inter, sans-serif' }}>Мекенжай</span>
              </div>
              <div className="px-5 py-4 text-center space-y-3" style={{ backgroundColor: `${accent}05` }}>
                <p style={{ fontSize: '1rem', color: primary, fontFamily: script, lineHeight: 1.4 }}>{event.locationName}</p>
                {event.gisLink && (
                  <a href={event.gisLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-5 py-2 rounded-full transition-all hover:opacity-80"
                    style={{ backgroundColor: accent, color: '#FFF7E8', fontFamily: 'Inter, sans-serif', letterSpacing: '0.04em' }}>
                    <MapPin size={11} /> Картада ашу
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {/* ── RSVP ── */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }} className="space-y-4">
            <GoldDividerFull accent={accent} />

            {rsvpToken && !rsvpDone && (
              <div className="flex flex-col gap-3 pt-1">
                <button onClick={onAccept} disabled={rsvpLoading}
                  className="w-full py-3.5 text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: primary, color: '#F5F0E8', letterSpacing: '0.06em', fontFamily: 'Inter, sans-serif' }}>
                  {bi.acceptFull}
                </button>
                <button onClick={onDecline} disabled={rsvpLoading}
                  className="w-full py-3.5 text-sm rounded-xl border transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ borderColor: `${accent}50`, color: primary, backgroundColor: `${accent}07`, fontFamily: 'Inter, sans-serif' }}>
                  {bi.decline}
                </button>
              </div>
            )}

            {!rsvpToken && (
              <GuestRegisterForm toyId={event.id} primaryColor={primary} accentColor={accent} variant="light" textColor={primary} />
            )}

            {rsvpDone === 'accepted' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 15 }}
                className="rounded-2xl p-6 text-center" style={{ backgroundColor: `${accent}10`, border: `1px solid ${accent}28` }}>
                <div className="text-4xl mb-3">🎉</div>
                <p style={{ color: primary, fontFamily: serif }}>{bi.waitingCelebration}</p>
              </motion.div>
            )}

            {rsvpDone === 'declined' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl p-6 text-center" style={{ backgroundColor: `${accent}06` }}>
                <div className="text-4xl mb-3">💙</div>
                <p style={{ color: primary, fontFamily: serif, fontSize: '0.9rem' }}>{bi.declinedMsg}</p>
              </motion.div>
            )}
          </motion.div>

          <div className="flex justify-center pt-2">
            <Image src="/made-with-toyla.png" alt="Made with Toyla" width={130} height={40}
              className="opacity-40 hover:opacity-75 transition-opacity duration-300" />
          </div>
        </div>
      </div>

      {s.musicUrl && (
        <BackgroundMusicPlayer musicUrl={s.musicUrl} autoplay={s.musicAutoplay} loop={s.musicLoop} volume={s.musicVolume} />
      )}
    </div>
  )
}
