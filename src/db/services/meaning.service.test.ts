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
      categories: ['Verbs'] as const,
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
