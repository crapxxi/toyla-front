'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Check, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCreateToy } from '@/hooks/useToys'
import { useAuthStore } from '@/store/auth.store'
import { EventTemplate, MessageLanguage } from '@/types'

interface TemplateConfig {
  id: EventTemplate
  label: string
  desc: string
  preview: {
    bg: string
    headerBg?: string
    titleColor: string
    accentColor: string
    textColor: string
    style: 'elegant' | 'festive' | 'minimalist' | 'romantic' | 'modern'
  }
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: 'ELEGANT',
    label: 'Элегантный',
    desc: 'Классический с золотыми акцентами',
    preview: { bg: '#FFFEF8', titleColor: '#8B6914', accentColor: '#C9A84C', textColor: '#5C3D2A', style: 'elegant' },
  },
  {
    id: 'FESTIVE',
    label: 'Праздничный',
    desc: 'Яркий тёмный с неоновыми цветами',
    preview: { bg: '#0D0221', titleColor: '#FFE66D', accentColor: '#FF6B6B', textColor: '#ffffff', style: 'festive' },
  },
  {
    id: 'MINIMALIST',
    label: 'Минималистичный',
    desc: 'Чистый и современный',
    preview: { bg: '#FFFFFF', titleColor: '#111827', accentColor: '#9CA3AF', textColor: '#6B7280', style: 'minimalist' },
  },
  {
    id: 'ROMANTIC',
    label: 'Романтичный',
    desc: 'Нежно-розовый с цветами',
    preview: { bg: '#FFF0F5', titleColor: '#BE4B7A', accentColor: '#F5A7C7', textColor: '#6B2040', style: 'romantic' },
  },
  {
    id: 'MODERN',
    label: 'Современный',
    desc: 'Тёмный с фиолетовым свечением',
    preview: { bg: '#09090F', titleColor: '#C4B5FD', accentColor: '#8B5CF6', textColor: '#A0A0C0', style: 'modern' },
  },
]

const LANGUAGES: { id: MessageLanguage; label: string; flag: string }[] = [
  { id: 'RUSSIAN', label: 'Русский', flag: '🇷🇺' },
  { id: 'KAZAKH', label: 'Қазақша', flag: '🇰🇿' },
]

const detailsSchema = z.object({
  title: z.string().min(2, 'Минимум 2 символа').max(100),
  description: z.string().min(10, 'Минимум 10 символов').max(1000),
  eventDate: z.string().min(1, 'Укажите дату'),
  locationName: z.string().optional(),
  gisLink: z.string().url('Введите корректную ссылку').optional().or(z.literal('')),
  organizerName: z.string().max(128).optional(),
})

type DetailsForm = z.infer<typeof detailsSchema>
const steps = ['Детали', 'Шаблон', 'Язык', 'Готово']

function TemplatePreviewCard({ tmpl, selected, onClick }: { tmpl: TemplateConfig; selected: boolean; onClick: () => void }) {
  const p = tmpl.preview

  const renderPreviewContent = () => {
    if (p.style === 'elegant') {
      return (
        <>
          <div className="flex justify-center gap-1 mb-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-px flex-1" style={{ backgroundColor: p.accentColor, opacity: 0.6 }} />
            ))}
          </div>
          <p className="text-center font-bold leading-tight" style={{ color: p.titleColor, fontSize: 11, fontFamily: 'Georgia, serif' }}>Свадьба</p>
          <p className="text-center font-bold leading-tight" style={{ color: p.titleColor, fontSize: 10, fontFamily: 'Georgia, serif' }}>Айгерим & Алибек</p>
          <div className="my-2 h-px mx-4" style={{ backgroundColor: p.accentColor, opacity: 0.4 }} />
          <div className="flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: p.accentColor }} />
            <p className="text-center" style={{ color: p.textColor, fontSize: 8 }}>14 июня 2025</p>
            <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: p.accentColor }} />
          </div>
          <div className="mt-3 mx-4 py-1 px-2 rounded-full border text-center" style={{ borderColor: p.accentColor }}>
            <p style={{ color: p.titleColor, fontSize: 7 }}>Принять приглашение</p>
          </div>
        </>
      )
    }
    if (p.style === 'festive') {
      return (
        <>
          <div className="flex justify-center gap-0.5 mb-1">
            {['✦', '✨', '✦'].map((s, i) => <span key={i} style={{ color: p.accentColor, fontSize: 8 }}>{s}</span>)}
          </div>
          <p className="text-center font-extrabold leading-tight"
            style={{ fontSize: 11, background: `linear-gradient(135deg, ${p.titleColor}, ${p.accentColor})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            День рождения!
          </p>
          <p className="text-center font-extrabold" style={{ fontSize: 9, color: p.accentColor }}>Праздничная вечеринка</p>
          <div className="mt-2 mx-4 py-1 rounded-full text-center" style={{ background: `linear-gradient(135deg, ${p.accentColor}, ${p.titleColor})` }}>
            <p style={{ color: '#0D0221', fontSize: 7, fontWeight: 700 }}>Приду! 🎉</p>
          </div>
          <div className="flex justify-center mt-1 gap-0.5">
            {['⭐', '🎊', '⭐'].map((e, i) => <span key={i} style={{ fontSize: 8 }}>{e}</span>)}
          </div>
        </>
      )
    }
    if (p.style === 'minimalist') {
      return (
        <>
          <div className="h-px mx-4 mb-3" style={{ backgroundColor: p.titleColor, opacity: 0.12 }} />
          <p style={{ color: p.accentColor, fontSize: 7, letterSpacing: '0.15em', textTransform: 'uppercase' }} className="mb-2 ml-4">Айгерим & Алибек</p>
          <p className="font-light leading-tight ml-4 mb-2" style={{ color: p.titleColor, fontSize: 13 }}>Свадебный вечер</p>
          <p style={{ color: p.accentColor, fontSize: 8 }} className="ml-4">14 июня 2025</p>
          <div className="h-px mx-4 mt-3" style={{ backgroundColor: p.titleColor, opacity: 0.08 }} />
          <div className="mt-2 mx-4 py-1 border text-center" style={{ borderColor: p.titleColor }}>
            <p style={{ color: p.titleColor, fontSize: 7 }}>Принять</p>
          </div>
        </>
      )
    }
    if (p.style === 'romantic') {
      return (
        <>
          <div className="flex justify-center gap-0.5 mb-1">
            {['❀', '✿', '❀'].map((f, i) => <span key={i} style={{ color: p.accentColor, fontSize: 9 }}>{f}</span>)}
          </div>
          <p className="text-center italic" style={{ color: p.titleColor, fontSize: 8 }}>приглашает вас</p>
          <p className="text-center font-light leading-tight mt-1" style={{ color: p.titleColor, fontSize: 13, fontFamily: '"Cormorant Garamond", Georgia, serif' }}>Свадьба</p>
          <div className="flex items-center justify-center gap-1 my-2">
            <div className="h-px flex-1 mx-2" style={{ backgroundColor: p.accentColor }} />
            <span style={{ color: p.titleColor, fontSize: 9 }}>♥</span>
            <div className="h-px flex-1 mx-2" style={{ backgroundColor: p.accentColor }} />
          </div>
          <p style={{ color: p.textColor, fontSize: 7 }} className="text-center">14 июня 2025</p>
          <div className="mt-2 mx-4 py-1 rounded-full text-center" style={{ background: `linear-gradient(135deg, ${p.titleColor}, ${p.accentColor})` }}>
            <p style={{ color: 'white', fontSize: 7 }}>Приду ♥</p>
          </div>
        </>
      )
    }
    // modern
    return (
      <>
        <div className="mx-4 mb-2 px-2 py-0.5 rounded-full inline-flex items-center gap-1" style={{ border: `1px solid ${p.accentColor}50`, backgroundColor: `${p.accentColor}15` }}>
          <div className="w-1 h-1 rounded-full" style={{ backgroundColor: p.accentColor }} />
          <p style={{ color: p.accentColor, fontSize: 6, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Мероприятие</p>
        </div>
        <p className="font-black leading-none ml-4" style={{ color: '#F1F0FF', fontSize: 12 }}>Корпоратив</p>
        <p className="font-black ml-4" style={{ color: p.titleColor, fontSize: 12 }}>2025</p>
        <div className="h-px ml-4 mr-4 mt-2 mb-2" style={{ background: `linear-gradient(90deg, ${p.accentColor}, transparent)` }} />
        <p style={{ color: p.textColor, fontSize: 7 }} className="ml-4">14 июня, Алматы</p>
        <div className="mt-2 mx-4 py-1 rounded-xl text-center" style={{ background: `linear-gradient(135deg, ${p.accentColor}, ${p.titleColor})` }}>
          <p style={{ color: 'white', fontSize: 7, fontWeight: 700 }}>Принять →</p>
        </div>
      </>
    )
  }

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
        selected ? 'border-[#8B5CF6] ring-4 ring-[#8B5CF6]/20 scale-[1.01]' : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
      }`}
    >
      <div className="flex gap-0">
        {/* Mini preview */}
        <div
          className="w-40 flex-shrink-0 relative overflow-hidden"
          style={{ backgroundColor: p.bg, minHeight: 156 }}
        >
          {p.style === 'festive' && (
            <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${p.bg} 0%, #1E0547 50%, ${p.bg} 100%)` }} />
          )}
          {p.style === 'romantic' && (
            <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${p.bg} 0%, #FFE4F0 50%, ${p.bg} 100%)` }} />
          )}
          {p.style === 'modern' && (
            <>
              <div className="absolute top-2 left-2 w-12 h-12 rounded-full blur-2xl" style={{ backgroundColor: p.accentColor, opacity: 0.4 }} />
              <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full blur-xl" style={{ backgroundColor: p.titleColor, opacity: 0.3 }} />
            </>
          )}
          <div className="relative z-10 pt-4 flex flex-col">
            {renderPreviewContent()}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-4 flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-gray-900">{tmpl.label}</p>
              {selected && (
                <div className="w-5 h-5 rounded-full bg-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{tmpl.desc}</p>
          </div>
          <div className="flex gap-1 mt-3">
            {[p.bg, p.titleColor, p.accentColor].map((color, i) => (
              <div key={i} className="w-4 h-4 rounded-full border border-gray-100" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>
      </div>
    </button>
  )
}

const slideVariants = {
  enter: { x: 40, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -40, opacity: 0 },
}

export default function NewEventPage() {
  const router = useRouter()
  const { userId } = useAuthStore()
  const createToy = useCreateToy(userId ?? 0)
  const [step, setStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<EventTemplate>('ELEGANT')
  const [selectedLang, setSelectedLang] = useState<MessageLanguage>('RUSSIAN')
  const [createdId, setCreatedId] = useState<string | null>(null)

  const form = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { title: '', description: '', eventDate: '', locationName: '', gisLink: '', organizerName: '' },
  })

  const handleDetailsNext = form.handleSubmit(() => setStep(1))

  const handleCreate = async () => {
    const values = form.getValues()
    const result = await createToy.mutateAsync({
      title: values.title,
      description: values.description,
      eventDate: new Date(values.eventDate).toISOString().replace('Z', '').slice(0, 19),
      locationName: values.locationName || undefined,
      gisLink: values.gisLink || undefined,
      organizerName: values.organizerName || undefined,
      templateId: selectedTemplate,
      language: selectedLang,
    })
    setCreatedId(result.id)
    setStep(3)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => (step > 0 ? setStep(step - 1) : router.back())}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Новое мероприятие</h1>
          <p className="text-xs text-gray-500">Шаг {step + 1} из {steps.length}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                i < step ? 'bg-[#8B5CF6] text-white' : i === step ? 'bg-[#8B5CF6] text-white ring-4 ring-violet-100' : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i < step ? <Check size={13} /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? 'font-medium text-gray-900' : 'text-gray-400'}`}>{s}</span>
            {i < steps.length - 1 && <div className={`h-px w-6 sm:w-12 ${i < step ? 'bg-[#8B5CF6]' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="max-w-xl">
        <AnimatePresence mode="wait">
          {/* Step 0 — Details */}
          {step === 0 && (
            <motion.div key="details" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="text-base font-semibold text-gray-900">Детали мероприятия</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Название *</label>
                <Input {...form.register('title')} placeholder="Свадьба Айгерим и Алибека" className="rounded-xl" />
                {form.formState.errors.title && <p className="text-xs text-red-500 mt-1">{form.formState.errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Описание *</label>
                <Textarea {...form.register('description')} placeholder="Мы рады пригласить вас на наш праздник..." rows={4} className="rounded-xl resize-none" />
                {form.formState.errors.description && <p className="text-xs text-red-500 mt-1">{form.formState.errors.description.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата и время *</label>
                <Input type="datetime-local" {...form.register('eventDate')} className="rounded-xl" />
                {form.formState.errors.eventDate && <p className="text-xs text-red-500 mt-1">{form.formState.errors.eventDate.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Место проведения</label>
                <Input {...form.register('locationName')} placeholder="Ресторан Alatau, Алматы" className="rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Имя организатора</label>
                <Input {...form.register('organizerName')} placeholder="Семья Абылай" className="rounded-xl" />
                <p className="text-xs text-gray-400 mt-1">Отображается на странице приглашения. Если не заполнено — берётся из профиля</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ссылка на 2GIS</label>
                <Input {...form.register('gisLink')} placeholder="https://2gis.kz/..." className="rounded-xl" />
                {form.formState.errors.gisLink && <p className="text-xs text-red-500 mt-1">{form.formState.errors.gisLink.message}</p>}
              </div>
              <Button onClick={handleDetailsNext} className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl">Далее</Button>
            </motion.div>
          )}

          {/* Step 1 — Template */}
          {step === 1 && (
            <motion.div key="template" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }} className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Выберите шаблон</h2>
              <p className="text-sm text-gray-500">Внешний вид приглашения для ваших гостей</p>
              <div className="space-y-3">
                {TEMPLATES.map((tmpl) => (
                  <TemplatePreviewCard
                    key={tmpl.id}
                    tmpl={tmpl}
                    selected={selectedTemplate === tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                  />
                ))}
              </div>
              <Button onClick={() => setStep(2)} className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl mt-4">Далее</Button>
            </motion.div>
          )}

          {/* Step 2 — Language */}
          {step === 2 && (
            <motion.div key="language" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }} className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Язык приглашения</h2>
              <p className="text-sm text-gray-500">Язык WhatsApp-сообщений для гостей</p>
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGES.map((lng) => (
                  <button
                    key={lng.id}
                    onClick={() => setSelectedLang(lng.id)}
                    className={`p-5 rounded-2xl border-2 text-center transition-all ${
                      selectedLang === lng.id ? 'border-[#8B5CF6] bg-[#EDE9FE]/50' : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="text-3xl mb-2">{lng.flag}</div>
                    <div className="font-medium text-gray-900 text-sm">{lng.label}</div>
                    {selectedLang === lng.id && (
                      <div className="mt-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#8B5CF6]">
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <Button onClick={handleCreate} disabled={createToy.isPending} className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl mt-4">
                {createToy.isPending ? 'Создание...' : 'Создать мероприятие'}
              </Button>
            </motion.div>
          )}

          {/* Step 3 — Done */}
          {step === 3 && createdId && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, type: 'spring', damping: 20 }}
              className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', damping: 12 }}
                className="w-20 h-20 rounded-full bg-[#EDE9FE] flex items-center justify-center mx-auto mb-6">
                <Sparkles size={36} className="text-[#8B5CF6]" />
              </motion.div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Мероприятие создано!</h2>
              <p className="text-sm text-gray-500 mb-8">Добавьте гостей и настройте приглашение</p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => router.push(`/events/${createdId}/guests`)} className="bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl">
                  Добавить гостей
                </Button>
                <Button variant="outline" onClick={() => router.push(`/events/${createdId}`)} className="rounded-xl">
                  Перейти к мероприятию
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
