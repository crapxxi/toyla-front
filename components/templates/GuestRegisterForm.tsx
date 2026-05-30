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

  const inputStyle: React.CSSProperties =
    variant === 'glass'
      ? { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }
      : variant === 'dark'
      ? { background: 'rgba(255,255,255,0.05)', border: `1px solid ${primaryColor}40`, color: '#F1F0FF' }
      : { borderColor: `${accentColor}60`, backgroundColor: 'white', color: textColor ?? '#2C1810' }

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
        className="rounded-2xl p-6 text-center"
        style={wrapStyle}
      >
        <div className="text-3xl mb-3">📱</div>
        <p className="font-medium mb-1" style={{ color: primaryColor }}>{bi.registerSuccess}</p>
        <p className="text-sm opacity-70" style={{ color: textColor }}>{bi.checkWhatsApp}</p>
        <p className="text-xs mt-1 opacity-50" style={{ color: textColor }}>{bi.linkSentAlt}</p>
      </motion.div>
    )
  }

  return (
    <div className="rounded-2xl p-5 space-y-3" style={wrapStyle}>
      <p className="text-[11px] uppercase tracking-[0.4em]" style={{ color: labelColor }}>
        {bi.registerTitle}
      </p>

      {/* First name */}
      <div className="relative">
        <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: iconColor }} />
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder={bi.firstNamePlaceholder}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={inputStyle}
        />
      </div>

      {/* Last name */}
      <div className="relative">
        <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: iconColor }} />
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder={bi.lastNamePlaceholder}
          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={inputStyle}
        />
      </div>

      {/* Party size */}
      <div className="rounded-xl px-3 py-2.5 flex items-center justify-between gap-3" style={inputStyle}>
        <div className="flex items-center gap-2">
          <Users size={13} style={{ color: iconColor }} />
          <span className="text-xs" style={{ color: iconColor }}>
            {partySize === 1 ? bi.partySizeAlone : bi.partySizeWith(partySize - 1)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPartySize(s => Math.max(1, s - 1))}
            disabled={partySize <= 1}
            className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all disabled:opacity-30"
            style={{ background: `${primaryColor}25`, color: primaryColor }}
          >−</button>
          <span className="text-sm font-semibold w-4 text-center" style={{ color: primaryColor }}>{partySize}</span>
          <button
            type="button"
            onClick={() => setPartySize(s => Math.min(10, s + 1))}
            disabled={partySize >= 10}
            className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all disabled:opacity-30"
            style={{ background: `${primaryColor}25`, color: primaryColor }}
          >+</button>
        </div>
      </div>

      {/* Phone + submit */}
      <div className="flex gap-2">
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
          className="flex-1 px-3 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={inputStyle}
        />
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          className="px-4 py-2.5 text-white text-sm font-bold rounded-xl transition-all hover:opacity-90 disabled:opacity-40 whitespace-nowrap"
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
        >
          {loading ? '...' : '→'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}
    </div>
  )
}
