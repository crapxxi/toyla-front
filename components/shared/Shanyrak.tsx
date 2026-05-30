interface ShanyrakProps {
  hoop?: string
  lattice?: string
  spoke?: string
  knot?: string
  spokes?: number
  sw?: number
  size?: number
  className?: string
}

export function Shanyrak({
  hoop = '#261B11',
  lattice = '#A8492A',
  spoke = '#B0843A',
  knot,
  spokes = 28,
  sw = 2,
  size,
  className,
}: ShanyrakProps) {
  const k = knot ?? lattice
  const lines: React.ReactNode[] = []
  for (let i = 0; i < spokes; i++) {
    const a = (i / spokes) * Math.PI * 2
    const r1 = 30.5, r2 = 41
    lines.push(
      <line
        key={i}
        x1={(50 + r1 * Math.cos(a)).toFixed(2)}
        y1={(50 + r1 * Math.sin(a)).toFixed(2)}
        x2={(50 + r2 * Math.cos(a)).toFixed(2)}
        y2={(50 + r2 * Math.sin(a)).toFixed(2)}
      />
    )
  }

  const clipId = `shanyrak-clip-${Math.random().toString(36).slice(2, 7)}`

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      style={size ? { width: size, height: size, display: 'block' } : { width: '100%', height: '100%', display: 'block' }}
    >
      {/* uyk spokes */}
      <g stroke={spoke} strokeWidth={sw * 0.82}>{lines}</g>
      {/* hoop double ring */}
      <circle cx="50" cy="50" r="30" stroke={hoop} strokeWidth={sw * 1.1} />
      <circle cx="50" cy="50" r="27" stroke={hoop} strokeWidth={sw * 0.5} opacity={0.5} />
      {/* curved dome lattice */}
      <g stroke={lattice} strokeWidth={sw * 0.92} clipPath={`url(#${clipId})`}>
        <path d="M37,24 Q33,50 37,76" />
        <path d="M50,21 L50,79" />
        <path d="M63,24 Q67,50 63,76" />
        <path d="M24,37 Q50,33 76,37" />
        <path d="M21,50 L79,50" />
        <path d="M24,63 Q50,67 76,63" />
      </g>
      {/* knot */}
      <circle cx="50" cy="50" r="3.2" fill={k} stroke="none" />
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="27.5" />
        </clipPath>
      </defs>
    </svg>
  )
}
