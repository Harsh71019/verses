import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Minimize2 } from 'lucide-react'
import quotesData from './data/quotes.json'
import { MOODS } from './lib/moods'
import type { MoodId } from './lib/moods'
import type { Quote } from './types'
import { AmbientBackground } from './components/AmbientBackground'
import { InteractiveQuoteCard } from './components/InteractiveQuoteCard'
import { Toolbar } from './components/Toolbar'
import { MoodDock } from './components/MoodDock'
import { SlideshowSettings } from './components/SlideshowSettings'
import { copyText } from './lib/clipboard'
import { exportCardAsImage } from './lib/exportCard'

const QUOTES = quotesData as Quote[]
const SLIDESHOW_INTERVALS = [5_000, 15_000, 30_000, 60_000, 300_000] as const
const SLIDESHOW_STORAGE_KEY = 'verse:slideshow:v1'

interface SlideshowPreferences {
  enabled: boolean
  interval: number
}

function loadSlideshowPreferences(): SlideshowPreferences {
  try {
    const stored = window.localStorage.getItem(SLIDESHOW_STORAGE_KEY)
    if (!stored) return { enabled: false, interval: 15_000 }
    const parsed = JSON.parse(stored) as Partial<SlideshowPreferences>
    const interval = SLIDESHOW_INTERVALS.includes(parsed.interval as (typeof SLIDESHOW_INTERVALS)[number])
      ? parsed.interval as number
      : 15_000
    return { enabled: parsed.enabled === true, interval }
  } catch {
    return { enabled: false, interval: 15_000 }
  }
}

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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [slideshow, setSlideshow] = useState<SlideshowPreferences>(loadSlideshowPreferences)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [ambientExitVisible, setAmbientExitVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const ambientHideTimer = useRef<number | undefined>(undefined)
  const nativeFullscreenEntered = useRef(false)

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

  const closeSettings = useCallback(() => setSettingsOpen(false), [])
  const setSlideshowEnabled = useCallback((enabled: boolean) => {
    setSlideshow((current) => ({ ...current, enabled }))
  }, [])
  const setSlideshowInterval = useCallback((interval: number) => {
    setSlideshow((current) => ({ ...current, interval }))
  }, [])

  const revealAmbientExit = useCallback(() => {
    setAmbientExitVisible(true)
    window.clearTimeout(ambientHideTimer.current)
    ambientHideTimer.current = window.setTimeout(() => setAmbientExitVisible(false), 2_200)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      setIsFullscreen(false)
      window.clearTimeout(ambientHideTimer.current)
      setAmbientExitVisible(false)

      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen()
        } catch {
          // Ambient mode has still exited even if the browser owns fullscreen state.
        }
      }
      return
    }

    setSettingsOpen(false)
    setIsFullscreen(true)
    revealAmbientExit()

    if (!document.fullscreenEnabled) return

    try {
      await document.documentElement.requestFullscreen({ navigationUI: 'hide' })
    } catch {
      // Embedded browsers can deny native fullscreen; the full-viewport fallback remains active.
    }
  }, [isFullscreen, revealAmbientExit])

  useEffect(() => {
    window.localStorage.setItem(SLIDESHOW_STORAGE_KEY, JSON.stringify(slideshow))
  }, [slideshow])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreen = document.fullscreenElement !== null

      if (fullscreen) {
        nativeFullscreenEntered.current = true
        setIsFullscreen(true)
        revealAmbientExit()
      } else if (nativeFullscreenEntered.current) {
        nativeFullscreenEntered.current = false
        setIsFullscreen(false)
        window.clearTimeout(ambientHideTimer.current)
        setAmbientExitVisible(false)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.clearTimeout(ambientHideTimer.current)
    }
  }, [revealAmbientExit])

  useEffect(() => {
    if (!isFullscreen) return

    window.addEventListener('pointermove', revealAmbientExit, { passive: true })
    window.addEventListener('touchstart', revealAmbientExit, { passive: true })
    return () => {
      window.removeEventListener('pointermove', revealAmbientExit)
      window.removeEventListener('touchstart', revealAmbientExit)
    }
  }, [isFullscreen, revealAmbientExit])

  useEffect(() => {
    if (!slideshow.enabled || settingsOpen) return

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') nextQuote(-1)
    }, slideshow.interval)

    return () => window.clearInterval(timer)
  }, [slideshow.enabled, slideshow.interval, settingsOpen, nextQuote])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) return
      if (event.key === 'Escape' && isFullscreen) {
        toggleFullscreen()
      } else if (event.key === 'ArrowRight' || event.key === ' ') {
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
      } else if (event.key.toLowerCase() === 'f' && !event.metaKey && !event.ctrlKey) {
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextQuote, handleMoodChange, handleCopy, handleExport, isFullscreen, toggleFullscreen])

  const activeMood = MOODS.find((item) => item.id === mood) ?? MOODS[0]

  return (
    <div className={`app-shell mood-${mood}${isFullscreen ? ' is-ambient' : ''}${ambientExitVisible ? ' ambient-exit-visible' : ''}`}>
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
        slideshowEnabled={slideshow.enabled}
        slideshowCycleKey={`${quote.id}-${slideshow.interval}`}
        slideshowInterval={slideshow.interval}
        onSettings={() => setSettingsOpen(true)}
        onFullscreen={toggleFullscreen}
      />

      <SlideshowSettings
        open={settingsOpen}
        enabled={slideshow.enabled}
        interval={slideshow.interval}
        intervals={SLIDESHOW_INTERVALS}
        onEnabledChange={setSlideshowEnabled}
        onIntervalChange={setSlideshowInterval}
        onClose={closeSettings}
      />

      <div className="key-hint" aria-hidden>
        <span>← →</span> move through words
      </div>

      <AnimatePresence>
        {isFullscreen && ambientExitVisible ? (
          <motion.button
            type="button"
            className="ambient-exit"
            aria-label="Exit fullscreen ambience"
            onClick={toggleFullscreen}
            initial={{ opacity: 0, y: -12, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <Minimize2 aria-hidden />
            <span>Exit ambience</span>
            <kbd>Esc</kbd>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
