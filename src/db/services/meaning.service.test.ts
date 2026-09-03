import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Dexie from 'dexie'
import { AppDB } from '../db'

let testDb: AppDB

vi.mock('../db', async (importOriginal) => {
  const original = await importOriginal<typeof import('../db')>()
  return {
    ...original,
    get db() {
      return testDb
    },
  }
})

describe('meaning.service - searchMeanings', () => {
  beforeEach(async () => {
    await Dexie.delete('LittleWordsDB')
    testDb = new AppDB()
    await testDb.open()
  })

  afterEach(async () => {
    testDb.close()
    await Dexie.delete('LittleWordsDB')
  })

  it('returns empty array when prefix is empty string', async () => {
    const { searchMeanings } = await import('./meaning.service')
    const results = await searchMeanings('')
    expect(results).toEqual([])
  })

  it('returns empty array when prefix is empty and DB has meanings', async () => {
    await testDb.meanings.add({
      text: 'goodbye',
      categories: ['Social Communication'],
      isActive: true,
      firstUseDate: '2025-01-01',
      lastUseDate: '2025-01-01',
    })
    const { searchMeanings } = await import('./meaning.service')
    const results = await searchMeanings('')
    expect(results).toEqual([])
  })

  it('returns empty array when DB is empty and prefix is provided', async () => {
    const { searchMeanings } = await import('./meaning.service')
    const results = await searchMeanings('go')
    expect(results).toEqual([])
  })

  it('returns meanings matching the prefix', async () => {
    await testDb.meanings.bulkAdd([
      { text: 'goodbye', categories: ['Social Communication'], isActive: true, firstUseDate: '2025-01-01', lastUseDate: '2025-01-01' },
      { text: 'go away', categories: ['Social Communication'], isActive: true, firstUseDate: '2025-01-01', lastUseDate: '2025-01-01' },
      { text: 'horse', categories: ['Animals'], isActive: true, firstUseDate: '2025-01-01', lastUseDate: '2025-01-01' },
    ])
    const { searchMeanings } = await import('./meaning.service')
    const results = await searchMeanings('go')
    expect(results).toHaveLength(2)
    const texts = results.map((m) => m.text)
    expect(texts).toContain('goodbye')
    expect(texts).toContain('go away')
    expect(texts).not.toContain('horse')
  })

  it('performs case-insensitive prefix matching', async () => {
    await testDb.meanings.add({
      text: 'Goodbye',
      categories: ['Social Communication'],
      isActive: true,
      firstUseDate: '2025-01-01',
      lastUseDate: '2025-01-01',
    })
    const { searchMeanings } = await import('./meaning.service')
    const results = await searchMeanings('good')
    expect(results).toHaveLength(1)
    expect(results[0].text).toBe('Goodbye')
  })

  it('limits results to 10 meanings', async () => {
    const meanings = Array.from({ length: 15 }, (_, i) => ({
      text: `go word ${i}`,
      categories: ['Verbs' as const],
      isActive: true,
      firstUseDate: '2025-01-01',
      lastUseDate: '2025-01-01',
    }))
    await testDb.meanings.bulkAdd(meanings)
    const { searchMeanings } = await import('./meaning.service')
    const results = await searchMeanings('go')
    expect(results.length).toBeLessThanOrEqual(10)
  })

  it('existing addMeaning remains functional (backward compat)', async () => {
    const { addMeaning } = await import('./meaning.service')
    const id = await addMeaning({
      text: 'water',
      categories: ['Nouns'],
      isActive: true,
      firstUseDate: '2025-01-01',
      lastUseDate: '2025-01-01',
    })
    expect(typeof id).toBe('number')
    expect(id).toBeGreaterThan(0)
  })
})

// ── aggregateMeaningFromPairs ─────────────────────────────────────────────────

describe('meaning.service - aggregateMeaningFromPairs', () => {
  let meaningId: number

  beforeEach(async () => {
    await Dexie.delete('LittleWordsDB')
    testDb = new AppDB()
    await testDb.open()

    meaningId = await testDb.meanings.add({
      text: 'test',
      categories: ['Nouns'],
      isActive: false,
      firstUseDate: '2025-09-01',
      lastUseDate: '2025-09-01',
    }) as number
  })

  afterEach(async () => {
    testDb.close()
    await Dexie.delete('LittleWordsDB')
  })

  it('sets meaning.isActive=true when at least one linked pair is active', async () => {
    await testDb.wordFormMeanings.bulkAdd([
      { wordFormId: 1, meaningId, firstObservationDate: '2025-01-01', lastUsedDate: '2025-06-01', isActive: true },
      { wordFormId: 2, meaningId, firstObservationDate: '2025-03-01', lastUsedDate: '2025-08-01', isActive: false },
    ])
    const { aggregateMeaningFromPairs } = await import('./meaning.service')
    await aggregateMeaningFromPairs(meaningId)
    const updated = await testDb.meanings.get(meaningId)
    expect(updated!.isActive).toBe(true)
  })

  it('sets meaning.isActive=false when all linked pairs are inactive', async () => {
    await testDb.wordFormMeanings.add({
      wordFormId: 1,
      meaningId,
      firstObservationDate: '2025-01-01',
      lastUsedDate: '2025-06-01',
      isActive: false,
    })
    const { aggregateMeaningFromPairs } = await import('./meaning.service')
    await aggregateMeaningFromPairs(meaningId)
    const updated = await testDb.meanings.get(meaningId)
    expect(updated!.isActive).toBe(false)
  })

  it('sets meaning.firstUseDate to min(pair.firstObservationDate)', async () => {
    await testDb.wordFormMeanings.bulkAdd([
      { wordFormId: 1, meaningId, firstObservationDate: '2025-03-01', lastUsedDate: '2025-06-01', isActive: true },
      { wordFormId: 2, meaningId, firstObservationDate: '2025-01-01', lastUsedDate: '2025-08-01', isActive: true },
    ])
    const { aggregateMeaningFromPairs } = await import('./meaning.service')
    await aggregateMeaningFromPairs(meaningId)
    const updated = await testDb.meanings.get(meaningId)
    expect(updated!.firstUseDate).toBe('2025-01-01')
  })

  it('sets meaning.lastUseDate to max(pair.lastUsedDate)', async () => {
    await testDb.wordFormMeanings.bulkAdd([
      { wordFormId: 1, meaningId, firstObservationDate: '2025-01-01', lastUsedDate: '2025-06-01', isActive: true },
      { wordFormId: 2, meaningId, firstObservationDate: '2025-03-01', lastUsedDate: '2025-12-01', isActive: true },
    ])
    const { aggregateMeaningFromPairs } = await import('./meaning.service')
    await aggregateMeaningFromPairs(meaningId)
    const updated = await testDb.meanings.get(meaningId)
    expect(updated!.lastUseDate).toBe('2025-12-01')
  })

  it('does not update meaning when no pairs exist', async () => {
    const { aggregateMeaningFromPairs } = await import('./meaning.service')
    await aggregateMeaningFromPairs(meaningId)
    const unchanged = await testDb.meanings.get(meaningId)
    // meaning.isActive was set to false in beforeEach; should remain unchanged
    expect(unchanged!.isActive).toBe(false)
    expect(unchanged!.firstUseDate).toBe('2025-09-01')
  })
})

// ── updateMeaning ─────────────────────────────────────────────────────────────

describe('meaning.service - updateMeaning', () => {
  let meaningId: number

  beforeEach(async () => {
    await Dexie.delete('LittleWordsDB')
    testDb = new AppDB()
    await testDb.open()

    meaningId = await testDb.meanings.add({
      text: 'original',
      categories: ['Nouns'],
      isActive: true,
      firstUseDate: '2025-01-01',
      lastUseDate: '2025-01-01',
    }) as number
  })

  afterEach(async () => {
    testDb.close()
    await Dexie.delete('LittleWordsDB')
  })

  it('updates text and categories on the DB row', async () => {
    const { updateMeaning, getMeaningById } = await import('./meaning.service')
    await updateMeaning(meaningId, { text: 'updated text', categories: ['Verbs'] })
    const updated = await getMeaningById(meaningId)
    expect(updated!.text).toBe('updated text')
    expect(updated!.categories).toEqual(['Verbs'])
  })

  it('rejects empty text with an error', async () => {
    const { updateMeaning } = await import('./meaning.service')
    await expect(updateMeaning(meaningId, { text: '', categories: [] })).rejects.toThrow()
  })

  it('rejects whitespace-only text with an error', async () => {
    const { updateMeaning } = await import('./meaning.service')
    await expect(updateMeaning(meaningId, { text: '   ', categories: [] })).rejects.toThrow()
  })
})
