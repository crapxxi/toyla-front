'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Phone, User } from 'lucide-react'
import axios from 'axios'
import { api } from '@/lib/api'
import { bi } from './strings'

interface Props {
  toyId: string
  primaryColor: string
  accentColor: string
  // visual variant controls background/border/text styling
  variant: 'light' | 'dark' | 'glass'
  textColor?: string
}

export function GuestRegisterForm({ toyId, primaryColor, accentColor, variant, textColor }: Props) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = firstName.trim().length >= 1 && phone.length >= 10

  const handleSubmit = async () => {
    if (!canSubmit || loading) return
    setLoading(true)
    setError(null)
    try {
      await api.post(`/api/v1/public/events/${toyId}/register`, {
        firstName: firstName.trim(),
        lastName: lastName.trim() || undefined,
        phoneNumber: phone,
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
  const labelColor = variant === 'light' ? accentColor : variant === 'glass' ? accentColor : accentColor

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
    <div className="rounded-2xl p-6 space-y-3" style={wrapStyle}>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: labelColor }}>
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

      {/* Phone */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: iconColor }} />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={bi.phonePlaceholder}
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl outline-none transition-all"
            style={inputStyle}
          />
        </div>
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
