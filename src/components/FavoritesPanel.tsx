import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import type { Mood, MoodId } from '../lib/moods'
import type { Quote } from '../types'

interface FavoritesPanelProps {
  open: boolean
  quotes: Quote[]
  moods: Mood[]
  activeQuoteId: string
  onSelect: (quote: Quote) => void
  onRemove: (id: string) => void
  onClose: () => void
}

export function FavoritesPanel({ open, quotes, moods, activeQuoteId, onSelect, onRemove, onClose }: FavoritesPanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const moodById = new Map<MoodId, Mood>(moods.map((mood) => [mood.id, mood]))

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
            className="settings-modal favorites-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="favorites-title"
            initial={{ opacity: 0, y: 34, scale: 0.94, rotateX: -7 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            <header className="settings-header">
              <div>
                <span className="settings-eyebrow">Kept</span>
                <h2 id="favorites-title">Words you didn&rsquo;t want to lose</h2>
              </div>
              <motion.button
                ref={closeRef}
                type="button"
                className="settings-close"
                aria-label="Close saved quotes"
                onClick={onClose}
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.88 }}
              >
                <X aria-hidden />
              </motion.button>
            </header>

            {quotes.length === 0 ? (
              <div className="favorites-empty">
                <Heart aria-hidden />
                <p>Tap the heart on a quote that stops you. It&rsquo;ll wait here.</p>
              </div>
            ) : (
              <ul className="favorites-list">
                {quotes.map((quote) => {
                  const quoteMood = moodById.get(quote.category)
                  const isActive = quote.id === activeQuoteId
                  return (
                    <li key={quote.id} className={`favorite-row${isActive ? ' is-active' : ''}`}>
                      <button type="button" className="favorite-row-main" onClick={() => onSelect(quote)}>
                        <span
                          className="favorite-row-dot"
                          style={{ background: quoteMood?.visual.accent ?? 'currentColor' }}
                          aria-hidden
                        />
                        <span className="favorite-row-copy">
                          <span className="favorite-row-quote">&ldquo;{quote.quote}&rdquo;</span>
                          <span className="favorite-row-author">{quote.author}</span>
                        </span>
                      </button>
                      <motion.button
                        type="button"
                        className="favorite-row-remove"
                        aria-label={`Remove "${quote.quote}" from saved`}
                        onClick={() => onRemove(quote.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.85 }}
                      >
                        <Heart aria-hidden fill="currentColor" />
                      </motion.button>
                    </li>
                  )
                })}
              </ul>
            )}

            <footer className="settings-footer">
              <span>{quotes.length} saved</span>
              <motion.button type="button" onClick={onClose} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.94 }}>
                Done
              </motion.button>
            </footer>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export default FavoritesPanel
