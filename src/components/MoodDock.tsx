import { useEffect, useRef } from 'react'
import type { ComponentType } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CloudSun, Crosshair, Flame, Hammer, Mountain, PartyPopper, Swords } from 'lucide-react'
import type { Mood, MoodId } from '../lib/moods'

interface MoodDockProps {
  moods: Mood[]
  active: MoodId
  onSelect: (id: MoodId) => void
}

const MOOD_ICONS: Record<MoodId, ComponentType<{ className?: string }>> = {
  drive: Flame,
  calm: CloudSun,
  grit: Mountain,
  joy: PartyPopper,
  revenge: Swords,
  hardwork: Hammer,
  focus: Crosshair,
}

export function MoodDock({ moods, active, onSelect }: MoodDockProps) {
  const activeTabRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [active])

  return (
    <motion.nav
      className="mood-dock"
      role="tablist"
      aria-label="Choose a mood"
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 20, delay: 0.12 }}
    >
      <span className="mood-dock-label">I need</span>
      <div className="mood-tabs">
        {moods.map((mood) => {
          const Icon = MOOD_ICONS[mood.id]
          const isActive = mood.id === active
          return (
            <motion.button
              key={mood.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`${mood.label}: ${mood.tagline}`}
              className="mood-tab"
              ref={isActive ? activeTabRef : undefined}
              onClick={() => onSelect(mood.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.94 }}
            >
              {isActive ? (
                <motion.span
                  layoutId="mood-active"
                  className="mood-active"
                  transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                />
              ) : null}
              <Icon className="mood-icon" />
              <span>{mood.label}</span>
              <AnimatePresence>
                {isActive ? (
                  <motion.i
                    className="active-dot"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  />
                ) : null}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </motion.nav>
  )
}

export default MoodDock
