'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { OtpInput } from '@/components/auth/OtpInput'
import { Logo } from '@/components/shared/Logo'
import { useAuthStore } from '@/store/auth.store'
import { useLangStore } from '@/store/lang.store'
import { AuthResponse } from '@/types'
import { api } from '@/lib/api'

type Step = 'phone' | 'otp'
type Lang = 'ru' | 'kk'

const t = {
  ru: {
    title: 'Добро пожаловать',
    subtitle: 'Войдите, чтобы управлять своими тоями',
    phoneLabel: 'Номер телефона',
    sendCode: 'Получить код →',
    otpLabel: 'Код из WhatsApp',
    nameLabel: 'Имя',
    lastNameLabel: 'Фамилия',
    namePlaceholder: 'Айгерим',
    lastNamePlaceholder: 'Алибекова',
    nameHint: 'Будет отображаться в приглашениях',
    verify: 'Войти →',
    resendIn: (s: number) => `Повторно через ${s}с`,
    resendCode: 'Отправить повторно',
    back: 'Изменить номер',
    invalidPhone: 'Введите корректный номер (+7...)',
    loginSuccess: 'Добро пожаловать!',
    sentTo: (p: string) => `Код отправлен на +${p}`,
  },
  kk: {
    title: 'Қош келдіңіз',
    subtitle: 'Тойларыңызды басқару үшін кіріңіз',
    phoneLabel: 'Телефон нөмірі',
    sendCode: 'Кодты алу →',
    otpLabel: 'WhatsApp коды',
    nameLabel: 'Аты',
    lastNameLabel: 'Тегі',
    namePlaceholder: 'Айгерім',
    lastNamePlaceholder: 'Әлібекова',
    nameHint: 'Шақырулармен көрсетіледі',
    verify: 'Кіру →',
    resendIn: (s: number) => `${s}с кейін қайталаңыз`,
    resendCode: 'Қайта жіберу',
    back: 'Нөмірді өзгерту',
    invalidPhone: 'Дұрыс нөмір енгізіңіз (+7...)',
    loginSuccess: 'Қош келдіңіз!',
    sentTo: (p: string) => `Код +${p} нөміріне жіберілді`,
  },
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

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 12,
  border: '1px solid var(--line)',
  background: 'var(--paper)',
  color: 'var(--ink)',
  fontFamily: 'var(--font-manrope), sans-serif',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color .2s',
}

export default function LoginPage() {
  const { setAuth } = useAuthStore()
  const { lang: globalLang, setLang: setGlobalLang } = useLangStore()
  const [lang, setLang] = useState<Lang>(globalLang as Lang)

  const handleLangChange = (l: Lang) => {
    setLang(l)
    setGlobalLang(l)
  }
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [phoneRaw, setPhoneRaw] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const tr = t[lang]

  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const normalized = raw.startsWith('7') ? raw : raw.startsWith('8') ? '7' + raw.slice(1) : '7' + raw
    setPhoneRaw(normalized.slice(0, 11))
    setPhone(formatPhoneDisplay(normalized))
  }

  const handleSendCode = async () => {
    const digits = phoneRaw.replace(/\D/g, '')
    if (digits.length < 11) { toast.error(tr.invalidPhone); return }
    setLoading(true)
    try {
      await api.post('/api/v1/auth/request-otp', { phoneNumber: digits })
      setStep('otp')
      setCountdown(60)
      toast.success(tr.sentTo(digits))
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const retryAfter = err.response?.headers?.['retry-after'] ?? 60
        toast.error(
          err.response?.status === 429
            ? `Лимит запросов. Повторите через ${retryAfter}с`
            : err.response?.data?.error ?? 'Ошибка отправки кода'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = useCallback(async () => {
    if (otp.length < 6) return
    setLoading(true)
    try {
      const digits = phoneRaw.replace(/\D/g, '')
      const body: Record<string, string> = { phoneNumber: digits, code: otp }
      if (name.trim()) body.name = name.trim()
      if (lastName.trim()) body.lastName = lastName.trim()
      const { data } = await api.post<AuthResponse>('/api/v1/auth/verify-otp', body)
      const res = await fetch('/internal/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token }),
      })
      if (!res.ok) { toast.error('Ошибка сохранения сессии.'); return }
      setAuth(data)
      toast.success(tr.loginSuccess)
      window.location.href = '/dashboard'
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        if (status === 400) toast.error('Неверный код.')
        else if (status === 429) toast.error(`Лимит. Повторите через ${err.response?.headers?.['retry-after'] ?? 60}с`)
        else toast.error(err.response?.data?.error ?? 'Ошибка')
      } else {
        toast.error('Ошибка соединения.')
      }
    } finally {
      setLoading(false)
    }
  }, [otp, phoneRaw, setAuth, tr.loginSuccess])

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 32, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: -dir * 32, opacity: 0 }),
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bone)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-5">
        <Logo size="sm" href="/" />
        <div className="flex items-center gap-1 rounded-full px-3 py-1.5" style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}>
          <Globe size={13} style={{ color: 'var(--ink-soft)' }} />
          {(['ru', 'kk'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => handleLangChange(l)}
              className="text-xs font-semibold px-2 py-0.5 rounded-full transition-all"
              style={lang === l
                ? { background: 'var(--clay)', color: 'var(--paper)' }
                : { color: 'var(--ink-soft)' }
              }
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--paper)', border: '1px solid var(--line)', boxShadow: '0 20px 60px rgba(38,27,17,.1)' }}>
            <AnimatePresence mode="wait" custom={step === 'otp' ? 1 : -1}>
              {step === 'phone' ? (
                <motion.div
                  key="phone" custom={-1} variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="p-8"
                >
                  <h1 className="font-semibold mb-1" style={{ fontFamily: 'var(--font-spectral), serif', fontSize: 22, color: 'var(--ink)', fontWeight: 500 }}>
                    {tr.title}
                  </h1>
                  <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>{tr.subtitle}</p>

                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--ink-soft)' }}>{tr.phoneLabel}</label>
                  <input
                    type="tel"
                    value={phone || '+7'}
                    onChange={handlePhoneChange}
                    onFocus={(e) => {
                      if (!phone) setPhone('+7')
                      e.target.style.borderColor = 'var(--clay)'
                      setTimeout(() => e.target.setSelectionRange(e.target.value.length, e.target.value.length), 0)
                    }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                    placeholder="+7 (___) ___-__-__"
                    style={inputStyle}
                    disabled={loading}
                  />
                  <button
                    onClick={handleSendCode}
                    disabled={loading || phoneRaw.length < 11}
                    className="w-full mt-4 py-3 rounded-full font-semibold text-sm transition-all disabled:opacity-40"
                    style={{ background: 'var(--clay)', color: 'var(--paper)', fontFamily: 'var(--font-manrope), sans-serif', boxShadow: '0 6px 18px rgba(168,73,42,.22)' }}
                  >
                    {loading ? 'Отправка...' : tr.sendCode}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="otp" custom={1} variants={slideVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="p-8"
                >
                  <button
                    onClick={() => { setStep('phone'); setOtp('') }}
                    className="text-xs font-semibold mb-4 flex items-center gap-1 transition-colors"
                    style={{ color: 'var(--clay)' }}
                  >
                    ← {tr.back}
                  </button>
                  <h2 className="font-semibold mb-1" style={{ fontFamily: 'var(--font-spectral), serif', fontSize: 20, color: 'var(--ink)', fontWeight: 500 }}>
                    {tr.otpLabel}
                  </h2>
                  <p className="text-xs mb-5" style={{ color: 'var(--ink-soft)' }}>{tr.sentTo(phoneRaw)}</p>

                  <OtpInput value={otp} onChange={setOtp} disabled={loading} />

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--ink-soft)' }}>{tr.nameLabel}</label>
                      <input
                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder={tr.namePlaceholder} maxLength={64} disabled={loading}
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--clay)' }}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--ink-soft)' }}>{tr.lastNameLabel}</label>
                      <input
                        type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
                        placeholder={tr.lastNamePlaceholder} maxLength={64} disabled={loading}
                        style={inputStyle}
                        onFocus={(e) => { e.target.style.borderColor = 'var(--clay)' }}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--line)' }}
                      />
                    </div>
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: 'var(--ink-soft)', opacity: 0.7 }}>{tr.nameHint}</p>

                  <button
                    onClick={handleVerify}
                    disabled={loading || otp.length < 6}
                    className="w-full mt-5 py-3 rounded-full font-semibold text-sm transition-all disabled:opacity-40"
                    style={{ background: 'var(--clay)', color: 'var(--paper)', fontFamily: 'var(--font-manrope), sans-serif', boxShadow: '0 6px 18px rgba(168,73,42,.22)' }}
                  >
                    {loading ? 'Проверка...' : tr.verify}
                  </button>
                  <div className="mt-4 text-center">
                    {countdown > 0 ? (
                      <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{tr.resendIn(countdown)}</p>
                    ) : (
                      <button
                        onClick={async () => { await handleSendCode(); setOtp('') }}
                        className="text-xs font-semibold transition-colors"
                        style={{ color: 'var(--clay)' }}
                      >
                        {tr.resendCode}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
