'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, MessageCircle } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { Shanyrak } from '@/components/shared/Shanyrak'
import { KazakhTemplate } from '@/components/templates/KazakhTemplate'
import { useAuthStore } from '@/store/auth.store'
import type { PublicToyResponse } from '@/types'

// ── Mock event for template preview ──────────────────────────────────────────
const DEMO_EVENT: PublicToyResponse = {
  id: 'demo',
  title: 'Айгерім 60 жас',
  description: 'Сізді Айгерімнің 60 жас мерей тойына шақырамыз. Бұл қуанышты күнде бізбен бірге болыңыз!',
  eventDate: '2025-09-14T18:00:00',
  locationName: '"Қымбатжан" мейрамханасы',
  gisLink: null,
  templateId: 'ELEGANT',
  templateSettings: {
    primaryColor: '#2D4A1E',
    accentColor: '#B8963C',
    backgroundColor: '#FDFAF3',
    countdownEnabled: true,
    countdownTargetDate: '2025-09-14T18:00:00',
  },
  organizerDisplayName: 'Семья Абылай',
  images: [],
  musicUrl: null,
  showWatermark: true,
}

// ── Reusable buttons ──────────────────────────────────────────────────────────
function PrimaryBtn({ href, children, onClick }: { href?: string; children: React.ReactNode; onClick?: () => void }) {
  const style = {
    fontFamily: 'var(--font-manrope), sans-serif',
    fontSize: 14.5,
    fontWeight: 600,
    background: 'var(--clay)',
    color: 'var(--paper)',
    padding: '12px 26px',
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    whiteSpace: 'nowrap' as const,
    boxShadow: '0 8px 20px rgba(168,73,42,.22)',
    transition: 'all .2s',
    cursor: 'pointer',
    border: 'none',
  }
  if (href) return (
    <Link href={href} style={style}
      onMouseEnter={(e) => { Object.assign((e.currentTarget as HTMLElement).style, { background: 'var(--clay-deep)', transform: 'translateY(-1px)', boxShadow: '0 12px 26px rgba(168,73,42,.3)' }) }}
      onMouseLeave={(e) => { Object.assign((e.currentTarget as HTMLElement).style, { background: 'var(--clay)', transform: 'translateY(0)', boxShadow: '0 8px 20px rgba(168,73,42,.22)' }) }}
    >{children}</Link>
  )
  return <button onClick={onClick} style={style}
    onMouseEnter={(e) => { Object.assign((e.currentTarget as HTMLElement).style, { background: 'var(--clay-deep)', transform: 'translateY(-1px)' }) }}
    onMouseLeave={(e) => { Object.assign((e.currentTarget as HTMLElement).style, { background: 'var(--clay)', transform: 'translateY(0)' }) }}
  >{children}</button>
}

function GhostLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', borderBottom: '1.5px solid var(--line)', paddingBottom: 3, transition: 'all .18s', whiteSpace: 'nowrap' as const }}
      onMouseEnter={(e) => { Object.assign((e.currentTarget as HTMLElement).style, { color: 'var(--clay)', borderBottomColor: 'var(--clay)' }) }}
      onMouseLeave={(e) => { Object.assign((e.currentTarget as HTMLElement).style, { color: 'var(--ink)', borderBottomColor: 'var(--line)' }) }}
    >{children}</Link>
  )
}

// ── Pricing card ──────────────────────────────────────────────────────────────
function PriceCard({
  name, price, sub, features, highlight, cta, ctaHref,
}: {
  name: string; price: string; sub: string
  features: string[]; highlight?: boolean; cta: string; ctaHref: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55 }}
      style={{
        background: highlight ? 'var(--ink)' : 'var(--paper)',
        border: highlight ? '2px solid var(--clay)' : '1px solid var(--line)',
        borderRadius: 24,
        padding: '36px 32px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {highlight && (
        <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--clay)', color: 'var(--paper)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 999 }}>
          Танымал
        </span>
      )}
      <p style={{ fontFamily: 'var(--font-spectral), serif', fontSize: 22, fontWeight: 500, color: highlight ? 'var(--paper)' : 'var(--ink)', marginBottom: 6 }}>{name}</p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
        <span style={{ fontFamily: 'var(--font-spectral), serif', fontSize: 40, fontWeight: 400, color: highlight ? 'var(--gold-soft)' : 'var(--clay)', lineHeight: 1 }}>{price}</span>
        <span style={{ fontSize: 14, color: highlight ? 'rgba(244,236,223,.6)' : 'var(--ink-soft)' }}>{sub}</span>
      </div>
      <div style={{ height: 1, background: highlight ? 'rgba(244,236,223,.15)' : 'var(--line)', margin: '22px 0' }} />
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {features.map((f) => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: highlight ? 'rgba(244,236,223,.82)' : 'var(--ink-soft)', lineHeight: 1.4 }}>
            <Check size={15} style={{ color: highlight ? 'var(--gold-soft)' : 'var(--clay)', marginTop: 1, flexShrink: 0 }} />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '12px 24px',
          borderRadius: 999,
          fontWeight: 600,
          fontSize: 14,
          background: highlight ? 'var(--clay)' : 'transparent',
          color: highlight ? 'var(--paper)' : 'var(--clay)',
          border: highlight ? 'none' : '1.5px solid var(--clay)',
          transition: 'all .18s',
        }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = highlight ? 'var(--clay-deep)' : 'var(--clay)'; if (!highlight) el.style.color = 'var(--paper)' }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = highlight ? 'var(--clay)' : 'transparent'; if (!highlight) el.style.color = 'var(--clay)' }}
      >
        {cta}
      </Link>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { token } = useAuthStore()
  const dashHref = token ? '/dashboard' : '/login'

  return (
    <div style={{ background: 'var(--bone)', color: 'var(--ink)', fontFamily: 'var(--font-manrope), system-ui, sans-serif', minHeight: '100vh' }}>

      {/* ── Header ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(244,236,223,.88)', backdropFilter: 'saturate(150%) blur(12px)', borderBottom: '1px solid rgba(228,216,196,.7)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <Logo size="sm" href="/" />
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Мүмкіндіктер', href: '#how' },
              { label: 'Үлгілер', href: '#templates' },
              { label: 'Баға', href: '#pricing' },
            ].map((item) => (
              <a key={item.label} href={item.href}
                style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink-soft)', transition: 'color .18s' }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--clay)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--ink-soft)')}
              >{item.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <Link href="/login" className="hidden sm:block" style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>Кіру</Link>
            <PrimaryBtn href={dashHref}>Той құру</PrimaryBtn>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', textAlign: 'center', padding: '96px 24px 60px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 620, height: 620, opacity: 0.05, pointerEvents: 'none' }}>
          <Shanyrak hoop="#A8492A" lattice="#A8492A" spoke="#A8492A" sw={1.4} />
        </div>
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.34em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 24 }}>
            Той-көмекші
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: 'var(--font-spectral), Georgia, serif', fontWeight: 400, fontSize: 'clamp(42px, 6.4vw, 76px)', lineHeight: 1.06, letterSpacing: '-0.012em', color: 'var(--ink)' }}>
            Әдемі той<br />
            <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>осыдан</span> басталады
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            style={{ maxWidth: 520, margin: '24px auto 0', fontSize: 17, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
            Toyla берёт на себя весь той: красивые пригласительные, список гостей и напоминания — собрано в одном месте.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.38 }}
            className="flex items-center justify-center gap-5 flex-wrap" style={{ marginTop: 36 }}>
            <PrimaryBtn href={dashHref}>Той құру →</PrimaryBtn>
            <GhostLink href="#how">Қалай жұмыс істейді</GhostLink>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            style={{ marginTop: 28, fontSize: 13, color: 'var(--ink-soft)', letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span>Тойхана мен жеке тойларға</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
            <span>Қазақша · Русский</span>
          </motion.div>
        </div>
      </section>

      {/* ── Template showcase ── */}
      <section id="templates" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: 48, alignItems: 'center' }} className="lg:grid-cols-2">

          {/* Text */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 18 }}>
              Үлгі
            </p>
            <h2 style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 400, fontSize: 'clamp(28px,3.6vw,46px)', lineHeight: 1.1, color: 'var(--ink)', marginBottom: 20 }}>
              Казахский шаблон —<br /><span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>тепло и красиво</span>
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-soft)', marginBottom: 32, maxWidth: 460 }}>
              Ботанический стиль с золотыми акцентами и казахским колоритом. Обратный отсчёт, адрес с картой, фото и фоновая музыка — всё встроено.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Красивое пригласительное на казахском и русском',
                'Обратный отсчёт до торжества',
                'Адрес со ссылкой на 2GIS / карту',
                'Фоновая музыка и фотографии',
                'Форма регистрации гостей',
              ].map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--ink-soft)' }}>
                  <Check size={16} style={{ color: 'var(--clay)', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
            <PrimaryBtn href={dashHref}>Попробовать →</PrimaryBtn>
          </motion.div>

          {/* Phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex justify-center"
          >
            <div style={{ position: 'relative' }}>
              {/* phone shell */}
              <div style={{
                width: 270,
                height: 560,
                borderRadius: 44,
                border: '8px solid #261B11',
                background: '#261B11',
                boxShadow: '0 40px 90px rgba(38,27,17,.3), 0 0 0 1px rgba(38,27,17,.15)',
                overflow: 'hidden',
                position: 'relative',
              }}>
                {/* notch */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 90, height: 28, background: '#261B11', borderRadius: '0 0 18px 18px', zIndex: 10 }} />
                {/* screen */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  overflow: 'hidden',
                  borderRadius: 38,
                  background: '#FDFAF3',
                }}>
                  {/* scaled template */}
                  <div style={{
                    width: 390,
                    transformOrigin: 'top left',
                    transform: `translateZ(0) scale(${254 / 390})`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none',
                  }}>
                    <KazakhTemplate event={DEMO_EVENT} />
                  </div>
                </div>
              </div>
              {/* shadow reflection */}
              <div style={{ position: 'absolute', bottom: -24, left: '50%', transform: 'translateX(-50%)', width: 180, height: 20, background: 'rgba(38,27,17,.12)', borderRadius: '50%', filter: 'blur(12px)' }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ maxWidth: 680, marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 18 }}>Қалай жұмыс істейді</p>
            <h2 style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 400, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.1, color: 'var(--ink)' }}>
              Үш қадам — <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>той дайын</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ borderTop: '1px solid var(--line)' }}>
            {[
              { num: '01', kz: 'Шақыру жасаңыз', ru: 'Приглашение', text: 'Выберите шаблон, добавьте дату, место и пару тёплых слов. Готовое пригласительное — за минуту.' },
              { num: '02', kz: 'Қонақтарды жинаңыз', ru: 'Гости', text: 'Гость отвечает одним касанием. Список «кто придёт» собирается сам — без чатов и таблиц.' },
              { num: '03', kz: 'Еске салдырыңыз', ru: 'Напоминания', text: 'Toyla сам напомнит каждому гостю в нужный момент — накануне и в день торжества.' },
            ].map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                style={{ padding: '36px 0', paddingRight: i < 2 ? 34 : 0, paddingLeft: i > 0 ? 34 : 0, borderRight: i < 2 ? '1px solid var(--line)' : 'none' }}
                className="border-r-0 md:border-r last:border-r-0"
              >
                <p style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 300, fontSize: 46, color: 'var(--clay)', lineHeight: 1, marginBottom: 20 }}>{step.num}</p>
                <p style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 500, fontSize: 22, color: 'var(--ink)', marginBottom: 4 }}>{step.kz}</p>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>{step.ru}</p>
                <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--ink-soft)' }}>{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 18 }}>Баға</p>
            <h2 style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 400, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.1, color: 'var(--ink)' }}>
              Таңдаңыз — <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>тойыңызға лайықты</span>
            </h2>
            <p style={{ marginTop: 16, fontSize: 16, color: 'var(--ink-soft)' }}>Бір той — бір төлем. Айлық жазылым жоқ.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
            <PriceCard
              name="Тегін"
              price="0 ₸"
              sub="бір той"
              cta="Бастау →"
              ctaHref={dashHref}
              features={[
                '1 той',
                '10 қонаққа дейін',
                'Қазақша үлгі',
                'Қонақтарды отырғызу',
                'Еске салу жоқ',
              ]}
            />
            <PriceCard
              name="Дара"
              price="6 990 ₸"
              sub="бір той"
              cta="Той құру →"
              ctaHref={dashHref}
              highlight
              features={[
                '1 той',
                '300 қонаққа дейін',
                'Барлық үлгілер',
                'Фото және музыка',
                'Қонақтарды отырғызу',
                'Қонақтарға еске салу',
              ]}
            />
            <PriceCard
              name="Той"
              price="9 990 ₸"
              sub="бір той"
              cta="Той құру →"
              ctaHref={dashHref}
              features={[
                '1 той',
                '1 000 қонаққа дейін',
                'Барлық үлгілер',
                'Басым қолдау',
                'Toyla логосыз',
                'Барлық мүмкіндіктер',
              ]}
            />
          </div>

          {/* Custom design banner */}
          <motion.a
            href="https://wa.me/77073907131"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              background: 'var(--paper)',
              border: '1.5px dashed var(--gold)',
              borderRadius: 20,
              padding: '28px 36px',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
            whileHover={{ borderColor: 'var(--clay)', scale: 1.005 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--clay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--clay)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-spectral), serif', fontSize: 20, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>
                  Өз дизайніңізді тапсырыс беріңіз
                </p>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  Бірегей шаблон жасаймыз — брендіңізге, тақырыбыңызға сай
                </p>
              </div>
            </div>
            <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, background: '#25D366', color: '#fff', borderRadius: 999, padding: '10px 22px', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              +7 707 390 71 31
            </div>
          </motion.a>
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
            style={{ background: 'var(--ink)', borderRadius: 32, padding: 'clamp(48px,6vw,80px) clamp(24px,5vw,64px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', right: -100, top: '50%', transform: 'translateY(-50%)', width: 440, height: 440, opacity: 0.08, pointerEvents: 'none' }}>
              <Shanyrak hoop="#E9D9BE" lattice="#C8A24B" spoke="#C8A24B" sw={1.5} />
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold-soft)', marginBottom: 20, position: 'relative' }}>Тойыңызды бастаймыз ба?</p>
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
                style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 14.5, background: 'var(--paper)', color: 'var(--ink)', padding: '12px 26px', borderRadius: 999, transition: 'all .18s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 26px rgba(0,0,0,.25)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                Той құру →
              </Link>
              <a href="#pricing" style={{ fontSize: 15, fontWeight: 600, color: 'var(--bone)', borderBottom: '1.5px solid rgba(244,236,223,.3)', paddingBottom: 3 }}>
                Бағаны көру
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '0 24px 48px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6" style={{ borderTop: '1px solid var(--line)', paddingTop: 36 }}>
            <div className="flex flex-col gap-4">
              <Logo size="sm" href="/" />
              <a
                href="https://wa.me/77073907131"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-all"
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--clay)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--ink-soft)')}
              >
                <MessageCircle size={16} />
                +7 707 390 71 31
              </a>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {[
                { label: 'Мүмкіндіктер', href: '#how' },
                { label: 'Үлгілер', href: '#templates' },
                { label: 'Баға', href: '#pricing' },
                { label: 'WhatsApp', href: 'https://wa.me/77073907131' },
              ].map((item) => (
                <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
                  style={{ fontSize: 14, color: 'var(--ink-soft)', transition: 'color .18s' }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--clay)')}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--ink-soft)')}
                >{item.label}</a>
              ))}
            </div>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>© 2026 Toyla · toyla.app</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
