'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { OtpInput } from '@/components/auth/OtpInput'
import { useAuthStore } from '@/store/auth.store'
import { AuthResponse } from '@/types'
import { api } from '@/lib/api'

type Step = 'phone' | 'otp'
type Lang = 'ru' | 'kk'

const t = {
  ru: {
    title: 'Toyla.app',
    subtitle: 'Платформа для управления мероприятиями',
    phoneLabel: 'Номер телефона',
    sendCode: 'Получить код',
    otpLabel: 'Введите код из SMS',
    verify: 'Войти',
    resendIn: (s: number) => `Повторно через ${s}с`,
    resendCode: 'Отправить повторно',
    back: 'Изменить номер',
    invalidPhone: 'Введите корректный номер (+7...)',
    loginSuccess: 'Добро пожаловать!',
    sentTo: (p: string) => `Код отправлен на +${p}`,
  },
  kk: {
    title: 'Toyla.app',
    subtitle: 'Іс-шараларды басқару платформасы',
    phoneLabel: 'Телефон нөмірі',
    sendCode: 'Кодты алу',
    otpLabel: 'SMS-тен кодты енгізіңіз',
    verify: 'Кіру',
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

export default function LoginPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [lang, setLang] = useState<Lang>('ru')
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [phoneRaw, setPhoneRaw] = useState('')
  const [otp, setOtp] = useState('')
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
    if (digits.length < 11) {
      toast.error(tr.invalidPhone)
      return
    }
    setLoading(true)
    try {
      await api.post('/api/v1/auth/request-otp', { phoneNumber: digits })
      setStep('otp')
      setCountdown(60)
      toast.success(tr.sentTo(digits))
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 429) {
          const retryAfter = err.response.headers['retry-after'] ?? 60
          toast.error(`Лимит запросов. Повторите через ${retryAfter}с`)
        } else {
          toast.error(err.response?.data?.error ?? 'Ошибка отправки кода')
        }
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
      const { data } = await api.post<AuthResponse>('/api/v1/auth/verify-otp', {
        phoneNumber: digits,
        code: otp,
      })
      // Set httpOnly cookie via Next.js API route
      const cookieRes = await fetch('/api/auth/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token }),
      })
      if (!cookieRes.ok) {
        toast.error('Ошибка сохранения сессии. Попробуйте ещё раз.')
        return
      }
      // Store in Zustand for client use
      setAuth(data.token, data.username, 'ORGANIZER')
      toast.success(tr.loginSuccess)
      window.location.href = '/dashboard'
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400 || err.response?.status === 401) {
          toast.error('Неверный код')
        } else if (err.response?.status === 429) {
          const retryAfter = err.response.headers['retry-after'] ?? 60
          toast.error(`Лимит запросов. Повторите через ${retryAfter}с`)
        } else {
          toast.error(err.response?.data?.error ?? 'Ошибка верификации')
        }
      } else {
        toast.error('Ошибка соединения. Попробуйте ещё раз.')
      }
    } finally {
      setLoading(false)
    }
  }, [otp, phoneRaw, setAuth, router, tr.loginSuccess])

  useEffect(() => {
    if (otp.length === 6) handleVerify()
  }, [otp, handleVerify])

  const slideVariants = {
    enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: -dir * 40, opacity: 0 }),
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#F5F3FF] via-white to-[#FEF3C7] px-4">
      {/* Language toggle */}
      <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm border border-gray-100">
        <Globe size={14} className="text-gray-400" />
        <button
          onClick={() => setLang('ru')}
          className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${lang === 'ru' ? 'bg-[#8B5CF6] text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          RU
        </button>
        <button
          onClick={() => setLang('kk')}
          className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${lang === 'kk' ? 'bg-[#8B5CF6] text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          KK
        </button>
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] flex items-center justify-center shadow-lg shadow-violet-200">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex items-baseline">
            <span className="text-2xl font-semibold text-gray-900">toyla</span>
            <span className="text-2xl font-light text-[#8B5CF6]">.app</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100/80 border border-gray-100 overflow-hidden">
          <AnimatePresence mode="wait" custom={step === 'otp' ? 1 : -1}>
            {step === 'phone' ? (
              <motion.div
                key="phone"
                custom={-1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="p-8"
              >
                <h1 className="text-xl font-semibold text-gray-900 mb-1">{tr.title}</h1>
                <p className="text-sm text-gray-500 mb-6">{tr.subtitle}</p>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tr.phoneLabel}
                </label>
                <input
                  type="tel"
                  value={phone || '+7'}
                  onChange={handlePhoneChange}
                  onFocus={(e) => {
                    if (!phone) setPhone('+7')
                    setTimeout(() => e.target.setSelectionRange(e.target.value.length, e.target.value.length), 0)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none text-sm transition-all"
                  disabled={loading}
                />

                <button
                  onClick={handleSendCode}
                  disabled={loading || phoneRaw.length < 11}
                  className="w-full mt-4 py-3 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7C3AED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? 'Отправка...' : tr.sendCode}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="p-8"
              >
                <button
                  onClick={() => { setStep('phone'); setOtp('') }}
                  className="text-xs text-[#8B5CF6] hover:underline mb-4 flex items-center gap-1"
                >
                  ← {tr.back}
                </button>

                <h2 className="text-lg font-semibold text-gray-900 mb-1">{tr.otpLabel}</h2>
                <p className="text-xs text-gray-500 mb-6">{tr.sentTo(phoneRaw)}</p>

                <OtpInput value={otp} onChange={setOtp} disabled={loading} />

                <button
                  onClick={handleVerify}
                  disabled={loading || otp.length < 6}
                  className="w-full mt-6 py-3 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7C3AED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? 'Проверка...' : tr.verify}
                </button>

                <div className="mt-4 text-center">
                  {countdown > 0 ? (
                    <p className="text-xs text-gray-400">{tr.resendIn(countdown)}</p>
                  ) : (
                    <button
                      onClick={async () => {
                        await handleSendCode()
                        setOtp('')
                      }}
                      className="text-xs text-[#8B5CF6] hover:underline font-medium"
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
  )
}
