'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, MessageCircle } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { Shanyrak } from '@/components/shared/Shanyrak'
import { KazakhTemplate } from '@/components/templates/KazakhTemplate'
import { useAuthStore } from '@/store/auth.store'
import { useLangStore } from '@/store/lang.store'
import type { Lang } from '@/store/lang.store'
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

// ── Bilingual content (Kazakh first) ─────────────────────────────────────────
const C = {
  kk: {
    nav: { features: 'Мүмкіндіктер', templates: 'Үлгілер', pricing: 'Баға' },
    login: 'Кіру',
    create: 'Той құру',
    hero: {
      eyebrow: 'Той-көмекші',
      titleA: 'Әдемі той', titleEm: 'осыдан', titleB: 'басталады',
      subtitle: 'Toyla бүкіл тойды өз мойнына алады: әдемі шақырулар, қонақтар тізімі және еске салулар — бәрі бір жерде.',
      ctaPrimary: 'Той құру →',
      ctaGhost: 'Қалай жұмыс істейді',
      badge: 'Тойхана мен жеке тойларға',
      langs: 'Қазақша · Русский',
    },
    tpl: {
      eyebrow: 'Үлгі',
      titleA: 'Қазақ үлгісі —', titleEm: 'жылы әрі әдемі',
      desc: 'Алтын акценттері мен қазақ нақышындағы ботаникалық стиль. Кері санақ, картадағы мекенжай, фото және фондық музыка — бәрі ішінде.',
      features: [
        'Қазақша және орысша әдемі шақыру',
        'Тойға дейінгі кері санақ',
        '2GIS / картаға сілтемемен мекенжай',
        'Фондық музыка және фотолар',
        'Қонақтарды тіркеу формасы',
      ],
      cta: 'Қолданып көру →',
    },
    how: {
      eyebrow: 'Қалай жұмыс істейді',
      titleA: 'Үш қадам —', titleEm: 'той дайын',
      steps: [
        { num: '01', title: 'Шақыру жасаңыз', text: 'Үлгіні таңдап, күні мен орнын және бірер жылы сөз қосыңыз. Дайын шақыру — бір минутта.' },
        { num: '02', title: 'Қонақтарды жинаңыз', text: 'Қонақ бір рет басып жауап береді. «Кім келеді» тізімі өзі жиналады — чатсыз, кестесіз.' },
        { num: '03', title: 'Еске салдырыңыз', text: 'Toyla әр қонаққа қажет сәтте өзі еске салады — той қарсаңында және мерекелі күні.' },
      ],
    },
    pricing: {
      eyebrow: 'Баға',
      titleA: 'Таңдаңыз —', titleEm: 'тойыңызға лайықты',
      subtitle: 'Бір той — бір төлем. Айлық жазылым жоқ.',
      popular: 'Танымал',
      plans: [
        { name: 'Тегін', price: '0 ₸', sub: 'бір той', cta: 'Бастау →', highlight: false, features: ['1 той', '10 қонаққа дейін', 'Қазақша үлгі', 'Қонақтарды отырғызу', 'Еске салу жоқ'] },
        { name: 'Дара', price: '6 990 ₸', sub: 'бір той', cta: 'Той құру →', highlight: true, features: ['1 той', '300 қонаққа дейін', 'Барлық үлгілер', 'Фото және музыка', 'Қонақтарды отырғызу', 'Қонақтарға еске салу'] },
        { name: 'Той', price: '9 990 ₸', sub: 'бір той', cta: 'Той құру →', highlight: false, features: ['1 той', '1 000 қонаққа дейін', 'Барлық үлгілер', 'Басым қолдау', 'Toyla логосыз', 'Барлық мүмкіндіктер'] },
      ],
    },
    custom: { title: 'Өз дизайныңызды тапсырыс беріңіз', desc: 'Бірегей шаблон жасаймыз — брендіңізге, тақырыбыңызға сай' },
    faq: {
      eyebrow: 'Сұрақ-жауап',
      title: 'Жиі қойылатын сұрақтар',
      items: [
        { q: 'Тойға сайт қалай жасаймын?', a: 'Toyla-да той жасау оңай: үлгіні таңдап, күні мен орнын қосыңыз — тойға сайт пен электронды шақыру бірнеше минутта дайын болады.' },
        { q: 'Бұл не қамтиды?', a: 'Әдемі шақыру (ашық хат), қонақтарды тіркеу формасы, отырғызу және автоматты еске салулар — бәрі бір сілтемеде.' },
        { q: 'Қандай тойларға келеді?', a: 'Үйлену тойы, қыз ұзату, беташар, тұсаукесер, сүндет той, мерейтой және кез келген мереке — Toyla барлығына лайық.' },
        { q: 'Қанша тұрады?', a: 'Тегін бастауға болады. Ақылы тарифтер бір той үшін 6 990 ₸-ден, айлық жазылымсыз.' },
      ],
    },
    cta: { eyebrow: 'Тойыңызды бастаймыз ба?', titleA: 'Әр шаңыраққа —', titleEm: 'лайықты той', desc: 'Алғашқы шақыруды тегін жасаңыз. Қосымшасыз — бәрі бір сілтемемен жұмыс істейді.', primary: 'Той құру →', ghost: 'Бағаны көру' },
    footerWhats: 'WhatsApp',
  },
  ru: {
    nav: { features: 'Возможности', templates: 'Шаблоны', pricing: 'Цены' },
    login: 'Войти',
    create: 'Создать той',
    hero: {
      eyebrow: 'Помощник в организации тоя',
      titleA: 'Красивый той', titleEm: 'начинается', titleB: 'здесь',
      subtitle: 'Toyla берёт на себя весь той: красивые пригласительные, список гостей и напоминания — всё в одном месте.',
      ctaPrimary: 'Создать той →',
      ctaGhost: 'Как это работает',
      badge: 'Для тойхана и частных праздников',
      langs: 'Қазақша · Русский',
    },
    tpl: {
      eyebrow: 'Шаблон',
      titleA: 'Казахский шаблон —', titleEm: 'тепло и красиво',
      desc: 'Ботанический стиль с золотыми акцентами и казахским колоритом. Обратный отсчёт, адрес с картой, фото и фоновая музыка — всё встроено.',
      features: [
        'Красивое приглашение на казахском и русском',
        'Обратный отсчёт до торжества',
        'Адрес со ссылкой на 2GIS / карту',
        'Фоновая музыка и фотографии',
        'Форма регистрации гостей',
      ],
      cta: 'Попробовать →',
    },
    how: {
      eyebrow: 'Как это работает',
      titleA: 'Три шага —', titleEm: 'той готов',
      steps: [
        { num: '01', title: 'Приглашение', text: 'Выберите шаблон, добавьте дату, место и пару тёплых слов. Готовое пригласительное — за минуту.' },
        { num: '02', title: 'Гости', text: 'Гость отвечает одним касанием. Список «кто придёт» собирается сам — без чатов и таблиц.' },
        { num: '03', title: 'Напоминания', text: 'Toyla сам напомнит каждому гостю в нужный момент — накануне и в день торжества.' },
      ],
    },
    pricing: {
      eyebrow: 'Цены',
      titleA: 'Выберите —', titleEm: 'под ваш той',
      subtitle: 'Один той — один платёж. Без ежемесячной подписки.',
      popular: 'Популярный',
      plans: [
        { name: 'Бесплатно', price: '0 ₸', sub: 'один той', cta: 'Начать →', highlight: false, features: ['1 той', 'до 10 гостей', 'Казахский шаблон', 'Рассадка гостей', 'Без напоминаний'] },
        { name: 'Дара', price: '6 990 ₸', sub: 'один той', cta: 'Создать той →', highlight: true, features: ['1 той', 'до 300 гостей', 'Все шаблоны', 'Фото и музыка', 'Рассадка гостей', 'Напоминания гостям'] },
        { name: 'Той', price: '9 990 ₸', sub: 'один той', cta: 'Создать той →', highlight: false, features: ['1 той', 'до 1 000 гостей', 'Все шаблоны', 'Приоритетная поддержка', 'Без логотипа Toyla', 'Все возможности'] },
      ],
    },
    custom: { title: 'Закажите свой дизайн', desc: 'Создадим уникальный шаблон — под ваш бренд и тематику' },
    faq: {
      eyebrow: 'Вопросы и ответы',
      title: 'Частые вопросы',
      items: [
        { q: 'Как сделать сайт на той?', a: 'Создать той в Toyla просто: выберите шаблон, добавьте дату и место — сайт-приглашение (пригласительные) будет готов за пару минут.' },
        { q: 'Что входит?', a: 'Красивая открытка-приглашение, форма регистрации гостей, рассадка и автоматические напоминания — всё по одной ссылке.' },
        { q: 'Для каких мероприятий подходит?', a: 'Свадьба, қыз ұзату, беташар, тұсаукесер, сүндет той, юбилей и любой праздник — Toyla подойдёт для каждого тоя.' },
        { q: 'Сколько стоит?', a: 'Можно начать бесплатно. Платные тарифы от 6 990 ₸ за один той, без ежемесячной подписки.' },
      ],
    },
    cta: { eyebrow: 'Начнём ваш той?', titleA: 'Каждой семье —', titleEm: 'достойный той', desc: 'Создайте первое пригласительное бесплатно. Без приложения — всё работает по одной ссылке.', primary: 'Создать той →', ghost: 'Посмотреть цены' },
    footerWhats: 'WhatsApp',
  },
} satisfies Record<Lang, unknown>

const WHATSAPP = 'https://wa.me/77073907131'
const PHONE = '+7 707 390 71 31'

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

// ── Language toggle (Kazakh listed first) ────────────────────────────────────
function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const opts: { code: Lang; label: string }[] = [
    { code: 'kk', label: 'ҚАЗ' },
    { code: 'ru', label: 'РУС' },
  ]
  return (
    <div style={{ display: 'inline-flex', border: '1px solid var(--line)', borderRadius: 999, padding: 2, background: 'var(--paper)' }}>
      {opts.map((o) => {
        const active = lang === o.code
        return (
          <button key={o.code} onClick={() => setLang(o.code)} aria-pressed={active}
            style={{
              fontSize: 12.5, fontWeight: 700, letterSpacing: '0.04em',
              padding: '6px 13px', borderRadius: 999, border: 'none', cursor: 'pointer',
              background: active ? 'var(--clay)' : 'transparent',
              color: active ? 'var(--paper)' : 'var(--ink-soft)',
              transition: 'all .15s',
            }}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Pricing card ──────────────────────────────────────────────────────────────
function PriceCard({
  name, price, sub, features, highlight, cta, ctaHref, popularLabel,
}: {
  name: string; price: string; sub: string
  features: string[]; highlight?: boolean; cta: string; ctaHref: string; popularLabel: string
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
        <span style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'var(--clay)', color: 'var(--paper)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '4px 14px', borderRadius: 999, whiteSpace: 'nowrap' }}>
          {popularLabel}
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
  const { lang, setLang } = useLangStore()
  const c = C[lang]
  const dashHref = token ? '/dashboard' : '/login'

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faq.items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  }

  return (
    <div style={{ background: 'var(--bone)', color: 'var(--ink)', fontFamily: 'var(--font-manrope), system-ui, sans-serif', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* ── Header ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(244,236,223,.88)', backdropFilter: 'saturate(150%) blur(12px)', borderBottom: '1px solid rgba(228,216,196,.7)' }}>
        <div className="mx-auto px-4 sm:px-6" style={{ maxWidth: 1200, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <Logo size="sm" href="/" />
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: c.nav.features, href: '#how' },
              { label: c.nav.templates, href: '#templates' },
              { label: c.nav.pricing, href: '#pricing' },
            ].map((item) => (
              <a key={item.href} href={item.href}
                style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--ink-soft)', transition: 'color .18s' }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--clay)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--ink-soft)')}
              >{item.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2.5 sm:gap-4">
            <LangToggle lang={lang} setLang={setLang} />
            <Link href="/login" className="hidden sm:block" style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{c.login}</Link>
            <PrimaryBtn href={dashHref}>{c.create}</PrimaryBtn>
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
            {c.hero.eyebrow}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            style={{ fontFamily: 'var(--font-spectral), Georgia, serif', fontWeight: 400, fontSize: 'clamp(42px, 6.4vw, 76px)', lineHeight: 1.06, letterSpacing: '-0.012em', color: 'var(--ink)' }}>
            {c.hero.titleA}<br />
            <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>{c.hero.titleEm}</span> {c.hero.titleB}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
            style={{ maxWidth: 520, margin: '24px auto 0', fontSize: 17, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
            {c.hero.subtitle}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.38 }}
            className="flex items-center justify-center gap-5 flex-wrap" style={{ marginTop: 36 }}>
            <PrimaryBtn href={dashHref}>{c.hero.ctaPrimary}</PrimaryBtn>
            <GhostLink href="#how">{c.hero.ctaGhost}</GhostLink>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
            style={{ marginTop: 28, fontSize: 13, color: 'var(--ink-soft)', letterSpacing: '0.02em', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span>{c.hero.badge}</span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} />
            <span>{c.hero.langs}</span>
          </motion.div>
        </div>
      </section>

      {/* ── Template showcase ── */}
      <section id="templates" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr', gap: 48, alignItems: 'center' }} className="lg:grid-cols-2">

          {/* Text */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.7 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 18 }}>
              {c.tpl.eyebrow}
            </p>
            <h2 style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 400, fontSize: 'clamp(28px,3.6vw,46px)', lineHeight: 1.1, color: 'var(--ink)', marginBottom: 20 }}>
              {c.tpl.titleA}<br /><span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>{c.tpl.titleEm}</span>
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-soft)', marginBottom: 32, maxWidth: 460 }}>
              {c.tpl.desc}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {c.tpl.features.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--ink-soft)' }}>
                  <Check size={16} style={{ color: 'var(--clay)', flexShrink: 0 }} />
                  {f}
                </li>
              ))}
            </ul>
            <PrimaryBtn href={dashHref}>{c.tpl.cta}</PrimaryBtn>
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
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 18 }}>{c.how.eyebrow}</p>
            <h2 style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 400, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.1, color: 'var(--ink)' }}>
              {c.how.titleA} <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>{c.how.titleEm}</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ borderTop: '1px solid var(--line)' }}>
            {c.how.steps.map((step, i) => (
              <motion.div key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                style={{ padding: '36px 0' }}
                className={`md:pr-9 ${i > 0 ? 'md:pl-9' : ''} ${i < 2 ? 'md:border-r' : ''}`}
              >
                <p style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 300, fontSize: 46, color: 'var(--clay)', lineHeight: 1, marginBottom: 20 }}>{step.num}</p>
                <p style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 500, fontSize: 22, color: 'var(--ink)', marginBottom: 14 }}>{step.title}</p>
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
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 18 }}>{c.pricing.eyebrow}</p>
            <h2 style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 400, fontSize: 'clamp(30px,4vw,48px)', lineHeight: 1.1, color: 'var(--ink)' }}>
              {c.pricing.titleA} <span style={{ fontStyle: 'italic', color: 'var(--clay)' }}>{c.pricing.titleEm}</span>
            </h2>
            <p style={{ marginTop: 16, fontSize: 16, color: 'var(--ink-soft)' }}>{c.pricing.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
            {c.pricing.plans.map((plan) => (
              <PriceCard
                key={plan.name}
                name={plan.name}
                price={plan.price}
                sub={plan.sub}
                cta={plan.cta}
                ctaHref={dashHref}
                highlight={plan.highlight}
                features={plan.features}
                popularLabel={c.pricing.popular}
              />
            ))}
          </div>

          {/* Custom design banner */}
          <motion.a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between p-6 sm:px-9 sm:py-7"
            style={{
              background: 'var(--paper)',
              border: '1.5px dashed var(--gold)',
              borderRadius: 20,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
            whileHover={{ borderColor: 'var(--clay)' }}
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <div style={{ width: 48, height: 48, borderRadius: 16, background: 'var(--clay-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--clay)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-spectral), serif', fontSize: 20, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>
                  {c.custom.title}
                </p>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  {c.custom.desc}
                </p>
              </div>
            </div>
            <div className="w-full sm:w-auto justify-center" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, background: '#25D366', color: '#fff', borderRadius: 999, padding: '12px 22px', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
              </svg>
              {PHONE}
            </div>
          </motion.a>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '40px 24px 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 14 }}>{c.faq.eyebrow}</p>
            <h2 style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 400, fontSize: 'clamp(28px,3.6vw,42px)', lineHeight: 1.1, color: 'var(--ink)' }}>
              {c.faq.title}
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {c.faq.items.map((it) => (
              <details key={it.q} style={{ borderTop: '1px solid var(--line)', padding: '20px 0' }}>
                <summary style={{ cursor: 'pointer', listStyle: 'none', fontFamily: 'var(--font-spectral), serif', fontSize: 19, fontWeight: 500, color: 'var(--ink)' }}>
                  {it.q}
                </summary>
                <p style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: 'var(--ink-soft)' }}>{it.a}</p>
              </details>
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
            style={{ background: 'var(--ink)', borderRadius: 32, padding: 'clamp(48px,6vw,80px) clamp(24px,5vw,64px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', right: -100, top: '50%', transform: 'translateY(-50%)', width: 440, height: 440, opacity: 0.08, pointerEvents: 'none' }}>
              <Shanyrak hoop="#E9D9BE" lattice="#C8A24B" spoke="#C8A24B" sw={1.5} />
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold-soft)', marginBottom: 20, position: 'relative' }}>{c.cta.eyebrow}</p>
            <h2 style={{ fontFamily: 'var(--font-spectral), serif', fontWeight: 400, fontSize: 'clamp(32px,4.4vw,54px)', lineHeight: 1.08, color: 'var(--paper)', position: 'relative' }}>
              {c.cta.titleA}<br />
              <span style={{ fontStyle: 'italic', color: 'var(--gold-soft)' }}>{c.cta.titleEm}</span>
            </h2>
            <p style={{ maxWidth: 460, margin: '22px auto 0', color: 'rgba(244,236,223,.72)', fontSize: 16, lineHeight: 1.6, position: 'relative' }}>
              {c.cta.desc}
            </p>
            <div className="flex items-center justify-center gap-5 flex-wrap" style={{ marginTop: 36, position: 'relative' }}>
              <Link
                href={dashHref}
                style={{ display: 'inline-flex', alignItems: 'center', fontFamily: 'var(--font-manrope), sans-serif', fontWeight: 600, fontSize: 14.5, background: 'var(--paper)', color: 'var(--ink)', padding: '12px 26px', borderRadius: 999, transition: 'all .18s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 26px rgba(0,0,0,.25)' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
              >
                {c.cta.primary}
              </Link>
              <a href="#pricing" style={{ fontSize: 15, fontWeight: 600, color: 'var(--bone)', borderBottom: '1.5px solid rgba(244,236,223,.3)', paddingBottom: 3 }}>
                {c.cta.ghost}
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
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-all"
                style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-soft)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--clay)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--ink-soft)')}
              >
                <MessageCircle size={16} />
                {PHONE}
              </a>
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {[
                { label: c.nav.features, href: '#how' },
                { label: c.nav.templates, href: '#templates' },
                { label: c.nav.pricing, href: '#pricing' },
                { label: c.footerWhats, href: WHATSAPP },
              ].map((item) => (
                <a key={item.href} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
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
