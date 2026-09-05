import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import quotesData from './data/quotes.json'
import { MOODS } from './lib/moods'
import type { MoodId } from './lib/moods'
import type { Quote } from './types'
import { AmbientBackground } from './components/AmbientBackground'
import { InteractiveQuoteCard } from './components/InteractiveQuoteCard'
import { Toolbar } from './components/Toolbar'
import { MoodDock } from './components/MoodDock'
import { copyText } from './lib/clipboard'
import { exportCardAsImage } from './lib/exportCard'

const QUOTES = quotesData as Quote[]

function getQuotesForMood(mood: MoodId): Quote[] {
  return QUOTES.filter((quote) => quote.category === mood)
}

function randomQuote(mood: MoodId, exceptId?: string) {
  const pool = getQuotesForMood(mood)
  const options = pool.length > 1 ? pool.filter((quote) => quote.id !== exceptId) : pool
  return options[Math.floor(Math.random() * options.length)]
}

export default function App() {
  const [mood, setMood] = useState<MoodId>('drive')
  const [quote, setQuote] = useState<Quote>(() => randomQuote('drive'))
  const [direction, setDirection] = useState(1)
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    document.documentElement.dataset.mood = mood
  }, [mood])

  const handleMoodChange = useCallback((next: MoodId) => {
    if (next === mood) return
    setDirection(0)
    setMood(next)
    setQuote(randomQuote(next))
  }, [mood])

  const nextQuote = useCallback(
    (dir = -1) => {
      setDirection(dir)
      const pool = getQuotesForMood(mood)
      const currentIndex = pool.findIndex((item) => item.id === quote.id)
      const nextIndex = dir < 0
        ? (currentIndex + 1) % pool.length
        : (currentIndex - 1 + pool.length) % pool.length
      setQuote(pool[nextIndex])
    },
    [mood, quote.id],
  )

  const handleCopy = useCallback(async () => {
    const ok = await copyText(`“${quote.quote}” — ${quote.author}`)
    if (!ok) return
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }, [quote])

  const handleExport = useCallback(async () => {
    if (!cardRef.current || exporting) return
    setExporting(true)
    try {
      await exportCardAsImage(cardRef.current, mood)
    } catch (error) {
      console.error('Export failed', error)
    } finally {
      setExporting(false)
    }
  }, [mood, exporting])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) return
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        nextQuote(-1)
      } else if (event.key === 'ArrowLeft') {
        nextQuote(1)
      } else if (['1', '2', '3', '4', '5', '6', '7'].includes(event.key)) {
        handleMoodChange(MOODS[Number(event.key) - 1].id)
      } else if (event.key.toLowerCase() === 'c' && !event.metaKey && !event.ctrlKey) {
        handleCopy()
      } else if (event.key.toLowerCase() === 'e') {
        handleExport()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextQuote, handleMoodChange, handleCopy, handleExport])

  const activeMood = MOODS.find((item) => item.id === mood) ?? MOODS[0]

  return (
    <div className={`app-shell mood-${mood}`}>
      <AmbientBackground mood={mood} />

      <motion.header
        className="brand"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="brand-mark">V</span>
        <span className="brand-name">Verse</span>
      </motion.header>

      <MoodDock moods={MOODS} active={mood} onSelect={handleMoodChange} />

      <main className="quote-canvas">
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={`intro-${mood}`}
            className="mood-intro"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.14 } }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <span>{activeMood.tagline}</span>
            <p>{activeMood.prompt}</p>
          </motion.div>
        </AnimatePresence>

        <InteractiveQuoteCard
          ref={cardRef}
          quote={quote}
          mood={activeMood}
          direction={direction}
          onSwipe={nextQuote}
        />
      </main>

      <Toolbar
        onNew={() => nextQuote(-1)}
        onExport={handleExport}
        onCopy={handleCopy}
        copied={copied}
        exporting={exporting}
      />

      <div className="key-hint" aria-hidden>
        <span>← →</span> move through words
      </div>
    </div>
  )
}
