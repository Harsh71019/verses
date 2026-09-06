import type { TargetAndTransition } from 'framer-motion'
import type { MoodId } from './moods'

export interface QuoteChoreography {
  enter: TargetAndTransition
  center: TargetAndTransition
  exit: TargetAndTransition
  hero: TargetAndTransition
  heroTransition: TargetAndTransition['transition']
}

function stableHash(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Returns a deterministic, mood-specific entrance and emphasis choreography. */
export function getQuoteChoreography(mood: MoodId, quoteId: string, direction: number): QuoteChoreography {
  const seed = stableHash(`${mood}:${quoteId}`)
  const variation = seed % 3
  const sign = direction >= 0 ? 1 : -1
  const swift = [0.62, 0.72, 0.82][variation]

  if (mood === 'drive') {
    return {
      enter: { x: `${sign * (10 + variation * 3)}vw`, opacity: 0, scaleX: 1.08, skewX: sign * -5 },
      center: { x: 0, opacity: 1, scaleX: 1, skewX: 0, transition: { duration: swift, ease: [0.16, 1, 0.3, 1] } },
      exit: { x: `${sign * -7}vw`, opacity: 0, skewX: sign * 3, transition: { duration: 0.24, ease: [0.7, 0, 1, 0.4] } },
      hero: { x: [0, 7, 0], scaleX: [1, 1.08, 1], textShadow: ['0 0 0 transparent', '0 0 22px currentColor', '0 0 0 transparent'] },
      heroTransition: { duration: 0.72, delay: 0.62, ease: [0.16, 1, 0.3, 1] },
    }
  }

  if (mood === 'calm') {
    return {
      enter: { y: 26 + variation * 7, opacity: 0, scale: 0.985, filter: `blur(${12 + variation * 3}px)` },
      center: { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 1.1 + variation * 0.14, ease: [0.22, 1, 0.36, 1] } },
      exit: { y: -12, opacity: 0, filter: 'blur(8px)', transition: { duration: 0.5, ease: 'easeInOut' } },
      hero: { y: [0, -5, 0], opacity: [0.78, 1, 0.78], filter: ['blur(0px)', 'blur(0.4px)', 'blur(0px)'] },
      heroTransition: { duration: 3.8 + variation, delay: 0.9, repeat: Infinity, ease: 'easeInOut' },
    }
  }

  if (mood === 'grit') {
    return {
      enter: { y: sign * -(18 + variation * 5), opacity: 0, scale: 0.92, rotateZ: sign * (1.5 + variation) },
      center: { y: 0, opacity: 1, scale: 1, rotateZ: 0, transition: { type: 'spring', stiffness: 150 + variation * 25, damping: 18, mass: 1.25 } },
      exit: { y: 16, opacity: 0, scale: 0.98, transition: { duration: 0.2, ease: [0.8, 0, 1, 1] } },
      hero: { y: [0, -2, 0, 1, 0], rotateZ: [0, -1, 0.7, 0] },
      heroTransition: { duration: 0.42, delay: 0.68, ease: 'easeOut' },
    }
  }

  if (mood === 'joy') {
    return {
      enter: { y: 32, opacity: 0, scale: 0.78 + variation * 0.03, rotateZ: sign * (4 - variation) },
      center: { y: 0, opacity: 1, scale: 1, rotateZ: 0, transition: { type: 'spring', stiffness: 105 + variation * 18, damping: 12 + variation, mass: 0.9 } },
      exit: { y: -22, opacity: 0, scale: 1.04, rotateZ: sign * -2, transition: { duration: 0.3, ease: 'easeIn' } },
      hero: { scale: [1, 1.14, 0.98, 1.08, 1], rotateZ: [0, sign * -2, sign, 0] },
      heroTransition: { duration: 0.9, delay: 0.58, ease: [0.16, 1, 0.3, 1] },
    }
  }

  if (mood === 'revenge') {
    return {
      enter: { x: `${sign * (5 + variation * 2)}vw`, opacity: 0, clipPath: sign > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)', filter: 'contrast(1.5)' },
      center: { x: 0, opacity: 1, clipPath: 'inset(0 0% 0 0%)', filter: 'contrast(1)', transition: { duration: 0.52 + variation * 0.08, ease: [0.76, 0, 0.24, 1] } },
      exit: { x: `${sign * -4}vw`, opacity: 0, clipPath: sign > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)', transition: { duration: 0.28, ease: [0.76, 0, 0.24, 1] } },
      hero: { x: [0, sign * -8, sign * 4, 0], skewX: [0, sign * -5, sign * 2, 0] },
      heroTransition: { duration: 0.34, delay: 0.64, ease: [0.76, 0, 0.24, 1] },
    }
  }

  if (mood === 'hardwork') {
    return {
      enter: { y: 24, opacity: 0, clipPath: 'inset(100% 0 0 0)', scale: 0.99 },
      center: { y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', scale: 1, transition: { duration: 0.68 + variation * 0.1, ease: [0.16, 1, 0.3, 1] } },
      exit: { opacity: 0, clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.28, ease: 'easeIn' } },
      hero: { y: [0, -5, -5, 0], scaleY: [1, 1.08, 1.08, 1] },
      heroTransition: { duration: 0.58, delay: 0.68, times: [0, 0.42, 0.62, 1], ease: 'easeOut' },
    }
  }

  return {
    enter: { opacity: 0, scale: 1.08 + variation * 0.025, filter: `blur(${14 + variation * 3}px)`, clipPath: 'inset(7% 7% 7% 7%)' },
    center: { opacity: 1, scale: 1, filter: 'blur(0px)', clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.78 + variation * 0.08, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, scale: 0.97, filter: 'blur(9px)', transition: { duration: 0.3, ease: 'easeIn' } },
    hero: { scale: [1, 1.12, 1], filter: ['blur(0px)', 'blur(1px)', 'blur(0px)'] },
    heroTransition: { duration: 1.25, delay: 0.7, ease: [0.16, 1, 0.3, 1] },
  }
}

export function getMotionSeed(value: string): number {
  return stableHash(value)
}
