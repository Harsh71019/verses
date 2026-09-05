import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock3, Pause, Play, X } from 'lucide-react'

interface SlideshowSettingsProps {
  open: boolean
  enabled: boolean
  interval: number
  intervals: readonly number[]
  onEnabledChange: (enabled: boolean) => void
  onIntervalChange: (interval: number) => void
  onClose: () => void
}

function formatInterval(interval: number) {
  if (interval < 60_000) return `${interval / 1000} sec`
  return `${interval / 60_000} min`
}

export function SlideshowSettings({ open, enabled, interval, intervals, onEnabledChange, onIntervalChange, onClose }: SlideshowSettingsProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="settings-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <motion.section
            className="settings-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="slideshow-title"
            initial={{ opacity: 0, y: 34, scale: 0.94, rotateX: -7 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <header className="settings-header">
              <div>
                <span className="settings-eyebrow">Playback</span>
                <h2 id="slideshow-title">Let the words flow</h2>
              </div>
              <motion.button ref={closeRef} type="button" className="settings-close" aria-label="Close settings" onClick={onClose} whileHover={{ rotate: 90 }} whileTap={{ scale: 0.88 }}>
                <X aria-hidden />
              </motion.button>
            </header>

            <button
              type="button"
              className={`slideshow-toggle ${enabled ? 'is-enabled' : ''}`}
              role="switch"
              aria-checked={enabled}
              onClick={() => onEnabledChange(!enabled)}
            >
              <span className="toggle-icon">{enabled ? <Play aria-hidden /> : <Pause aria-hidden />}</span>
              <span className="toggle-copy">
                <strong>Auto-play quotes</strong>
                <small>{enabled ? `Moving every ${formatInterval(interval)}` : 'Quotes stay put until you move them'}</small>
              </span>
              <span className="toggle-track" aria-hidden>
                <motion.i layout transition={{ type: 'spring', stiffness: 460, damping: 30 }} />
              </span>
            </button>

            <div className="timing-section">
              <div className="timing-heading">
                <Clock3 aria-hidden />
                <span>Change quote every</span>
              </div>
              <div className="timing-grid" role="radiogroup" aria-label="Slideshow timing">
                {intervals.map((option) => {
                  const selected = option === interval
                  return (
                    <motion.button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      className="timing-option"
                      onClick={() => onIntervalChange(option)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.94 }}
                    >
                      {selected ? <motion.span layoutId="selected-time" className="timing-selected" /> : null}
                      <span>{formatInterval(option)}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <footer className="settings-footer">
              <span>{enabled ? 'Slideshow is on' : 'Slideshow is off'}</span>
              <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.94 }}>Done</motion.button>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default SlideshowSettings
