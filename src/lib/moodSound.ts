import type { MoodId } from './moods'

export interface MoodSoundConfig {
  title: string
  bpm: number
  subdivision: number
  notes: readonly number[]
  pattern: readonly (number | null)[]
  waveform: OscillatorType
  attack: number
  release: number
  level: number
  master: number
  filterFrequency: number
  harmonicLevel: number
}

export const MOOD_SOUND_CONFIGS: Record<MoodId, MoodSoundConfig> = {
  drive: {
    title: 'Forward pulse',
    bpm: 108,
    subdivision: 2,
    notes: [110, 130.81, 146.83, 164.81, 196],
    pattern: [0, null, 2, 0, 3, null, 4, 2, 0, 1, null, 3, 4, null, 2, 1],
    waveform: 'sawtooth',
    attack: 0.018,
    release: 0.38,
    level: 0.34,
    master: 0.105,
    filterFrequency: 1_050,
    harmonicLevel: 0.18,
  },
  calm: {
    title: 'Still water',
    bpm: 52,
    subdivision: 1,
    notes: [146.83, 185, 220, 293.66, 329.63],
    pattern: [0, null, 2, null, 1, null, 3, null, 0, null, 4, null],
    waveform: 'sine',
    attack: 0.48,
    release: 2.8,
    level: 0.48,
    master: 0.085,
    filterFrequency: 1_650,
    harmonicLevel: 0.12,
  },
  grit: {
    title: 'Ground pressure',
    bpm: 76,
    subdivision: 2,
    notes: [73.42, 87.31, 98, 110, 130.81],
    pattern: [0, null, 0, 2, null, 1, 0, null, 3, null, 0, 4, null, 2, 1, null],
    waveform: 'square',
    attack: 0.012,
    release: 0.52,
    level: 0.26,
    master: 0.09,
    filterFrequency: 480,
    harmonicLevel: 0.08,
  },
  joy: {
    title: 'Open sky',
    bpm: 116,
    subdivision: 2,
    notes: [261.63, 293.66, 329.63, 392, 440, 523.25],
    pattern: [0, 2, 3, null, 1, 3, 4, 5, 3, 2, 0, null, 2, 4, 5, 3],
    waveform: 'triangle',
    attack: 0.025,
    release: 0.46,
    level: 0.28,
    master: 0.08,
    filterFrequency: 2_400,
    harmonicLevel: 0.16,
  },
  revenge: {
    title: 'Red resolve',
    bpm: 64,
    subdivision: 2,
    notes: [69.3, 82.41, 103.83, 123.47, 138.59],
    pattern: [0, null, null, 0, 2, null, 1, null, 0, null, 3, 2, null, 4, 1, null],
    waveform: 'sawtooth',
    attack: 0.032,
    release: 0.82,
    level: 0.3,
    master: 0.09,
    filterFrequency: 410,
    harmonicLevel: 0.1,
  },
  hardwork: {
    title: 'Workshop rhythm',
    bpm: 94,
    subdivision: 2,
    notes: [82.41, 98, 123.47, 146.83, 164.81],
    pattern: [0, 2, 0, null, 1, 3, 0, 2, 0, null, 4, 3, 1, 2, 0, null],
    waveform: 'square',
    attack: 0.01,
    release: 0.34,
    level: 0.22,
    master: 0.085,
    filterFrequency: 760,
    harmonicLevel: 0.09,
  },
  focus: {
    title: 'Deep signal',
    bpm: 60,
    subdivision: 1,
    notes: [130.81, 196, 261.63, 293.66, 392],
    pattern: [0, null, 1, null, 2, null, null, 3, 1, null, 4, null],
    waveform: 'sine',
    attack: 0.22,
    release: 1.65,
    level: 0.4,
    master: 0.075,
    filterFrequency: 1_100,
    harmonicLevel: 0.13,
  },
}

type AudioGlobal = typeof globalThis & {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

/**
 * A small generative sequencer that creates an original, category-specific score
 * with the Web Audio API. The context is created lazily after a user gesture.
 */
export class MoodSoundEngine {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private scheduler: ReturnType<typeof setInterval> | undefined
  private suspendTimer: ReturnType<typeof setTimeout> | undefined
  private mood: MoodId = 'drive'
  private step = 0
  private nextNoteTime = 0
  private enabled = false

  async start(mood: MoodId): Promise<boolean> {
    const context = this.ensureContext()
    if (!context || !this.master) return false

    clearTimeout(this.suspendTimer)
    try {
      await context.resume()
    } catch {
      return false
    }

    if (context.state !== 'running') return false

    this.enabled = true
    this.mood = mood
    this.step = 0
    this.nextNoteTime = context.currentTime + 0.05
    this.fadeMaster(MOOD_SOUND_CONFIGS[mood].master, 0.55)
    this.startScheduler()
    return true
  }

  stop(): void {
    this.enabled = false
    this.stopScheduler()
    this.fadeMaster(0.0001, 0.16)
    clearTimeout(this.suspendTimer)
    this.suspendTimer = setTimeout(() => {
      if (!this.enabled && this.context?.state === 'running') void this.context.suspend()
    }, 190)
  }

  setMood(mood: MoodId): void {
    this.mood = mood
    if (!this.enabled || !this.context || !this.master) return

    const now = this.context.currentTime
    const gain = this.master.gain
    gain.cancelScheduledValues(now)
    gain.setValueAtTime(Math.max(gain.value, 0.0001), now)
    gain.linearRampToValueAtTime(0.0001, now + 0.13)
    gain.linearRampToValueAtTime(MOOD_SOUND_CONFIGS[mood].master, now + 0.72)
    this.step = 0
    this.nextNoteTime = now + 0.15
  }

  async setPageVisible(visible: boolean): Promise<void> {
    if (!this.context || !this.enabled) return
    try {
      if (visible) {
        await this.context.resume()
        this.nextNoteTime = this.context.currentTime + 0.05
      } else {
        await this.context.suspend()
      }
    } catch {
      // Visibility changes should never interrupt the visual experience.
    }
  }

  async dispose(): Promise<void> {
    this.enabled = false
    this.stopScheduler()
    clearTimeout(this.suspendTimer)
    const context = this.context
    this.context = null
    this.master = null
    if (!context || context.state === 'closed') return
    try {
      await context.close()
    } catch {
      // The browser may already own a closing audio context.
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.context) return this.context

    const audioGlobal = globalThis as AudioGlobal
    const AudioContextConstructor = audioGlobal.AudioContext ?? audioGlobal.webkitAudioContext
    if (!AudioContextConstructor) return null

    const context = new AudioContextConstructor()
    const master = context.createGain()
    const compressor = context.createDynamicsCompressor()
    master.gain.value = 0.0001
    compressor.threshold.value = -20
    compressor.knee.value = 18
    compressor.ratio.value = 5
    compressor.attack.value = 0.012
    compressor.release.value = 0.24
    master.connect(compressor).connect(context.destination)
    this.context = context
    this.master = master
    return context
  }

  private fadeMaster(value: number, duration: number): void {
    if (!this.context || !this.master) return
    const now = this.context.currentTime
    const gain = this.master.gain
    gain.cancelScheduledValues(now)
    gain.setValueAtTime(Math.max(gain.value, 0.0001), now)
    gain.exponentialRampToValueAtTime(Math.max(value, 0.0001), now + duration)
  }

  private startScheduler(): void {
    this.stopScheduler()
    this.scheduleAhead()
    this.scheduler = setInterval(() => this.scheduleAhead(), 100)
  }

  private stopScheduler(): void {
    clearInterval(this.scheduler)
    this.scheduler = undefined
  }

  private scheduleAhead(): void {
    const context = this.context
    if (!context || !this.enabled || context.state !== 'running') return

    const config = MOOD_SOUND_CONFIGS[this.mood]
    const stepDuration = 60 / config.bpm / config.subdivision
    const scheduleUntil = context.currentTime + 0.28

    while (this.nextNoteTime < scheduleUntil) {
      const patternValue = config.pattern[this.step % config.pattern.length]
      if (patternValue !== null) this.scheduleNote(config.notes[patternValue], this.nextNoteTime, config, this.step)
      this.step += 1
      this.nextNoteTime += stepDuration
    }
  }

  private scheduleNote(frequency: number, time: number, config: MoodSoundConfig, step: number): void {
    const context = this.context
    const master = this.master
    if (!context || !master) return

    const oscillator = context.createOscillator()
    const harmonic = context.createOscillator()
    const filter = context.createBiquadFilter()
    const envelope = context.createGain()
    const harmonicGain = context.createGain()
    const panner = context.createStereoPanner()
    const endTime = time + config.attack + config.release

    oscillator.type = config.waveform
    oscillator.frequency.setValueAtTime(frequency, time)
    harmonic.type = config.waveform === 'square' ? 'triangle' : 'sine'
    harmonic.frequency.setValueAtTime(frequency * 2, time)
    harmonic.detune.setValueAtTime(step % 2 === 0 ? 4 : -4, time)
    harmonicGain.gain.setValueAtTime(config.harmonicLevel, time)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(config.filterFrequency, time)
    filter.Q.setValueAtTime(config.waveform === 'sine' ? 0.7 : 2.2, time)
    panner.pan.setValueAtTime(((step % 5) - 2) * 0.12, time)
    envelope.gain.setValueAtTime(0.0001, time)
    envelope.gain.exponentialRampToValueAtTime(config.level, time + config.attack)
    envelope.gain.exponentialRampToValueAtTime(0.0001, endTime)

    oscillator.connect(filter)
    harmonic.connect(harmonicGain).connect(filter)
    filter.connect(envelope).connect(panner).connect(master)
    oscillator.start(time)
    harmonic.start(time)
    oscillator.stop(endTime + 0.04)
    harmonic.stop(endTime + 0.04)

    oscillator.onended = () => {
      oscillator.disconnect()
      harmonic.disconnect()
      harmonicGain.disconnect()
      filter.disconnect()
      envelope.disconnect()
      panner.disconnect()
    }
  }
}

export function getMoodSoundTitle(mood: MoodId): string {
  return MOOD_SOUND_CONFIGS[mood].title
}
