import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { TargetAndTransition } from 'framer-motion'
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
import { getMotionSeed } from '../lib/motionChoreography'
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

const VISUAL_MOTION: Record<MoodId, { initial: TargetAndTransition; animate: TargetAndTransition; glyph: TargetAndTransition }> = {
  drive: { initial: { opacity: 0, x: '38%', skewX: -9 }, animate: { opacity: 1, x: 0, skewX: 0 }, glyph: { x: [0, 13, 0], scaleX: [1, 1.08, 1] } },
  calm: { initial: { opacity: 0, y: 45, scale: 0.82, filter: 'blur(14px)' }, animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }, glyph: { y: [0, -13, 0], rotate: [0, 2, 0, -2, 0] } },
  grit: { initial: { opacity: 0, y: -28, scale: 0.68, rotate: -7 }, animate: { opacity: 1, y: 0, scale: 1, rotate: 0 }, glyph: { y: [0, -3, 0, 2, 0], rotate: [0, -1.5, 1, 0] } },
  joy: { initial: { opacity: 0, scale: 0.15, rotate: -80 }, animate: { opacity: 1, scale: 1, rotate: 0 }, glyph: { y: [0, -15, 2, -8, 0], rotate: [0, 7, -5, 3, 0] } },
  revenge: { initial: { opacity: 0, x: '-24%', clipPath: 'inset(0 100% 0 0)' }, animate: { opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' }, glyph: { x: [0, -8, 5, 0], skewX: [0, -4, 3, 0] } },
  hardwork: { initial: { opacity: 0, scale: 0.62, rotate: -45 }, animate: { opacity: 1, scale: 1, rotate: 0 }, glyph: { rotate: [0, 3, 0, -3, 0], scale: [1, 1.035, 1] } },
  focus: { initial: { opacity: 0, scale: 1.65, filter: 'blur(18px)' }, animate: { opacity: 1, scale: 1, filter: 'blur(0px)' }, glyph: { scale: [1, 1.06, 1], opacity: [0.62, 1, 0.62] } },
}

function getChipInitial(moodId: MoodId, index: number) {
  if (moodId === 'drive') return { opacity: 0, x: 24 + index * 7, skewX: -6 }
  if (moodId === 'calm') return { opacity: 0, y: 18, filter: 'blur(7px)' }
  if (moodId === 'grit') return { opacity: 0, y: -14, rotate: index % 2 === 0 ? -4 : 4 }
  if (moodId === 'joy') return { opacity: 0, y: 18, scale: 0.35, rotate: index % 2 === 0 ? -12 : 12 }
  if (moodId === 'revenge') return { opacity: 0, x: -25, clipPath: 'inset(0 100% 0 0)' }
  if (moodId === 'hardwork') return { opacity: 0, y: 18, clipPath: 'inset(100% 0 0 0)' }
  return { opacity: 0, scale: 1.35, filter: 'blur(9px)' }
}

export function SemanticElements({ quote, moodId }: SemanticElementsProps) {
  const motifs = useMemo(() => getSemanticMotifs(quote, moodId), [moodId, quote])
  const PrimaryIcon = MOTIF_ICONS[motifs[0].id] ?? Sparkles
  const signature = motifs.map((motif) => motif.id).join('-')
  const motionLanguage = VISUAL_MOTION[moodId]
  const seed = getMotionSeed(`${quote}:${moodId}`)
  const direction = seed % 2 === 0 ? 1 : -1
  const driftDuration = 7.5 + (seed % 5)

  return (
    <div className={`semantic-layer semantic-layer-${moodId}`} aria-hidden="true">
      <motion.div
        key={`visual-${signature}`}
        className="semantic-visual"
        initial={motionLanguage.initial}
        animate={motionLanguage.animate}
        transition={moodId === 'calm'
          ? { duration: 1.35, ease: [0.22, 1, 0.36, 1], delay: 0.08 }
          : { type: 'spring', stiffness: moodId === 'revenge' ? 190 : 82, damping: moodId === 'joy' ? 12 : 17, mass: 1.05, delay: 0.08 }}
      >
        <motion.div
          className="semantic-glyph"
          animate={motionLanguage.glyph}
          transition={{ duration: driftDuration, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PrimaryIcon strokeWidth={0.72} />
        </motion.div>

        <div className="semantic-word-trace">
          {motifs.map((motif, index) => (
            <motion.span
              key={motif.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.14, 0.46, 0.14] }}
              transition={{ duration: 4 + index, delay: 0.7 + index * 0.22, repeat: Infinity, ease: 'easeInOut' }}
            >
              {motif.matchedWord}
            </motion.span>
          ))}
        </div>

        <motion.span
          className="semantic-orbit semantic-orbit-outer"
          animate={{ rotate: direction * 360 }}
          transition={{ duration: 19 + (seed % 7), repeat: Infinity, ease: 'linear' }}
        >
          <i />
          <i />
        </motion.span>
        <motion.span
          className="semantic-orbit semantic-orbit-inner"
          animate={{ rotate: direction * -360 }}
          transition={{ duration: 11 + (seed % 6), repeat: Infinity, ease: 'linear' }}
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
              initial={getChipInitial(moodId, index)}
              animate={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, skewX: 0, filter: 'blur(0px)', clipPath: 'inset(0 0% 0 0)' }}
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
