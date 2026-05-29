'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod/v4'
import { User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import { handleApiError } from '@/lib/handleApiError'
import { useAuthStore } from '@/store/auth.store'
import toast from 'react-hot-toast'
import { useMutation, useQuery } from '@tanstack/react-query'
import { User as UserType } from '@/types'

const profileSchema = z.object({
  name: z.string().min(1, 'Введите имя').max(50),
  lastName: z.string().min(1, 'Введите фамилию').max(50),
  username: z.string().min(3, 'Минимум 3 символа').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Только латиница, цифры и _'),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const { user, setAuth, token } = useAuthStore()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.username],
    queryFn: async () => {
      const { data } = await api.get<UserType>('/api/auth/me')
      return data
    },
    enabled: !!token,
  })

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      lastName: '',
      username: user?.username ?? '',
    },
  })

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name ?? '',
        lastName: profile.lastName ?? '',
        username: profile.username,
      })
    }
  }, [profile, form])

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      const { data: updated } = await api.put<UserType>('/api/auth/me', data)
      return updated
    },
    onSuccess: (updated) => {
      if (token && user) {
        setAuth(token, updated.username, updated.role, updated.id)
      }
      toast.success('Настройки сохранены')
    },
    onError: (err: unknown) => handleApiError(err),
  })

  const handleSave = form.handleSubmit((data) => updateMutation.mutate(data))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Настройки</h1>
        <p className="text-sm text-gray-500 mt-1">Управление профилем аккаунта</p>
      </div>

      <div className="max-w-lg">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-[#EDE9FE] flex items-center justify-center">
              <span className="text-2xl font-bold text-[#8B5CF6]">
                {(profile?.name?.[0] ?? user?.username?.[0] ?? 'U').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                {profile?.name ? `${profile.name} ${profile.lastName ?? ''}` : `@${user?.username}`}
              </p>
              <p className="text-sm text-gray-400">@{user?.username}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {user?.role === 'ADMIN' ? 'Администратор' : 'Организатор'}
              </p>
            </div>
          </div>

          <Separator className="mb-6" />

          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={15} />
            Профиль
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Имя *</label>
                <Input
                  {...form.register('name')}
                  placeholder="Айгерим"
                  className="rounded-xl"
                  disabled={isLoading}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Фамилия *</label>
                <Input
                  {...form.register('lastName')}
                  placeholder="Сейткали"
                  className="rounded-xl"
                  disabled={isLoading}
                />
                {form.formState.errors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Имя пользователя *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <Input
                  {...form.register('username')}
                  placeholder="username"
                  className="rounded-xl pl-8"
                  disabled={isLoading}
                />
              </div>
              {form.formState.errors.username && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.username.message}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Ссылки на мероприятия: toyla.app/@{form.watch('username')}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Телефон</label>
              <Input
                value={profile?.phoneNumber ? `+${profile.phoneNumber}` : ''}
                disabled
                className="rounded-xl bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Телефон изменить нельзя</p>
            </div>

            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending || isLoading}
              className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl mt-2"
            >
              {updateMutation.isPending ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-red-100 p-6 mt-4">
          <h3 className="text-sm font-semibold text-red-600 mb-2">Опасная зона</h3>
          <p className="text-xs text-gray-500 mb-4">
            Удаление аккаунта приведёт к безвозвратной потере всех данных о мероприятиях и гостях.
          </p>
          <Button variant="outline" className="border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs">
            Удалить аккаунт
          </Button>
        </div>
      </div>
    </div>
  )
}
