import { AnimatePresence, motion } from 'framer-motion'
import type { MoodId } from '../lib/moods'

const wipe = {
  initial: { opacity: 0, scale: 1.035 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1, transition: { duration: 0.18 } },
}

function DriveScene() {
  return (
    <div className="atmosphere drive-scene">
      <motion.div className="drive-sun" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 95, damping: 14, delay: 0.15 }} />
      <motion.div className="drive-track track-one" animate={{ x: ['-8%', '8%', '-8%'] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="drive-track track-two" animate={{ x: ['5%', '-6%', '5%'] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.span className="giant-word" initial={{ x: -180, opacity: 0 }} animate={{ x: 0, opacity: 0.055 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>MOVE</motion.span>
    </div>
  )
}

function CalmScene() {
  return (
    <div className="atmosphere calm-scene">
      <motion.div className="calm-orb" animate={{ y: [0, -18, 0], x: [0, 8, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      <svg className="calm-ripples" viewBox="0 0 900 500" preserveAspectRatio="none">
        {[120, 190, 260, 330].map((radius, index) => (
          <motion.ellipse key={radius} cx="620" cy="310" rx={radius} ry={radius * 0.36} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.32 - index * 0.05 }} transition={{ duration: 1.8, delay: 0.1 + index * 0.12, ease: [0.16, 1, 0.3, 1] }} />
        ))}
      </svg>
      <motion.div className="calm-haze haze-one" animate={{ x: [-20, 30, -20], scale: [1, 1.08, 1] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="calm-haze haze-two" animate={{ x: [20, -25, 20], y: [0, 14, 0] }} transition={{ duration: 19, repeat: Infinity, ease: 'easeInOut' }} />
    </div>
  )
}

function GritScene() {
  return (
    <div className="atmosphere grit-scene">
      <motion.div className="grit-strike" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
      <svg className="grit-contours" viewBox="0 0 1000 700" preserveAspectRatio="none">
        <motion.path d="M-20 580 C160 410 230 690 420 505 S740 315 1040 460" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} />
        <motion.path d="M-30 630 C150 465 250 730 445 550 S760 370 1050 510" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} />
        <motion.path d="M-40 680 C160 520 270 780 470 605 S790 420 1060 565" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} />
      </svg>
      <motion.span className="grit-coordinate" initial={{ opacity: 0 }} animate={{ opacity: 0.36 }} transition={{ delay: 0.8 }}>41° 18′ / KEEP NORTH</motion.span>
    </div>
  )
}

function JoyScene() {
  const confetti = Array.from({ length: 12 }, (_, index) => index)
  return (
    <div className="atmosphere joy-scene">
      <motion.div className="joy-flower" initial={{ scale: 0, rotate: -80 }} animate={{ scale: 1, rotate: 8 }} transition={{ type: 'spring', stiffness: 95, damping: 12 }}>
        <i /><i /><i /><i /><i /><b />
      </motion.div>
      <motion.div className="joy-blob" animate={{ rotate: [0, 12, -7, 0], borderRadius: ['34% 66% 64% 36%', '56% 44% 32% 68%', '34% 66% 64% 36%'] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }} />
      {confetti.map((item) => (
        <motion.i
          className={`confetti confetti-${item + 1}`}
          key={item}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: [0, 18, 0], opacity: 1, rotate: [0, 150, 300] }}
          transition={{ duration: 4 + (item % 4), delay: item * 0.06, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function RevengeScene() {
  return (
    <div className="atmosphere revenge-scene">
      <motion.div className="revenge-eclipse" initial={{ scale: 0.35, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
      <motion.div className="revenge-cut cut-one" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.72, delay: 0.16, ease: [0.76, 0, 0.24, 1] }} />
      <motion.div className="revenge-cut cut-two" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.82, delay: 0.24, ease: [0.76, 0, 0.24, 1] }} />
      <motion.span className="revenge-word" initial={{ opacity: 0, letterSpacing: '0.8em' }} animate={{ opacity: 0.08, letterSpacing: '0.16em' }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}>PROOF</motion.span>
    </div>
  )
}

function HardWorkScene() {
  return (
    <div className="atmosphere hardwork-scene">
      <div className="blueprint-grid" />
      <motion.div className="work-gear gear-large" animate={{ rotate: 360 }} transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}><i /><i /><i /><i /></motion.div>
      <motion.div className="work-gear gear-small" animate={{ rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}><i /><i /><i /><i /></motion.div>
      <motion.div className="work-measure" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
      <span className="work-note">EFFORT × TIME</span>
    </div>
  )
}

function FocusScene() {
  return (
    <div className="atmosphere focus-scene">
      <motion.div className="focus-ring ring-one" initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 0.34 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} />
      <motion.div className="focus-ring ring-two" animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.38, 0.18] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="focus-beam" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }} />
      <motion.span className="focus-point" animate={{ boxShadow: ['0 0 0 0 rgba(104,244,223,.5)', '0 0 0 24px rgba(104,244,223,0)', '0 0 0 0 rgba(104,244,223,0)'] }} transition={{ duration: 2.6, repeat: Infinity }} />
    </div>
  )
}

const scenes: Record<MoodId, () => React.JSX.Element> = {
  drive: DriveScene,
  calm: CalmScene,
  grit: GritScene,
  joy: JoyScene,
  revenge: RevengeScene,
  hardwork: HardWorkScene,
  focus: FocusScene,
}

export function AmbientBackground({ mood }: { mood: MoodId }) {
  const Scene = scenes[mood]
  return (
    <div aria-hidden className="ambient-root">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={mood}
          className={`ambient-layer ambient-${mood}`}
          variants={wipe}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 1.05, ease: [0.76, 0, 0.24, 1] }}
        >
          <Scene />
        </motion.div>
      </AnimatePresence>
      <div className="paper-noise" />
    </div>
  )
}

export default AmbientBackground
