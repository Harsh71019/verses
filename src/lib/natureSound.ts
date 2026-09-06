export type NatureSceneId = 'forest' | 'rain' | 'tide'

export interface NatureScene {
  id: NatureSceneId
  label: string
  caption: string
}

export const NATURE_SCENES: readonly NatureScene[] = [
  { id: 'forest', label: 'Forest', caption: 'leaves + distant birds' },
  { id: 'rain', label: 'Rain', caption: 'soft rain on a canopy' },
  { id: 'tide', label: 'Tide', caption: 'slow water at the shore' },
]

interface NatureVoice {
  bus: GainNode
  nodes: AudioNode[]
  sources: AudioScheduledSourceNode[]
  timers: ReturnType<typeof setInterval>[]
}

type AudioGlobal = typeof globalThis & {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

/**
 * Creates an original nature bed entirely with Web Audio. Long looping noise is
 * shaped into weather while sparse oscillators supply birds and water droplets.
 */
export class NatureSoundEngine {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private voice: NatureVoice | null = null
  private enabled = false
  private noiseBuffers = new Map<string, AudioBuffer>()

  async start(scene: NatureSceneId): Promise<boolean> {
    const context = this.ensureContext()
    if (!context || !this.master) return false

    try {
      await context.resume()
    } catch {
      return false
    }
    if (context.state !== 'running') return false

    this.enabled = true
    this.fadeMaster(0.36, 1.1)
    this.replaceVoice(scene)
    return true
  }

  setScene(scene: NatureSceneId): void {
    if (this.enabled) this.replaceVoice(scene)
  }

  stop(): void {
    this.enabled = false
    this.fadeMaster(0.0001, 0.45)
    const voice = this.voice
    this.voice = null
    if (voice) setTimeout(() => this.disposeVoice(voice), 520)
  }

  async setPageVisible(visible: boolean): Promise<void> {
    if (!this.context || !this.enabled) return
    try {
      if (visible) await this.context.resume()
      else await this.context.suspend()
    } catch {
      // Visibility changes should never interrupt the ritual UI.
    }
  }

  async dispose(): Promise<void> {
    this.enabled = false
    if (this.voice) this.disposeVoice(this.voice)
    this.voice = null
    this.noiseBuffers.clear()
    const context = this.context
    this.context = null
    this.master = null
    if (!context || context.state === 'closed') return
    try {
      await context.close()
    } catch {
      // A browser can close an audio context before React completes cleanup.
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
    compressor.knee.value = 24
    compressor.ratio.value = 4
    compressor.attack.value = 0.02
    compressor.release.value = 0.5
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

  private replaceVoice(scene: NatureSceneId): void {
    const context = this.context
    const master = this.master
    if (!context || !master) return

    const previous = this.voice
    const bus = context.createGain()
    bus.gain.setValueAtTime(0.0001, context.currentTime)
    bus.gain.exponentialRampToValueAtTime(1, context.currentTime + 1.2)
    bus.connect(master)
    const voice: NatureVoice = { bus, nodes: [bus], sources: [], timers: [] }
    this.voice = voice

    if (scene === 'forest') this.buildForest(voice)
    if (scene === 'rain') this.buildRain(voice)
    if (scene === 'tide') this.buildTide(voice)

    if (!previous) return
    previous.bus.gain.cancelScheduledValues(context.currentTime)
    previous.bus.gain.setValueAtTime(Math.max(previous.bus.gain.value, 0.0001), context.currentTime)
    previous.bus.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.85)
    setTimeout(() => this.disposeVoice(previous), 920)
  }

  private buildForest(voice: NatureVoice): void {
    const context = this.context
    if (!context) return
    const leaves = this.createNoiseSource('pink')
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    filter.type = 'lowpass'
    filter.frequency.value = 1_400
    filter.Q.value = 0.5
    gain.gain.value = 0.5
    leaves.connect(filter).connect(gain).connect(voice.bus)
    leaves.start()
    voice.sources.push(leaves)
    voice.nodes.push(filter, gain)

    this.scheduleBird(voice)
    voice.timers.push(setInterval(() => this.scheduleBird(voice), 3_800))
  }

  private buildRain(voice: NatureVoice): void {
    const context = this.context
    if (!context) return
    const rain = this.createNoiseSource('pink')
    const filter = context.createBiquadFilter()
    const shimmer = context.createBiquadFilter()
    const gain = context.createGain()
    filter.type = 'highpass'
    filter.frequency.value = 420
    shimmer.type = 'lowpass'
    shimmer.frequency.value = 5_800
    gain.gain.value = 0.72
    rain.connect(filter).connect(shimmer).connect(gain).connect(voice.bus)
    rain.start()
    voice.sources.push(rain)
    voice.nodes.push(filter, shimmer, gain)

    voice.timers.push(setInterval(() => this.scheduleDroplet(voice), 620))
  }

  private buildTide(voice: NatureVoice): void {
    const context = this.context
    if (!context) return
    const water = this.createNoiseSource('brown')
    const filter = context.createBiquadFilter()
    const swell = context.createGain()
    const lfo = context.createOscillator()
    const lfoDepth = context.createGain()
    filter.type = 'lowpass'
    filter.frequency.value = 760
    filter.Q.value = 0.9
    swell.gain.value = 0.5
    lfo.type = 'sine'
    lfo.frequency.value = 0.095
    lfoDepth.gain.value = 0.25
    lfo.connect(lfoDepth).connect(swell.gain)
    water.connect(filter).connect(swell).connect(voice.bus)
    water.start()
    lfo.start()
    voice.sources.push(water, lfo)
    voice.nodes.push(filter, swell, lfoDepth)
  }

  private scheduleBird(voice: NatureVoice): void {
    const context = this.context
    if (!context || this.voice !== voice) return
    const now = context.currentTime + 0.04
    const oscillator = context.createOscillator()
    const envelope = context.createGain()
    const panner = context.createStereoPanner()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(1_650 + Math.random() * 420, now)
    oscillator.frequency.exponentialRampToValueAtTime(2_700 + Math.random() * 500, now + 0.11)
    oscillator.frequency.exponentialRampToValueAtTime(1_950, now + 0.28)
    envelope.gain.setValueAtTime(0.0001, now)
    envelope.gain.exponentialRampToValueAtTime(0.055, now + 0.035)
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.3)
    panner.pan.value = Math.random() * 1.4 - 0.7
    oscillator.connect(envelope).connect(panner).connect(voice.bus)
    oscillator.start(now)
    oscillator.stop(now + 0.32)
    voice.sources.push(oscillator)
    voice.nodes.push(envelope, panner)
  }

  private scheduleDroplet(voice: NatureVoice): void {
    const context = this.context
    if (!context || this.voice !== voice || Math.random() < 0.35) return
    const now = context.currentTime + Math.random() * 0.18
    const oscillator = context.createOscillator()
    const envelope = context.createGain()
    const panner = context.createStereoPanner()
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(1_100 + Math.random() * 1_500, now)
    oscillator.frequency.exponentialRampToValueAtTime(520, now + 0.09)
    envelope.gain.setValueAtTime(0.035, now)
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)
    panner.pan.value = Math.random() * 1.6 - 0.8
    oscillator.connect(envelope).connect(panner).connect(voice.bus)
    oscillator.start(now)
    oscillator.stop(now + 0.13)
    voice.sources.push(oscillator)
    voice.nodes.push(envelope, panner)
  }

  private createNoiseSource(color: 'brown' | 'pink'): AudioBufferSourceNode {
    const context = this.context
    if (!context) throw new Error('Audio context must exist before creating nature sound')
    const source = context.createBufferSource()
    source.buffer = this.getNoiseBuffer(color)
    source.loop = true
    return source
  }

  private getNoiseBuffer(color: 'brown' | 'pink'): AudioBuffer {
    const context = this.context
    if (!context) throw new Error('Audio context must exist before creating noise')
    const cached = this.noiseBuffers.get(color)
    if (cached) return cached

    const length = context.sampleRate * 6
    const buffer = context.createBuffer(2, length, context.sampleRate)
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel)
      let previous = 0
      for (let index = 0; index < length; index += 1) {
        const white = Math.random() * 2 - 1
        const smoothing = color === 'brown' ? 0.985 : 0.82
        previous = previous * smoothing + white * (1 - smoothing)
        data[index] = previous * (color === 'brown' ? 3.8 : 1.7)
      }
    }
    this.noiseBuffers.set(color, buffer)
    return buffer
  }

  private disposeVoice(voice: NatureVoice): void {
    for (const timer of voice.timers) clearInterval(timer)
    for (const source of voice.sources) {
      try {
        source.stop()
      } catch {
        // One-shot sources may already have naturally ended.
      }
    }
    for (const node of voice.nodes) node.disconnect()
  }
}
