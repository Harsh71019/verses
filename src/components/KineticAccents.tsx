import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import { getMotionSeed } from '../lib/motionChoreography'
import type { MoodId } from '../lib/moods'
import { getSemanticMotifs } from '../lib/semanticMotifs'

interface KineticAccentsProps {
  quote: string
  quoteId: string
  moodId: MoodId
}

const SYMBOLS: Record<MoodId, readonly string[]> = {
  drive: ['→', '↗', '///', '+'],
  calm: ['○', '⌁', '·', '◌'],
  grit: ['×', '▲', '—', '◆'],
  joy: ['✦', '●', '◡', '✺'],
  revenge: ['/', '//', '×', '—'],
  hardwork: ['+', '⌗', '□', '↳'],
  focus: ['⌖', '+', '·', '[]'],
}

type AccentStyle = CSSProperties & {
  '--accent-x': string
  '--accent-y': string
  '--accent-size': string
  '--accent-delay': string
  '--accent-duration': string
  '--accent-rotation': string
  [key: `--${string}`]: string | number
}

function seededFraction(seed: number, offset: number): number {
  const value = Math.sin(seed * 0.0001 + offset * 78.233) * 43_758.5453
  return value - Math.floor(value)
}

export function KineticAccents({ quote, quoteId, moodId }: KineticAccentsProps) {
  const accents = useMemo(() => {
    const seed = getMotionSeed(`${quoteId}:${moodId}`)
    const motifs = getSemanticMotifs(quote, moodId)
    const symbols = SYMBOLS[moodId]
    const count = moodId === 'calm' ? 7 : moodId === 'joy' ? 11 : 9

    return Array.from({ length: count }, (_, index) => {
      const style: AccentStyle = {
        '--accent-x': `${4 + seededFraction(seed, index * 6 + 1) * 92}%`,
        '--accent-y': `${7 + seededFraction(seed, index * 6 + 2) * 86}%`,
        '--accent-size': `${0.58 + seededFraction(seed, index * 6 + 3) * 1.05}rem`,
        '--accent-delay': `${-seededFraction(seed, index * 6 + 4) * 7}s`,
        '--accent-duration': `${3.4 + seededFraction(seed, index * 6 + 5) * 6.5}s`,
        '--accent-rotation': `${Math.round(seededFraction(seed, index * 6 + 6) * 90 - 45)}deg`,
      }
      return {
        symbol: symbols[(seed + index + motifs.length) % symbols.length],
        label: motifs[index % motifs.length].label,
        style,
      }
    })
  }, [moodId, quote, quoteId])

  return (
    <div className={`kinetic-field kinetic-${moodId}`} aria-hidden="true">
      {accents.map((accent, index) => (
        <span key={`${accent.symbol}-${index}`} style={accent.style} data-motif={accent.label}>
          {accent.symbol}
        </span>
      ))}
    </div>
  )
}

export default KineticAccents
