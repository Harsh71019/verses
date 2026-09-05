import { forwardRef, useMemo } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import type { PanInfo, Variants } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { Mood } from '../lib/moods'
import { analyzeQuoteWords } from '../lib/wordEmphasis'
import type { WordMotionPreset } from '../lib/wordEmphasis'
import type { Quote } from '../types'
import SemanticElements from './SemanticElements'

export interface InteractiveQuoteCardProps {
  quote: Quote
  mood: Mood
  direction?: number
  onSwipe?: (direction: number) => void
}

const cardVariants: Variants = {
  enter: (direction: number) => ({
    x: direction === 0 ? 0 : direction > 0 ? '-8vw' : '8vw',
    opacity: 0,
    scale: direction === 0 ? 1 : 0.96,
    rotateZ: direction === 0 ? 0 : direction > 0 ? -1.2 : 1.2,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotateZ: 0,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (direction: number) => direction === 0
    ? { x: 0, opacity: 0, scale: 1, transition: { duration: 0.01 } }
    : {
        x: direction > 0 ? '5vw' : '-5vw',
        opacity: 0,
        scale: 0.985,
        transition: { duration: 0.24, ease: [0.55, 0, 1, 0.45] },
      },
}

interface WordAnimationData {
  index: number
  motion: WordMotionPreset
}

const WORD_STARTS: Record<WordMotionPreset, Record<string, string | number>> = {
  rise: { y: '120%', rotate: 3 },
  drop: { y: '-105%', rotate: -3 },
  slide: { x: '-0.7em', y: '18%', rotate: -7 },
  pivot: { y: '70%', rotate: 14, scale: 0.78 },
  focus: { y: '18%', scale: 1.3, filter: 'blur(12px)' },
  pop: { y: '24%', rotate: -5, scale: 0.28 },
}

const wordVariants: Variants = {
  hidden: ({ motion: motionPreset }: WordAnimationData) => ({
    ...WORD_STARTS[motionPreset],
    opacity: 0,
  }),
  visible: ({ index }: WordAnimationData) => ({
    x: 0,
    y: '0%',
    rotate: 0,
    scale: 1,
    filter: 'blur(0px)',
    opacity: 1,
    transition: { duration: 0.72, delay: 0.14 + index * 0.026, ease: [0.16, 1, 0.3, 1] },
  }),
}

function QuoteDecoration({ moodId }: { moodId: Mood['id'] }) {
  if (moodId === 'drive') {
    return <><span className="card-speed-word">GO</span><span className="card-slash slash-one" /><span className="card-slash slash-two" /></>
  }
  if (moodId === 'calm') {
    return <><span className="card-horizon" /><span className="card-moon" /><svg className="card-branch" viewBox="0 0 180 240"><path d="M152 230C112 174 102 101 119 6M110 91C76 75 51 46 38 16M108 138C141 120 160 91 170 58M118 184C80 173 55 149 32 119" /></svg></>
  }
  if (moodId === 'grit') {
    return <><span className="card-stamp">PROVEN<br />UNDER<br />PRESSURE</span><span className="card-rip rip-one" /><span className="card-rip rip-two" /></>
  }
  if (moodId === 'revenge') {
    return <><span className="card-revenge-mark">R</span><span className="card-blade blade-one" /><span className="card-blade blade-two" /><span className="card-verdict">LET THE RESULT SPEAK</span></>
  }
  if (moodId === 'hardwork') {
    return <><span className="card-work-word">WORK</span><span className="card-ruler" /><span className="card-corner-note">REV. 06<br />BUILD / REPEAT</span></>
  }
  if (moodId === 'focus') {
    return <><span className="card-crosshair"><i /><i /><b /></span><span className="card-focus-line" /><span className="card-signal">SIGNAL 100%</span></>
  }
  return <><span className="card-smile">◡</span><span className="card-spark spark-one">✦</span><span className="card-spark spark-two">✦</span><span className="card-tape" /></>
}

export const InteractiveQuoteCard = forwardRef<HTMLDivElement, InteractiveQuoteCardProps>(
  function InteractiveQuoteCard({ quote, mood, direction = 1, onSwipe }, ref) {
    const pointerX = useMotionValue(0)
    const pointerY = useMotionValue(0)
    const smoothX = useSpring(pointerX, { stiffness: 120, damping: 22 })
    const smoothY = useSpring(pointerY, { stiffness: 120, damping: 22 })
    const rotateY = useTransform(smoothX, [-0.5, 0.5], [-1.2, 1.2])
    const rotateX = useTransform(smoothY, [-0.5, 0.5], [1.2, -1.2])
    const prefersReducedMotion = useReducedMotion()
    const words = useMemo(
      () => analyzeQuoteWords(quote.quote, quote.id, mood.id),
      [mood.id, quote.id, quote.quote],
    )

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect()
      pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5)
      pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5)
    }

    const resetPointer = () => {
      pointerX.set(0)
      pointerY.set(0)
    }

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.x < -90 || info.velocity.x < -450) onSwipe?.(-1)
      if (info.offset.x > 90 || info.velocity.x > 450) onSwipe?.(1)
    }

    return (
      <div className="quote-stage-wrap">
        <AnimatePresence custom={direction} mode="sync" initial={false}>
          <motion.div
            key={quote.id}
            ref={ref}
            className={`quote-stage quote-stage-${mood.id}`}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            dragDirectionLock
            onDragEnd={handleDragEnd}
            onPointerMove={handlePointerMove}
            onPointerLeave={resetPointer}
            style={{ rotateX, rotateY, transformPerspective: 1400 }}
          >
            <QuoteDecoration moodId={mood.id} />
            <SemanticElements quote={quote.quote} moodId={mood.id} />

            <div className="quote-meta">
              <span className="quote-index">{quote.id.slice(-2)}</span>
              <span className="quote-category">{mood.eyebrow}</span>
              <span className="quote-rule" />
              <span className="quote-instruction">swipe for another</span>
            </div>

            <blockquote
              className={`quote-copy quote-copy-${quote.quote.length > 110 ? 'long' : quote.quote.length > 70 ? 'medium' : 'short'}`}
              aria-label={`${quote.quote} — ${quote.author}`}
            >
              <p aria-hidden="true">
                {words.map((word, index) => (
                  <span className="word-mask" key={`${quote.id}-${index}`}>
                    <motion.span
                      className="quote-word-reveal"
                      custom={{ index, motion: word.motion } satisfies WordAnimationData}
                      variants={wordVariants}
                      initial={prefersReducedMotion ? false : 'hidden'}
                      animate="visible"
                    >
                      <motion.span
                        className={`quote-word${word.isStrongest ? ' quote-word-hero' : ''}`}
                        data-emphasis={word.isStrongest ? 'strongest' : undefined}
                        animate={prefersReducedMotion || !word.isStrongest
                          ? undefined
                          : { scale: [1, 1.1, 1], y: [0, -4, 0] }}
                        transition={{ duration: 0.68, delay: 0.6 + index * 0.026, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {word.raw}{index < words.length - 1 ? '\u00a0' : ''}
                      </motion.span>
                    </motion.span>
                  </span>
                ))}
              </p>
              <motion.footer initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.48, duration: 0.55 }}>
                <span>Words by</span>
                <strong>{quote.author}</strong>
              </motion.footer>
            </blockquote>

            <motion.button
              type="button"
              className="next-quote"
              aria-label="Show next quote"
              onClick={() => onSwipe?.(-1)}
              whileHover={{ scale: 1.06, rotate: -3 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowRight aria-hidden />
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>
    )
  },
)

InteractiveQuoteCard.displayName = 'InteractiveQuoteCard'
export default InteractiveQuoteCard
