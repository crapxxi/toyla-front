'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface EventCountdownProps {
  targetDate: string
  style?: 'minimal' | 'elegant' | 'festive'
  position?: 'top' | 'bottom' | 'floating'
}

function getTimeLeft(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function EventCountdown({
  targetDate,
  style = 'elegant',
  position = 'bottom',
}: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(targetDate))

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  const positionClasses: Record<string, string> = {
    top: 'w-full',
    bottom: 'w-full',
    floating: 'fixed bottom-20 left-1/2 -translate-x-1/2 z-40',
  }

  if (style === 'minimal') {
    return (
      <div className={`${positionClasses[position]} flex justify-center py-4`}>
        <div className="flex items-center gap-3 text-sm font-mono text-gray-600">
          <span>{timeLeft.days}д</span>
          <span>{pad(timeLeft.hours)}ч</span>
          <span>{pad(timeLeft.minutes)}м</span>
          <span>{pad(timeLeft.seconds)}с</span>
        </div>
      </div>
    )
  }

  if (style === 'festive') {
    return (
      <div className={`${positionClasses[position]} flex justify-center py-6`}>
        <div className="flex gap-3">
          {[
            { value: timeLeft.days, label: 'дней' },
            { value: timeLeft.hours, label: 'часов' },
            { value: timeLeft.minutes, label: 'минут' },
            { value: timeLeft.seconds, label: 'секунд' },
          ].map(({ value, label }) => (
            <motion.div
              key={label}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex flex-col items-center bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-xl px-3 py-2 min-w-[60px] shadow-md"
            >
              <span className="text-2xl font-bold leading-none">{pad(value)}</span>
              <span className="text-[10px] opacity-80 mt-1">{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  // elegant (default)
  return (
    <div className={`${positionClasses[position]} flex justify-center py-6`}>
      <div className="flex gap-4">
        {[
          { value: timeLeft.days, label: 'дней' },
          { value: timeLeft.hours, label: 'часов' },
          { value: timeLeft.minutes, label: 'минут' },
          { value: timeLeft.seconds, label: 'секунд' },
        ].map(({ value, label }, idx) => (
          <div key={label} className="flex items-center gap-4">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-light tracking-widest">{pad(value)}</span>
              <span className="text-[11px] uppercase tracking-widest text-gray-400 mt-1">{label}</span>
            </div>
            {idx < 3 && <span className="text-2xl text-gray-300 -mt-4">:</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
