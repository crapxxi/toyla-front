'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import Link from 'next/link'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, TouchSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Trash2, GripVertical, ChevronLeft, Users, ChevronRight, X, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { useGetTables, useCreateTable, useAssignGuest, useRemoveGuest, useDeleteTable } from '@/hooks/useSeating'
import { useGetGuests } from '@/hooks/useGuests'
import { GuestResponse, SeatingTableResponse } from '@/types'

const tableSchema = z.object({
  name: z.string().min(1, 'Введите название'),
  capacity: z.coerce.number().min(1).max(50),
})
type TableForm = z.infer<typeof tableSchema>

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
}

// ── Desktop-only draggable guest chip ────────────────────────────────────────
function DraggableGuestChip({
  guest, tableId, onRemove,
}: { guest: GuestResponse; tableId: number; onRemove: (id: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `guest-${guest.id}`,
    data: { type: 'guest', guest, sourceTableId: tableId },
  })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5 group"
    >
      <span {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-400 hidden sm:block">
        <GripVertical size={12} />
      </span>
      <span className="text-xs text-gray-700 flex-1 truncate">
        {guest.firstName}{guest.lastName ? ` ${guest.lastName}` : ''}
        {guest.partySize > 1 && <span className="ml-1 text-[10px] text-gray-400">+{guest.partySize - 1}</span>}
      </span>
      <button
        onClick={() => onRemove(guest.id)}
        className="text-gray-300 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 transition-all flex-shrink-0"
      >
        <X size={13} />
      </button>
    </div>
  )
}

// ── Desktop table card (dnd target) ──────────────────────────────────────────
function DesktopTableCard({
  table, onDelete, onRemoveGuest,
}: { table: SeatingTableResponse; onDelete: () => void; onRemoveGuest: (id: number) => void }) {
  const { setNodeRef, isOver } = useSortable({
    id: `table-${table.id}`,
    data: { type: 'table', table },
  })
  const occupancy = table.guests.reduce((sum, g) => sum + g.partySize, 0)
  const pct = table.capacity > 0 ? Math.round((occupancy / table.capacity) * 100) : 0

  return (
    <div ref={setNodeRef} className={`bg-white rounded-2xl border-2 transition-all ${isOver ? 'border-[#8B5CF6] bg-violet-50/30' : 'border-gray-100'}`}>
      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{table.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{occupancy}/{table.capacity} мест</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-400' : pct >= 80 ? 'bg-amber-400' : 'bg-[#8B5CF6]'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <button onClick={onDelete} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      <div className="p-3 min-h-[80px]">
        <SortableContext items={table.guests.map((g) => `guest-${g.id}`)} strategy={verticalListSortingStrategy}>
          {table.guests.length === 0 ? (
            <div className="flex items-center justify-center h-16 text-xs text-gray-300 border-2 border-dashed border-gray-100 rounded-xl">
              Перетащите гостя
            </div>
          ) : (
            <div className="space-y-1">
              {table.guests.map((g) => (
                <DraggableGuestChip key={g.id} guest={g} tableId={table.id} onRemove={onRemoveGuest} />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SeatingPage() {
  const { toyId } = useParams<{ toyId: string }>()
  const { data: tables, isLoading: tablesLoading } = useGetTables(toyId)
  const { data: guests } = useGetGuests(toyId)
  const createTable = useCreateTable(toyId)
  const assignGuest = useAssignGuest(toyId)
  const removeGuest = useRemoveGuest(toyId)
  const deleteTable = useDeleteTable(toyId)

  const [showForm, setShowForm] = useState(false)
  const [deleteTableId, setDeleteTableId] = useState<number | null>(null)
  const [activeGuest, setActiveGuest] = useState<GuestResponse | null>(null)
  // tap-to-assign state
  const [assigningGuest, setAssigningGuest] = useState<GuestResponse | null>(null)

  const form = useForm<TableForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tableSchema) as any,
    defaultValues: { name: '', capacity: 8 },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
  )

  const unassigned = (guests ?? []).filter((g) => g.seatingTableId === null)

  const handleDragStart = (e: DragStartEvent) => {
    const d = e.active.data.current
    if (d?.type === 'guest') setActiveGuest(d.guest)
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveGuest(null)
    const { active, over } = e
    if (!over) return
    const activeData = active.data.current
    if (activeData?.type !== 'guest') return
    const guestId: number = activeData.guest.id
    const sourceTableId: number | undefined = activeData.sourceTableId
    const overData = over.data.current
    let targetTableId: number | undefined
    if (overData?.type === 'table') targetTableId = overData.table.id
    else if (overData?.type === 'guest') targetTableId = overData.sourceTableId
    else if (String(over.id).startsWith('table-')) targetTableId = Number(String(over.id).replace('table-', ''))
    if (!targetTableId || targetTableId === sourceTableId) return
    assignGuest.mutate({ tableId: targetTableId, guestId })
  }

  const handleCreateTable = form.handleSubmit(async (raw) => {
    const data = raw as TableForm
    await createTable.mutateAsync({ name: data.name, capacity: data.capacity })
    form.reset({ name: '', capacity: 8 })
    setShowForm(false)
  })

  const handleDeleteTable = async () => {
    if (!deleteTableId) return
    await deleteTable.mutateAsync(deleteTableId)
    setDeleteTableId(null)
  }

  const handleAssign = (tableId: number) => {
    if (!assigningGuest) return
    assignGuest.mutate({ tableId, guestId: assigningGuest.id })
    setAssigningGuest(null)
  }

  const handleRemoveGuest = (tableId: number, guestId: number) => {
    removeGuest.mutate({ tableId, guestId })
  }

  const totalAssigned = (guests ?? []).filter((g) => g.seatingTableId !== null).length
  const totalGuests = (guests ?? []).length

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link href={`/events/${toyId}`} className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">Рассадка</h1>
          <p className="text-xs text-gray-500">{totalAssigned}/{totalGuests} гостей рассажено</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl gap-2">
          <Plus size={16} />
          <span className="hidden sm:block">Стол</span>
        </Button>
      </div>

      {/* Create table form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Новый стол</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Название</label>
              <Input {...form.register('name')} placeholder="Стол 1" className="rounded-xl h-10 text-sm" />
              {form.formState.errors.name && <p className="text-[11px] text-red-500 mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Мест</label>
              <Input {...form.register('capacity')} type="number" min={1} max={50} className="rounded-xl h-10 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl h-9 text-xs">Отмена</Button>
            <Button onClick={handleCreateTable} disabled={createTable.isPending} className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl h-9 text-xs">Создать</Button>
          </div>
        </div>
      )}

      {tablesLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : (tables?.length ?? 0) === 0 ? (
        <EmptyState
          title="Нет столов"
          description="Создайте первый стол для рассадки гостей"
          icon={<Users size={48} className="text-gray-300" />}
          action={{ label: 'Добавить стол', onClick: () => setShowForm(true) }}
        />
      ) : (
        <>
          {/* ── Mobile layout ── */}
          <div className="sm:hidden space-y-4">
            {/* Unassigned */}
            {unassigned.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Без стола</span>
                  <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5 font-medium">{unassigned.length}</span>
                </div>
                <div className="space-y-2">
                  {unassigned.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setAssigningGuest(g)}
                      className="w-full flex items-center gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3 text-left active:bg-gray-50 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-[#EDE9FE] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-[#8B5CF6]">{getInitials(g.firstName, g.lastName)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {g.firstName}{g.lastName ? ` ${g.lastName}` : ''}
                          {g.partySize > 1 && <span className="ml-1 text-xs text-gray-400">+{g.partySize - 1}</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[#8B5CF6] flex-shrink-0">
                        <span className="text-xs font-medium">Назначить</span>
                        <ChevronRight size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tables */}
            <div className="space-y-3">
              {(tables ?? []).map((table) => {
                const occupancy = table.guests.reduce((sum, g) => sum + g.partySize, 0)
                const free = table.capacity - occupancy
                const pct = table.capacity > 0 ? Math.round((occupancy / table.capacity) * 100) : 0
                return (
                  <div key={table.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {/* Table header */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{table.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct >= 100 ? 'bg-red-400' : pct >= 80 ? 'bg-amber-400' : 'bg-[#8B5CF6]'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className="text-[11px] text-gray-400 flex-shrink-0">{occupancy}/{table.capacity}</span>
                        </div>
                      </div>
                      {free > 0 && (
                        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 flex-shrink-0">
                          {free} своб.
                        </span>
                      )}
                      <button onClick={() => setDeleteTableId(table.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Guests */}
                    {table.guests.length > 0 ? (
                      <div className="divide-y divide-gray-50">
                        {table.guests.map((g) => (
                          <div key={g.id} className="flex items-center gap-3 px-4 py-2.5">
                            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-semibold text-gray-500">{getInitials(g.firstName, g.lastName)}</span>
                            </div>
                            <span className="flex-1 text-sm text-gray-800 truncate">
                              {g.firstName}{g.lastName ? ` ${g.lastName}` : ''}
                              {g.partySize > 1 && <span className="ml-1 text-xs text-gray-400">+{g.partySize - 1}</span>}
                            </span>
                            <button onClick={() => handleRemoveGuest(table.id, g.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-5 text-center text-xs text-gray-300">Нет гостей</div>
                    )}
                  </div>
                )
              })}
            </div>

            {unassigned.length === 0 && (guests?.length ?? 0) > 0 && (
              <div className="flex items-center gap-2 justify-center py-4 text-sm text-emerald-600">
                <CheckCircle2 size={16} />
                Все гости рассажены
              </div>
            )}
          </div>

          {/* ── Desktop layout (dnd) ── */}
          <div className="hidden sm:block">
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Unassigned column */}
                <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-semibold text-gray-700">Без стола</span>
                    <span className="text-xs bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">{unassigned.reduce((s, g) => s + g.partySize, 0)}</span>
                  </div>
                  <SortableContext items={unassigned.map((g) => `guest-${g.id}`)} strategy={verticalListSortingStrategy}>
                    {unassigned.length === 0 ? (
                      <div className="text-xs text-gray-400 text-center py-4">Все гости рассажены</div>
                    ) : (
                      <div className="space-y-1">
                        {unassigned.map((g) => (
                          <DraggableGuestChip key={g.id} guest={g} tableId={-1} onRemove={() => {}} />
                        ))}
                      </div>
                    )}
                  </SortableContext>
                </div>

                {/* Table columns */}
                {(tables ?? []).map((table) => (
                  <DesktopTableCard
                    key={table.id}
                    table={table}
                    onDelete={() => setDeleteTableId(table.id)}
                    onRemoveGuest={(guestId) => handleRemoveGuest(table.id, guestId)}
                  />
                ))}
              </div>

              <DragOverlay>
                {activeGuest && (
                  <div className="bg-white shadow-lg rounded-lg px-3 py-2 text-xs font-medium text-gray-700 border border-[#8B5CF6]/30">
                    {activeGuest.firstName} {activeGuest.lastName}
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </div>
        </>
      )}

      {/* Assign table bottom sheet (mobile) */}
      <Sheet open={!!assigningGuest} onOpenChange={(open) => { if (!open) setAssigningGuest(null) }}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80dvh] overflow-y-auto">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-sm text-left">
              Выберите стол для{' '}
              <span className="text-[#8B5CF6]">
                {assigningGuest?.firstName}{assigningGuest?.lastName ? ` ${assigningGuest.lastName}` : ''}
              </span>
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-2 pb-4">
            {(tables ?? []).map((table) => {
              const occupancy = table.guests.reduce((sum, g) => sum + g.partySize, 0)
              const free = table.capacity - occupancy
              const full = free <= 0
              return (
                <button
                  key={table.id}
                  onClick={() => !full && handleAssign(table.id)}
                  disabled={full || assignGuest.isPending}
                  className={`w-full flex items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition-all ${
                    full
                      ? 'border-gray-100 opacity-40 cursor-not-allowed'
                      : 'border-gray-100 hover:border-[#8B5CF6] hover:bg-violet-50/40 active:bg-violet-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{table.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{occupancy}/{table.capacity} занято</p>
                  </div>
                  {full ? (
                    <span className="text-[11px] font-medium text-red-400 bg-red-50 rounded-full px-2.5 py-1 flex-shrink-0">Полный</span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1 flex-shrink-0">
                      {free} своб.
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTableId}
        onOpenChange={(open) => !open && setDeleteTableId(null)}
        title="Удалить стол?"
        description="Все гости будут откреплены от стола."
        confirmLabel="Удалить"
        onConfirm={handleDeleteTable}
        loading={deleteTable.isPending}
      />
    </div>
  )
}
