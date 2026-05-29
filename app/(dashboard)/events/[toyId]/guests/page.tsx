'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { Plus, Search, Trash2, Users, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { useGetGuests, useAddGuest, useDeleteGuest } from '@/hooks/useGuests'
import { RsvpStatus, rsvpColors } from '@/types'
import { rsvpStatusLabel, formatPhone } from '@/lib/formatters'

const guestSchema = z.object({
  firstName: z.string().min(1, 'Введите имя'),
  lastName: z.string().min(1, 'Введите фамилию'),
  phoneNumber: z.string().min(10, 'Минимум 10 цифр').max(15),
  partySize: z.coerce.number().min(1).max(20),
})

type GuestForm = z.infer<typeof guestSchema>

const FILTER_TABS: { value: RsvpStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Все' },
  { value: 'ACCEPTED', label: 'Приняли' },
  { value: 'DECLINED', label: 'Отказали' },
  { value: 'PENDING', label: 'Ожидают' },
]

export default function GuestsPage() {
  const { toyId } = useParams<{ toyId: string }>()
  const { data: guests, isLoading } = useGetGuests(toyId)
  const addGuest = useAddGuest(toyId)
  const deleteGuest = useDeleteGuest(toyId)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [filter, setFilter] = useState<RsvpStatus | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  const form = useForm<GuestForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(guestSchema) as any,
    defaultValues: { firstName: '', lastName: '', phoneNumber: '', partySize: 1 },
  })

  const filtered = (guests ?? []).filter((g) => {
    const matchStatus = filter === 'ALL' || g.status === filter
    const name = `${g.firstName} ${g.lastName}`.toLowerCase()
    const matchSearch = name.includes(search.toLowerCase()) || g.phoneNumber.includes(search)
    return matchStatus && matchSearch
  })

  const handleAdd = form.handleSubmit(async (rawData) => {
    const data = rawData as GuestForm
    const digits = data.phoneNumber.replace(/\D/g, '')
    await addGuest.mutateAsync({
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: digits,
      partySize: data.partySize,
    })
    form.reset()
    setSheetOpen(false)
  })

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteGuest.mutateAsync(deleteId)
    setDeleteId(null)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/events/${toyId}`}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Гости</h1>
          <p className="text-xs text-gray-500">{guests?.length ?? 0} гостей</p>
        </div>
        <Button
          onClick={() => setSheetOpen(true)}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl gap-2"
        >
          <Plus size={16} />
          <span className="hidden sm:block">Добавить гостя</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === tab.value
                ? 'bg-[#8B5CF6] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs w-36 rounded-full border-gray-200"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
              <Skeleton className="w-8 h-8 rounded-full" />
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
            description="Добавьте первого гостя"
            icon={<Users size={48} className="text-gray-300" />}
            action={{ label: 'Добавить гостя', onClick: () => setSheetOpen(true) }}
          />
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">Нет гостей по фильтру</div>
        )
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="text-xs font-medium text-gray-500">Имя</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 hidden sm:table-cell">Телефон</TableHead>
                <TableHead className="text-xs font-medium text-gray-500">Статус</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 hidden md:table-cell">Группа</TableHead>
                <TableHead className="text-xs font-medium text-gray-500 hidden md:table-cell">Стол</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((guest) => (
                <TableRow key={guest.id} className="hover:bg-gray-50/50">
                  <TableCell className="py-3">
                    <div className="font-medium text-sm text-gray-900">
                      {guest.firstName} {guest.lastName}
                    </div>
                    <div className="text-xs text-gray-400 sm:hidden">
                      {formatPhone(guest.phoneNumber)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 hidden sm:table-cell">
                    {formatPhone(guest.phoneNumber)}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${rsvpColors[guest.status]}`}>
                      {rsvpStatusLabel(guest.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 hidden md:table-cell">
                    {guest.partySize}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 hidden md:table-cell">
                    {guest.seatingTableId !== null ? 'Назначен' : '—'}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => setDeleteId(guest.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add guest sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Добавить гостя</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Имя *</label>
              <Input {...form.register('firstName')} placeholder="Айгерим" className="rounded-xl" />
              {form.formState.errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Фамилия *</label>
              <Input {...form.register('lastName')} placeholder="Сейткали" className="rounded-xl" />
              {form.formState.errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.lastName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Телефон *</label>
              <Input
                {...form.register('phoneNumber')}
                placeholder="77001234567"
                className="rounded-xl"
                type="tel"
              />
              {form.formState.errors.phoneNumber && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.phoneNumber.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Размер группы</label>
              <Input
                {...form.register('partySize')}
                type="number"
                min={1}
                max={20}
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setSheetOpen(false)} className="flex-1 rounded-xl">
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
