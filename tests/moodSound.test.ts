import assert from 'node:assert/strict'
import test from 'node:test'
import { MOODS } from '../src/lib/moods.ts'
import { getMoodSoundTitle, MOOD_SOUND_CONFIGS, MoodSoundEngine } from '../src/lib/moodSound.ts'

test('every mood has a valid and playable sound identity', () => {
  for (const { id } of MOODS) {
    const config = MOOD_SOUND_CONFIGS[id]
    assert.ok(config.title.length > 3)
    assert.ok(config.bpm >= 40 && config.bpm <= 140)
    assert.ok(config.notes.length >= 4)
    assert.ok(config.pattern.some((step) => step !== null))
    assert.ok(config.pattern.every((step) => step === null || (step >= 0 && step < config.notes.length)))
    assert.ok(config.master > 0.12 && config.master <= 0.2)
    assert.ok(config.guitarLevel >= 0.3 && config.guitarLevel <= 0.5)
    assert.ok(config.guitarDecay >= 1 && config.guitarDecay <= 3.5)
    assert.ok(config.guitarBrightness >= 1_000)
    assert.ok(config.guitarOctave === 1 || config.guitarOctave === 2)
    assert.ok(config.guitarDamping > 0.99 && config.guitarDamping < 1)
    assert.equal(getMoodSoundTitle(id), config.title)
  }
})

test('mood scores are musically distinct', () => {
  const signatures = MOODS.map(({ id }) => {
    const config = MOOD_SOUND_CONFIGS[id]
    return `${config.bpm}:${config.waveform}:${config.pattern.join(',')}`
  })
  assert.equal(new Set(signatures).size, MOODS.length)
})

test('the engine fails safely when Web Audio is unavailable', async () => {
  const engine = new MoodSoundEngine()
  assert.equal(await engine.start('drive'), false)
  engine.setMood('calm')
  engine.stop()
  await engine.setPageVisible(false)
  await engine.dispose()
})
