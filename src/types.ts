import type { MoodId } from './lib/moods'

export interface Quote {
  id: string
  quote: string
  author: string
  category: MoodId
}

export type CardRatio = 'classic' | 'square' | 'portrait' | 'story'
