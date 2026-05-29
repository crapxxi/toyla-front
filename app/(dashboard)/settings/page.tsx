'use client'
import { Phone } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/store/auth.store'

function formatPhoneDisplay(phone: string | null): string {
  if (!phone) return '—'
  const digits = phone.replace(/\D/g, '')
  if (digits.length >= 11) {
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
  }
  return `+${digits}`
}

export default function SettingsPage() {
  const { userId, phoneNumber } = useAuthStore()
  const initials = phoneNumber?.replace(/\D/g, '').slice(-2) ?? 'ID'

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
              <span className="text-lg font-bold text-[#8B5CF6]">{initials}</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{formatPhoneDisplay(phoneNumber)}</p>
              <p className="text-xs text-gray-400 mt-0.5">Организатор</p>
            </div>
          </div>

          <Separator className="mb-6" />

          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone size={15} />
            Профиль
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">ID пользователя</label>
              <p className="text-sm text-gray-700">{userId ?? '—'}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Телефон</label>
              <p className="text-sm text-gray-700">{formatPhoneDisplay(phoneNumber)}</p>
            </div>
            <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
              Редактирование профиля недоступно.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
