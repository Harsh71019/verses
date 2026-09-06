import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, Headphones, Pause, Play, RotateCcw, X } from 'lucide-react'
import type { Mood } from '../lib/moods'
import { NATURE_SCENES, NatureSoundEngine } from '../lib/natureSound'
import type { NatureSceneId } from '../lib/natureSound'
import { analyzeQuoteWords } from '../lib/wordEmphasis'
import type { Quote } from '../types'

interface BreathingRitualProps {
  open: boolean
  quote: Quote
  mood: Mood
  onClose: () => void
}

const PHASES = [
  { id: 'inhale', label: 'Breathe in', cue: 'let the word arrive', duration: 4_000, scale: 1.3 },
  { id: 'hold', label: 'Be still', cue: 'keep it with you', duration: 2_000, scale: 1.3 },
  { id: 'exhale', label: 'Breathe out', cue: 'release everything else', duration: 6_000, scale: 0.82 },
] as const

const SESSION_LENGTHS = [
  { cycles: 1, label: '12 sec' },
  { cycles: 3, label: '36 sec' },
  { cycles: 5, label: '1 min' },
] as const

export function BreathingRitual({ open, quote, mood, onClose }: BreathingRitualProps) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [completedCycles, setCompletedCycles] = useState(0)
  const [targetCycles, setTargetCycles] = useState(3)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [natureScene, setNatureScene] = useState<NatureSceneId>('forest')
  const [naturePlaying, setNaturePlaying] = useState(false)
  const natureEngine = useRef<NatureSoundEngine | null>(null)
  const prefersReducedMotion = useReducedMotion()
  const anchorWord = useMemo(
    () => analyzeQuoteWords(quote.quote, quote.id, mood.id).find((word) => word.isStrongest)?.raw ?? mood.label,
    [mood.id, mood.label, quote.id, quote.quote],
  )
  const phase = PHASES[phaseIndex]

  useEffect(() => {
    if (!open || sessionComplete) return
    const timer = window.setTimeout(() => {
      const nextPhase = (phaseIndex + 1) % PHASES.length
      if (nextPhase === 0) {
        const nextCompletedCycles = completedCycles + 1
        setCompletedCycles(nextCompletedCycles)
        if (nextCompletedCycles >= targetCycles) {
          setSessionComplete(true)
          return
        }
      }
      setPhaseIndex(nextPhase)
    }, phase.duration)
    return () => window.clearTimeout(timer)
  }, [completedCycles, open, phase.duration, phaseIndex, sessionComplete, targetCycles])

  useEffect(() => () => {
    void natureEngine.current?.dispose()
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      void natureEngine.current?.setPageVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const toggleNature = useCallback(async () => {
    const engine = natureEngine.current ?? new NatureSoundEngine()
    natureEngine.current = engine
    if (naturePlaying) {
      engine.stop()
      setNaturePlaying(false)
      return
    }
    const started = await engine.start(natureScene)
    setNaturePlaying(started)
  }, [naturePlaying, natureScene])

  const selectNatureScene = useCallback((scene: NatureSceneId) => {
    setNatureScene(scene)
    natureEngine.current?.setScene(scene)
  }, [])

  const startSession = useCallback((cycles = targetCycles) => {
    setTargetCycles(cycles)
    setCompletedCycles(0)
    setPhaseIndex(0)
    setSessionComplete(false)
  }, [targetCycles])

  return (
    <AnimatePresence>
      {open ? (
        <motion.section
          className={`breathing-ritual sanctuary-scene sanctuary-${natureScene}`}
          aria-label="Sanctuary guided reflection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65 }}
        >
          <div className="sanctuary-landscape" aria-hidden>
            <motion.i className="sanctuary-sun" animate={prefersReducedMotion ? undefined : { y: [0, -7, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
            <span className="sanctuary-ridge sanctuary-ridge-far" />
            <span className="sanctuary-ridge sanctuary-ridge-near" />
            <span className="sanctuary-water" />
            <motion.b className="sanctuary-leaf leaf-one" animate={prefersReducedMotion ? undefined : { x: [0, 34, 4], y: [0, 80, 155], rotate: [12, 120, 260] }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }} />
            <motion.b className="sanctuary-leaf leaf-two" animate={prefersReducedMotion ? undefined : { x: [0, -26, 18], y: [0, 100, 185], rotate: [0, -100, -220] }} transition={{ duration: 15, repeat: Infinity, ease: 'linear', delay: -6 }} />
          </div>

          <header className="sanctuary-header">
            <div className="sanctuary-brand">
              <span>V</span>
              <p><strong>Sanctuary</strong><small>A quiet room inside Verse</small></p>
            </div>
            <button type="button" className="breathing-close" onClick={onClose} aria-label="Leave Sanctuary">
              <X aria-hidden />
              <span>Leave Sanctuary</span>
              <kbd>Esc</kbd>
            </button>
          </header>

          <aside className="sanctuary-panel sanctuary-sound-panel" aria-label="Nature sound controls">
            <div className="sanctuary-panel-heading">
              <Headphones aria-hidden />
              <span><strong>Nature room</strong><small>{naturePlaying ? 'playing softly' : 'sound is optional'}</small></span>
            </div>
            <div className="nature-options">
              {NATURE_SCENES.map((scene) => (
                <button
                  type="button"
                  key={scene.id}
                  className={natureScene === scene.id ? 'is-selected' : ''}
                  onClick={() => selectNatureScene(scene.id)}
                  aria-pressed={natureScene === scene.id}
                  title={scene.caption}
                >
                  {scene.label}
                </button>
              ))}
            </div>
            <button type="button" className="nature-play" onClick={() => void toggleNature()}>
              {naturePlaying ? <Pause aria-hidden /> : <Play aria-hidden />}
              <span>{naturePlaying ? 'Pause nature' : 'Listen'}</span>
            </button>
          </aside>

          <main className="breathing-center" aria-live="polite">
            <AnimatePresence mode="wait">
              {sessionComplete ? (
                <motion.div
                  key="complete"
                  className="sanctuary-complete"
                  initial={{ opacity: 0, scale: 0.9, filter: 'blur(12px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="complete-mark"><Check aria-hidden /></span>
                  <small>Reset complete</small>
                  <strong>You returned.</strong>
                  <p>Carry <em>{anchorWord}</em> with you.</p>
                  <button type="button" onClick={() => startSession()}><RotateCcw aria-hidden /> Again</button>
                </motion.div>
              ) : (
                <motion.div key="breathing" className="breathing-practice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <motion.div
                    key={`${quote.id}-${phase.id}-${completedCycles}`}
                    className={`breathing-orbit breathing-orbit-${phase.id}`}
                    initial={prefersReducedMotion ? false : { scale: phase.id === 'inhale' ? 0.82 : 1.3 }}
                    animate={{ scale: prefersReducedMotion ? 1 : phase.scale }}
                    transition={{ duration: prefersReducedMotion ? 0 : phase.duration / 1000, ease: 'easeInOut' }}
                  >
                    <span className="breathing-ring breathing-ring-one" />
                    <span className="breathing-ring breathing-ring-two" />
                    <span className="breathing-ring breathing-ring-three" />
                    <strong>{anchorWord}</strong>
                  </motion.div>

                  <AnimatePresence mode="wait">
                    <motion.div key={phase.id} className="breathing-copy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.32 }}>
                      <span>{phase.label}</span>
                      <small>{phase.cue}</small>
                    </motion.div>
                  </AnimatePresence>

                  <div className="breathing-timeline" aria-hidden>
                    {PHASES.map((item, index) => (
                      <span key={item.id} className={index === phaseIndex ? 'is-current' : ''}>
                        <i>{item.label}</i>
                        <b>{index === phaseIndex ? <motion.em key={`${phaseIndex}-${completedCycles}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: phase.duration / 1000, ease: 'linear' }} /> : null}</b>
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <aside className="sanctuary-panel sanctuary-time-panel" aria-label="Reflection length">
            <span className="sanctuary-kicker">Your reset</span>
            <strong>{targetCycles === 1 ? 'One breath' : `${targetCycles} cycles`}</strong>
            <div className="session-options">
              {SESSION_LENGTHS.map((session) => (
                <button
                  type="button"
                  key={session.cycles}
                  className={targetCycles === session.cycles ? 'is-selected' : ''}
                  onClick={() => startSession(session.cycles)}
                  aria-pressed={targetCycles === session.cycles}
                >
                  {session.label}
                </button>
              ))}
            </div>
            <span className="session-count">{Math.min(completedCycles + 1, targetCycles)} / {targetCycles}</span>
          </aside>

          <blockquote className="breathing-quote">“{quote.quote}” <cite>— {quote.author}</cite></blockquote>
        </motion.section>
      ) : null}
    </AnimatePresence>
  )
}

export default BreathingRitual
