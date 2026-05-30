'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import Link from 'next/link'
import {
  DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent,
  PointerSensor, TouchSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, Trash2, GripVertical, ChevronLeft, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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

function GuestChip({
  guest,
  tableId,
  onRemove,
}: {
  guest: GuestResponse
  tableId: number
  onRemove: (guestId: number) => void
}) {
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
      <span {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-400">
        <GripVertical size={12} />
      </span>
      <span className="text-xs text-gray-700 flex-1 truncate">
        {guest.firstName} {guest.lastName}
        {guest.partySize > 1 && (
          <span className="ml-1 text-[10px] text-gray-400">+{guest.partySize - 1}</span>
        )}
      </span>
      <button
        onClick={() => onRemove(guest.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
      >
        <Trash2 size={11} />
      </button>
    </div>
  )
}

function TableCard({
  table,
  onDelete,
  onRemoveGuest,
}: {
  table: SeatingTableResponse
  onDelete: () => void
  onRemoveGuest: (guestId: number) => void
}) {
  const { setNodeRef, isOver } = useSortable({
    id: `table-${table.id}`,
    data: { type: 'table', table },
  })

  const occupancy = table.guests.reduce((sum, g) => sum + g.partySize, 0)
  const capacityPct = table.capacity > 0 ? Math.round((occupancy / table.capacity) * 100) : 0

  return (
    <div
      ref={setNodeRef}
      className={`bg-white rounded-2xl border-2 transition-all ${
        isOver ? 'border-[#8B5CF6] bg-violet-50/30' : 'border-gray-100'
      }`}
    >
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{table.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {occupancy}/{table.capacity} мест
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  capacityPct >= 100 ? 'bg-red-400' : capacityPct >= 80 ? 'bg-amber-400' : 'bg-[#8B5CF6]'
                }`}
                style={{ width: `${Math.min(capacityPct, 100)}%` }}
              />
            </div>
            <button
              onClick={onDelete}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
      <div className="p-3 min-h-[80px]">
        <SortableContext
          items={table.guests.map((g) => `guest-${g.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {table.guests.length === 0 ? (
            <div className="flex items-center justify-center h-16 text-xs text-gray-300 border-2 border-dashed border-gray-100 rounded-xl">
              Перетащите гостя
            </div>
          ) : (
            <div className="space-y-1">
              {table.guests.map((g) => (
                <GuestChip key={g.id} guest={g} tableId={table.id} onRemove={onRemoveGuest} />
              ))}
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}

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

  const form = useForm<TableForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tableSchema) as any,
    defaultValues: { name: '', capacity: 8 },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  const unassignedGuests = (guests ?? []).filter((g) => g.seatingTableId === null)

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current
    if (data?.type === 'guest') setActiveGuest(data.guest)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveGuest(null)
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current
    if (activeData?.type !== 'guest') return

    const guestId: number = activeData.guest.id
    const sourceTableId: number | undefined = activeData.sourceTableId
    const overData = over.data.current

    let targetTableId: number | undefined

    if (overData?.type === 'table') {
      targetTableId = overData.table.id
    } else if (overData?.type === 'guest') {
      targetTableId = overData.sourceTableId
    } else if (String(over.id).startsWith('table-')) {
      targetTableId = Number(String(over.id).replace('table-', ''))
    }

    if (!targetTableId) return
    if (targetTableId === sourceTableId) return

    assignGuest.mutate({ tableId: targetTableId, guestId })
  }

  const handleCreateTable = form.handleSubmit(async (rawData) => {
    const data = rawData as TableForm
    await createTable.mutateAsync({ name: data.name, capacity: data.capacity })
    form.reset()
    setShowForm(false)
  })

  const handleDeleteTable = async () => {
    if (!deleteTableId) return
    await deleteTable.mutateAsync(deleteTableId)
    setDeleteTableId(null)
  }

  const handleRemoveGuest = (tableId: number, guestId: number) => {
    removeGuest.mutate({ tableId, guestId })
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
          <h1 className="text-xl font-semibold text-gray-900">Рассадка</h1>
          <p className="text-xs text-gray-500">{tables?.length ?? 0} столов</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl gap-2"
        >
          <Plus size={16} />
          <span className="hidden sm:block">Добавить стол</span>
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Новый стол</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Название</label>
              <Input {...form.register('name')} placeholder="Стол 1" className="rounded-xl" />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Вместимость</label>
              <Input {...form.register('capacity')} type="number" min={1} max={50} className="rounded-xl" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl text-xs">
              Отмена
            </Button>
            <Button
              onClick={handleCreateTable}
              disabled={createTable.isPending}
              className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl text-xs"
            >
              Создать
            </Button>
          </div>
        </div>
      )}

      {tablesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
        </div>
      ) : (tables?.length ?? 0) === 0 ? (
        <EmptyState
          title="Нет столов"
          description="Создайте первый стол для рассадки гостей"
          icon={<Users size={48} className="text-gray-300" />}
          action={{ label: 'Добавить стол', onClick: () => setShowForm(true) }}
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Unassigned column */}
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-gray-700">Без стола</span>
                <Badge className="bg-gray-200 text-gray-600 text-xs">
                  {unassignedGuests.reduce((sum, g) => sum + g.partySize, 0)}
                </Badge>
              </div>
              <SortableContext
                items={unassignedGuests.map((g) => `guest-${g.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {unassignedGuests.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4">
                    Все гости рассажены
                  </div>
                ) : (
                  <div className="space-y-1">
                    {unassignedGuests.map((g) => (
                      <GuestChip
                        key={g.id}
                        guest={g}
                        tableId={-1}
                        onRemove={() => {}}
                      />
                    ))}
                  </div>
                )}
              </SortableContext>
            </div>

            {/* Table columns */}
            {(tables ?? []).map((table) => (
              <TableCard
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
      )}

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
