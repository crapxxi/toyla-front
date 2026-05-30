'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { motion } from 'framer-motion'
import { ChevronLeft, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCreateToy } from '@/hooks/useToys'
import { useAuthStore } from '@/store/auth.store'

const detailsSchema = z.object({
  title:         z.string().min(2, 'Минимум 2 символа').max(100),
  description:   z.string().min(10, 'Минимум 10 символов').max(1000),
  eventDate:     z.string().min(1, 'Укажите дату'),
  locationName:  z.string().optional(),
  gisLink:       z.string().url('Введите корректную ссылку').optional().or(z.literal('')),
  organizerName: z.string().max(128).optional(),
})

type DetailsForm = z.infer<typeof detailsSchema>

export default function NewEventPage() {
  const router = useRouter()
  const { userId } = useAuthStore()
  const createToy = useCreateToy(userId ?? 0)
  const [step, setStep] = useState(0)
  const [createdId, setCreatedId] = useState<string | null>(null)

  const form = useForm<DetailsForm>({
    resolver: zodResolver(detailsSchema),
    defaultValues: { title: '', description: '', eventDate: '', locationName: '', gisLink: '', organizerName: '' },
  })

  const handleCreate = form.handleSubmit(async (values) => {
    const result = await createToy.mutateAsync({
      title:         values.title,
      description:   values.description,
      eventDate:     new Date(values.eventDate).toISOString().replace('Z', '').slice(0, 19),
      locationName:  values.locationName  || undefined,
      gisLink:       values.gisLink       || undefined,
      organizerName: values.organizerName || undefined,
      templateId:    'ELEGANT',
    })
    setCreatedId(result.id)
    setStep(1)
  })

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : router.back()}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Новое мероприятие</h1>
          <p className="text-xs text-gray-500">{step === 0 ? 'Заполните детали' : 'Готово!'}</p>
        </div>
      </div>

      <div className="max-w-xl">
        {step === 0 && (
          <motion.div
            key="details"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.22 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5"
          >
            <h2 className="text-base font-semibold text-gray-900">Детали мероприятия</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Название *</label>
              <Input {...form.register('title')} placeholder="60 жас Мерей той Айгерим" className="rounded-xl" />
              {form.formState.errors.title && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Текст приглашения *</label>
              <Textarea
                {...form.register('description')}
                placeholder="Сізді Айгерімнің 60 жас мерей тойына шақырамыз..."
                rows={4}
                className="rounded-xl resize-none"
              />
              {form.formState.errors.description && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Дата и время *</label>
              <Input type="datetime-local" {...form.register('eventDate')} className="rounded-xl" />
              {form.formState.errors.eventDate && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.eventDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Место проведения</label>
              <Input {...form.register('locationName')} placeholder='"Қымбатжан" мейрамханасы' className="rounded-xl" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Имя организатора / Шақырушы</label>
              <Input {...form.register('organizerName')} placeholder="Семья Абылай" className="rounded-xl" />
              <p className="text-xs text-gray-400 mt-1">Отображается на странице приглашения. Если не заполнено — берётся из профиля</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ссылка на 2GIS / карту</label>
              <Input {...form.register('gisLink')} placeholder="https://2gis.kz/..." className="rounded-xl" />
              {form.formState.errors.gisLink && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.gisLink.message}</p>
              )}
            </div>

            <Button
              onClick={handleCreate}
              disabled={createToy.isPending}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl"
            >
              {createToy.isPending ? 'Создание...' : 'Создать мероприятие'}
            </Button>
          </motion.div>
        )}

        {step === 1 && createdId && (
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
            <p className="text-sm text-gray-500 mb-8">Добавьте гостей и настройте приглашение</p>
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
      </div>
    </div>
  )
}
