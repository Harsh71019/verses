import type { MoodId } from './moods'
import { getSemanticMotifs } from './semanticMotifs'

export type WordMotionPreset = 'drop' | 'focus' | 'pivot' | 'pop' | 'rise' | 'slide'

export interface AnalyzedQuoteWord {
  raw: string
  normalized: string
  score: number
  isStrongest: boolean
  motion: WordMotionPreset
}

const STOP_WORDS = new Set([
  'a', 'about', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'but', 'by', 'can', 'could', 'did', 'do', 'does',
  'doing', 'each', 'even', 'every', 'for', 'from', 'get', 'gets', 'got', 'had', 'has', 'have',
  'he', 'her', 'here', 'hers', 'him', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its',
  'just', 'may', 'me', 'more', 'most', 'much', 'my', 'no', 'not', 'of', 'on', 'once', 'only',
  'or', 'other', 'our', 'ours', 'out', 'over', 'said', 'she', 'so', 'some', 'such', 'than', 'that',
  'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'up', 'us', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'why',
  'will', 'with', 'would', 'you', 'your', 'yours',
])

const POWER_PATTERNS: Array<{ pattern: RegExp; weight: number }> = [
  { pattern: /^(?:courage|fearless|brave|strength|strong|power)/i, weight: 26 },
  { pattern: /^(?:freedom|liberty|truth|purpose|destiny)/i, weight: 25 },
  { pattern: /^(?:victor|success|triumph|champion|conquer|achiev)/i, weight: 24 },
  { pattern: /^(?:impossible|possible|belie|dream|vision|hope)/i, weight: 23 },
  { pattern: /^(?:rise|rising|climb|higher|great|limitless)/i, weight: 22 },
  { pattern: /^(?:disciplin|persist|resilien|endure|effort|commit)/i, weight: 21 },
  { pattern: /^(?:create|build|work|action|change|begin|start)/i, weight: 20 },
  { pattern: /^(?:love|heart|joy|happy|happiness|kind|grat)/i, weight: 19 },
  { pattern: /^(?:wisdom|learn|knowledge|understand|lesson)/i, weight: 18 },
  { pattern: /^(?:focus|clarity|mind|attention|choice|decide)/i, weight: 18 },
  { pattern: /^(?:fire|flame|burn|spark|light|bright|shine)/i, weight: 18 },
  { pattern: /^(?:forgive|mercy|enemy|revenge|pain|sacrifice|risk|fear|doubt)/i, weight: 18 },
  { pattern: /^(?:peace|calm|quiet|still|breathe|silence)/i, weight: 17 },
  { pattern: /^(?:future|today|tomorrow|moment|time)/i, weight: 15 },
]

const MOOD_PATTERNS: Record<MoodId, RegExp> = {
  drive: /^(?:ambition|begin|belie|bold|build|create|dream|future|imagin|possible|rise|start|vision)/i,
  calm: /^(?:accept|balance|breathe|calm|forgive|gentle|peace|quiet|release|still|within)/i,
  grit: /^(?:courage|endure|fight|persist|pressure|recover|resilien|scar|stand|strength|survive)/i,
  joy: /^(?:celebrate|delight|grat|happy|heart|joy|kind|laugh|light|love|smile)/i,
  revenge: /^(?:comeback|dismiss|enemy|forgive|outgrow|proof|result|revenge|silence|succeed|victor)/i,
  hardwork: /^(?:build|commit|disciplin|effort|grind|habit|labor|practice|repeat|sweat|work)/i,
  focus: /^(?:attention|choice|clarity|decide|direction|focus|mind|priority|signal|single|vision)/i,
}

const MOOD_MOTION_PRESETS: Record<MoodId, readonly WordMotionPreset[]> = {
  drive: ['rise', 'slide', 'pop'],
  calm: ['focus', 'rise'],
  grit: ['drop', 'pivot', 'rise'],
  joy: ['pop', 'pivot', 'rise'],
  revenge: ['slide', 'drop', 'pivot'],
  hardwork: ['drop', 'rise', 'slide'],
  focus: ['focus', 'slide'],
}

function normalizeWord(word: string) {
  return word.toLocaleLowerCase().replace(/[^\p{L}\p{N}'’-]/gu, '').replace(/[’']/g, '')
}

function stableHash(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

export function analyzeQuoteWords(quote: string, quoteId: string, moodId: MoodId): AnalyzedQuoteWord[] {
  const rawWords = quote.trim().split(/\s+/)
  const normalizedWords = rawWords.map(normalizeWord)
  const frequencies = new Map<string, number>()

  for (const word of normalizedWords) {
    if (word && !STOP_WORDS.has(word)) frequencies.set(word, (frequencies.get(word) ?? 0) + 1)
  }

  const semanticWords = new Set(
    getSemanticMotifs(quote, moodId)
      .map((motif) => normalizeWord(motif.matchedWord))
      .filter(Boolean),
  )

  const scoredWords = rawWords.map((raw, index) => {
    const normalized = normalizedWords[index]
    const isStopWord = normalized.length < 3 || STOP_WORDS.has(normalized)
    const powerWeight = POWER_PATTERNS.find(({ pattern }) => pattern.test(normalized))?.weight ?? 0
    const semanticWeight = semanticWords.has(normalized) ? 16 : 0
    const moodWeight = MOOD_PATTERNS[moodId].test(normalized) ? 9 : 0
    const repetitionWeight = Math.max(0, (frequencies.get(normalized) ?? 1) - 1) * 5
    const lengthWeight = Math.min(normalized.length, 12) * 0.62
    const edgeWeight = index === 0 || index === rawWords.length - 1 ? 0.35 : 0
    const score = isStopWord ? -100 : powerWeight + semanticWeight + moodWeight + repetitionWeight + lengthWeight + edgeWeight
    const motionPresets = MOOD_MOTION_PRESETS[moodId]
    const motionIndex = stableHash(`${quoteId}:${normalized}:${index}`) % motionPresets.length

    return {
      raw,
      normalized,
      score,
      isStrongest: false,
      motion: motionPresets[motionIndex],
    }
  })

  let strongestIndex = 0
  for (let index = 1; index < scoredWords.length; index += 1) {
    if (scoredWords[index].score > scoredWords[strongestIndex].score) strongestIndex = index
  }

  return scoredWords.map((word, index) => ({ ...word, isStrongest: index === strongestIndex }))
}
