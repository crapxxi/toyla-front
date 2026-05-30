'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Logo } from '@/components/shared/Logo'
import { Shanyrak } from '@/components/shared/Shanyrak'
import { useAuthStore } from '@/store/auth.store'

function PrimaryBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 whitespace-nowrap font-semibold rounded-full transition-all duration-200"
      style={{
        fontFamily: 'var(--font-manrope), sans-serif',
        fontSize: 14.5,
        background: 'var(--clay)',
        color: 'var(--paper)',
        padding: '12px 26px',
        boxShadow: '0 8px 20px rgba(168,73,42,.22)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = 'var(--clay-deep)'
        el.style.transform = 'translateY(-1px)'
        el.style.boxShadow = '0 12px 26px rgba(168,73,42,.3)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.background = 'var(--clay)'
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = '0 8px 20px rgba(168,73,42,.22)'
      }}
    >
      {children}
    </Link>
  )
}

function GhostBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 whitespace-nowrap font-semibold rounded-full transition-all duration-200"
      style={{
        fontFamily: 'var(--font-manrope), sans-serif',
        fontSize: 15,
        color: 'var(--ink)',
        borderBottom: '1.5px solid var(--line)',
        paddingBottom: 3,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.color = 'var(--clay)'
        el.style.borderBottomColor = 'var(--clay)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.color = 'var(--ink)'
        el.style.borderBottomColor = 'var(--line)'
      }}
    >
      {children}
    </Link>
  )
}

export default function LandingPage() {
  const { token } = useAuthStore()
  const dashHref = token ? '/dashboard' : '/login'

  return (
    <div style={{ background: 'var(--bone)', color: 'var(--ink)', fontFamily: 'var(--font-manrope), system-ui, sans-serif', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(244,236,223,.86)', backdropFilter: 'saturate(150%) blur(12px)', borderBottom: '1px solid rgba(228,216,196,.7)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <Logo size="sm" href="/" />
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Мүмкіндіктер', href: '#how' },
              { label: 'Үлгілер', href: '#templates' },
              { label: 'Баға', href: '#pricing' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink-soft)', transition: 'color .18s' }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--clay)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--ink-soft)')}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="hidden sm:block"
              style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}
            >
              Кіру
            </Link>
            <PrimaryBtn href={dashHref}>Той құру</PrimaryBtn>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', textAlign: 'center', padding: '96px 24px 60px', overflow: 'hidden' }}>
        {/* watermark */}
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 620, height: 620, opacity: 0.05, pointerEvents: 'none' }}>
          <Shanyrak hoop="#A8492A" lattice="#A8492A" spoke="#A8492A" sw={1.4} />
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.34em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 24 }}
          >
            Той-көмекші
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-spectral), Georgia, serif',
              fontWeight: 400,
              fontSize: 'clamp(42px, 6.4vw, 76px)',
              lineHeight: 1.06,
              letterSpacing: '-0.012em',
              color: 'var(--ink)',
              marginBottom: 0,
            }}
          >
            Әдемі той<br />
            <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>осыдан</span> басталады
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            style={{ maxWidth: 520, margin: '24px auto 0', fontSize: 17, lineHeight: 1.6, color: 'var(--ink-soft)' }}
          >
            Toyla берёт на себя весь той: красивые пригласительные, список гостей и напоминания — собрано в одном месте.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38 }}
            className="flex items-center justify-center gap-5 flex-wrap"
            style={{ marginTop: 36 }}
          >
            <PrimaryBtn href={dashHref}>Той құру →</PrimaryBtn>
            <GhostBtn href="#how">Қалай жұмыс істейді</GhostBtn>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            style={{ marginTop: 28, fontSize: 13, color: 'var(--ink-soft)', letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 10 }}
          >
            <span>Тойхана мен жеке тойларға</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
            <span>Қазақша · Русский</span>
          </motion.div>
        </div>
      </section>

      {/* ── Photo frame ── */}
      <section style={{ padding: '12px 24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', border: '1px solid var(--line)', boxShadow: '0 30px 70px rgba(38,27,17,.12)', background: 'var(--bone-2)', minHeight: 420, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* Decorative placeholder */}
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ width: 80, height: 80, margin: '0 auto 20px', opacity: 0.25 }}>
                <Shanyrak hoop="#261B11" lattice="#A8492A" spoke="#B0843A" sw={2.3} />
              </div>
              <p style={{ fontFamily: 'var(--font-spectral), serif', fontStyle: 'italic', fontSize: 22, color: 'var(--ink-soft)' }}>
                Айгерім &amp; Нұрлан · 14 маусым
              </p>
            </div>
            {/* Corner chip */}
            <div style={{ position: 'absolute', top: 20, left: 20, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(251,246,238,.92)', backdropFilter: 'blur(6px)', padding: '8px 14px 8px 10px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: 'var(--ink)', boxShadow: '0 6px 18px rgba(38,27,17,.1)' }}>
              <span style={{ width: 18, height: 18, display: 'block', flexShrink: 0 }}>
                <Shanyrak hoop="#261B11" lattice="#A8492A" spoke="#B0843A" sw={2.4} />
              </span>
              Toyla — той-көмекші
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ padding: '104px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ maxWidth: 680, marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 18 }}>
              Қалай жұмыс істейді
            </p>
            <h2 style={{ fontFamily: 'var(--font-spectral), Georgia, serif', fontWeight: 400, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.1, letterSpacing: '-0.01em', color: 'var(--ink)' }}>
              Үш қадам — <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>той дайын</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid var(--line)' }} className="grid-cols-1 md:grid-cols-3">
            {[
              { num: '01', kz: 'Шақыру жасаңыз', ru: 'Приглашение', text: 'Выберите шаблон, добавьте дату, место и пару тёплых слов. Готовое пригласительное — за минуту.' },
              { num: '02', kz: 'Қонақтарды жинаңыз', ru: 'Гости', text: 'Гость отвечает одним касанием. Список «кто придёт» собирается сам — без чатов и таблиц.' },
              { num: '03', kz: 'Еске салдырыңыз', ru: 'Напоминания', text: 'Toyla сам напомнит каждому гостю в нужный момент — накануне и в день торжества.' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                style={{
                  padding: '38px 34px 38px 0',
                  borderRight: i < 2 ? '1px solid var(--line)' : 'none',
                  paddingLeft: i > 0 ? 34 : 0,
                }}
                className="border-r-0 md:border-r"
              >
                <p style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 300, fontSize: 46, color: 'var(--clay)', lineHeight: 1, marginBottom: 22 }}>{step.num}</p>
                <p style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 500, fontSize: 23, color: 'var(--ink)', marginBottom: 4 }}>{step.kz}</p>
                <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>{step.ru}</p>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--ink-soft)' }}>{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA block ── */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            style={{ background: 'var(--ink)', borderRadius: 32, padding: '80px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
          >
            {/* watermark */}
            <div style={{ position: 'absolute', right: -100, top: '50%', transform: 'translateY(-50%)', width: 440, height: 440, opacity: 0.08, pointerEvents: 'none' }}>
              <Shanyrak hoop="#E9D9BE" lattice="#C8A24B" spoke="#C8A24B" sw={1.5} />
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold-soft)', marginBottom: 20, position: 'relative' }}>
              Тойыңызды бастаймыз ба?
            </p>
            <h2 style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 400, fontSize: 'clamp(32px,4.4vw,54px)', lineHeight: 1.08, color: 'var(--paper)', position: 'relative' }}>
              Әр шаңыраққа —<br />
              <span style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>лайықты той</span>
            </h2>
            <p style={{ maxWidth: 460, margin: '22px auto 0', color: 'rgba(244,236,223,.72)', fontSize: 16, lineHeight: 1.6, position: 'relative' }}>
              Создайте первое пригласительное бесплатно. Без приложения — всё работает по одной ссылке.
            </p>
            <div className="flex items-center justify-center gap-5 flex-wrap" style={{ marginTop: 36, position: 'relative' }}>
              <Link
                href={dashHref}
                className="inline-flex items-center font-semibold rounded-full transition-all duration-200"
                style={{ fontFamily: 'var(--font-manrope), sans-serif', fontSize: 14.5, background: 'var(--paper)', color: 'var(--ink)', padding: '12px 26px' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 26px rgba(0,0,0,.25)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                Той құру →
              </Link>
              <a href="#how" style={{ fontSize: 15, fontWeight: 600, color: 'var(--bone)', borderBottom: '1.5px solid rgba(244,236,223,.3)', paddingBottom: 3 }}>
                Үлгілерді көру
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '0 24px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', borderTop: '1px solid var(--line)', paddingTop: 32 }}>
            <Logo size="sm" href="/" />
            <div className="flex gap-8 flex-wrap">
              {['Мүмкіндіктер', 'Үлгілер', 'Баға', 'Қолдау'].map((label) => (
                <a key={label} href="#" style={{ fontSize: 14, color: 'var(--ink-soft)', transition: 'color .18s' }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--clay)')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--ink-soft)')}
                >
                  {label}
                </a>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>© 2026 Toyla · toyla.app</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
