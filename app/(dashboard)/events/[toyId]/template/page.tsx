'use client'
import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save, Monitor, Music2, Timer, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useGetToy } from '@/hooks/useToys'
import { useTemplateSettings } from '@/hooks/useTemplateSettings'
import { KazakhTemplate } from '@/components/templates/KazakhTemplate'
import { PublicToyResponse } from '@/types'


function Toggle({ label, sublabel, checked, onChange }: { label: string; sublabel?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm text-gray-900">{label}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[#8B5CF6]' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-50">
        <div className="w-7 h-7 rounded-lg bg-[#EDE9FE] flex items-center justify-center">
          <Icon size={14} className="text-[#8B5CF6]" />
        </div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  )
}


export default function TemplatePage() {
  const { toyId } = useParams<{ toyId: string }>()
  const { data: toy, isLoading } = useGetToy(toyId)
  const [showPreview, setShowPreview] = useState(false)

  const initialSettings = useMemo(() => toy?.templateSettings ?? {}, [toy])
  const { settings, updateSettings, saveSettings, isSaving } = useTemplateSettings(
    toyId,
    initialSettings
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
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

  const TemplateComponent = KazakhTemplate

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href={`/events/${toyId}`}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-gray-900">Дизайн шаблона</h1>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{toy.title}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className={`rounded-xl gap-2 text-sm transition-colors ${showPreview ? 'bg-[#EDE9FE] border-[#8B5CF6] text-[#8B5CF6]' : ''}`}
          >
            <Eye size={15} />
            <span className="hidden sm:block">Превью</span>
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

      <div className={`grid gap-5 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-xl'}`}>
        {/* Settings */}
        <div className="space-y-4">
          {/* Music */}
          <SectionCard icon={Music2} title="Музыка">
            <div>
              <label className="block text-sm text-gray-700 mb-1.5">Ссылка на MP3</label>
              <Input
                value={settings.musicUrl ?? ''}
                onChange={(e) => updateSettings({ musicUrl: e.target.value })}
                placeholder="https://example.com/music.mp3"
                className="rounded-xl text-sm"
              />
              <p className="text-xs text-gray-400 mt-1.5">Прямая ссылка на аудиофайл</p>
            </div>
            <Separator />
            <Toggle
              label="Автовоспроизведение"
              sublabel="Музыка запустится при открытии"
              checked={settings.musicAutoplay ?? false}
              onChange={(v) => updateSettings({ musicAutoplay: v })}
            />
            <Separator />
            <Toggle
              label="Повтор"
              sublabel="Воспроизводить по кругу"
              checked={settings.musicLoop ?? true}
              onChange={(v) => updateSettings({ musicLoop: v })}
            />
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-700">Громкость</label>
                <span className="text-sm font-medium text-[#8B5CF6]">{Math.round((settings.musicVolume ?? 0.5) * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={settings.musicVolume ?? 0.5}
                onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })}
                className="w-full accent-[#8B5CF6]"
              />
            </div>
          </SectionCard>

          {/* Timer */}
          <SectionCard icon={Timer} title="Обратный отсчёт">
            <Toggle
              label="Показывать таймер"
              sublabel="Обратный отсчёт до события"
              checked={settings.countdownEnabled ?? false}
              onChange={(v) => updateSettings({
                countdownEnabled: v,
                ...(v && !settings.countdownTargetDate ? { countdownTargetDate: toy.eventDate } : {}),
              })}
            />

            {settings.countdownEnabled && (
              <>
                <Separator />
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Дата и время события</label>
                  <Input
                    type="datetime-local"
                    value={settings.countdownTargetDate?.slice(0, 16) ?? toy.eventDate.slice(0, 16)}
                    onChange={(e) => updateSettings({ countdownTargetDate: e.target.value + ':00' })}
                    className="rounded-xl text-sm"
                  />
                </div>
              </>
            )}
          </SectionCard>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-100">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-200 bg-white">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-300" />
                  <div className="w-3 h-3 rounded-full bg-amber-300" />
                  <div className="w-3 h-3 rounded-full bg-green-300" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1">
                    <Monitor size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-400">toyla.app / предпросмотр</span>
                  </div>
                </div>
              </div>
              {/*
                transform: translateZ(0) here is critical:
                it creates a new containing block for position:fixed children,
                preventing the music player and other fixed elements from
                escaping the preview box and overlapping settings controls.
              */}
              <div
                className="overflow-auto"
                style={{ maxHeight: '70vh', transform: 'translateZ(0)', position: 'relative' }}
              >
                <TemplateComponent event={mockEvent} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
