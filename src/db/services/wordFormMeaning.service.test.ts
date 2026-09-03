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

// ── linkMeaningToWordForm (updated signature) ────────────────────────────────

describe('wordFormMeaning.service - linkMeaningToWordForm with pairFields', () => {
  beforeEach(async () => {
    await Dexie.delete('LittleWordsDB')
    testDb = new AppDB()
    await testDb.open()
  })

  afterEach(async () => {
    testDb.close()
    await Dexie.delete('LittleWordsDB')
  })

  it('stores pairFields on the created junction row when pairFields are supplied', async () => {
    const { linkMeaningToWordForm } = await import('./wordFormMeaning.service')
    await linkMeaningToWordForm(1, 2, {
      firstObservationDate: '2025-01-15',
      lastUsedDate: '2025-06-20',
      isActive: true,
    })
    const pair = await testDb.wordFormMeanings
      .where('[wordFormId+meaningId]')
      .equals([1, 2])
      .first()
    expect(pair).toBeDefined()
    expect(pair!.firstObservationDate).toBe('2025-01-15')
    expect(pair!.lastUsedDate).toBe('2025-06-20')
    expect(pair!.isActive).toBe(true)
  })

  it('uses today as default dates and isActive=true when pairFields omitted', async () => {
    const { linkMeaningToWordForm } = await import('./wordFormMeaning.service')
    const today = new Date().toISOString().slice(0, 10)
    await linkMeaningToWordForm(3, 4)
    const pair = await testDb.wordFormMeanings
      .where('[wordFormId+meaningId]')
      .equals([3, 4])
      .first()
    expect(pair).toBeDefined()
    expect(pair!.firstObservationDate).toBe(today)
    expect(pair!.lastUsedDate).toBe(today)
    expect(pair!.isActive).toBe(true)
  })

  it('defaults isActive to true when pairFields.isActive is omitted', async () => {
    const { linkMeaningToWordForm } = await import('./wordFormMeaning.service')
    await linkMeaningToWordForm(5, 6, {
      firstObservationDate: '2025-03-01',
      lastUsedDate: '2025-03-01',
    })
    const pair = await testDb.wordFormMeanings
      .where('[wordFormId+meaningId]')
      .equals([5, 6])
      .first()
    expect(pair!.isActive).toBe(true)
  })
})

// ── updatePairFields ─────────────────────────────────────────────────────────

describe('wordFormMeaning.service - updatePairFields', () => {
  let wordFormId: number
  let meaningId: number
  let pairId: number

  beforeEach(async () => {
    await Dexie.delete('LittleWordsDB')
    testDb = new AppDB()
    await testDb.open()

    wordFormId = await testDb.wordForms.add({ form: 'ba', createdAt: '2025-01-01' }) as number
    meaningId = await testDb.meanings.add({
      text: 'ball',
      categories: ['Nouns'],
      isActive: true,
      firstUseDate: '2025-01-01',
      lastUseDate: '2025-06-01',
    }) as number
    pairId = await testDb.wordFormMeanings.add({
      wordFormId,
      meaningId,
      firstObservationDate: '2025-01-01',
      lastUsedDate: '2025-06-01',
      isActive: true,
    }) as number
  })

  afterEach(async () => {
    testDb.close()
    await Dexie.delete('LittleWordsDB')
  })

  it('updates isActive on the pair and triggers aggregation on the parent meaning', async () => {
    const { updatePairFields } = await import('./wordFormMeaning.service')
    await updatePairFields(pairId, { isActive: false })

    const updatedPair = await testDb.wordFormMeanings.get(pairId)
    expect(updatedPair!.isActive).toBe(false)

    const updatedMeaning = await testDb.meanings.get(meaningId)
    expect(updatedMeaning!.isActive).toBe(false)
  })

  it('updates dates and triggers aggregation on the parent meaning', async () => {
    const { updatePairFields } = await import('./wordFormMeaning.service')
    await updatePairFields(pairId, {
      firstObservationDate: '2025-06-01',
      lastUsedDate: '2025-12-01',
    })

    const updatedPair = await testDb.wordFormMeanings.get(pairId)
    expect(updatedPair!.firstObservationDate).toBe('2025-06-01')
    expect(updatedPair!.lastUsedDate).toBe('2025-12-01')

    const updatedMeaning = await testDb.meanings.get(meaningId)
    expect(updatedMeaning!.firstUseDate).toBe('2025-06-01')
    expect(updatedMeaning!.lastUseDate).toBe('2025-12-01')
  })
})

// ── getPairsWithDetails ──────────────────────────────────────────────────────

describe('wordFormMeaning.service - getPairsWithDetails', () => {
  beforeEach(async () => {
    await Dexie.delete('LittleWordsDB')
    testDb = new AppDB()
    await testDb.open()
  })

  afterEach(async () => {
    testDb.close()
    await Dexie.delete('LittleWordsDB')
  })

  it('returns empty array when no pairs exist', async () => {
    const { getPairsWithDetails } = await import('./wordFormMeaning.service')
    const result = await getPairsWithDetails()
    expect(result).toEqual([])
  })

  it('returns enriched array with wordFormText and meaningText joined from their tables', async () => {
    const wordFormId = await testDb.wordForms.add({ form: 'mama', createdAt: '2025-01-01' }) as number
    const meaningId = await testDb.meanings.add({
      text: 'mother',
      categories: ['People'],
      isActive: true,
      firstUseDate: '2025-01-01',
      lastUseDate: '2025-06-01',
    }) as number
    await testDb.wordFormMeanings.add({
      wordFormId,
      meaningId,
      firstObservationDate: '2025-01-01',
      lastUsedDate: '2025-06-01',
      isActive: true,
    })

    const { getPairsWithDetails } = await import('./wordFormMeaning.service')
    const result = await getPairsWithDetails()

    expect(result).toHaveLength(1)
    expect(result[0].wordFormText).toBe('mama')
    expect(result[0].meaningText).toBe('mother')
    expect(result[0].wordFormId).toBe(wordFormId)
    expect(result[0].meaningId).toBe(meaningId)
    expect(result[0].firstObservationDate).toBe('2025-01-01')
    expect(result[0].lastUsedDate).toBe('2025-06-01')
    expect(result[0].isActive).toBe(true)
  })

  it('filters out pairs where the word form or meaning is not found', async () => {
    // Insert orphan pair (wordFormId and meaningId don't match any table rows)
    await testDb.wordFormMeanings.add({
      wordFormId: 999,
      meaningId: 888,
      firstObservationDate: '2025-01-01',
      lastUsedDate: '2025-01-01',
      isActive: false,
    })

    const { getPairsWithDetails } = await import('./wordFormMeaning.service')
    const result = await getPairsWithDetails()
    expect(result).toHaveLength(0)
  })
})
