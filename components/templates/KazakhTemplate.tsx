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
    { v: t.days, label: 'Күн' },
    { v: t.hours, label: 'Сағат' },
    { v: t.minutes, label: 'Минут' },
    { v: t.seconds, label: 'Секунд' },
  ]
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {units.map(({ v, label }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="w-[56px] h-[56px] flex items-center justify-center rounded-2xl text-[20px]"
              style={{ border: `1px solid ${accent}45`, background: `linear-gradient(145deg, ${accent}18, ${accent}06)`, color: primary, fontFamily: '"Georgia", serif', fontWeight: 300 }}>
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

// ── Botanical wreath with event title inside ───────────────────────────────────
function BotanicalWreath({ title, gold, primary }: { title: string; gold: string; primary: string }) {
  // leaf(L, W) = right-pointing canonical leaf path
  const lf = (L: number, W: number) =>
    `M 0,0 C ${L * 0.2},${-W} ${L * 0.55},${-(W * 1.2)} ${L},0 C ${L * 0.55},${W * 1.2} ${L * 0.2},${W} 0,0 Z`

  const d1 = '#2D4A1E'
  const d2 = '#3D5C2A'
  const d3 = '#4E7038'
  const d4 = '#6A8F52'
  const d5 = '#8DAA72'
  const d6 = '#A8BFA0'
  const fw = 'rgba(232,242,225,0.92)'
  const fs = '#9BB88A'

  return (
    <div className="relative" style={{ width: '100%', maxWidth: 320, margin: '0 auto' }}>
      <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>

        {/* ── Gold rings (rendered first so leaves appear on top) ── */}
        <circle cx="160" cy="160" r="121" stroke={gold} strokeWidth="2.2" fill="none" />
        <circle cx="160" cy="160" r="126" stroke={gold} strokeWidth="0.9" fill="none" opacity="0.45" />

        {/* ── RIGHT cluster: stems near ring, leaves extend outward ── */}
        {/* Large main leaves */}
        <path d={lf(90, 18)} fill={d1} transform="translate(216,48) rotate(-55)" />
        <path d={lf(82, 17)} fill={d2} transform="translate(248,80) rotate(-37)" opacity="0.95" />
        <path d={lf(84, 20)} fill={d1} transform="translate(268,116) rotate(-18)" />
        <path d={lf(76, 18)} fill={d3} transform="translate(280,160) rotate(1)" opacity="0.88" />
        <path d={lf(78, 17)} fill={d2} transform="translate(268,202) rotate(19)" opacity="0.93" />
        <path d={lf(68, 15)} fill={d1} transform="translate(248,238) rotate(38)" />
        <path d={lf(58, 13)} fill={d3} transform="translate(218,264) rotate(58)" opacity="0.82" />

        {/* Accent / secondary leaves right */}
        <path d={lf(64, 13)} fill={d4} transform="translate(235,58) rotate(-47)" opacity="0.72" />
        <path d={lf(60, 20)} fill={d5} transform="translate(275,140) rotate(-8)" opacity="0.62" />
        <path d={lf(54, 12)} fill={d4} transform="translate(244,250) rotate(46)" opacity="0.68" />
        <path d={lf(44, 10)} fill={d6} transform="translate(230,272) rotate(65)" opacity="0.55" />
        <path d={lf(40, 9)} fill={d5} transform="translate(225,52) rotate(-63)" opacity="0.5" />
        <path d={lf(36, 8)} fill={d6} transform="translate(258,94) rotate(-28)" opacity="0.45" />

        {/* White flower sprigs — right */}
        <line x1="256" y1="66" x2="272" y2="50" stroke={fs} strokeWidth="0.9" strokeLinecap="round" />
        <circle cx="272" cy="50" r="2.8" fill={fw} />
        <circle cx="266" cy="55" r="2.2" fill={fw} opacity="0.8" />
        <circle cx="260" cy="60" r="1.8" fill={fw} opacity="0.65" />

        <line x1="276" y1="138" x2="294" y2="128" stroke={fs} strokeWidth="0.9" strokeLinecap="round" />
        <circle cx="294" cy="128" r="2.6" fill={fw} />
        <circle cx="288" cy="132" r="2" fill={fw} opacity="0.75" />
        <circle cx="282" cy="136" r="1.6" fill={fw} opacity="0.6" />

        {/* ── LEFT cluster ── */}
        <path d={lf(88, 18)} fill={d1} transform="translate(102,268) rotate(118)" />
        <path d={lf(84, 18)} fill={d2} transform="translate(56,228) rotate(150)" opacity="0.95" />
        <path d={lf(78, 17)} fill={d1} transform="translate(38,185) rotate(170)" />
        <path d={lf(72, 16)} fill={d3} transform="translate(42,140) rotate(191)" opacity="0.88" />
        <path d={lf(82, 18)} fill={d2} transform="translate(60,98) rotate(218)" opacity="0.93" />
        <path d={lf(76, 16)} fill={d1} transform="translate(98,63) rotate(242)" />
        <path d={lf(62, 13)} fill={d3} transform="translate(138,44) rotate(262)" opacity="0.82" />

        {/* Accent left */}
        <path d={lf(62, 13)} fill={d4} transform="translate(64,110) rotate(206)" opacity="0.72" />
        <path d={lf(58, 19)} fill={d5} transform="translate(40,160) rotate(180)" opacity="0.62" />
        <path d={lf(52, 11)} fill={d4} transform="translate(68,232) rotate(142)" opacity="0.68" />
        <path d={lf(44, 10)} fill={d6} transform="translate(107,262) rotate(126)" opacity="0.55" />
        <path d={lf(40, 9)} fill={d5} transform="translate(100,55) rotate(252)" opacity="0.5" />
        <path d={lf(36, 8)} fill={d6} transform="translate(62,76) rotate(232)" opacity="0.45" />

        {/* White flower sprigs — left */}
        <line x1="64" y1="218" x2="48" y2="204" stroke={fs} strokeWidth="0.9" strokeLinecap="round" />
        <circle cx="48" cy="204" r="2.8" fill={fw} />
        <circle cx="54" cy="210" r="2.2" fill={fw} opacity="0.8" />
        <circle cx="60" cy="215" r="1.8" fill={fw} opacity="0.65" />

        <line x1="44" y1="142" x2="27" y2="134" stroke={fs} strokeWidth="0.9" strokeLinecap="round" />
        <circle cx="27" cy="134" r="2.6" fill={fw} />
        <circle cx="33" cy="138" r="2" fill={fw} opacity="0.75" />
        <circle cx="39" cy="141" r="1.6" fill={fw} opacity="0.6" />

        {/* ── Small gold circles at bottom ── */}
        <circle cx="148" cy="282" r="3.8" stroke={gold} strokeWidth="1.6" fill="none" opacity="0.72" />
        <circle cx="160" cy="286" r="4.8" stroke={gold} strokeWidth="2" fill="none" opacity="0.9" />
        <circle cx="172" cy="282" r="3.8" stroke={gold} strokeWidth="1.6" fill="none" opacity="0.72" />
      </svg>

      {/* Title text centered inside the ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ paddingBottom: 10 }}>
        <div className="text-center px-10">
          <p style={{
            fontFamily: '"Marck Script", "Dancing Script", Georgia, serif',
            fontSize: 'clamp(1.5rem, 7.5vw, 2.2rem)',
            color: primary,
            lineHeight: 1.35,
            whiteSpace: 'pre-line',
          }}>
            {title}
          </p>
        </div>
      </div>
    </div>
  )
}

function GoldDividerSmall({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="h-px w-12" style={{ background: `linear-gradient(to right, transparent, ${accent}75)` }} />
      <svg width="9" height="9" viewBox="0 0 9 9"><polygon points="4.5,0 9,4.5 4.5,9 0,4.5" fill={accent} opacity="0.85" /></svg>
      <div className="h-px w-12" style={{ background: `linear-gradient(to left, transparent, ${accent}75)` }} />
    </div>
  )
}

function GoldDividerFull({ accent }: { accent: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${accent}48)` }} />
      <svg width="13" height="13" viewBox="0 0 13 13">
        <polygon points="6.5,1 12,6.5 6.5,12 1,6.5" fill="none" stroke={accent} strokeWidth="0.8" opacity="0.65" />
        <polygon points="6.5,4 9.5,6.5 6.5,9 3.5,6.5" fill={accent} opacity="0.7" />
      </svg>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${accent}48)` }} />
    </div>
  )
}

function DateCircles({ dateInfo, accent, primary }: { dateInfo: ReturnType<typeof formatDateKk>; accent: string; primary: string }) {
  return (
    <div className="flex items-end justify-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <div style={{ width: 82, height: 82, borderRadius: '50%', border: `1.5px solid ${accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: `${accent}06` }}>
          <div style={{ position: 'absolute', inset: 5, borderRadius: '50%', border: `0.75px dashed ${accent}38` }} />
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: primary }}>{dateInfo.time}</span>
        </div>
        <span style={{ fontSize: 9, color: accent, letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>уақыт</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div style={{ width: 106, height: 106, borderRadius: '50%', border: `2px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', background: `radial-gradient(circle, ${accent}20 0%, ${accent}07 100%)`, boxShadow: `0 0 0 5px ${accent}10, 0 4px 18px ${accent}18` }}>
          <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', border: `0.75px dashed ${accent}48` }} />
          <span style={{ fontSize: '2.5rem', fontWeight: 300, color: primary, lineHeight: 1 }}>{dateInfo.date}</span>
        </div>
        <span style={{ fontSize: 9, color: accent, letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>күні</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div style={{ width: 82, height: 82, borderRadius: '50%', border: `1.5px solid ${accent}55`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: `${accent}06` }}>
          <div style={{ position: 'absolute', inset: 5, borderRadius: '50%', border: `0.75px dashed ${accent}38` }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: primary, textAlign: 'center', lineHeight: 1.5 }}>
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
  const accent  = s.accentColor     ?? '#C4A84C'
  const dateInfo = formatDateKk(event.eventDate)

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: bg, color: primary }}>
      {/* Google Font — Marck Script (Cyrillic cursive) */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Marck+Script&display=swap');`}</style>

      {/* Subtle dot texture */}
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.012, backgroundImage: `radial-gradient(circle at 1px 1px, ${primary} 0.8px, transparent 0)`, backgroundSize: '24px 24px' }} />

      <div className="relative z-10 max-w-md mx-auto">

        {/* ── МЕРЕЙ ТОЙҒА ШАҚЫРУ label at very top ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.8 }}
          className="text-center pt-8 pb-2">
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', letterSpacing: '0.55em', textTransform: 'uppercase', color: accent, fontWeight: 600 }}>
            МЕРЕЙ ТОЙҒА ШАҚЫРУ
          </p>
        </motion.div>

        {/* ── Botanical wreath with event title ── */}
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 1 }}
          className="px-4">
          <BotanicalWreath title={event.title} gold={accent} primary={primary} />
        </motion.div>

        <div className="px-6 pb-10 space-y-7">

          {/* ── Greeting / "Кто зовёт" ── */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.7 }}
            className="text-center space-y-2.5">
            <p style={{ fontSize: 'clamp(1.55rem, 7.5vw, 2.1rem)', color: primary, fontFamily: '"Marck Script", Georgia, serif', lineHeight: 1.3 }}>
              Құрметті қонақтар!
            </p>
            <GoldDividerSmall accent={accent} />
            <p style={{ fontSize: '1.05rem', color: primary, fontFamily: '"Georgia", serif' }}>
              {event.organizerDisplayName}
            </p>
            {/* "сізді шақырады" in Marck Script cursive */}
            <p style={{ fontFamily: '"Marck Script", Georgia, serif', fontSize: '1.3rem', color: accent, letterSpacing: '0.03em' }}>
              сізді шақырады
            </p>
          </motion.div>

          {/* ── Description ── */}
          {event.description && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.68 }}>
              <GoldDividerFull accent={accent} />
              <p className="text-center text-sm leading-[2.1] italic whitespace-pre-line mt-5"
                style={{ color: primary, opacity: 0.82, fontFamily: '"Georgia", serif' }}>
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
              className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${accent}28` }}>
              <div className="flex items-center gap-2 px-5 py-2.5" style={{ backgroundColor: `${accent}14` }}>
                <MapPin size={12} style={{ color: accent }} />
                <span className="text-[9px] uppercase tracking-[0.42em]" style={{ color: accent, fontFamily: 'Inter, sans-serif' }}>Мекенжай</span>
              </div>
              <div className="px-5 py-4 text-center space-y-3" style={{ backgroundColor: `${accent}05` }}>
                <p className="text-base leading-snug" style={{ color: primary }}>{event.locationName}</p>
                {event.gisLink && (
                  <a href={event.gisLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs px-5 py-2 rounded-full transition-all hover:opacity-80"
                    style={{ backgroundColor: accent, color: '#FFF7E8', fontFamily: 'Inter, sans-serif' }}>
                    <MapPin size={11} />Картада ашу
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
                  style={{ backgroundColor: primary, color: '#FFF7E8', letterSpacing: '0.07em', fontFamily: 'Inter, sans-serif' }}>
                  {bi.acceptFull}
                </button>
                <button onClick={onDecline} disabled={rsvpLoading}
                  className="w-full py-3.5 text-sm rounded-xl border transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ borderColor: `${accent}48`, color: primary, backgroundColor: `${accent}07`, fontFamily: 'Inter, sans-serif' }}>
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
                <p style={{ color: primary }}>{bi.waitingCelebration}</p>
              </motion.div>
            )}

            {rsvpDone === 'declined' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-2xl p-6 text-center" style={{ backgroundColor: `${accent}06` }}>
                <div className="text-4xl mb-3">💙</div>
                <p className="text-sm" style={{ color: primary }}>{bi.declinedMsg}</p>
              </motion.div>
            )}
          </motion.div>

          <div className="flex justify-center pt-2">
            <Image src="/made-with-toyla.png" alt="Made with Toyla" width={130} height={40}
              className="opacity-45 hover:opacity-80 transition-opacity duration-300" />
          </div>
        </div>
      </div>

      {s.musicUrl && (
        <BackgroundMusicPlayer musicUrl={s.musicUrl} autoplay={s.musicAutoplay} loop={s.musicLoop} volume={s.musicVolume} />
      )}
    </div>
  )
}
