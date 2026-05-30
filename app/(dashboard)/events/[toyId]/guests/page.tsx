'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Plus, Search, Trash2, Users, ChevronLeft, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { useGetGuests, useAddGuest, useDeleteGuest } from '@/hooks/useGuests'
import { useTariffGate } from '@/hooks/useTariff'
import { useLangStore } from '@/store/lang.store'
import { useUpgradeStore } from '@/store/upgrade.store'
import { formatPhone } from '@/lib/formatters'
import i18n from '@/lib/i18n'

const guestSchema = z.object({
  firstName: z.string().min(1, 'Атын енгізіңіз'),
  lastName: z.string().optional(),
  phoneNumber: z.string().min(11, 'Нөмірді толық енгізіңіз'),
  partySize: z.coerce.number().min(1).max(20),
})
type GuestForm = z.infer<typeof guestSchema>

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
  const { lang } = useLangStore()
  const t = i18n[lang]
  const { data: guests, isLoading } = useGetGuests(toyId)
  const addGuest = useAddGuest(toyId)
  const deleteGuest = useDeleteGuest(toyId)
  const { guestsLimitPerEvent } = useTariffGate()
  const openUpgrade = useUpgradeStore((s) => s.openUpgrade)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
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
    const name = `${g.firstName} ${g.lastName}`.toLowerCase()
    return name.includes(search.toLowerCase()) || g.phoneNumber.includes(search)
  })

  const handleAdd = form.handleSubmit(async (rawData) => {
    const data = rawData as GuestForm
    await addGuest.mutateAsync({
      firstName: data.firstName,
      lastName: data.lastName ?? '',
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

  const total = guests?.length ?? 0
  const limitReached = guestsLimitPerEvent > 0 && total >= guestsLimitPerEvent

  const openSheet = () => {
    if (limitReached) { openUpgrade(t.limitGuestsReached); return }
    setSheetOpen(true)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Link href={`/events/${toyId}`} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">{t.guestsTitle}</h1>
        </div>
        <Button
          onClick={openSheet}
          title={limitReached ? t.limitGuestsReached : undefined}
          className={`rounded-xl gap-2 ${limitReached ? 'bg-[#A8492A]/60 hover:bg-[#A8492A]/60 cursor-not-allowed' : 'bg-[#A8492A] hover:bg-[#8A3A20]'}`}>
          <Plus size={16} />
          <span className="hidden sm:block">{t.addGuestBtn}</span>
        </Button>
      </div>

      <div className="mb-5">
        <div className="rounded-2xl border p-3 flex flex-col items-center gap-0.5 bg-[#FBF5F1] border-violet-100 inline-flex min-w-[80px]">
          <Users size={14} className="text-[#A8492A]" />
          <span className="text-lg font-bold leading-none text-[#A8492A]">
            {total}{guestsLimitPerEvent > 0 ? ` / ${guestsLimitPerEvent}` : ''}
          </span>
          <span className="text-[10px] text-gray-500">{t.totalLabel}</span>
        </div>
      </div>

      <div className="flex mb-4">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs w-36 rounded-full border-gray-200"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        guests?.length === 0 ? (
          <EmptyState
            title={t.noGuests}
            description={t.noGuestsDesc}
            icon={<UserPlus size={44} className="text-gray-300" />}
            action={{ label: t.addGuestTitle, onClick: openSheet }}
          />
        ) : (
          <div className="text-center py-10 text-gray-400 text-sm">{t.noGuestsFilter}</div>
        )
      ) : (
        <div className="space-y-2">
          {filtered.map((guest) => (
            <div key={guest.id} className="bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] px-4 py-3.5 flex items-center gap-3 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-full bg-[#F5EDE6] flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-[#A8492A]">
                  {getInitials(guest.firstName, guest.lastName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {guest.firstName}{guest.lastName ? ` ${guest.lastName}` : ''}
                </p>
                <p className="text-xs text-gray-400">{formatPhone(guest.phoneNumber)}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {guest.partySize > 1 && (
                  <span className="text-[11px] font-medium bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Users size={10} />
                    +{guest.partySize - 1}
                  </span>
                )}
                <button
                  onClick={() => setDeleteId(guest.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={(open) => { if (!open) resetSheet(); else setSheetOpen(true) }}>
        <SheetContent className="sm:max-w-sm px-6">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-xl bg-[#F5EDE6] flex items-center justify-center flex-shrink-0">
                <UserPlus size={13} className="text-[#A8492A]" />
              </div>
              {t.addGuestTitle}
            </SheetTitle>
          </SheetHeader>

          <div className="mt-5 space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">
                  {t.firstNameLbl} <span className="text-red-400">*</span>
                </label>
                <Input {...form.register('firstName')} placeholder="Айгерім" className="rounded-xl h-10 text-sm" autoComplete="off" />
                {form.formState.errors.firstName && (
                  <p className="text-[11px] text-red-500 mt-1">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">{t.lastNameLbl}</label>
                <Input {...form.register('lastName')} placeholder="Сейткали" className="rounded-xl h-10 text-sm" autoComplete="off" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">
                {t.phoneLbl} <span className="text-red-400">*</span>
              </label>
              <Input
                type="tel" value={phoneDisplay} onChange={handlePhoneChange}
                onFocus={(e) => {
                  if (!phoneRaw) { setPhoneDisplay('+7'); setTimeout(() => e.target.setSelectionRange(e.target.value.length, e.target.value.length), 0) }
                }}
                placeholder="+7 (___) ___-__-__"
                className="rounded-xl h-10 text-sm" inputMode="tel"
              />
              {form.formState.errors.phoneNumber && (
                <p className="text-[11px] text-red-500 mt-1">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">{t.withWhom}</label>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 h-10">
                <span className="text-xs text-gray-600">
                  {partySize === 1 ? t.alone : t.withN(partySize - 1)}
                </span>
                <div className="flex items-center gap-2.5">
                  <button type="button"
                    onClick={() => { const next = Math.max(1, partySize - 1); setPartySize(next); form.setValue('partySize', next) }}
                    disabled={partySize <= 1}
                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-30">−</button>
                  <span className="text-xs font-semibold text-gray-900 w-4 text-center">{partySize}</span>
                  <button type="button"
                    onClick={() => { const next = Math.min(20, partySize + 1); setPartySize(next); form.setValue('partySize', next) }}
                    disabled={partySize >= 20}
                    className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-200 disabled:opacity-30">+</button>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <Button variant="outline" onClick={resetSheet} className="flex-1 rounded-xl h-10 text-xs">{t.cancel}</Button>
              <Button onClick={handleAdd} disabled={addGuest.isPending} className="flex-1 bg-[#A8492A] hover:bg-[#8A3A20] rounded-xl h-10 text-xs">
                {addGuest.isPending ? t.adding : t.add}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t.deleteGuestQ}
        description={t.deleteGuestD}
        confirmLabel={t.delete}
        onConfirm={handleDelete}
        loading={deleteGuest.isPending}
      />
    </div>
  )
}
