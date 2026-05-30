'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import {
  Users, MapPin, Calendar, ChevronRight, Trash2,
  Copy, ExternalLink, Settings, LayoutGrid, User, Send, Bell, AlarmClock, Pencil, Lock,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useGetToy, useDeleteToy, useUpdateToy } from '@/hooks/useToys'
import { useGetGuests } from '@/hooks/useGuests'
import { useSendInvites, useSendReminders, useSendSeating } from '@/hooks/useNotifications'
import { useTariffGate } from '@/hooks/useTariff'
import { useAuthStore } from '@/store/auth.store'
import { useLangStore } from '@/store/lang.store'
import { useUpgradeStore } from '@/store/upgrade.store'
import { formatEventDate, isPastEvent, daysUntilDelete } from '@/lib/formatters'
import i18n from '@/lib/i18n'
import toast from 'react-hot-toast'

const editSchema = z.object({
  title:         z.string().min(2, 'Кемінде 2 таңба').max(100),
  description:   z.string().min(10, 'Кемінде 10 таңба').max(1000),
  eventDate:     z.string().min(1, 'Күнді көрсетіңіз'),
  locationName:  z.string().optional(),
  gisLink:       z.string().url('Дұрыс сілтеме енгізіңіз').optional().or(z.literal('')),
  organizerName: z.string().max(128).optional(),
})
type EditForm = z.infer<typeof editSchema>

export default function EventPage() {
  const { toyId } = useParams<{ toyId: string }>()
  const router = useRouter()
  const { userId } = useAuthStore()
  const { lang } = useLangStore()
  const t = i18n[lang]
  const { data: toy, isLoading } = useGetToy(toyId)
  const { data: guests } = useGetGuests(toyId)
  const deleteToy = useDeleteToy(userId ?? 0)
  const updateToy = useUpdateToy(toyId, userId ?? 0)
  const sendInvites = useSendInvites(toyId)
  const sendReminders = useSendReminders(toyId)
  const sendSeating = useSendSeating(toyId)
  const { canRemind } = useTariffGate()
  const openUpgrade = useUpgradeStore((s) => s.openUpgrade)
  const [showDelete, setShowDelete] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const form = useForm<EditForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editSchema) as any,
    defaultValues: { title: '', description: '', eventDate: '', locationName: '', gisLink: '', organizerName: '' },
  })

  const openEdit = () => {
    if (!toy) return
    form.reset({
      title:         toy.title,
      description:   toy.description,
      eventDate:     toy.eventDate.slice(0, 16),
      locationName:  toy.locationName ?? '',
      gisLink:       toy.gisLink ?? '',
      organizerName: toy.organizerName ?? '',
    })
    setShowEdit(true)
  }

  const handleEdit = form.handleSubmit(async (values) => {
    await updateToy.mutateAsync({
      title:         values.title,
      description:   values.description,
      eventDate:     values.eventDate.length === 16 ? values.eventDate + ':00' : values.eventDate,
      locationName:  values.locationName  || undefined,
      gisLink:       values.gisLink       || undefined,
      organizerName: values.organizerName || undefined,
      templateId:    toy!.templateId,
    })
    setShowEdit(false)
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  if (!toy) return <div className="text-center py-12 text-gray-500">{t.eventNotFound}</div>

  const past = isPastEvent(toy.eventDate)
  const daysLeft = past ? daysUntilDelete(toy.eventDate) : null
  const total = guests?.length ?? 0
  const eventUrl = `https://toyla.app/${userId}/${toy.id}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl)
    toast.success(t.linkCopied)
  }

  const handleDelete = async () => {
    await deleteToy.mutateAsync(toy.id)
    setShowDelete(false)
    router.push('/dashboard')
  }

  const tmplLabels: Record<string, string> = {
    ELEGANT: t.tmplELEGANT, FESTIVE: t.tmplFESTIVE,
    MINIMALIST: t.tmplMINIMALIST, ROMANTIC: t.tmplROMANTIC, MODERN: t.tmplMODERN,
  }

  const navCards = [
    { href: `/events/${toyId}/guests`,   icon: Users,       label: t.guestsNav,   value: `${total}`, color: 'text-[#A8492A] bg-[#FBF5F1]' },
    { href: `/events/${toyId}/seating`,  icon: LayoutGrid,  label: t.seatingNav,  value: '',         color: 'text-blue-600 bg-blue-50' },
    { href: `/events/${toyId}/template`, icon: Settings,    label: t.templateNav, value: tmplLabels[toy.templateId], color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-xs text-gray-400 hover:text-gray-600">{t.homeBreadcrumb}</Link>
            <span className="text-xs text-gray-300">/</span>
            <span className="text-xs text-gray-600 truncate max-w-[200px]">{toy.title}</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 leading-tight">{toy.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">{tmplLabels[toy.templateId]}</Badge>
            {past && <Badge className="text-xs bg-gray-100 text-gray-600">{t.pastBadgeFull}</Badge>}
            {past && daysLeft !== null && daysLeft <= 7 && (
              <Badge className={`text-xs ${daysLeft <= 2 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                {t.deleteDays(daysLeft)}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={openEdit} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Pencil size={14} />
            <span className="hidden sm:block">{t.edit}</span>
          </button>
          <button onClick={handleCopyLink} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Copy size={14} />
            <span className="hidden sm:block">{t.link}</span>
          </button>
          <a href={eventUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <ExternalLink size={14} />
            <span className="hidden sm:block">{t.open}</span>
          </a>
          <button onClick={() => setShowDelete(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-red-100 text-sm text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FBF5F1] flex items-center justify-center">
              <Calendar size={16} className="text-[#A8492A]" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{t.dateLabel}</p>
              <p className="text-sm font-medium text-gray-900">{formatEventDate(toy.eventDate, lang)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <User size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400">{t.organizerLabel}</p>
              <p className="text-sm font-medium text-gray-900">{toy.organizerName}</p>
            </div>
          </div>
          {toy.locationName && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <MapPin size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{t.placeLabel}</p>
                {toy.gisLink ? (
                  <a href={toy.gisLink} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 underline underline-offset-2">
                    {toy.locationName}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-gray-900">{toy.locationName}</p>
                )}
              </div>
            </div>
          )}
        </div>
        {toy.description && (
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-sm text-gray-600 leading-relaxed">{toy.description}</p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] p-4 text-center inline-block min-w-[120px]">
          <div className="text-2xl font-bold text-gray-900">{total}</div>
          <div className="text-xs text-gray-400 mt-1">{t.totalGuests}</div>
        </div>
      </div>

      <div className="bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">{t.notificationsH}</h2>
        <p className="text-xs text-gray-400 mb-4">{t.sendManually}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => sendInvites.mutate()} disabled={sendInvites.isPending}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-[#E8C5B5] hover:bg-[#FBF5F1]/40 transition-all text-left disabled:opacity-50">
            <div className="w-8 h-8 rounded-lg bg-[#FBF5F1] flex items-center justify-center flex-shrink-0">
              <Send size={14} className="text-[#A8492A]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{sendInvites.isPending ? t.sending : t.invites}</p>
              <p className="text-xs text-gray-400">{t.firstWhatsapp}</p>
            </div>
          </button>
          <button
            onClick={() => canRemind ? sendReminders.mutate() : openUpgrade(t.remindersLockedHint)}
            disabled={sendReminders.isPending}
            title={canRemind ? undefined : t.remindersLockedHint}
            className={`flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/40 transition-all text-left disabled:opacity-50 ${!canRemind ? 'opacity-60' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              {canRemind ? <Bell size={14} className="text-amber-600" /> : <Lock size={14} className="text-amber-600" />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{sendReminders.isPending ? t.sending : t.reminder}</p>
              <p className="text-xs text-gray-400">{t.reminder24h}</p>
            </div>
          </button>
          <button onClick={() => sendSeating.mutate()} disabled={sendSeating.isPending}
            className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all text-left disabled:opacity-50">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <AlarmClock size={14} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{sendSeating.isPending ? t.sending : t.seating}</p>
              <p className="text-xs text-gray-400">{t.morningMsg}</p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {navCards.map((card) => {
          const Icon = card.icon
          return (
            <Link key={card.href} href={card.href}
              className="flex items-center gap-4 bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] p-4 hover:shadow-md transition-shadow group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900">{card.label}</div>
                <div className="text-xs text-gray-400">{card.value}</div>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </Link>
          )
        })}
      </div>

      <Sheet open={showEdit} onOpenChange={(open) => { if (!open) setShowEdit(false) }}>
        <SheetContent className="sm:max-w-sm px-6 overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-xl bg-[#F5EDE6] flex items-center justify-center flex-shrink-0">
                <Pencil size={13} className="text-[#A8492A]" />
              </div>
              {t.editEvent}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-5 space-y-3.5">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">{t.titleField} *</label>
              <Input {...form.register('title')} className="rounded-xl h-10 text-sm" />
              {form.formState.errors.title && <p className="text-[11px] text-red-500 mt-1">{form.formState.errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">{t.inviteText} *</label>
              <Textarea {...form.register('description')} rows={4} className="rounded-xl resize-none text-sm" />
              {form.formState.errors.description && <p className="text-[11px] text-red-500 mt-1">{form.formState.errors.description.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">{t.dateTimeField} *</label>
              <Input type="datetime-local" {...form.register('eventDate')} className="rounded-xl h-10 text-sm" />
              {form.formState.errors.eventDate && <p className="text-[11px] text-red-500 mt-1">{form.formState.errors.eventDate.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">{t.venue}</label>
              <Input {...form.register('locationName')} className="rounded-xl h-10 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">{t.mapLink}</label>
              <Input {...form.register('gisLink')} placeholder="https://2gis.kz/..." className="rounded-xl h-10 text-sm" />
              {form.formState.errors.gisLink && <p className="text-[11px] text-red-500 mt-1">{form.formState.errors.gisLink.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">{t.organizerField}</label>
              <Input {...form.register('organizerName')} placeholder="Семья Абылай" className="rounded-xl h-10 text-sm" />
              <p className="text-[11px] text-gray-400 mt-1">{t.organizerHint}</p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <Button variant="outline" onClick={() => setShowEdit(false)} className="flex-1 rounded-xl h-10 text-xs">{t.cancel}</Button>
              <Button onClick={handleEdit} disabled={updateToy.isPending} className="flex-1 bg-[#A8492A] hover:bg-[#8A3A20] rounded-xl h-10 text-xs">
                {updateToy.isPending ? t.saving : t.save}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title={t.deleteEventQ}
        description={t.deleteEventDesc}
        confirmLabel={t.delete}
        onConfirm={handleDelete}
        loading={deleteToy.isPending}
      />
    </div>
  )
}
