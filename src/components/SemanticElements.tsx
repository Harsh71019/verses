import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AudioLines,
  BookOpen,
  Crosshair,
  Flame,
  Hammer,
  Heart,
  Hourglass,
  Mountain,
  Route,
  Sparkles,
  Sprout,
  Sun,
  Telescope,
  TrendingUp,
  Trophy,
  Waves,
  Wind,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { MoodId } from '../lib/moods'
import { getSemanticMotifs } from '../lib/semanticMotifs'
import type { SemanticMotifId } from '../lib/semanticMotifs'

const MOTIF_ICONS: Record<SemanticMotifId, LucideIcon> = {
  ascent: TrendingUp,
  courage: Zap,
  craft: Hammer,
  fire: Flame,
  focus: Crosshair,
  growth: Sprout,
  heart: Heart,
  journey: Route,
  learning: BookOpen,
  light: Sun,
  mountain: Mountain,
  possibility: Telescope,
  stillness: Waves,
  storm: Wind,
  time: Hourglass,
  victory: Trophy,
  voice: AudioLines,
}

interface SemanticElementsProps {
  quote: string
  moodId: MoodId
}

export function SemanticElements({ quote, moodId }: SemanticElementsProps) {
  const motifs = useMemo(() => getSemanticMotifs(quote, moodId), [moodId, quote])
  const PrimaryIcon = MOTIF_ICONS[motifs[0].id] ?? Sparkles
  const signature = motifs.map((motif) => motif.id).join('-')

  return (
    <div className="semantic-layer" aria-hidden="true">
      <motion.div
        key={`visual-${signature}`}
        className="semantic-visual"
        initial={{ opacity: 0, scale: 0.52, rotate: -22 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 72, damping: 16, mass: 1.1, delay: 0.1 }}
      >
        <motion.div
          className="semantic-glyph"
          animate={{ y: [0, -10, 0], rotate: [0, 3.5, 0, -2.5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PrimaryIcon strokeWidth={0.72} />
        </motion.div>

        <motion.span
          className="semantic-orbit semantic-orbit-outer"
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        >
          <i />
          <i />
        </motion.span>
        <motion.span
          className="semantic-orbit semantic-orbit-inner"
          animate={{ rotate: -360 }}
          transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
        >
          <i />
        </motion.span>
      </motion.div>

      <div className="semantic-signals">
        <motion.span
          className="semantic-signal-line"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.85, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
        />
        {motifs.map((motif, index) => {
          const Icon = MOTIF_ICONS[motif.id]
          return (
            <motion.span
              className="semantic-signal-chip"
              key={motif.id}
              initial={{ opacity: 0, y: 13, scale: 0.82 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.48 + index * 0.1 }}
            >
              <Icon strokeWidth={1.7} />
              <span>{motif.label}</span>
              <small>{motif.matchedWord}</small>
            </motion.span>
          )
        })}
      </div>
    </div>
  )
}

export default SemanticElements
