'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Music, Pause, Play, Volume2, VolumeX } from 'lucide-react'

interface BackgroundMusicPlayerProps {
  musicUrl: string
  autoplay?: boolean
  loop?: boolean
  volume?: number
}

export function BackgroundMusicPlayer({
  musicUrl,
  autoplay = false,
  loop = true,
  volume = 0.5,
}: BackgroundMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [canPlay, setCanPlay] = useState(false)

  useEffect(() => {
    const audio = new Audio(musicUrl)
    audio.loop = loop
    audio.volume = volume
    audioRef.current = audio

    audio.addEventListener('canplaythrough', () => setCanPlay(true))
    audio.addEventListener('ended', () => setIsPlaying(false))

    if (autoplay) {
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Autoplay blocked — user gesture needed
          })
      }
    }

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [musicUrl, autoplay, loop, volume])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  if (!musicUrl) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-14 right-0 flex flex-col items-center gap-2 bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-100"
          >
            <button
              onClick={toggleMute}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={togglePlay}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-100 flex items-center justify-center text-gray-700 hover:text-[#8B5CF6] transition-colors"
        aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
      >
        {isPlaying ? (
          <Pause size={20} />
        ) : (
          <div className="relative">
            <Music size={20} />
            {!isPlaying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
            )}
          </div>
        )}
      </motion.button>

      {isPlaying && (
        <div className="absolute -bottom-1 -right-1 flex gap-0.5 items-end">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-1 bg-[#8B5CF6] rounded-full opacity-75"
              style={{
                animation: `equalizer 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                height: `${4 + i * 3}px`,
              }}
            />
          ))}
        </div>
      )}

      <style>{`
        @keyframes equalizer {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
      `}</style>
    </div>
  )
}
