import assert from 'node:assert/strict'
import test from 'node:test'
import { getDailyQuote, registerVisit } from '../src/lib/dailyRitual.ts'
import type { Quote } from '../src/types.ts'

const POOL: Quote[] = Array.from({ length: 12 }, (_, index) => ({
  id: `drive-${index}`,
  quote: `Quote number ${index}`,
  author: 'Test Author',
  category: 'drive',
}))

test('a repeat visit on the same day does not change the streak', () => {
  const firstVisitToday = registerVisit({ count: 3, longest: 5, lastVisit: '2026-01-10' })
  const secondVisitToday = registerVisit(firstVisitToday)
  assert.deepEqual(secondVisitToday, firstVisitToday)
})

test('a one-day gap extends the streak and tracks the longest run', () => {
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10)
  const next = registerVisit({ count: 4, longest: 4, lastVisit: yesterday })
  assert.equal(next.count, 5)
  assert.equal(next.longest, 5)
})

test('a missed day resets the streak to one', () => {
  const longAgo = new Date(Date.now() - 5 * 86_400_000).toISOString().slice(0, 10)
  const next = registerVisit({ count: 9, longest: 9, lastVisit: longAgo })
  assert.equal(next.count, 1)
  assert.equal(next.longest, 9)
})

test("today's verse is deterministic for a given date and mood", () => {
  const date = new Date('2026-03-01T12:00:00Z')
  const first = getDailyQuote('drive', POOL, date)
  const second = getDailyQuote('drive', POOL, date)
  assert.deepEqual(first, second)
  assert.ok(POOL.includes(first))
})

test("today's verse changes as the pool or the date changes", () => {
  const dayOne = getDailyQuote('drive', POOL, new Date('2026-03-01T12:00:00Z'))
  const dayTwo = getDailyQuote('drive', POOL, new Date('2026-03-02T12:00:00Z'))
  assert.notEqual(dayOne.id, dayTwo.id)
})
