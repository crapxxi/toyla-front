'use client'
import Link from 'next/link'
import { Sparkles, MessageCircle } from 'lucide-react'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useUpgradeStore } from '@/store/upgrade.store'
import { useLangStore } from '@/store/lang.store'
import i18n from '@/lib/i18n'

export const ADMIN_WHATSAPP = 'https://wa.me/77073907131'

export function UpgradeModal() {
  const { open, message, closeUpgrade } = useUpgradeStore()
  const { lang } = useLangStore()
  const t = i18n[lang]

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeUpgrade()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
            style={{ background: 'var(--clay-light)' }}>
            <Sparkles size={22} style={{ color: 'var(--clay)' }} />
          </div>
          <DialogTitle>{t.upgradeTitle}</DialogTitle>
          <DialogDescription>{message?.trim() || t.upgradeDescDefault}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2.5 mt-1">
          <a href={ADMIN_WHATSAPP} target="_blank" rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--clay)' }}>
            <MessageCircle size={16} />
            {t.contactAdmin}
          </a>
          <Link href="/pricing" onClick={closeUpgrade}
            className="w-full inline-flex items-center justify-center py-2.5 rounded-xl text-sm font-medium border transition-colors"
            style={{ borderColor: 'var(--line)', color: 'var(--ink-soft)' }}>
            {t.viewPlans}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
