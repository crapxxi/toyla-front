'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Check, Sparkles, Lock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCreateToy } from '@/hooks/useToys'
import { useAuthStore } from '@/store/auth.store'
import { useLangStore } from '@/store/lang.store'
import { EventTemplate } from '@/types'
import i18n from '@/lib/i18n'

interface TemplateConfig {
  id: EventTemplate
  label: string
  desc: string
  colors: [string, string, string]
  available: boolean
}

function KazakhMiniPreview() {
  return (
    <div className="relative w-full overflow-hidden select-none" style={{ height: 230, backgroundColor: '#FDFAF3', fontFamily: '"Georgia", serif' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.015, backgroundImage: 'radial-gradient(circle at 1px 1px, #3D2B1F 0.8px, transparent 0)', backgroundSize: '14px 14px' }} />
      <svg viewBox="0 0 300 58" fill="none" className="w-full" style={{ maxHeight: 58, display: 'block' }}>
        <path d="M150 58 Q112 44 72 22"  stroke="#7A8F55" strokeWidth="1"   fill="none" strokeLinecap="round"/>
        <path d="M150 58 Q188 44 228 22" stroke="#7A8F55" strokeWidth="1"   fill="none" strokeLinecap="round"/>
        <path d="M150 58 Q98  40 54 12"  stroke="#7A8F55" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
        <path d="M150 58 Q202 40 246 12" stroke="#7A8F55" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
        <ellipse cx="108" cy="31" rx="14" ry="4.5" transform="rotate(-38 108 31)" fill="#8A9E5A" opacity="0.70"/>
        <ellipse cx="84"  cy="20" rx="11" ry="3.5" transform="rotate(-52 84  20)" fill="#7A8F55" opacity="0.62"/>
        <ellipse cx="192" cy="31" rx="14" ry="4.5" transform="rotate( 38 192 31)" fill="#8A9E5A" opacity="0.70"/>
        <ellipse cx="216" cy="20" rx="11" ry="3.5" transform="rotate( 52 216 20)" fill="#7A8F55" opacity="0.62"/>
        <circle cx="84"  cy="18" r="2.5" fill="#C4943A" opacity="0.65"/>
        <circle cx="216" cy="18" r="2.5" fill="#C4943A" opacity="0.65"/>
        <circle cx="150" cy="56" r="3"   fill="#C4943A" opacity="0.78"/>
        <circle cx="150" cy="56" r="1.5" fill="#9A6A1A"/>
      </svg>
      <div className="px-5 text-center space-y-1.5" style={{ marginTop: -2 }}>
        <p style={{ fontSize: 7.5, letterSpacing: '0.42em', color: '#C4943A', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase' }}>Құрметті қонақтар!</p>
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-10" style={{ background: 'linear-gradient(to right, transparent, #C4943A70)' }}/>
          <svg width="6" height="6" viewBox="0 0 6 6"><polygon points="3,0 6,3 3,6 0,3" fill="#C4943A" opacity="0.85"/></svg>
          <div className="h-px w-10" style={{ background: 'linear-gradient(to left, transparent, #C4943A70)' }}/>
        </div>
        <p style={{ fontSize: 11, color: '#3D2B1F' }}>Семья Абылай</p>
        <p style={{ fontSize: 7, color: '#5C6B3A', fontStyle: 'italic', fontFamily: 'Inter, sans-serif' }}>шақырады</p>
        <p style={{ fontSize: 17, color: '#3D2B1F', lineHeight: 1.25 }}>60 жас Мерей той</p>
        <div className="flex items-center gap-1 px-4" style={{ marginTop: 2 }}>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #C4943A45)' }}/>
          <svg width="8" height="8" viewBox="0 0 8 8">
            <polygon points="4,0.5 7.5,4 4,7.5 0.5,4" fill="none" stroke="#C4943A" strokeWidth="0.6" opacity="0.65"/>
            <polygon points="4,2.5 5.5,4 4,5.5 2.5,4" fill="#C4943A" opacity="0.7"/>
          </svg>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #C4943A45)' }}/>
        </div>
        <div className="flex gap-1.5 justify-center">
          {[{ v: '15', l: 'Күн' }, { v: '08', l: 'Сағат' }, { v: '30', l: 'Мин' }, { v: '45', l: 'Сек' }].map(({ v, l }) => (
            <div key={l} className="flex flex-col items-center gap-0.5">
              <div style={{ width: 30, height: 28, border: '1px solid #C4943A40', background: 'linear-gradient(145deg, #C4943A12, #C4943A03)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3D2B1F', fontSize: 12, fontFamily: '"Georgia", serif' }}>{v}</div>
              <span style={{ fontSize: 6, color: '#C4943A', fontFamily: 'Inter, sans-serif', letterSpacing: '0.1em' }}>{l}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 7.5, color: '#7A8F55', fontFamily: 'Inter, sans-serif', marginTop: 2 }}>📍 &ldquo;Қымбатжан&rdquo; мейрамханасы</p>
      </div>
    </div>
  )
}

function ComingSoonPreview({ colors, soon }: { colors: [string, string, string]; soon: string }) {
  return (
    <div className="relative w-full overflow-hidden flex flex-col items-center justify-center gap-3" style={{ height: 230 }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(145deg, ${colors[0]}, ${colors[0]}ee)` }} />
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 30% 30%, ${colors[1]}, transparent 60%), radial-gradient(circle at 70% 70%, ${colors[2]}, transparent 60%)` }} />
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${colors[1]}20`, border: `1px solid ${colors[1]}40` }}>
          <Lock size={16} style={{ color: colors[1] }} />
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: `${colors[1]}18`, color: colors[1], border: `1px solid ${colors[1]}35` }}>
          {soon}
        </span>
      </div>
    </div>
  )
}

function TemplateCard({ tmpl, selected, onClick }: { tmpl: TemplateConfig; selected: boolean; onClick: () => void }) {
  const { lang } = useLangStore()
  const t = i18n[lang]
  return (
    <motion.button
      onClick={tmpl.available ? onClick : undefined}
      whileHover={tmpl.available ? { y: -2 } : {}}
      whileTap={tmpl.available ? { scale: 0.99 } : {}}
      disabled={!tmpl.available}
      className={['relative w-full text-left rounded-2xl overflow-hidden transition-all duration-200 border-2',
        selected ? 'border-[#A8492A] shadow-lg shadow-[#F5EDE6]'
        : tmpl.available ? 'border-gray-100 hover:border-gray-200 hover:shadow-md'
        : 'border-gray-100 opacity-60 cursor-not-allowed',
      ].join(' ')}
    >
      <div className="overflow-hidden">
        {tmpl.available ? <KazakhMiniPreview /> : <ComingSoonPreview colors={tmpl.colors} soon={t.soon} />}
      </div>
      <div className="bg-white px-4 py-3.5 flex items-center gap-3">
        <div className="flex gap-1">
          {tmpl.colors.map((c, i) => (
            <div key={i} className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: c }} />
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{tmpl.label}</p>
          <p className="text-xs text-gray-400 truncate">{tmpl.desc}</p>
        </div>
        {selected ? (
          <div className="w-6 h-6 rounded-full bg-[#A8492A] flex items-center justify-center flex-shrink-0">
            <Check size={12} className="text-white" />
          </div>
        ) : tmpl.available ? (
          <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex-shrink-0" />
        ) : (
          <span className="text-[10px] font-medium text-gray-400 flex-shrink-0">{t.soon}</span>
        )}
      </div>
      {selected && <div className="absolute inset-0 rounded-2xl pointer-events-none ring-4 ring-[#F5EDE6]" />}
    </motion.button>
  )
}

function StepBar({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={['w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all',
            i < current ? 'bg-[#A8492A] text-white'
            : i === current ? 'bg-[#A8492A] text-white ring-4 ring-[#F5EDE6]'
            : 'bg-gray-100 text-gray-400',
          ].join(' ')}>
            {i < current ? <Check size={13} /> : i + 1}
          </div>
          <span className={`text-xs hidden sm:block ${i === current ? 'font-medium text-gray-900' : 'text-gray-400'}`}>{label}</span>
          {i < steps.length - 1 && <div className={`h-px w-6 sm:w-10 ${i < current ? 'bg-[#A8492A]' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  )
}

const detailsSchema = z.object({
  title:         z.string().min(2, 'Кемінде 2 таңба').max(100),
  description:   z.string().min(10, 'Кемінде 10 таңба').max(1000),
  eventDate:     z.string().min(1, 'Күнді көрсетіңіз'),
  locationName:  z.string().optional(),
  gisLink:       z.string().url('Дұрыс сілтеме енгізіңіз').optional().or(z.literal('')),
  organizerName: z.string().max(128).optional(),
})
type DetailsForm = z.infer<typeof detailsSchema>

const slide = { enter: { x: 40, opacity: 0 }, center: { x: 0, opacity: 1 }, exit: { x: -40, opacity: 0 } }

export default function NewEventPage() {
  const router = useRouter()
  const { userId } = useAuthStore()
  const { lang } = useLangStore()
  const t = i18n[lang]
  const createToy = useCreateToy(userId ?? 0)

  const TEMPLATES: TemplateConfig[] = [
    { id: 'ELEGANT',    label: t.tmplKazakhLabel, desc: t.tmplKazakhDesc,  colors: ['#FDFAF3', '#C4943A', '#6B7C3E'], available: true },
    { id: 'MODERN',     label: t.tmplModernLabel, desc: t.tmplModernDesc,  colors: ['#09090F', '#A8492A', '#C4B5FD'], available: false },
    { id: 'ROMANTIC',   label: t.tmplRomLabel,    desc: t.tmplRomDesc,     colors: ['#FFF0F5', '#BE4B7A', '#F5A7C7'], available: false },
    { id: 'FESTIVE',    label: t.tmplFestLabel,   desc: t.tmplFestDesc,    colors: ['#0D0221', '#FFE66D', '#FF6B6B'], available: false },
  ]

  const [step, setStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate>('ELEGANT')
  const [createdId, setCreatedId] = useState<string | null>(null)

  const form = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { title: '', description: '', eventDate: '', locationName: '', gisLink: '', organizerName: '' },
  })

  const handleDetailsNext = form.handleSubmit(() => setStep(1))

  const handleCreate = async () => {
    const values = form.getValues()
    const result = await createToy.mutateAsync({
      title:         values.title,
      description:   values.description,
      eventDate:     values.eventDate.length === 16 ? values.eventDate + ':00' : values.eventDate,
      locationName:  values.locationName  || undefined,
      gisLink:       values.gisLink       || undefined,
      organizerName: values.organizerName || undefined,
      templateId:    selectedTemplate,
    })
    setCreatedId(result.id)
    setStep(2)
  }

  const steps = [t.stepDetails, t.stepTemplate, t.stepDone]

  return (
    <div>
      <div className="flex items-center gap-3 mb-7">
        <button onClick={() => step > 0 ? setStep(step - 1) : router.back()}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">{t.newEvent}</h1>
        </div>
      </div>

      <div className="mb-7"><StepBar current={step} steps={steps} /></div>

      <div className="max-w-xl">
        <AnimatePresence mode="wait">

          {step === 0 && (
            <motion.div key="details" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}
              className="bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] p-6 space-y-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{t.eventDetails}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{t.fillInfo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.titleField} *</label>
                <Input {...form.register('title')} placeholder="60 жас Мерей той Айгерім" className="rounded-xl" />
                {form.formState.errors.title && <p className="text-xs text-red-500 mt-1">{form.formState.errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.inviteText} *</label>
                <Textarea {...form.register('description')} placeholder="Сізді Айгерімнің 60 жас мерей тойына шақырамыз..." rows={4} className="rounded-xl resize-none" />
                {form.formState.errors.description && <p className="text-xs text-red-500 mt-1">{form.formState.errors.description.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.dateTimeField} *</label>
                <Input type="datetime-local" {...form.register('eventDate')} className="rounded-xl" />
                {form.formState.errors.eventDate && <p className="text-xs text-red-500 mt-1">{form.formState.errors.eventDate.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.venue}</label>
                <Input {...form.register('locationName')} placeholder='"Қымбатжан" мейрамханасы' className="rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.orgName}</label>
                <Input {...form.register('organizerName')} placeholder="Семья Абылай" className="rounded-xl" />
                <p className="text-xs text-gray-400 mt-1">{t.orgNameHint}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.mapLink}</label>
                <Input {...form.register('gisLink')} placeholder="https://2gis.kz/..." className="rounded-xl" />
                {form.formState.errors.gisLink && <p className="text-xs text-red-500 mt-1">{form.formState.errors.gisLink.message}</p>}
              </div>
              <Button onClick={handleDetailsNext} className="w-full bg-[#A8492A] hover:bg-[#8A3A20] rounded-xl">
                {t.nextToTemplate}
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="template" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }} className="space-y-5">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{t.chooseTemplate}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{t.templateDesc}</p>
              </div>
              <div className="space-y-3">
                {TEMPLATES.map((tmpl) => (
                  <TemplateCard key={tmpl.id} tmpl={tmpl} selected={selectedTemplate === tmpl.id} onClick={() => setSelectedTemplate(tmpl.id)} />
                ))}
              </div>
              <Button onClick={handleCreate} disabled={createToy.isPending} className="w-full bg-[#A8492A] hover:bg-[#8A3A20] rounded-xl h-12 text-base">
                {createToy.isPending ? t.creating : t.createBtn}
              </Button>
            </motion.div>
          )}

          {step === 2 && createdId && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, type: 'spring', damping: 20 }}
              className="bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', damping: 12 }}
                className="w-20 h-20 rounded-full bg-[#F5EDE6] flex items-center justify-center mx-auto mb-6">
                <Sparkles size={36} className="text-[#A8492A]" />
              </motion.div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t.createdTitle}</h2>
              <p className="text-sm text-gray-500 mb-8">{t.createdSubtitle}</p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => router.push(`/events/${createdId}/guests`)} className="bg-[#A8492A] hover:bg-[#8A3A20] rounded-xl">
                  {t.addGuestsBtn}
                </Button>
                <Button variant="outline" onClick={() => router.push(`/events/${createdId}`)} className="rounded-xl">
                  {t.goToEventBtn}
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}
