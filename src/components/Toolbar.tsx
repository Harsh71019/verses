import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, Download, LoaderCircle, Maximize2, Settings, Shuffle } from 'lucide-react'

interface ToolbarProps {
  onNew: () => void
  onExport: () => void
  onCopy: () => void
  copied: boolean
  exporting: boolean
  slideshowEnabled: boolean
  slideshowCycleKey: string
  slideshowInterval: number
  onSettings: () => void
  onFullscreen: () => void
}

export function Toolbar({ onNew, onExport, onCopy, copied, exporting, slideshowEnabled, slideshowCycleKey, slideshowInterval, onSettings, onFullscreen }: ToolbarProps) {
  const [shuffleRotation, setShuffleRotation] = useState(0)

  const shuffle = () => {
    setShuffleRotation((rotation) => rotation + 180)
    onNew()
  }

  return (
    <motion.div
      className="toolbar"
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
    >
      <button type="button" className="toolbar-text-button" onClick={shuffle}>
        <motion.span animate={{ rotate: shuffleRotation }} transition={{ type: 'spring', stiffness: 240, damping: 18 }}>
          <Shuffle aria-hidden />
        </motion.span>
        New words
      </button>

      <span className="toolbar-divider" />

      <motion.button type="button" className="toolbar-icon-button" aria-label={copied ? 'Quote copied' : 'Copy quote'} onClick={onCopy} whileTap={{ scale: 0.86 }}>
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.span key="check" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
              <Check aria-hidden />
            </motion.span>
          ) : (
            <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Copy aria-hidden />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <motion.button
        type="button"
        className="toolbar-icon-button"
        aria-label="Enter fullscreen ambience"
        onClick={onFullscreen}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.84 }}
      >
        <Maximize2 aria-hidden />
      </motion.button>

      <motion.button
        type="button"
        className="toolbar-icon-button settings-trigger"
        aria-label={slideshowEnabled ? 'Slideshow settings, autoplay on' : 'Slideshow settings, autoplay off'}
        onClick={onSettings}
        whileHover={{ rotate: 20 }}
        whileTap={{ scale: 0.86 }}
      >
        <Settings aria-hidden />
        {slideshowEnabled ? (
          <motion.span
            key={slideshowCycleKey}
            className="slideshow-progress"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: slideshowInterval / 1000, ease: 'linear' }}
          />
        ) : null}
      </motion.button>

      <motion.button
        type="button"
        className="toolbar-export-button"
        aria-label="Download quote as image"
        onClick={onExport}
        disabled={exporting}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.92 }}
      >
        {exporting ? <LoaderCircle className="spin" aria-hidden /> : <Download aria-hidden />}
        <span>{exporting ? 'Making' : 'Keep it'}</span>
      </motion.button>
    </motion.div>
  )
}

export default Toolbar
