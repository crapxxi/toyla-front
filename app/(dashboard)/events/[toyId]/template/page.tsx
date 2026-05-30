'use client'
import { useState, useMemo, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save, Monitor, Music2, Timer, Eye, Upload, Trash2, ImageIcon, X, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useGetToy, useUploadMusic, useDeleteMusic, useUploadImage, useDeleteImage } from '@/hooks/useToys'
import { useTemplateSettings } from '@/hooks/useTemplateSettings'
import { useTariffGate } from '@/hooks/useTariff'
import { KazakhTemplate } from '@/components/templates/KazakhTemplate'
import { useLangStore } from '@/store/lang.store'
import { useUpgradeStore } from '@/store/upgrade.store'
import { PublicToyResponse } from '@/types'
import i18n from '@/lib/i18n'
import Image from 'next/image'

/** Small banner shown in media sections when the plan doesn't allow uploads. */
function MediaLockedNote({ hint, onUpgrade, cta }: { hint: string; onUpgrade: () => void; cta: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3 bg-[#FBF5F1] border border-[#E8C5B5]">
      <Lock size={15} className="text-[#A8492A] flex-shrink-0" />
      <p className="text-xs text-gray-600 flex-1">{hint}</p>
      <button onClick={onUpgrade}
        className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg bg-[#A8492A] hover:bg-[#8A3A20] transition-colors flex-shrink-0">
        {cta}
      </button>
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
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-[#A8492A]' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#FBF6EE] rounded-2xl border border-[#E4D8C4] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-50">
        <div className="w-7 h-7 rounded-lg bg-[#F5EDE6] flex items-center justify-center">
          <Icon size={14} className="text-[#A8492A]" />
        </div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  )
}

export default function TemplatePage() {
  const { toyId } = useParams<{ toyId: string }>()
  const { lang } = useLangStore()
  const t = i18n[lang]
  const { data: toy, isLoading } = useGetToy(toyId)
  const [showPreview, setShowPreview] = useState(false)
  const { canMedia, tariff } = useTariffGate()
  const openUpgrade = useUpgradeStore((s) => s.openUpgrade)

  const uploadMusic = useUploadMusic(toyId)
  const deleteMusic = useDeleteMusic(toyId)
  const uploadImage = useUploadImage(toyId)
  const deleteImage = useDeleteImage(toyId)

  const musicInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const initialSettings = useMemo(() => toy?.templateSettings ?? {}, [toy])
  const { settings, updateSettings, saveSettings, isSaving } = useTemplateSettings(toyId, initialSettings)

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
    organizerDisplayName: toy.organizerName,
    images: toy.images ?? [],
    musicUrl: toy.musicUrl,
    showWatermark: tariff?.plan.showWatermark ?? true,
  }

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadMusic.mutateAsync(file)
    updateSettings({ musicUrl: url })
    if (musicInputRef.current) musicInputRef.current.value = ''
  }

  const handleMusicDelete = async () => {
    await deleteMusic.mutateAsync()
    updateSettings({ musicUrl: undefined })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Delete existing image first if any
    if (toy.images && toy.images.length > 0) {
      await deleteImage.mutateAsync(toy.images[0].id)
    }
    await uploadImage.mutateAsync(file)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const currentMusicUrl = toy.musicUrl ?? settings.musicUrl
  const images = toy.images ?? []

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/events/${toyId}`}
          className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-gray-900">{t.templateDesign}</h1>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{toy.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}
            className={`rounded-xl gap-2 text-sm transition-colors ${showPreview ? 'bg-[#F5EDE6] border-[#A8492A] text-[#A8492A]' : ''}`}>
            <Eye size={15} />
            <span className="hidden sm:block">{t.previewBtn}</span>
          </Button>
          <Button onClick={saveSettings} disabled={isSaving} className="bg-[#A8492A] hover:bg-[#8A3A20] rounded-xl gap-2 text-sm">
            <Save size={15} />
            <span className="hidden sm:block">{isSaving ? t.saving : t.save}</span>
          </Button>
        </div>
      </div>

      <div className={`grid gap-5 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-xl'}`}>
        <div className="space-y-4">

          {/* Images — max 1 */}
          <SectionCard icon={ImageIcon} title={t.eventPhotos}>
            <p className="text-xs text-gray-400 -mt-2">{t.photosHint}</p>
            {!canMedia && <MediaLockedNote hint={t.mediaLockedHint} cta={t.upgradeToDara} onUpgrade={() => openUpgrade(t.mediaLockedHint)} />}

            {images.length > 0 && (
              <div className="relative group rounded-xl overflow-hidden aspect-video bg-gray-50">
                <Image src={images[0].url} alt="" fill className="object-cover" sizes="400px" />
                <button
                  onClick={() => deleteImage.mutate(images[0].id)}
                  disabled={deleteImage.isPending}
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
                    <X size={13} className="text-red-500" />
                  </div>
                </button>
              </div>
            )}

            {images.length === 0 && (
              <>
                <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageUpload} />
                <button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadImage.isPending || deleteImage.isPending || !canMedia}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 flex flex-col items-center gap-1.5 text-gray-400 hover:border-[#A8492A] hover:text-[#A8492A] transition-colors disabled:opacity-50"
                >
                  <Upload size={18} />
                  <span className="text-xs font-medium">
                    {uploadImage.isPending || deleteImage.isPending ? t.uploading : t.uploadPhoto}
                  </span>
                  <span className="text-[10px]">JPG, PNG, WEBP · до 10 МБ</span>
                </button>
              </>
            )}

            {images.length > 0 && (
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={uploadImage.isPending || deleteImage.isPending || !canMedia}
                className="w-full border border-gray-200 rounded-xl py-2 flex items-center justify-center gap-2 text-xs text-gray-500 hover:border-[#A8492A] hover:text-[#A8492A] transition-colors disabled:opacity-50"
              >
                <Upload size={13} />
                {uploadImage.isPending || deleteImage.isPending ? t.uploading : t.uploadPhoto}
                <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleImageUpload} />
              </button>
            )}
          </SectionCard>

          {/* Music */}
          <SectionCard icon={Music2} title={t.musicSection}>
            {!canMedia && <MediaLockedNote hint={t.mediaLockedHint} cta={t.upgradeToDara} onUpgrade={() => openUpgrade(t.mediaLockedHint)} />}
            {currentMusicUrl ? (
              <div className="flex items-center gap-3 bg-[#FBF5F1] rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-[#A8492A] flex items-center justify-center flex-shrink-0">
                  <Music2 size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentMusicUrl.split('/').pop() ?? 'Аудиофайл'}
                  </p>
                  <p className="text-xs text-gray-400">{t.uploadedLabel}</p>
                </div>
                <button onClick={handleMusicDelete} disabled={deleteMusic.isPending}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <>
                <input ref={musicInputRef} type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4" className="hidden" onChange={handleMusicUpload} />
                <button onClick={() => musicInputRef.current?.click()} disabled={uploadMusic.isPending || !canMedia}
                  className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 flex flex-col items-center gap-1.5 text-gray-400 hover:border-[#A8492A] hover:text-[#A8492A] transition-colors disabled:opacity-50">
                  <Upload size={18} />
                  <span className="text-xs font-medium">{uploadMusic.isPending ? t.uploading : t.uploadMusic}</span>
                  <span className="text-[10px]">MP3, WAV, OGG, M4A · до 20 МБ</span>
                </button>
              </>
            )}
            <Separator />
            <Toggle label={t.autoplay} sublabel={t.autoplayHint} checked={settings.musicAutoplay ?? false} onChange={(v) => updateSettings({ musicAutoplay: v })} />
            <Separator />
            <Toggle label={t.loopLabel} sublabel={t.loopHint} checked={settings.musicLoop ?? true} onChange={(v) => updateSettings({ musicLoop: v })} />
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-700">{t.volumeLabel}</label>
                <span className="text-sm font-medium text-[#A8492A]">{Math.round((settings.musicVolume ?? 0.5) * 100)}%</span>
              </div>
              <input type="range" min={0} max={1} step={0.05} value={settings.musicVolume ?? 0.5}
                onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })}
                className="w-full accent-[#A8492A]" />
            </div>
          </SectionCard>

          {/* Countdown */}
          <SectionCard icon={Timer} title={t.countdownSection}>
            <Toggle label={t.showTimer} sublabel={t.countdownHint} checked={settings.countdownEnabled ?? false}
              onChange={(v) => updateSettings({
                countdownEnabled: v,
                ...(v && !settings.countdownTargetDate ? { countdownTargetDate: toy.eventDate } : {}),
              })} />
            {settings.countdownEnabled && (
              <>
                <Separator />
                <div>
                  <label className="block text-sm text-gray-700 mb-1.5">{t.eventDateLbl}</label>
                  <input type="datetime-local"
                    value={settings.countdownTargetDate?.slice(0, 16) ?? toy.eventDate.slice(0, 16)}
                    onChange={(e) => updateSettings({ countdownTargetDate: e.target.value + ':00' })}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#A8492A]/30" />
                </div>
              </>
            )}
          </SectionCard>
        </div>

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
                    <span className="text-xs text-gray-400">{t.previewUrl}</span>
                  </div>
                </div>
              </div>
              <div className="overflow-auto" style={{ maxHeight: '70vh', transform: 'translateZ(0)', position: 'relative' }}>
                <KazakhTemplate event={mockEvent} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
