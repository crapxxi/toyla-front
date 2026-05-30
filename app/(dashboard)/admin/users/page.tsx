'use client'
import { useState } from 'react'
import { ShieldCheck, ShieldOff, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useProfile } from '@/hooks/useProfile'
import { useAdminUsers, useEnableUser, useDisableUser, useSetRole, useDeleteAdminUser } from '@/hooks/useAdmin'
import { useLangStore } from '@/store/lang.store'
import i18n from '@/lib/i18n'
import { AdminUserResponse, Role } from '@/types'

function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, '')
  if (d.length >= 11) return `+${d[0]} (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`
  return phone
}

function UserRow({ user, currentUserId }: { user: AdminUserResponse; currentUserId: number | null }) {
  const { lang } = useLangStore()
  const t = i18n[lang]
  const [confirmDelete, setConfirmDelete] = useState(false)
  const enableUser = useEnableUser()
  const disableUser = useDisableUser()
  const setRole = useSetRole()
  const deleteUser = useDeleteAdminUser()
  const isSelf = user.id === currentUserId

  const toggleRole = () => {
    const next: Role = user.role === 'ADMIN' ? 'ORGANIZER' : 'ADMIN'
    setRole.mutate({ userId: user.id, role: next })
  }

  return (
    <tr className="border-b last:border-0" style={{ borderColor: 'var(--line)' }}>
      <td className="py-3 px-4">
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
            {[user.name, user.lastName].filter(Boolean).join(' ') || '—'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
            {formatPhone(user.phoneNumber)}
          </p>
        </div>
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
          {!user.enabled ? (
            <Button size="sm" className="h-7 text-xs px-2.5"
              style={{ background: 'var(--clay)', color: 'var(--paper)' }}
              onClick={() => enableUser.mutate(user.id)}
              disabled={enableUser.isPending}>
              {t.approveBtn}
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="h-7 text-xs px-2.5"
              onClick={() => disableUser.mutate(user.id)}
              disabled={disableUser.isPending || isSelf}>
              <XCircle size={12} className="mr-1" /> {t.blockBtn}
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-7 text-xs px-2.5"
            onClick={toggleRole} disabled={setRole.isPending || isSelf}>
            {user.role === 'ADMIN' ? <ShieldOff size={12} className="mr-1" /> : <ShieldCheck size={12} className="mr-1" />}
            {user.role === 'ADMIN' ? t.demoteBtn : t.adminShort}
          </Button>
          {!confirmDelete ? (
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setConfirmDelete(true)} disabled={isSelf}>
              <Trash2 size={13} />
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button size="sm" className="h-7 text-xs px-2 bg-red-500 hover:bg-red-600 text-white"
                onClick={() => deleteUser.mutate(user.id)} disabled={deleteUser.isPending}>
                {t.delete}
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs px-2"
                onClick={() => setConfirmDelete(false)}>
                {t.cancel}
              </Button>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function AdminUsersPage() {
  const { lang } = useLangStore()
  const t = i18n[lang]
  const { data: profile } = useProfile()
  const { data: users, isLoading } = useAdminUsers()

  if (profile && profile.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: 'var(--ink-soft)' }}>
        {t.forbidden}
      </div>
    )
  }

  const pending = users?.filter((u) => !u.enabled) ?? []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--ink)', fontFamily: 'var(--font-spectral)' }}>
          {t.adminUsersTitle}
        </h1>
        {!isLoading && (
          <p className="text-sm mt-1" style={{ color: 'var(--ink-soft)' }}>
            {t.totalCount(users?.length ?? 0)}
            {pending.length > 0 && (
              <span className="ml-2 font-medium" style={{ color: 'var(--clay)' }}>
                {t.pendingCountMsg(pending.length)}
              </span>
            )}
          </p>
        )}
      </div>

      {pending.length > 0 && (
        <div className="mb-6 rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
          <div className="px-4 py-3 flex items-center gap-2 border-b" style={{ borderColor: 'var(--line)', background: 'var(--clay-light)' }}>
            <Clock size={14} style={{ color: 'var(--clay)' }} />
            <span className="text-sm font-semibold" style={{ color: 'var(--clay)' }}>
              {t.pendingSection(pending.length)}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {[t.userCol, t.roleCol, t.statusCol, t.toysCol, t.actionsCol].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold px-4 py-2.5" style={{ color: 'var(--ink-soft)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pending.map((u) => <UserRow key={u.id} user={u} currentUserId={profile?.id ?? null} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--line)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{t.allUsersSection}</span>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
                <Skeleton className="h-10 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {[t.userCol, t.roleCol, t.statusCol, t.toysCol, t.actionsCol].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold px-4 py-2.5" style={{ color: 'var(--ink-soft)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(users ?? []).map((u) => <UserRow key={u.id} user={u} currentUserId={profile?.id ?? null} />)}
              </tbody>
            </table>
            {(users ?? []).length === 0 && (
              <div className="text-center py-12 text-sm" style={{ color: 'var(--ink-soft)' }}>{t.noUsers}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
