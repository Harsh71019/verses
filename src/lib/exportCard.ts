import { toPng } from 'html-to-image'
import type { MoodId } from './moods'

const FALLBACK_BG: Record<MoodId, string> = {
  drive: '#151312',
  calm: '#dce9e5',
  grit: '#24231f',
  joy: '#5946d2',
  revenge: '#0a0909',
  hardwork: '#0d49a1',
  focus: '#111020',
}

/** Renders the card node to a high-resolution PNG and triggers a browser download.
 * backgroundColor is a solid fallback for browsers that don't rasterize
 * backdrop-filter through html-to-image's foreignObject clone. */
export async function exportCardAsImage(node: HTMLElement, mood: MoodId) {
  const dataUrl = await toPng(node, {
    pixelRatio: 3,
    cacheBust: true,
    backgroundColor: FALLBACK_BG[mood],
  })

  const link = document.createElement('a')
  link.download = `verse-${mood}-${Date.now()}.png`
  link.href = dataUrl
  link.click()
}
