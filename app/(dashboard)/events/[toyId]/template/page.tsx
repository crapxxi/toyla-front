'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Eye, Save } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useGetToy } from '@/hooks/useToys'
import { useTemplateSettings } from '@/hooks/useTemplateSettings'
import { ElegantTemplate } from '@/components/templates/ElegantTemplate'
import { FestiveTemplate } from '@/components/templates/FestiveTemplate'
import { MinimalistTemplate } from '@/components/templates/MinimalistTemplate'
import { RomanticTemplate } from '@/components/templates/RomanticTemplate'
import { ModernTemplate } from '@/components/templates/ModernTemplate'
import { PublicToyResponse } from '@/types'

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 p-0.5"
        />
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="w-28 h-8 text-xs rounded-lg"
        />
      </div>
    </div>
  )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-[#8B5CF6]' : 'bg-gray-200'}`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

export default function TemplatePage() {
  const { toyId } = useParams<{ toyId: string }>()
  const { data: toy, isLoading } = useGetToy(toyId)
  const [showPreview, setShowPreview] = useState(false)

  const { settings, updateSettings, saveSettings, isSaving } = useTemplateSettings(
    toyId,
    toy?.templateSettings ?? {}
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (!toy) return null

  const mockEvent: PublicToyResponse = {
    id: toy.id,
    title: toy.title,
    description: toy.description,
    eventDate: toy.eventDate,
    locationName: toy.locationName,
    gisLink: toy.gisLink,
    templateId: toy.templateId,
    templateSettings: settings,
    organizerDisplayName: 'Организатор',
  }

  const TemplateComponent = {
    ELEGANT: ElegantTemplate,
    FESTIVE: FestiveTemplate,
    MINIMALIST: MinimalistTemplate,
    ROMANTIC: RomanticTemplate,
    MODERN: ModernTemplate,
  }[toy.templateId] ?? ElegantTemplate

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
          <h1 className="text-xl font-semibold text-gray-900">Шаблон</h1>
          <p className="text-xs text-gray-500">{toy.title}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-xl gap-2 text-sm"
          >
            <Eye size={15} />
            <span className="hidden sm:block">Предпросмотр</span>
          </Button>
          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl gap-2 text-sm"
          >
            <Save size={15} />
            <span className="hidden sm:block">{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Settings panel */}
        <div>
          <Tabs defaultValue="design">
            <TabsList className="w-full rounded-xl mb-4">
              <TabsTrigger value="design" className="flex-1 rounded-lg text-xs">Дизайн</TabsTrigger>
              <TabsTrigger value="music" className="flex-1 rounded-lg text-xs">Музыка</TabsTrigger>
              <TabsTrigger value="timer" className="flex-1 rounded-lg text-xs">Таймер</TabsTrigger>
            </TabsList>

            {/* Design tab */}
            <TabsContent value="design" className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
              <ColorPicker
                label="Основной цвет"
                value={settings.primaryColor ?? ''}
                onChange={(v) => updateSettings({ primaryColor: v })}
              />
              <Separator />
              <ColorPicker
                label="Цвет фона"
                value={settings.backgroundColor ?? ''}
                onChange={(v) => updateSettings({ backgroundColor: v })}
              />
              <Separator />
              <ColorPicker
                label="Акцентный цвет"
                value={settings.accentColor ?? ''}
                onChange={(v) => updateSettings({ accentColor: v })}
              />
              <Separator />
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Текст приветствия</label>
                <Textarea
                  value={settings.greetingText ?? ''}
                  onChange={(e) => updateSettings({ greetingText: e.target.value })}
                  placeholder="С радостью приглашаем вас..."
                  rows={2}
                  className="rounded-xl resize-none text-sm"
                />
              </div>
              <Separator />
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">URL обложки</label>
                <Input
                  value={settings.coverImageUrl ?? ''}
                  onChange={(e) => updateSettings({ coverImageUrl: e.target.value })}
                  placeholder="https://..."
                  className="rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">URL фонового изображения</label>
                <Input
                  value={settings.backgroundImageUrl ?? ''}
                  onChange={(e) => updateSettings({ backgroundImageUrl: e.target.value })}
                  placeholder="https://..."
                  className="rounded-xl text-sm"
                />
              </div>
              <Separator />
              <div>
                <label className="block text-sm text-gray-700 mb-2">Шрифт</label>
                <div className="flex gap-2">
                  {(['serif', 'sans-serif', 'cursive'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => updateSettings({ fontFamily: f })}
                      className={`flex-1 py-2 text-xs rounded-lg border transition-all ${
                        settings.fontFamily === f
                          ? 'border-[#8B5CF6] bg-[#EDE9FE] text-[#8B5CF6]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {f === 'serif' ? 'Serif' : f === 'sans-serif' ? 'Sans' : 'Cursive'}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Music tab */}
            <TabsContent value="music" className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Ссылка на музыку</label>
                <Input
                  value={settings.musicUrl ?? ''}
                  onChange={(e) => updateSettings({ musicUrl: e.target.value })}
                  placeholder="https://..."
                  className="rounded-xl text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Прямая ссылка на MP3 файл</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">Автовоспроизведение</p>
                  <p className="text-xs text-gray-400">Музыка запустится при открытии</p>
                </div>
                <ToggleSwitch
                  checked={settings.musicAutoplay ?? false}
                  onChange={(v) => updateSettings({ musicAutoplay: v })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">Повтор</p>
                  <p className="text-xs text-gray-400">Воспроизводить по кругу</p>
                </div>
                <ToggleSwitch
                  checked={settings.musicLoop ?? true}
                  onChange={(v) => updateSettings({ musicLoop: v })}
                />
              </div>
              <Separator />
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Громкость: {Math.round((settings.musicVolume ?? 0.5) * 100)}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={settings.musicVolume ?? 0.5}
                  onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })}
                  className="w-full accent-[#8B5CF6]"
                />
              </div>
            </TabsContent>

            {/* Timer tab */}
            <TabsContent value="timer" className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">Обратный отсчёт</p>
                  <p className="text-xs text-gray-400">Показывать таймер на странице</p>
                </div>
                <ToggleSwitch
                  checked={settings.countdownEnabled ?? false}
                  onChange={(v) => updateSettings({ countdownEnabled: v })}
                />
              </div>

              {settings.countdownEnabled && (
                <>
                  <Separator />
                  <div>
                    <label className="block text-sm text-gray-700 mb-1.5">Дата события</label>
                    <Input
                      type="datetime-local"
                      value={settings.countdownTargetDate?.slice(0, 16) ?? toy.eventDate.slice(0, 16)}
                      onChange={(e) => updateSettings({ countdownTargetDate: new Date(e.target.value).toISOString() })}
                      className="rounded-xl text-sm"
                    />
                  </div>
                  <Separator />
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Стиль таймера</label>
                    <div className="flex gap-2">
                      {(['minimal', 'elegant', 'festive'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateSettings({ countdownStyle: s })}
                          className={`flex-1 py-2 text-xs rounded-lg border transition-all ${
                            settings.countdownStyle === s
                              ? 'border-[#8B5CF6] bg-[#EDE9FE] text-[#8B5CF6]'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {s === 'minimal' ? 'Минимал.' : s === 'elegant' ? 'Элегант.' : 'Праздн.'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Позиция</label>
                    <div className="flex gap-2">
                      {(['top', 'bottom', 'floating'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => updateSettings({ countdownPosition: p })}
                          className={`flex-1 py-2 text-xs rounded-lg border transition-all ${
                            settings.countdownPosition === p
                              ? 'border-[#8B5CF6] bg-[#EDE9FE] text-[#8B5CF6]'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {p === 'top' ? 'Сверху' : p === 'bottom' ? 'Снизу' : 'Плав.'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 min-h-[600px]">
            <div className="bg-gray-100 px-4 py-2 flex items-center gap-2 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-300" />
                <div className="w-3 h-3 rounded-full bg-amber-300" />
                <div className="w-3 h-3 rounded-full bg-green-300" />
              </div>
              <span className="text-xs text-gray-400 mx-auto">Предпросмотр</span>
            </div>
            <div className="overflow-auto max-h-[700px]">
              <TemplateComponent event={mockEvent} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
