'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { OtpInput } from '@/components/auth/OtpInput'
import { useAuthStore } from '@/store/auth.store'
import { AuthResponse } from '@/types'
import { api } from '@/lib/api'

type OtpStep = 'phone' | 'otp'
type AuthTab = 'otp' | 'password'
type PasswordMode = 'login' | 'register'
type Lang = 'ru' | 'kk'

const t = {
  ru: {
    title: 'Toyla.app',
    subtitle: 'Платформа для управления мероприятиями',
    tabOtp: 'WhatsApp',
    tabPassword: 'Пароль',
    phoneLabel: 'Номер телефона',
    sendCode: 'Получить код',
    otpLabel: 'Введите код из WhatsApp',
    verify: 'Войти',
    resendIn: (s: number) => `Повторно через ${s}с`,
    resendCode: 'Отправить повторно',
    back: 'Изменить номер',
    invalidPhone: 'Введите корректный номер (+7...)',
    loginSuccess: 'Добро пожаловать!',
    sentTo: (p: string) => `Код отправлен на +${p}`,
    // password tab
    modeLogin: 'Войти',
    modeRegister: 'Зарегистрироваться',
    nameLabel: 'Имя',
    lastNameLabel: 'Фамилия',
    usernameLabel: 'Имя пользователя',
    passwordLabel: 'Пароль',
    loginBtn: 'Войти',
    registerBtn: 'Зарегистрироваться',
  },
  kk: {
    title: 'Toyla.app',
    subtitle: 'Іс-шараларды басқару платформасы',
    tabOtp: 'WhatsApp',
    tabPassword: 'Пароль',
    phoneLabel: 'Телефон нөмірі',
    sendCode: 'Кодты алу',
    otpLabel: 'WhatsApp кодын енгізіңіз',
    verify: 'Кіру',
    resendIn: (s: number) => `${s}с кейін қайталаңыз`,
    resendCode: 'Қайта жіберу',
    back: 'Нөмірді өзгерту',
    invalidPhone: 'Дұрыс нөмір енгізіңіз (+7...)',
    loginSuccess: 'Қош келдіңіз!',
    sentTo: (p: string) => `Код +${p} нөміріне жіберілді`,
    modeLogin: 'Кіру',
    modeRegister: 'Тіркелу',
    nameLabel: 'Аты',
    lastNameLabel: 'Тегі',
    usernameLabel: 'Пайдаланушы аты',
    passwordLabel: 'Пароль',
    loginBtn: 'Кіру',
    registerBtn: 'Тіркелу',
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

async function saveSession(authRes: AuthResponse, setAuth: (r: AuthResponse) => void) {
  const res = await fetch('/api/auth/set-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: authRes.token }),
  })
  if (!res.ok) throw new Error('session')
  setAuth(authRes)
}

export default function LoginPage() {
  const { setAuth } = useAuthStore()
  const [lang, setLang] = useState<Lang>('ru')
  const [tab, setTab] = useState<AuthTab>('otp')
  const tr = t[lang]

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
        {(['ru', 'kk'] as Lang[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`text-xs font-medium px-2 py-0.5 rounded-full transition-colors ${lang === l ? 'bg-[#8B5CF6] text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
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
          {/* Tab switcher */}
          <div className="flex border-b border-gray-100">
            {(['otp', 'password'] as AuthTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  tab === t
                    ? 'text-[#8B5CF6] border-b-2 border-[#8B5CF6]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'otp' ? tr.tabOtp : tr.tabPassword}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" custom={tab === 'otp' ? -1 : 1}>
            {tab === 'otp' ? (
              <motion.div
                key="otp-tab"
                custom={-1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <OtpTab lang={lang} tr={tr} setAuth={setAuth} saveSession={saveSession} />
              </motion.div>
            ) : (
              <motion.div
                key="password-tab"
                custom={1}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <PasswordTab lang={lang} tr={tr} setAuth={setAuth} saveSession={saveSession} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─── OTP Tab ─────────────────────────────────────────────────────────────────

function OtpTab({
  lang,
  tr,
  setAuth,
  saveSession,
}: {
  lang: Lang
  tr: typeof t['ru']
  setAuth: (r: AuthResponse) => void
  saveSession: (r: AuthResponse, s: (r: AuthResponse) => void) => Promise<void>
}) {
  const [step, setStep] = useState<OtpStep>('phone')
  const [phone, setPhone] = useState('')
  const [phoneRaw, setPhoneRaw] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

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
      const { data } = await api.post<AuthResponse>('/api/v1/auth/verify-otp', {
        phoneNumber: digits,
        code: otp,
      })
      await saveSession(data, setAuth)
      toast.success(tr.loginSuccess)
      window.location.href = '/dashboard'
    } catch (err) {
      if (err instanceof Error && err.message === 'session') {
        toast.error('Ошибка сохранения сессии. Попробуйте ещё раз.')
        return
      }
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        if (status === 400 || status === 401) toast.error('Неверный код')
        else if (status === 429) {
          const retryAfter = err.response?.headers?.['retry-after'] ?? 60
          toast.error(`Лимит запросов. Повторите через ${retryAfter}с`)
        } else toast.error(err.response?.data?.error ?? 'Ошибка верификации')
      } else {
        toast.error('Ошибка соединения. Попробуйте ещё раз.')
      }
    } finally {
      setLoading(false)
    }
  }, [otp, phoneRaw, setAuth, saveSession, tr.loginSuccess])

  useEffect(() => {
    if (otp.length === 6) handleVerify()
  }, [otp, handleVerify])

  if (step === 'phone') {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-1">{tr.title}</h1>
        <p className="text-sm text-gray-500 mb-6">{tr.subtitle}</p>
        <label className="block text-sm font-medium text-gray-700 mb-2">{tr.phoneLabel}</label>
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
      </div>
    )
  }

  return (
    <div className="p-8">
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
            onClick={async () => { await handleSendCode(); setOtp('') }}
            className="text-xs text-[#8B5CF6] hover:underline font-medium"
          >
            {tr.resendCode}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Password Tab ─────────────────────────────────────────────────────────────

function PasswordTab({
  tr,
  setAuth,
  saveSession,
}: {
  lang: Lang
  tr: typeof t['ru']
  setAuth: (r: AuthResponse) => void
  saveSession: (r: AuthResponse, s: (r: AuthResponse) => void) => Promise<void>
}) {
  const [mode, setMode] = useState<PasswordMode>('login')
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('')
  const [phoneRaw, setPhoneRaw] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const normalized = raw.startsWith('7') ? raw : raw.startsWith('8') ? '7' + raw.slice(1) : '7' + raw
    setPhoneRaw(normalized.slice(0, 11))
    setPhone(formatPhoneDisplay(normalized))
  }

  const handleAuth = async () => {
    setLoading(true)
    try {
      let data: AuthResponse
      if (mode === 'login') {
        const res = await api.post<AuthResponse>('/api/v1/auth/login', {
          phoneNumber: phoneRaw,
          password,
        })
        data = res.data
      } else {
        if (!name.trim() || !lastName.trim() || !username.trim() || phoneRaw.length < 11 || password.length < 8) {
          toast.error('Заполните все поля корректно')
          return
        }
        const res = await api.post<AuthResponse>('/api/v1/auth/register', {
          name: name.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          phoneNumber: phoneRaw,
          password,
        })
        data = res.data
      }
      await saveSession(data, setAuth)
      toast.success('Добро пожаловать!')
      window.location.href = '/dashboard'
    } catch (err) {
      if (err instanceof Error && err.message === 'session') {
        toast.error('Ошибка сохранения сессии. Попробуйте ещё раз.')
        return
      }
      if (axios.isAxiosError(err)) {
        const { status, data } = err.response ?? {}
        if (status === 401) toast.error('Неверный номер или пароль')
        else if (status === 409) toast.error(data?.error ?? 'Пользователь уже существует')
        else if (status === 400 && data?.errors) {
          Object.values(data.errors).forEach((m) => toast.error(m as string))
        } else toast.error(data?.error ?? 'Ошибка входа')
      } else {
        toast.error('Ошибка соединения. Попробуйте ещё раз.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Mode switcher */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        {(['login', 'register'] as PasswordMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === m ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {m === 'login' ? tr.modeLogin : tr.modeRegister}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {mode === 'register' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{tr.nameLabel} *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Айгерим"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none text-sm"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{tr.lastNameLabel} *</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Сейткали"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none text-sm"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">{tr.usernameLabel} *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="username"
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none text-sm"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Только строчные буквы, цифры и _</p>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{tr.phoneLabel} *</label>
          <input
            type="tel"
            value={phone || '+7'}
            onChange={handlePhoneChange}
            onFocus={(e) => {
              if (!phone) setPhone('+7')
              setTimeout(() => e.target.setSelectionRange(e.target.value.length, e.target.value.length), 0)
            }}
            placeholder="+7 (___) ___-__-__"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none text-sm"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{tr.passwordLabel} *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === 'register' ? 'Минимум 8 символов' : '••••••••'}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none text-sm"
            disabled={loading}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
          />
        </div>

        <button
          onClick={handleAuth}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#8B5CF6] text-white text-sm font-semibold hover:bg-[#7C3AED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-1"
        >
          {loading ? '...' : mode === 'login' ? tr.loginBtn : tr.registerBtn}
        </button>
      </div>
    </div>
  )
}
