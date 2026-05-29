import { useState, useEffect, useRef, useCallback } from 'react'
import { TemplateSettings } from '@/types'
import { usePatchTemplate } from '@/hooks/useToys'

export function useTemplateSettings(toyId: string, initialSettings: TemplateSettings) {
  const [settings, setSettings] = useState<TemplateSettings>(initialSettings)
  const patchMutation = usePatchTemplate(toyId)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDirtyRef = useRef(false)

  useEffect(() => {
    setSettings(initialSettings)
  }, [initialSettings])

  const updateSettings = useCallback((patch: Partial<TemplateSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }))
    isDirtyRef.current = true

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      if (isDirtyRef.current) {
        isDirtyRef.current = false
      }
    }, 1500)
  }, [])

  const saveSettings = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    patchMutation.mutate(settings)
  }, [settings, patchMutation])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  return { settings, updateSettings, saveSettings, isSaving: patchMutation.isPending }
}
