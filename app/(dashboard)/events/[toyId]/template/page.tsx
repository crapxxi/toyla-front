'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save, Monitor, Palette, Music2, Timer, Eye } from 'lucide-react'
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
    <div className="flex items-center justify-between gap-4">
      <label className="text-sm text-gray-700 flex-1">{label}</label>
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <input
            type="color"
            value={value || '#8B5CF6'}
            onChange={(e) => onChange(e.target.value)}
            className="w-9 h-9 rounded-xl cursor-pointer border-2 border-gray-100 p-0.5 bg-transparent"
          />
        </div>
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#8B5CF6"
          className="w-28 h-9 text-xs rounded-xl font-mono"
        />
      </div>
    </div>
  )
}

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

const TEMPLATE_MAP = {
  ELEGANT: ElegantTemplate,
  FESTIVE: FestiveTemplate,
  MINIMALIST: MinimalistTemplate,
  ROMANTIC: RomanticTemplate,
  MODERN: ModernTemplate,
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

  const TemplateComponent = TEMPLATE_MAP[toy.templateId] ?? ElegantTemplate

  const TEMPLATE_LABELS: Record<string, string> = {
    ELEGANT: 'Элегантный', FESTIVE: 'Праздничный', MINIMALIST: 'Минималистичный',
    ROMANTIC: 'Романтичный', MODERN: 'Современный',
  }

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
          <p className="text-xs text-gray-400 mt-0.5 truncate">{toy.title} · {TEMPLATE_LABELS[toy.templateId]}</p>
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
          {/* Design */}
          <SectionCard icon={Palette} title="Цвета и шрифт">
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
              <label className="block text-sm text-gray-700 mb-2">Приветственный текст</label>
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
              <label className="block text-sm text-gray-700 mb-2">Шрифт</label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: 'serif', label: 'Serif', preview: 'Аа' },
                  { key: 'sans-serif', label: 'Sans', preview: 'Аа' },
                  { key: 'cursive', label: 'Cursive', preview: 'Аа' },
                ] as { key: 'serif' | 'sans-serif' | 'cursive'; label: string; preview: string }[]).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => updateSettings({ fontFamily: f.key })}
                    className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                      settings.fontFamily === f.key
                        ? 'border-[#8B5CF6] bg-[#EDE9FE] text-[#8B5CF6]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="text-lg leading-none mb-0.5"
                      style={{ fontFamily: f.key === 'sans-serif' ? 'Inter' : f.key === 'cursive' ? 'cursive' : 'Georgia, serif' }}
                    >
                      {f.preview}
                    </div>
                    <div className="text-[10px] font-medium">{f.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>

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
              onChange={(v) => updateSettings({ countdownEnabled: v })}
            />

            {settings.countdownEnabled && (
              <>
                <Separator />
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">Дата и время события</label>
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
                  <div className="grid grid-cols-3 gap-2">
                    {(['minimal', 'elegant', 'festive'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateSettings({ countdownStyle: s })}
                        className={`py-2 px-3 text-xs rounded-xl border transition-all ${
                          settings.countdownStyle === s
                            ? 'border-[#8B5CF6] bg-[#EDE9FE] text-[#8B5CF6] font-medium'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {s === 'minimal' ? 'Простой' : s === 'elegant' ? 'Элегант.' : 'Праздн.'}
                      </button>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Позиция</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['top', 'bottom', 'floating'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => updateSettings({ countdownPosition: p })}
                        className={`py-2 px-3 text-xs rounded-xl border transition-all ${
                          settings.countdownPosition === p
                            ? 'border-[#8B5CF6] bg-[#EDE9FE] text-[#8B5CF6] font-medium'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {p === 'top' ? '↑ Сверху' : p === 'bottom' ? '↓ Снизу' : '⊙ Плав.'}
                      </button>
                    ))}
                  </div>
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
