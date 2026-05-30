'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Plus, Search, Trash2, Users, ChevronLeft, Check, X, Clock, UserPlus } from 'lucide-react'
import Link from 'next/link'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { useGetGuests, useAddGuest, useDeleteGuest } from '@/hooks/useGuests'
import { RsvpStatus } from '@/types'
import { formatPhone } from '@/lib/formatters'

const guestSchema = z.object({
  firstName: z.string().min(1, 'Введите имя'),
  lastName: z.string().min(1, 'Введите фамилию'),
  phoneNumber: z.string().min(11, 'Введите номер полностью'),
  partySize: z.coerce.number().min(1).max(20),
})

type GuestForm = z.infer<typeof guestSchema>

const FILTER_TABS: { value: RsvpStatus | 'ALL'; label: string }[] = [
  { value: 'ALL',      label: 'Все' },
  { value: 'ACCEPTED', label: 'Приняли' },
  { value: 'DECLINED', label: 'Отказали' },
  { value: 'PENDING',  label: 'Ожидают' },
]

const STATUS_STYLES: Record<RsvpStatus, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  ACCEPTED: { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700', icon: Check,  label: 'Принял' },
  DECLINED: { bg: 'bg-red-50 text-red-600',         text: 'text-red-600',     icon: X,      label: 'Отказал' },
  PENDING:  { bg: 'bg-amber-50 text-amber-600',     text: 'text-amber-600',   icon: Clock,  label: 'Ожидает' },
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

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

export default function GuestsPage() {
  const { toyId } = useParams<{ toyId: string }>()
  const { data: guests, isLoading } = useGetGuests(toyId)
  const addGuest = useAddGuest(toyId)
  const deleteGuest = useDeleteGuest(toyId)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [filter, setFilter] = useState<RsvpStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  // Phone field — separate from react-hook-form to handle formatting
  const [phoneDisplay, setPhoneDisplay] = useState('+7')
  const [phoneRaw, setPhoneRaw] = useState('')
  const [partySize, setPartySize] = useState(1)

  const form = useForm<GuestForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(guestSchema) as any,
    defaultValues: { firstName: '', lastName: '', phoneNumber: '', partySize: 1 },
  })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const normalized = raw.startsWith('7') ? raw : raw.startsWith('8') ? '7' + raw.slice(1) : '7' + raw
    const clamped = normalized.slice(0, 11)
    setPhoneRaw(clamped)
    setPhoneDisplay(formatPhoneDisplay(clamped))
    form.setValue('phoneNumber', clamped, { shouldValidate: true })
  }

  const resetSheet = () => {
    form.reset()
    setPhoneDisplay('+7')
    setPhoneRaw('')
    setPartySize(1)
    setSheetOpen(false)
  }

  const filtered = (guests ?? []).filter((g) => {
    const matchStatus = filter === 'ALL' || g.status === filter
    const name = `${g.firstName} ${g.lastName}`.toLowerCase()
    const matchSearch = name.includes(search.toLowerCase()) || g.phoneNumber.includes(search)
    return matchStatus && matchSearch
  })

  const handleAdd = form.handleSubmit(async (rawData) => {
    const data = rawData as GuestForm
    await addGuest.mutateAsync({
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: phoneRaw,
      partySize,
    })
    resetSheet()
  })

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteGuest.mutateAsync(deleteId)
    setDeleteId(null)
  }

  // Stats
  const total    = guests?.length ?? 0
  const accepted = guests?.filter(g => g.status === 'ACCEPTED').length ?? 0
  const declined = guests?.filter(g => g.status === 'DECLINED').length ?? 0
  const pending  = guests?.filter(g => g.status === 'PENDING').length ?? 0

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link
          href={`/events/${toyId}`}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Гости</h1>
        </div>
        <Button
          onClick={() => setSheetOpen(true)}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl gap-2"
        >
          <Plus size={16} />
          <span className="hidden sm:block">Добавить</span>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2.5 mb-5">
        {[
          { label: 'Всего',    value: total,    icon: Users,    color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
          { label: 'Приняли',  value: accepted, icon: Check,    color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Отказали', value: declined, icon: X,        color: 'text-red-500',    bg: 'bg-red-50 border-red-100' },
          { label: 'Ждут',     value: pending,  icon: Clock,    color: 'text-amber-500',  bg: 'bg-amber-50 border-amber-100' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-3 flex flex-col items-center gap-0.5 ${bg}`}>
            <Icon size={14} className={color} />
            <span className={`text-lg font-bold leading-none ${color}`}>{value}</span>
            <span className="text-[10px] text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Filter + search */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === tab.value
                ? 'bg-[#8B5CF6] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="relative ml-auto flex-shrink-0">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs w-36 rounded-full border-gray-200"
          />
        </div>
      </div>

      {/* Guest list */}
      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        guests?.length === 0 ? (
          <EmptyState
            title="Нет гостей"
            description="Добавьте первого гостя вручную или поделитесь ссылкой на мероприятие"
            icon={<UserPlus size={44} className="text-gray-300" />}
            action={{ label: 'Добавить гостя', onClick: () => setSheetOpen(true) }}
          />
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">Нет гостей по фильтру</div>
        )
      ) : (
        <div className="space-y-2">
          {filtered.map((guest) => {
            const s = STATUS_STYLES[guest.status]
            const StatusIcon = s.icon
            return (
              <div
                key={guest.id}
                className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-center gap-3 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold text-[#8B5CF6]">
                    {getInitials(guest.firstName, guest.lastName)}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {guest.firstName} {guest.lastName}
                  </p>
                  <p className="text-xs text-gray-400">{formatPhone(guest.phoneNumber)}</p>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {guest.partySize > 1 && (
                    <span className="text-[11px] font-medium bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 flex items-center gap-1">
                      <Users size={10} />
                      +{guest.partySize - 1}
                    </span>
                  )}
                  <span className={`inline-flex items-center gap-1 text-[11px] font-medium rounded-full px-2.5 py-1 ${s.bg}`}>
                    <StatusIcon size={10} />
                    {s.label}
                  </span>
                  <button
                    onClick={() => setDeleteId(guest.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add guest sheet */}
      <Sheet open={sheetOpen} onOpenChange={(open) => { if (!open) resetSheet(); else setSheetOpen(true) }}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                <UserPlus size={15} className="text-[#8B5CF6]" />
              </div>
              Добавить гостя
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Имя *</label>
                <Input
                  {...form.register('firstName')}
                  placeholder="Айгерим"
                  className="rounded-xl h-11"
                />
                {form.formState.errors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Фамилия *</label>
                <Input
                  {...form.register('lastName')}
                  placeholder="Сейткали"
                  className="rounded-xl h-11"
                />
                {form.formState.errors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Телефон *</label>
              <Input
                type="tel"
                value={phoneDisplay}
                onChange={handlePhoneChange}
                onFocus={(e) => {
                  if (!phoneRaw) {
                    setPhoneDisplay('+7')
                    setTimeout(() => e.target.setSelectionRange(e.target.value.length, e.target.value.length), 0)
                  }
                }}
                placeholder="+7 (___) ___-__-__"
                className="rounded-xl h-11"
              />
              {form.formState.errors.phoneNumber && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Party size */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">С кем придёт</label>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 h-11">
                <span className="text-sm text-gray-600">
                  {partySize === 1 ? 'Только сам(а)' : `+${partySize - 1} ${partySize - 1 === 1 ? 'человек' : partySize - 1 < 5 ? 'человека' : 'человек'}`}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setPartySize(s => Math.max(1, s - 1)); form.setValue('partySize', Math.max(1, partySize - 1)) }}
                    disabled={partySize <= 1}
                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-all"
                  >−</button>
                  <span className="text-sm font-semibold text-gray-900 w-4 text-center">{partySize}</span>
                  <button
                    type="button"
                    onClick={() => { setPartySize(s => Math.min(20, s + 1)); form.setValue('partySize', Math.min(20, partySize + 1)) }}
                    disabled={partySize >= 20}
                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-30 transition-all"
                  >+</button>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={resetSheet} className="flex-1 rounded-xl">
                Отмена
              </Button>
              <Button
                onClick={handleAdd}
                disabled={addGuest.isPending}
                className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl"
              >
                {addGuest.isPending ? 'Добавление...' : 'Добавить'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Удалить гостя?"
        description="Гость будет удалён безвозвратно."
        confirmLabel="Удалить"
        onConfirm={handleDelete}
        loading={deleteGuest.isPending}
      />
    </div>
  )
}
