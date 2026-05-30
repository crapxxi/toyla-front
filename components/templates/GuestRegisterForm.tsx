'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Users } from 'lucide-react'
import axios from 'axios'
import { api } from '@/lib/api'
import { bi } from './strings'

interface Props {
  toyId: string
  primaryColor: string
  accentColor: string
  variant: 'light' | 'dark' | 'glass'
  textColor?: string
}

function formatPhoneDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, '').replace(/^7/, '').slice(0, 10)
  let result = '+7'
  if (digits.length > 0) result += ' (' + digits.slice(0, 3)
  if (digits.length >= 3) result += ') ' + digits.slice(3, 6)
  if (digits.length >= 6) result += '-' + digits.slice(6, 8)
  if (digits.length >= 8) result += '-' + digits.slice(8, 10)
  return result
}

export function GuestRegisterForm({ toyId, primaryColor, accentColor, variant, textColor }: Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneDisplay, setPhoneDisplay] = useState('+7')
  const [phoneRaw, setPhoneRaw] = useState('')
  const [partySize, setPartySize] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = firstName.trim().length >= 1 && phoneRaw.length >= 11

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const normalized = raw.startsWith('7') ? raw : raw.startsWith('8') ? '7' + raw.slice(1) : '7' + raw
    const clamped = normalized.slice(0, 11)
    setPhoneRaw(clamped)
    setPhoneDisplay(formatPhoneDisplay(clamped))
  }

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    setError(null)
    try {
      await api.post(`/api/v1/public/events/${toyId}/register`, {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        phoneNumber: phoneRaw,
        partySize,
      })
      setDone(true)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const data = err.response?.data
        if (status === 409) setError(bi.eventFull)
        else if (status === 429) setError(bi.tooManyRequests)
        else if (data?.errors) setError(Object.values(data.errors as Record<string, string>).join(' · '))
        else setError(data?.error ?? bi.genericError)
      } else {
        setError(bi.genericError)
      }
    } finally {
      setLoading(false)
    }
  }

  const inputType: React.CSSProperties = {
    fontFamily: 'var(--font-display), Georgia, serif',
    fontSize: '1.12rem',
    fontWeight: 500,
  }

  const inputStyle: React.CSSProperties =
    variant === 'glass'
      ? { ...inputType, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }
      : variant === 'dark'
      ? { ...inputType, background: 'rgba(255,255,255,0.05)', border: `1px solid ${primaryColor}40`, color: '#F1F0FF' }
      : { ...inputType, borderColor: `${accentColor}55`, backgroundColor: 'white', color: textColor ?? '#2C1810' }

  const wrapStyle: React.CSSProperties =
    variant === 'glass'
      ? { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }
      : variant === 'dark'
      ? { background: `rgba(139,92,246,0.08)`, border: `1px solid ${primaryColor}30` }
      : { backgroundColor: `${accentColor}06`, border: `1px solid ${accentColor}40` }

  const iconColor = variant === 'light' ? accentColor : variant === 'dark' ? primaryColor : 'rgba(255,255,255,0.5)'
  const labelColor = accentColor

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl p-7 text-center"
        style={wrapStyle}
      >
        <div className="text-4xl mb-3">📱</div>
        <p className="mb-1.5" style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 600, color: primaryColor }}>{bi.registerSuccess}</p>
        <p style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: '1.05rem', fontWeight: 500, opacity: 0.78, color: textColor }}>{bi.checkWhatsApp}</p>
        <p className="mt-1" style={{ fontFamily: 'var(--font-sc), Georgia, serif', fontSize: '0.85rem', opacity: 0.55, color: textColor }}>{bi.linkSentAlt}</p>
      </motion.div>
    )
  }

  return (
    <div className="rounded-3xl p-6 space-y-3.5" style={wrapStyle}>
      <p className="text-center" style={{ fontFamily: 'var(--font-sc), Georgia, serif', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.26em', textTransform: 'uppercase', color: labelColor }}>
        {bi.registerTitle}
      </p>

      {/* First name */}
      <div className="relative">
        <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: iconColor }} />
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={bi.firstNamePlaceholder}
          className="w-full pl-11 pr-3.5 py-3 rounded-xl outline-none transition-all"
          style={inputStyle}
        />
      </div>

      {/* Last name */}
      <div className="relative">
        <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40" style={{ color: iconColor }} />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder={bi.lastNamePlaceholder}
          className="w-full pl-11 pr-3.5 py-3 rounded-xl outline-none transition-all"
          style={inputStyle}
        />
      </div>

      {/* Party size */}
      <div className="rounded-xl px-4 py-3 flex items-center justify-between gap-3" style={inputStyle}>
        <div className="flex items-center gap-2.5 min-w-0">
          <Users size={17} className="flex-shrink-0" style={{ color: iconColor }} />
          <span className="truncate" style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: '1.05rem', fontWeight: 500, color: textColor ?? iconColor }}>
            {partySize === 1 ? bi.partySizeAlone : bi.partySizeWith(partySize - 1)}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={() => setPartySize(s => Math.max(1, s - 1))}
            disabled={partySize <= 1}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all disabled:opacity-30"
            style={{ background: `${primaryColor}22`, color: primaryColor }}
          >−</button>
          <span style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: '1.25rem', fontWeight: 600, color: primaryColor, width: 20, textAlign: 'center' }}>{partySize}</span>
          <button
            type="button"
            onClick={() => setPartySize(s => Math.min(10, s + 1))}
            disabled={partySize >= 10}
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-all disabled:opacity-30"
            style={{ background: `${primaryColor}22`, color: primaryColor }}
          >+</button>
        </div>
      </div>

      {/* Phone */}
      <input
        type="tel"
        value={phoneDisplay}
        onChange={handlePhoneChange}
        onFocus={(e) => {
          if (!phoneRaw) {
            setPhoneDisplay('+7')
            setTimeout(() => e.target.setSelectionRange(e.target.value.length, e.target.value.length), 0)
          }
        }}
        placeholder="+7 (___) ___-__-__"
        className="w-full px-4 py-3 rounded-xl outline-none transition-all text-center"
        style={inputStyle}
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        className="w-full py-3.5 text-white rounded-xl transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`, fontFamily: 'var(--font-sc), Georgia, serif', fontSize: '0.95rem', fontWeight: 600, letterSpacing: '0.12em' }}
      >
        {loading ? bi.registering : bi.registerBtn}
      </button>

      {error && (
        <p className="text-center" style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: '0.95rem', color: '#DC2626' }}>{error}</p>
      )}
    </div>
  )
}
