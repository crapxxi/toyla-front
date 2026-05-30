'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import toast from 'react-hot-toast'
import { PublicToyResponse } from '@/types'
import { ElegantTemplate } from '@/components/templates/ElegantTemplate'
import { FestiveTemplate } from '@/components/templates/FestiveTemplate'
import { MinimalistTemplate } from '@/components/templates/MinimalistTemplate'
import { RomanticTemplate } from '@/components/templates/RomanticTemplate'
import { ModernTemplate } from '@/components/templates/ModernTemplate'
import { api } from '@/lib/api'

interface Props {
  event: PublicToyResponse
  rsvpToken?: string
}

const TEMPLATE_MAP = {
  ELEGANT: ElegantTemplate,
  FESTIVE: FestiveTemplate,
  MINIMALIST: MinimalistTemplate,
  ROMANTIC: RomanticTemplate,
  MODERN: ModernTemplate,
}

export function PublicEventClient({ event, rsvpToken }: Props) {
  const [rsvpDone, setRsvpDone] = useState<'accepted' | 'declined' | null>(null)
  const [rsvpLoading, setRsvpLoading] = useState(false)

  const TemplateComponent = TEMPLATE_MAP[event.templateId] ?? ElegantTemplate

  const handleRsvp = async (action: 'accept' | 'decline') => {
    if (!rsvpToken) return
    setRsvpLoading(true)
    const status = action === 'accept' ? 'ACCEPTED' : 'DECLINED'
    try {
      await api.post(`/api/v1/rsvp/${rsvpToken}`, null, { params: { status } })
      setRsvpDone(action === 'accept' ? 'accepted' : 'declined')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          toast.error('Шақырту табылмады / Приглашение не найдено или уже использовано')
        } else if (err.response?.status === 409) {
          toast.error('Сіз бұл шақыртуға жауап бердіңіз / Вы уже ответили на это приглашение')
        } else {
          toast.error('Қате. Кейінірек қайталаңыз / Ошибка. Попробуйте позже')
        }
      }
    } finally {
      setRsvpLoading(false)
    }
  }

  return (
    <>
      {/* RSVP accepted full-screen overlay */}
      <AnimatePresence>
        {rsvpDone === 'accepted' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
          >
            {/* Confetti burst */}
            <div className="absolute inset-0">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: '50vw',
                    y: '50vh',
                    opacity: 1,
                    scale: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    opacity: 0,
                    scale: Math.random() + 0.5,
                  }}
                  transition={{ duration: 1.5 + Math.random(), ease: 'easeOut', delay: i * 0.03 }}
                  className="absolute w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF8E53', '#A78BFA', '#34D399'][
                      i % 6
                    ],
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <TemplateComponent
        event={event}
        rsvpToken={rsvpToken}
        onAccept={() => handleRsvp('accept')}
        onDecline={() => handleRsvp('decline')}
        rsvpLoading={rsvpLoading}
        rsvpDone={rsvpDone}
      />
    </>
  )
}
