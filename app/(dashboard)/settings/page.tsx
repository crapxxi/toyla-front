'use client'
import { User } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/auth.store'

export default function SettingsPage() {
  const { userId, username } = useAuthStore()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Настройки</h1>
        <p className="text-sm text-gray-500 mt-1">Профиль аккаунта</p>
      </div>

      <div className="max-w-lg">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#EDE9FE] flex items-center justify-center">
              <span className="text-2xl font-bold text-[#8B5CF6]">
                {(username?.[0] ?? 'U').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">@{username}</p>
              <p className="text-xs text-gray-400 mt-0.5">Организатор</p>
            </div>
          </div>

          <Separator className="mb-6" />

          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={15} />
            Профиль
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">ID пользователя</label>
              <p className="text-sm text-gray-700">{userId ?? '—'}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Имя пользователя</label>
              <p className="text-sm text-gray-700">@{username ?? '—'}</p>
            </div>
            <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
              Редактирование профиля временно недоступно.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
