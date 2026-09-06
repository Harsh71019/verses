import type { MoodId } from './moods'
import type { Quote } from '../types'

const STREAK_STORAGE_KEY = 'verse:streak:v1'

export interface StreakState {
  count: number
  longest: number
  lastVisit: string
}

const EMPTY_STREAK: StreakState = { count: 0, longest: 0, lastVisit: '' }

function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86_400_000
  return Math.round((new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) / msPerDay)
}

export function loadStreak(): StreakState {
  try {
    const stored = window.localStorage.getItem(STREAK_STORAGE_KEY)
    if (!stored) return EMPTY_STREAK
    const parsed = JSON.parse(stored)
    return {
      count: typeof parsed.count === 'number' ? parsed.count : 0,
      longest: typeof parsed.longest === 'number' ? parsed.longest : 0,
      lastVisit: typeof parsed.lastVisit === 'string' ? parsed.lastVisit : '',
    }
  } catch {
    return EMPTY_STREAK
  }
}

function saveStreak(state: StreakState) {
  try {
    window.localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable — the streak just won't persist across visits.
  }
}

/** Advances the streak by exactly one calendar day of continuity, resets on a
 * missed day, and is a no-op on a repeat same-day call — safe to run on every mount. */
export function registerVisit(previous: StreakState): StreakState {
  const today = todayKey()
  if (previous.lastVisit === today) return previous

  const gap = previous.lastVisit ? daysBetween(previous.lastVisit, today) : Number.POSITIVE_INFINITY
  const count = gap === 1 ? previous.count + 1 : 1
  const next: StreakState = { count, longest: Math.max(previous.longest, count), lastVisit: today }
  saveStreak(next)
  return next
}

function hashSeed(input: string): number {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (Math.imul(hash, 31) + input.charCodeAt(index)) >>> 0
  }
  return hash
}

/** A deterministic pick from date + mood — everyone who opens Verse in this mood
 * today lands on the same line, so it reads as a daily anchor, not another shuffle. */
export function getDailyQuote(mood: MoodId, pool: Quote[], date = new Date()): Quote {
  const seed = hashSeed(`${todayKey(date)}:${mood}`)
  return pool[seed % pool.length]
}
