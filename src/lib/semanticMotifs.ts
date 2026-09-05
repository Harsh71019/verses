import type { MoodId } from './moods'

export type SemanticMotifId =
  | 'ascent'
  | 'courage'
  | 'craft'
  | 'fire'
  | 'focus'
  | 'growth'
  | 'heart'
  | 'journey'
  | 'learning'
  | 'light'
  | 'mountain'
  | 'possibility'
  | 'stillness'
  | 'storm'
  | 'time'
  | 'victory'
  | 'voice'

export interface SemanticMotif {
  id: SemanticMotifId
  label: string
  matchedWord: string
}

interface SemanticRule {
  id: SemanticMotifId
  label: string
  patterns: RegExp[]
  weight?: number
}

const SEMANTIC_RULES: SemanticRule[] = [
  { id: 'fire', label: 'inner fire', patterns: [/\bfire\b/i, /\bflame\w*\b/i, /\bburn\w*\b/i, /\bblaz\w*\b/i, /\bspark\w*\b/i], weight: 2 },
  { id: 'growth', label: 'growth', patterns: [/\bgrow\w*\b/i, /\bseed\w*\b/i, /\bbloom\w*\b/i, /\broot\w*\b/i, /\bplant\w*\b/i] },
  { id: 'ascent', label: 'ascent', patterns: [/\brise\b/i, /\brising\b/i, /\bclimb\w*\b/i, /\bhigher\b/i, /\babove\b/i, /\belevat\w*\b/i] },
  { id: 'light', label: 'light', patterns: [/\blight\w*\b/i, /\bsun(?:s|rise|set|light|shine)?\b/i, /\bstars?\b/i, /\bstarlight\b/i, /\bbright\w*\b/i, /\bglow\w*\b/i, /\bshine\w*\b/i] },
  { id: 'storm', label: 'weather it', patterns: [/\bstorm\w*\b/i, /\brain\w*\b/i, /\bwinds?\b/i, /\bwindy\b/i, /\bthunder\w*\b/i, /\bocean\w*\b/i, /\bwave\w*\b/i] },
  { id: 'mountain', label: 'endurance', patterns: [/\bmountain\w*\b/i, /\brocks?\b/i, /\brocky\b/i, /\bstone\w*\b/i, /\bfoundation\w*\b/i, /\bendure\w*\b/i] },
  { id: 'journey', label: 'the way', patterns: [/\bjourney\w*\b/i, /\bpath\w*\b/i, /\broad\w*\b/i, /\bdirection\w*\b/i, /\bsteps?\b/i, /\bwalk\w*\b/i] },
  { id: 'time', label: 'time', patterns: [/\btime\b/i, /\bmoments?\b/i, /\btoday\b/i, /\btomorrow\b/i, /\byesterday\b/i, /\bfuture\b/i, /\bpast\b/i, /\byears?\b/i] },
  { id: 'craft', label: 'the work', patterns: [/\bwork\w*\b/i, /\bbuild\w*\b/i, /\bcraft\w*\b/i, /\bpractice\w*\b/i, /\beffort\w*\b/i, /\bdisciplin\w*\b/i, /\bhabit\w*\b/i] },
  { id: 'focus', label: 'focus', patterns: [/\bfocus\w*\b/i, /\battention\b/i, /\bclarity\b/i, /\bmind\b/i, /\bthought\w*\b/i, /\bconcentrat\w*\b/i] },
  { id: 'possibility', label: 'possibility', patterns: [/\bdream\w*\b/i, /\bimagin\w*\b/i, /\bbelie\w*\b/i, /\bpossible\b/i, /\bvision\w*\b/i, /\bhope\w*\b/i] },
  { id: 'victory', label: 'victory', patterns: [/\bwins?\b/i, /\bwinning\b/i, /\bwinners?\b/i, /\bvictor\w*\b/i, /\bsuccess\w*\b/i, /\bachiev\w*\b/i, /\bconquer\w*\b/i, /\bchampion\w*\b/i] },
  { id: 'courage', label: 'strength', patterns: [/\bcourage\w*\b/i, /\bbrave\w*\b/i, /\bstrong\w*\b/i, /\bstrength\b/i, /\bpower\w*\b/i, /\bfearless\b/i] },
  { id: 'learning', label: 'wisdom', patterns: [/\blearn\w*\b/i, /\bknowledge\b/i, /\bwisdom\b/i, /\bbooks?\b/i, /\bteach\w*\b/i, /\blesson\w*\b/i] },
  { id: 'heart', label: 'heart', patterns: [/\blove\w*\b/i, /\bheart\w*\b/i, /\bjoy\w*\b/i, /\bhapp\w*\b/i, /\blaugh\w*\b/i, /\bgrat\w*\b/i, /\bkind\w*\b/i] },
  { id: 'stillness', label: 'stillness', patterns: [/\bpeace\w*\b/i, /\bcalm\w*\b/i, /\bquiet\w*\b/i, /\bstill\w*\b/i, /\bsilence\b/i, /\bbreathe?\b/i] },
  { id: 'voice', label: 'your voice', patterns: [/\bvoice\b/i, /\bspeak\w*\b/i, /\bwords?\b/i, /\bsay\b/i, /\bsaid\b/i, /\btell\w*\b/i] },
]

const FALLBACK_MOTIFS: Record<MoodId, SemanticMotif> = {
  drive: { id: 'possibility', label: 'possibility', matchedWord: 'ambition' },
  calm: { id: 'stillness', label: 'stillness', matchedWord: 'peace' },
  grit: { id: 'mountain', label: 'endurance', matchedWord: 'resilience' },
  joy: { id: 'heart', label: 'heart', matchedWord: 'joy' },
  revenge: { id: 'victory', label: 'the comeback', matchedWord: 'revenge' },
  hardwork: { id: 'craft', label: 'the work', matchedWord: 'discipline' },
  focus: { id: 'focus', label: 'focus', matchedWord: 'clarity' },
}

export function getSemanticMotifs(quote: string, moodId: MoodId, limit = 3): SemanticMotif[] {
  const matches = SEMANTIC_RULES.flatMap((rule) => {
    const hits = rule.patterns
      .map((pattern) => quote.match(pattern))
      .filter((match): match is RegExpMatchArray => match !== null)

    if (hits.length === 0) return []

    const firstHit = hits.reduce((earliest, hit) => Math.min(earliest, hit.index ?? quote.length), quote.length)

    return [{
      motif: {
        id: rule.id,
        label: rule.label,
        matchedWord: hits[0][0].toLocaleLowerCase(),
      },
      score: hits.length * 10 + (rule.weight ?? 0),
      firstHit,
    }]
  })

  matches.sort((a, b) => b.score - a.score || a.firstHit - b.firstHit)

  const motifs = matches.slice(0, limit).map(({ motif }) => motif)
  return motifs.length > 0 ? motifs : [FALLBACK_MOTIFS[moodId]]
}
