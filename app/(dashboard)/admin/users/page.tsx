'use client'
import { useState, type ReactNode } from 'react'
import {
  ShieldCheck, ShieldOff, Trash2, CheckCircle2, XCircle, Clock, Pencil, AlertTriangle, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfile } from '@/hooks/useProfile'
import {
  useAdminUsers, useEnableUser, useDisableUser, useSetRole, useDeleteAdminUser, useSetTariff,
} from '@/hooks/useAdmin'
import { useLangStore } from '@/store/lang.store'
import type { Lang } from '@/store/lang.store'
import { daysUntil, formatDateOnly } from '@/lib/formatters'
import i18n from '@/lib/i18n'
import { AdminUserResponse, Role, TariffPlan } from '@/types'

const TARIFF_PLANS: TariffPlan[] = ['FREE', 'DARA', 'TOY']

/**
 * UI strings for the tariff editor that aren't in the shared catalogue yet.
 * Kept local so this ships without touching lib/i18n.ts; can be migrated later.
 */
const TX = {
  ru: {
    editTariff: 'Изменить тариф',
    assignFor: 'Тариф для',
    plan: 'Тариф',
    duration: 'Срок действия',
    customDate: 'Своя дата',
    expiredBadge: 'истёк',
    validUntil: 'Действует до',
    save: 'Сохранить',
    saving: 'Сохранение…',
    dateError: 'Для DARA и TOY укажите дату окончания в будущем',
    freeHint: 'Бесплатный тариф — без срока действия.',
    presets: [
      { months: 1, label: '1 месяц' },
      { months: 3, label: '3 месяца' },
      { months: 6, label: '6 месяцев' },
      { months: 12, label: '1 год' },
    ],
  },
  kk: {
    editTariff: 'Тарифті өзгерту',
    assignFor: 'Тариф',
    plan: 'Тариф',
    duration: 'Жарамдылық мерзімі',
    customDate: 'Басқа күн',
    expiredBadge: 'бітті',
    validUntil: 'Дейін жарамды',
    save: 'Сақтау',
    saving: 'Сақталуда…',
    dateError: 'DARA және TOY үшін болашақтағы аяқталу күнін көрсетіңіз',
    freeHint: 'Тегін тариф — мерзімсіз.',
    presets: [
      { months: 1, label: '1 ай' },
      { months: 3, label: '3 ай' },
      { months: 6, label: '6 ай' },
      { months: 12, label: '1 жыл' },
    ],
  },
} as const

// --- small helpers ---------------------------------------------------------

function toDateInput(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addMonthsInput(months: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return toDateInput(d)
}

function planBadgeClass(plan: TariffPlan): string {
  if (plan === 'DARA') return 'bg-violet-100 text-violet-700'
  if (plan === 'TOY') return 'bg-amber-100 text-amber-700'
  return 'bg-gray-100 text-gray-600'
}

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.length >= 11) return `+${d[0]} (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`
  return phone
}

function fullName(user: AdminUserResponse): string {
  return [user.name, user.lastName].filter(Boolean).join(' ')
}

// --- shared user-action mutations ------------------------------------------

function useUserActions(user: AdminUserResponse, currentUserId: number | null) {
  const enableUser = useEnableUser()
  const disableUser = useDisableUser()
  const setRole = useSetRole()
  const deleteUser = useDeleteAdminUser()
  const isSelf = user.id === currentUserId
  const toggleRole = () => {
    const next: Role = user.role === 'ADMIN' ? 'ORGANIZER' : 'ADMIN'
    setRole.mutate({ userId: user.id, role: next })
  }
  return { enableUser, disableUser, setRole, deleteUser, isSelf, toggleRole }
}

/** Approve/block + role toggle + delete — shared by the table row and the card. */
function UserActions({
  user, currentUserId, lang, className = '',
}: {
  user: AdminUserResponse; currentUserId: number | null; lang: Lang; className?: string
}) {
  const t = i18n[lang]
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { enableUser, disableUser, deleteUser, setRole, isSelf, toggleRole } = useUserActions(user, currentUserId)

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {!user.enabled ? (
        <Button size="sm" className="h-8 text-xs px-3"
          style={{ background: 'var(--clay)', color: 'var(--paper)' }}
          onClick={() => enableUser.mutate(user.id)} disabled={enableUser.isPending}>
          {t.approveBtn}
        </Button>
      ) : (
        <Button size="sm" variant="outline" className="h-8 text-xs px-3"
          onClick={() => disableUser.mutate(user.id)} disabled={disableUser.isPending || isSelf}>
          <XCircle size={12} className="mr-1" /> {t.blockBtn}
        </Button>
      )}
      <Button size="sm" variant="outline" className="h-8 text-xs px-3"
        onClick={toggleRole} disabled={setRole.isPending || isSelf}>
        {user.role === 'ADMIN' ? <ShieldOff size={12} className="mr-1" /> : <ShieldCheck size={12} className="mr-1" />}
        {user.role === 'ADMIN' ? t.demoteBtn : t.adminShort}
      </Button>
      {!confirmDelete ? (
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={() => setConfirmDelete(true)} disabled={isSelf}>
          <Trash2 size={13} />
        </Button>
      ) : (
        <div className="flex gap-1">
          <Button size="sm" className="h-8 text-xs px-2 bg-red-500 hover:bg-red-600 text-white"
            onClick={() => deleteUser.mutate(user.id)} disabled={deleteUser.isPending}>
            {t.delete}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs px-2"
            onClick={() => setConfirmDelete(false)}>
            {t.cancel}
          </Button>
        </div>
      )}
    </div>
  )
}

// --- tariff display + editor ------------------------------------------------

function TariffStatus({ user, lang }: { user: AdminUserResponse; lang: Lang }) {
  const t = i18n[lang]
  const tx = TX[lang]
  const isFree = user.tariffPlan === 'FREE'
  const days = user.tariffExpiresAt ? daysUntil(user.tariffExpiresAt) : null
  const expiringSoon = !isFree && days !== null && days >= 0 && days < 7

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planBadgeClass(user.tariffPlan)}`}>
        {user.tariffPlan}
      </span>
      {user.tariffExpired && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
          {tx.expiredBadge}
        </span>
      )}
      {!isFree && user.tariffExpiresAt && (
        <span className={`text-[11px] ${expiringSoon ? 'text-red-600 font-medium' : ''}`}
          style={expiringSoon ? undefined : { color: 'var(--ink-soft)' }}>
          {tx.validUntil} {formatDateOnly(user.tariffExpiresAt, lang)}
        </span>
      )}
      {!isFree && !user.tariffExpiresAt && (
        <span className="text-[11px] text-green-600">{t.foreverLabel}</span>
      )}
    </div>
  )
}

function TariffEditor({
  user, lang, onClose,
}: {
  user: AdminUserResponse; lang: Lang; onClose: () => void
}) {
  const tx = TX[lang]
  const setTariff = useSetTariff()
  const [plan, setPlan] = useState<TariffPlan>(user.tariffPlan)
  const [date, setDate] = useState<string>(() => {
    const existing = user.tariffExpiresAt?.slice(0, 10) ?? ''
    if (existing && new Date(`${existing}T23:59:59`).getTime() > Date.now()) return existing
    return addMonthsInput(1)
  })
  const [error, setError] = useState('')
  const today = toDateInput(new Date())

  const save = () => {
    setError('')
    let expiresAt: string | null = null
    if (plan !== 'FREE') {
      if (!date) { setError(tx.dateError); return }
      const iso = `${date}T23:59:59`
      if (new Date(iso).getTime() <= Date.now()) { setError(tx.dateError); return }
      expiresAt = iso
    }
    setTariff.mutate({ userId: user.id, plan, expiresAt }, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        role="dialog" aria-modal="true"
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-xl max-h-[92vh] overflow-y-auto"
        style={{ background: 'var(--paper)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
          <div className="min-w-0">
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{tx.assignFor}</p>
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
              {fullName(user) || formatPhone(user.phoneNumber)}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/5 flex-shrink-0" aria-label="close">
            <X size={18} style={{ color: 'var(--ink-soft)' }} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {error && (
            <div className="flex items-start gap-2 text-xs rounded-xl px-3 py-2.5 bg-red-50 text-red-600">
              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" /> {error}
            </div>
          )}

          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ink-soft)' }}>{tx.plan}</p>
            <div className="grid grid-cols-3 gap-2">
              {TARIFF_PLANS.map((p) => (
                <button key={p} type="button" onClick={() => setPlan(p)}
                  className="py-3 rounded-xl text-sm font-semibold border transition-colors"
                  style={plan === p
                    ? { background: 'var(--clay)', color: 'var(--paper)', borderColor: 'var(--clay)' }
                    : { background: 'var(--paper)', color: 'var(--ink)', borderColor: 'var(--line)' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {plan !== 'FREE' ? (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ink-soft)' }}>{tx.duration}</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {tx.presets.map((p) => {
                  const presetDate = addMonthsInput(p.months)
                  const active = date === presetDate
                  return (
                    <button key={p.months} type="button" onClick={() => setDate(presetDate)}
                      className="py-2.5 rounded-xl text-sm border transition-colors"
                      style={active
                        ? { background: 'var(--clay-light)', color: 'var(--clay)', borderColor: 'var(--clay)' }
                        : { background: 'var(--paper)', color: 'var(--ink)', borderColor: 'var(--line)' }}>
                      {p.label}
                    </button>
                  )
                })}
              </div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--ink-soft)' }}>
                {tx.customDate}
              </label>
              <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border px-3 py-3 text-sm bg-white"
                style={{ borderColor: 'var(--line)', color: 'var(--ink)' }} />
              {date && (
                <p className="text-xs mt-2" style={{ color: 'var(--ink-soft)' }}>
                  {tx.validUntil}{' '}
                  <span className="font-semibold" style={{ color: 'var(--ink)' }}>
                    {formatDateOnly(`${date}T23:59:59`, lang)}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{tx.freeHint}</p>
          )}

          <Button onClick={save} disabled={setTariff.isPending}
            className="w-full h-11 text-sm font-semibold rounded-xl"
            style={{ background: 'var(--clay)', color: 'var(--paper)' }}>
            {setTariff.isPending ? tx.saving : tx.save}
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- table row + mobile card -----------------------------------------------

function UserRow({
  user, currentUserId, lang, onEdit,
}: {
  user: AdminUserResponse; currentUserId: number | null; lang: Lang; onEdit: () => void
}) {
  const t = i18n[lang]
  const tx = TX[lang]
  return (
    <tr className="border-b last:border-0" style={{ borderColor: 'var(--line)' }}>
      <td className="py-3 px-4">
        <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{fullName(user) || '—'}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>{formatPhone(user.phoneNumber)}</p>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
          user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'
        }`}>
          {user.role === 'ADMIN' && <ShieldCheck size={11} />}
          {user.role === 'ADMIN' ? t.adminRole : t.organizerRole}
        </span>
      </td>
      <td className="py-3 px-4">
        {user.enabled ? (
          <span className="inline-flex items-center gap-1 text-xs text-green-700">
            <CheckCircle2 size={13} /> {t.activeStatus}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-amber-600">
            <Clock size={13} /> {t.waitingStatus}
          </span>
        )}
      </td>
      <td className="py-3 px-4 text-sm" style={{ color: 'var(--ink-soft)' }}>{user.toysCount}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planBadgeClass(user.tariffPlan)}`}>
            {user.tariffPlan}
          </span>
          {user.tariffExpired && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
              {tx.expiredBadge}
            </span>
          )}
          <button onClick={onEdit} title={tx.editTariff}
            className="p-1 rounded-md hover:bg-black/5" aria-label={tx.editTariff}>
            <Pencil size={13} style={{ color: 'var(--clay)' }} />
          </button>
        </div>
      </td>
      <td className="py-3 px-4 text-xs" style={{ color: 'var(--ink-soft)' }}>
        {user.tariffPlan === 'FREE'
          ? '—'
          : user.tariffExpiresAt
            ? formatDateOnly(user.tariffExpiresAt, lang)
            : t.foreverLabel}
      </td>
      <td className="py-3 px-4">
        <UserActions user={user} currentUserId={currentUserId} lang={lang} />
      </td>
    </tr>
  )
}

function UserCard({
  user, currentUserId, lang, onEdit,
}: {
  user: AdminUserResponse; currentUserId: number | null; lang: Lang; onEdit: () => void
}) {
  const t = i18n[lang]
  const tx = TX[lang]
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{fullName(user) || '—'}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>{formatPhone(user.phoneNumber)}</p>
        </div>
        <span className={`flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
          user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'
        }`}>
          {user.role === 'ADMIN' && <ShieldCheck size={11} />}
          {user.role === 'ADMIN' ? t.adminRole : t.organizerRole}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs" style={{ color: 'var(--ink-soft)' }}>
        {user.enabled ? (
          <span className="inline-flex items-center gap-1 text-green-700">
            <CheckCircle2 size={13} /> {t.activeStatus}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-600">
            <Clock size={13} /> {t.waitingStatus}
          </span>
        )}
        <span>{t.toysCol}: {user.toysCount}</span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5"
        style={{ borderColor: 'var(--line)' }}>
        <TariffStatus user={user} lang={lang} />
        <Button size="sm" variant="outline" className="h-8 text-xs px-3 flex-shrink-0" onClick={onEdit}>
          <Pencil size={12} className="mr-1" /> {tx.editTariff}
        </Button>
      </div>

      <UserActions user={user} currentUserId={currentUserId} lang={lang} className="mt-3" />
    </div>
  )
}

// --- list section (renders table on desktop, cards on mobile) --------------

function UserListSection({
  users, currentUserId, lang, onEdit, header,
}: {
  users: AdminUserResponse[]
  currentUserId: number | null
  lang: Lang
  onEdit: (u: AdminUserResponse) => void
  header: ReactNode
}) {
  const t = i18n[lang]
  const cols = [t.userCol, t.roleCol, t.statusCol, t.toysCol, t.tariffCol, t.expiresCol, t.actionsCol]

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
      {header}

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              {cols.map((h) => (
                <th key={h} className="text-left text-xs font-semibold px-4 py-2.5" style={{ color: 'var(--ink-soft)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow key={u.id} user={u} currentUserId={currentUserId} lang={lang} onEdit={() => onEdit(u)} />
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12 text-sm" style={{ color: 'var(--ink-soft)' }}>{t.noUsers}</div>
        )}
      </div>

      {/* Mobile: cards */}
      <div className="md:hidden p-3 space-y-3">
        {users.map((u) => (
          <UserCard key={u.id} user={u} currentUserId={currentUserId} lang={lang} onEdit={() => onEdit(u)} />
        ))}
        {users.length === 0 && (
          <div className="text-center py-10 text-sm" style={{ color: 'var(--ink-soft)' }}>{t.noUsers}</div>
        )}
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const { lang } = useLangStore()
  const t = i18n[lang]
  const { data: profile } = useProfile()
  const { data: users, isLoading } = useAdminUsers()
  const [editUser, setEditUser] = useState<AdminUserResponse | null>(null)

  if (profile && profile.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: 'var(--ink-soft)' }}>
        {t.forbidden}
      </div>
    )
  }

  const allUsers = users ?? []
  const pending = allUsers.filter((u) => !u.enabled)
  const currentUserId = profile?.id ?? null

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--ink)', fontFamily: 'var(--font-spectral)' }}>
          {t.adminUsersTitle}
        </h1>
        {!isLoading && (
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
            {t.totalCount(allUsers.length)}
            {pending.length > 0 && (
              <span className="ml-2 font-medium" style={{ color: 'var(--clay)' }}>
                {t.pendingCountMsg(pending.length)}
              </span>
            )}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="rounded-2xl border p-4 space-y-3" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 flex-1 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
              <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <UserListSection
              users={pending} currentUserId={currentUserId} lang={lang} onEdit={setEditUser}
              header={
                <div className="px-4 py-3 flex items-center gap-2 border-b"
                  style={{ borderColor: 'var(--line)', background: 'var(--clay-light)' }}>
                  <Clock size={14} style={{ color: 'var(--clay)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--clay)' }}>
                    {t.pendingSection(pending.length)}
                  </span>
                </div>
              }
            />
          )}

          <UserListSection
            users={allUsers} currentUserId={currentUserId} lang={lang} onEdit={setEditUser}
            header={
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--line)' }}>
                <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{t.allUsersSection}</span>
              </div>
            }
          />
        </div>
      )}

      {editUser && (
        <TariffEditor user={editUser} lang={lang} onClose={() => setEditUser(null)} />
      )}
    </div>
  )
}
