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

const TEMPLATES: { id: EventTemplate; label: string; desc: string; color: string; bg: string }[] = [
  { id: 'ELEGANT', label: 'Элегантный', desc: 'Классический стиль с золотыми акцентами', color: '#B8860B', bg: '#FFFDF7' },
  { id: 'FESTIVE', label: 'Праздничный', desc: 'Яркий, с тёмным фоном и конфетти', color: '#FF6B6B', bg: '#1a0533' },
  { id: 'MINIMALIST', label: 'Минималистичный', desc: 'Чистый и современный дизайн', color: '#111827', bg: '#FFFFFF' },
  { id: 'ROMANTIC', label: 'Романтичный', desc: 'Нежно-розовый с цветочными украшениями', color: '#C06080', bg: '#FFF5F7' },
  { id: 'MODERN', label: 'Современный', desc: 'Тёмный фон с фиолетовыми акцентами', color: '#8B5CF6', bg: '#0F0F0F' },
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
})

type DetailsForm = z.infer<typeof detailsSchema>

const steps = ['Детали', 'Шаблон', 'Язык', 'Готово']

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
    defaultValues: { title: '', description: '', eventDate: '', locationName: '', gisLink: '' },
  })

  const handleDetailsNext = form.handleSubmit(() => setStep(1))

  const handleCreate = async () => {
    const values = form.getValues()
    const result = await createToy.mutateAsync({
      title: values.title,
      description: values.description,
      eventDate: new Date(values.eventDate).toISOString(),
      locationName: values.locationName || undefined,
      gisLink: values.gisLink || undefined,
      templateId: selectedTemplate,
      language: selectedLang,
    })
    setCreatedId(result.id)
    setStep(3)
  }

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  }

  return (
    <div>
      {/* Header */}
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
                i < step
                  ? 'bg-[#8B5CF6] text-white'
                  : i === step
                  ? 'bg-[#8B5CF6] text-white ring-4 ring-violet-100'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i < step ? <Check size={13} /> : i + 1}
            </div>
            <span className={`text-xs hidden sm:block ${i === step ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
              {s}
            </span>
            {i < steps.length - 1 && (
              <div className={`h-px w-6 sm:w-12 ${i < step ? 'bg-[#8B5CF6]' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="max-w-xl">
        <AnimatePresence mode="wait">
          {/* Step 0 — Details */}
          {step === 0 && (
            <motion.div
              key="details"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5"
            >
              <h2 className="text-base font-semibold text-gray-900">Детали мероприятия</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Название *</label>
                <Input
                  {...form.register('title')}
                  placeholder="Свадьба Айгерим и Алибека"
                  className="rounded-xl"
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Описание *</label>
                <Textarea
                  {...form.register('description')}
                  placeholder="Мы рады пригласить вас на наш праздник..."
                  rows={4}
                  className="rounded-xl resize-none"
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата и время *</label>
                <Input
                  type="datetime-local"
                  {...form.register('eventDate')}
                  className="rounded-xl"
                />
                {form.formState.errors.eventDate && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.eventDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Место проведения</label>
                <Input
                  {...form.register('locationName')}
                  placeholder="Ресторан Alatau, Алматы"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ссылка на 2GIS</label>
                <Input
                  {...form.register('gisLink')}
                  placeholder="https://2gis.kz/..."
                  className="rounded-xl"
                />
                {form.formState.errors.gisLink && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.gisLink.message}</p>
                )}
              </div>

              <Button onClick={handleDetailsNext} className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl">
                Далее
              </Button>
            </motion.div>
          )}

          {/* Step 1 — Template */}
          {step === 1 && (
            <motion.div
              key="template"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <h2 className="text-base font-semibold text-gray-900">Выберите шаблон</h2>
              <div className="grid grid-cols-1 gap-3">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                      selectedTemplate === tmpl.id
                        ? 'border-[#8B5CF6] bg-[#EDE9FE]/50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex-shrink-0"
                      style={{ backgroundColor: tmpl.bg, border: `2px solid ${tmpl.color}30` }}
                    >
                      <div className="w-full h-full rounded-xl flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tmpl.color }} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{tmpl.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{tmpl.desc}</div>
                    </div>
                    {selectedTemplate === tmpl.id && (
                      <div className="w-5 h-5 rounded-full bg-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <Button onClick={() => setStep(2)} className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl mt-4">
                Далее
              </Button>
            </motion.div>
          )}

          {/* Step 2 — Language */}
          {step === 2 && (
            <motion.div
              key="language"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="space-y-4"
            >
              <h2 className="text-base font-semibold text-gray-900">Язык приглашения</h2>
              <p className="text-sm text-gray-500">Выберите язык для SMS-приглашений гостям</p>
              <div className="grid grid-cols-2 gap-3">
                {LANGUAGES.map((lng) => (
                  <button
                    key={lng.id}
                    onClick={() => setSelectedLang(lng.id)}
                    className={`p-5 rounded-2xl border-2 text-center transition-all ${
                      selectedLang === lng.id
                        ? 'border-[#8B5CF6] bg-[#EDE9FE]/50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
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
              <Button
                onClick={handleCreate}
                disabled={createToy.isPending}
                className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl mt-4"
              >
                {createToy.isPending ? 'Создание...' : 'Создать мероприятие'}
              </Button>
            </motion.div>
          )}

          {/* Step 3 — Done */}
          {step === 3 && createdId && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, type: 'spring', damping: 20 }}
              className="bg-white rounded-2xl border border-gray-100 p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', damping: 12 }}
                className="w-20 h-20 rounded-full bg-[#EDE9FE] flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles size={36} className="text-[#8B5CF6]" />
              </motion.div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Мероприятие создано!</h2>
              <p className="text-sm text-gray-500 mb-8">
                Теперь добавьте гостей и настройте рассадку
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => router.push(`/events/${createdId}/guests`)}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl"
                >
                  Добавить гостей
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/events/${createdId}`)}
                  className="rounded-xl"
                >
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
