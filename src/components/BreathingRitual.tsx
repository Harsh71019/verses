import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Mood } from '../lib/moods'
import { analyzeQuoteWords } from '../lib/wordEmphasis'
import type { Quote } from '../types'

interface BreathingRitualProps {
  open: boolean
  quote: Quote
  mood: Mood
  onClose: () => void
}

const PHASES = [
  { id: 'inhale', label: 'Breathe in', cue: 'let the word arrive', duration: 4_000, scale: 1.34 },
  { id: 'hold', label: 'Be still', cue: 'keep it with you', duration: 2_000, scale: 1.34 },
  { id: 'exhale', label: 'Breathe out', cue: 'release everything else', duration: 6_000, scale: 0.82 },
] as const

export function BreathingRitual({ open, quote, mood, onClose }: BreathingRitualProps) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const prefersReducedMotion = useReducedMotion()
  const anchorWord = useMemo(
    () => analyzeQuoteWords(quote.quote, quote.id, mood.id).find((word) => word.isStrongest)?.raw ?? mood.label,
    [mood.id, mood.label, quote.id, quote.quote],
  )
  const phase = PHASES[phaseIndex]

  useEffect(() => {
    if (!open) return
    const timer = window.setTimeout(
      () => setPhaseIndex((current) => (current + 1) % PHASES.length),
      phase.duration,
    )
    return () => window.clearTimeout(timer)
  }, [open, phase.duration, phaseIndex])

  return (
    <AnimatePresence>
      {open ? (
        <motion.section
          className="breathing-ritual"
          aria-label="Guided breathing reflection"
          aria-live="polite"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="breathing-veil"
            initial={{ backdropFilter: 'blur(0px)' }}
            animate={{ backdropFilter: 'blur(18px)' }}
            transition={{ duration: 0.8 }}
          />

          <button type="button" className="breathing-close" onClick={onClose} aria-label="End reflection">
            <X aria-hidden />
            <span>End reflection</span>
            <kbd>Esc</kbd>
          </button>

          <div className="breathing-center">
            <motion.div
              key={`${quote.id}-${phase.id}`}
              className={`breathing-orbit breathing-orbit-${phase.id}`}
              initial={prefersReducedMotion ? false : { scale: phase.id === 'inhale' ? 0.82 : 1.34 }}
              animate={{ scale: prefersReducedMotion ? 1 : phase.scale }}
              transition={{ duration: prefersReducedMotion ? 0 : phase.duration / 1000, ease: 'easeInOut' }}
            >
              <span className="breathing-ring breathing-ring-one" />
              <span className="breathing-ring breathing-ring-two" />
              <span className="breathing-ring breathing-ring-three" />
              <motion.strong
                key={anchorWord}
                initial={{ opacity: 0, filter: 'blur(12px)', y: 8 }}
                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                {anchorWord}
              </motion.strong>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={phase.id}
                className="breathing-copy"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.32 }}
              >
                <span>{phase.label}</span>
                <small>{phase.cue}</small>
              </motion.div>
            </AnimatePresence>

            <div className="breathing-timeline" aria-hidden>
              {PHASES.map((item, index) => (
                <span key={item.id} className={index === phaseIndex ? 'is-current' : ''}>
                  <i>{item.label}</i>
                  <b>
                    {index === phaseIndex ? (
                      <motion.em
                        key={`${phaseIndex}-${quote.id}`}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: phase.duration / 1000, ease: 'linear' }}
                      />
                    ) : null}
                  </b>
                </span>
              ))}
            </div>
          </div>

          <p className="breathing-quote">“{quote.quote}”</p>
        </motion.section>
      ) : null}
    </AnimatePresence>
  )
}

export default BreathingRitual
