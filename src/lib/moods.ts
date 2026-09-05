export type MoodId = 'drive' | 'calm' | 'grit' | 'joy' | 'revenge' | 'hardwork' | 'focus'

export interface MoodVisual {
  accent: string
  accentAlt: string
  accentGlow: string
  surface: string
  surfaceBorder: string
  ink: string
  inkMuted: string
  ambientMesh: [string, string, string]
}

export interface Mood {
  id: MoodId
  label: string
  eyebrow: string
  tagline: string
  prompt: string
  visual: MoodVisual
}

export const MOODS: Mood[] = [
  {
    id: 'drive',
    label: 'Ambition',
    eyebrow: 'Possibility',
    tagline: 'Build what you imagine',
    prompt: 'Let the future pull you forward.',
    visual: {
      accent: '#ff5634',
      accentAlt: '#dfff38',
      accentGlow: 'rgba(255, 86, 52, 0.46)',
      surface: '#151312',
      surfaceBorder: 'rgba(255, 236, 219, 0.22)',
      ink: '#fff3e8',
      inkMuted: 'rgba(255, 243, 232, 0.62)',
      ambientMesh: ['#35150f', '#17120f', '#090909'],
    },
  },
  {
    id: 'calm',
    label: 'Peace',
    eyebrow: 'Stillness',
    tagline: 'Return to yourself',
    prompt: 'Nothing is asking you to hurry.',
    visual: {
      accent: '#9bcac2',
      accentAlt: '#f3d6a6',
      accentGlow: 'rgba(155, 202, 194, 0.4)',
      surface: '#dce9e5',
      surfaceBorder: 'rgba(21, 61, 65, 0.16)',
      ink: '#153d41',
      inkMuted: 'rgba(21, 61, 65, 0.58)',
      ambientMesh: ['#b9d5cf', '#dce9e5', '#8ab6b1'],
    },
  },
  {
    id: 'grit',
    label: 'Resilience',
    eyebrow: 'Resilience',
    tagline: 'Built through resistance',
    prompt: 'The mark means you kept going.',
    visual: {
      accent: '#db6b36',
      accentAlt: '#eddfc6',
      accentGlow: 'rgba(219, 107, 54, 0.36)',
      surface: '#24231f',
      surfaceBorder: 'rgba(237, 223, 198, 0.22)',
      ink: '#eddfc6',
      inkMuted: 'rgba(237, 223, 198, 0.58)',
      ambientMesh: ['#3b3026', '#1d1d1a', '#0f100f'],
    },
  },
  {
    id: 'joy',
    label: 'Joy',
    eyebrow: 'Delight',
    tagline: 'Let the light in',
    prompt: 'Good things count. Count them loudly.',
    visual: {
      accent: '#ff6f91',
      accentAlt: '#fff29a',
      accentGlow: 'rgba(255, 111, 145, 0.44)',
      surface: '#5946d2',
      surfaceBorder: 'rgba(255, 255, 255, 0.3)',
      ink: '#fffbe8',
      inkMuted: 'rgba(255, 251, 232, 0.7)',
      ambientMesh: ['#ffb0c5', '#7664df', '#342180'],
    },
  },
  {
    id: 'revenge',
    label: 'Revenge',
    eyebrow: 'The comeback',
    tagline: 'Turn it into proof',
    prompt: 'Outgrow every version they dismissed.',
    visual: {
      accent: '#ff2d2d',
      accentAlt: '#d5d2ca',
      accentGlow: 'rgba(255, 45, 45, 0.42)',
      surface: '#0a0909',
      surfaceBorder: 'rgba(255, 45, 45, 0.38)',
      ink: '#f1eee8',
      inkMuted: 'rgba(241, 238, 232, 0.56)',
      ambientMesh: ['#3a0808', '#100909', '#030303'],
    },
  },
  {
    id: 'hardwork',
    label: 'Hard work',
    eyebrow: 'Discipline',
    tagline: 'Earn the impossible',
    prompt: 'Repetition is the hidden superpower.',
    visual: {
      accent: '#ffd43b',
      accentAlt: '#dceaff',
      accentGlow: 'rgba(255, 212, 59, 0.36)',
      surface: '#0d49a1',
      surfaceBorder: 'rgba(220, 234, 255, 0.32)',
      ink: '#f2f7ff',
      inkMuted: 'rgba(242, 247, 255, 0.6)',
      ambientMesh: ['#145db9', '#0b3a85', '#061e49'],
    },
  },
  {
    id: 'focus',
    label: 'Focus',
    eyebrow: 'Clarity',
    tagline: 'One thing. Fully.',
    prompt: 'Your attention builds your future.',
    visual: {
      accent: '#68f4df',
      accentAlt: '#b9a7ff',
      accentGlow: 'rgba(104, 244, 223, 0.35)',
      surface: '#111020',
      surfaceBorder: 'rgba(104, 244, 223, 0.28)',
      ink: '#effffc',
      inkMuted: 'rgba(239, 255, 252, 0.58)',
      ambientMesh: ['#262052', '#111027', '#06060d'],
    },
  },
]

export const MOOD_INDEX: Record<MoodId, number> = MOODS.reduce(
  (acc, mood, i) => ({ ...acc, [mood.id]: i }),
  {} as Record<MoodId, number>,
)
