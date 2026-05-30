import Link from 'next/link'
import { Shanyrak } from './Shanyrak'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  dark?: boolean
}

const sizes = {
  sm: { mark: 28, text: 'text-[20px]' },
  md: { mark: 36, text: 'text-[26px]' },
  lg: { mark: 44, text: 'text-[34px]' },
}

export function Logo({ size = 'md', href = '/', dark = false }: LogoProps) {
  const s = sizes[size]
  const content = (
    <span className="flex items-center gap-2.5 select-none">
      <span style={{ width: s.mark, height: s.mark, flexShrink: 0, display: 'block' }}>
        {dark ? (
          <Shanyrak hoop="#E9D9BE" lattice="#C8A24B" spoke="#C8A24B" sw={2.3} />
        ) : (
          <Shanyrak hoop="#261B11" lattice="#A8492A" spoke="#B0843A" sw={2.3} />
        )}
      </span>
      <span
        className={s.text}
        style={{
          fontFamily: 'var(--font-spectral), Georgia, serif',
          fontWeight: 500,
          letterSpacing: '0.005em',
          color: dark ? '#E9D9BE' : '#261B11',
          lineHeight: 1,
        }}
      >
        Toyla<span style={{ color: dark ? '#C8A24B' : '#A8492A' }}>.</span>
      </span>
    </span>
  )

  if (href) {
    return <Link href={href} className="hover:opacity-80 transition-opacity">{content}</Link>
  }
  return content
}
