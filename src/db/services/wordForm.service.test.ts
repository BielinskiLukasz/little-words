import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Dexie from 'dexie'
import { AppDB } from '../db'

// Shared mutable db reference — replaced in beforeEach.
// Services resolve `db` at call time via the mocked module export.
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

describe('wordForm.service - findOrCreateWordForm', () => {
  beforeEach(async () => {
    await Dexie.delete('LittleWordsDB')
    testDb = new AppDB()
    await testDb.open()
  })

  afterEach(async () => {
    testDb.close()
    await Dexie.delete('LittleWordsDB')
  })

  it('creates a new word form when DB is empty and returns a numeric ID', async () => {
    const { findOrCreateWordForm } = await import('./wordForm.service')
    const id = await findOrCreateWordForm('ba')
    expect(typeof id).toBe('number')
    expect(id).toBeGreaterThan(0)
  })

  it('returns the existing ID when the same form is added twice (exact match)', async () => {
    const { findOrCreateWordForm } = await import('./wordForm.service')
    const id1 = await findOrCreateWordForm('pa')
    const id2 = await findOrCreateWordForm('pa')
    expect(id1).toBe(id2)
  })

  it('returns the existing ID for a case-insensitive match — Pa vs pa', async () => {
    const { findOrCreateWordForm } = await import('./wordForm.service')
    const id1 = await findOrCreateWordForm('pa')
    const id2 = await findOrCreateWordForm('Pa')
    expect(id1).toBe(id2)
  })

  it('returns the existing ID for an all-caps match — PA vs pa', async () => {
    const { findOrCreateWordForm } = await import('./wordForm.service')
    const id1 = await findOrCreateWordForm('pa')
    const id2 = await findOrCreateWordForm('PA')
    expect(id1).toBe(id2)
  })

  it('does not create a duplicate row on case-insensitive repeat call', async () => {
    const { findOrCreateWordForm } = await import('./wordForm.service')
    await findOrCreateWordForm('ba')
    await findOrCreateWordForm('BA')
    const count = await testDb.wordForms.count()
    expect(count).toBe(1)
  })

  it('creates distinct rows for different word forms', async () => {
    const { findOrCreateWordForm } = await import('./wordForm.service')
    const id1 = await findOrCreateWordForm('mama')
    const id2 = await findOrCreateWordForm('dada')
    expect(id1).not.toBe(id2)
    const count = await testDb.wordForms.count()
    expect(count).toBe(2)
  })

  it('throws when formText is an empty string', async () => {
    const { findOrCreateWordForm } = await import('./wordForm.service')
    await expect(findOrCreateWordForm('')).rejects.toThrow()
  })

  it('throws when formText is whitespace only', async () => {
    const { findOrCreateWordForm } = await import('./wordForm.service')
    await expect(findOrCreateWordForm('   ')).rejects.toThrow()
  })
})

// ── updateWordForm ─────────────────────────────────────────────────────────────

describe('wordForm.service - updateWordForm', () => {
  let wordFormId: number

  beforeEach(async () => {
    await Dexie.delete('LittleWordsDB')
    testDb = new AppDB()
    await testDb.open()

    wordFormId = await testDb.wordForms.add({ form: 'ba', createdAt: '2025-01-01' }) as number
  })

  afterEach(async () => {
    testDb.close()
    await Dexie.delete('LittleWordsDB')
  })

  it('normalizes form text to lowercase and updates the DB row', async () => {
    const { updateWordForm, getWordFormById } = await import('./wordForm.service')
    await updateWordForm(wordFormId, 'New Form')
    const updated = await getWordFormById(wordFormId)
    expect(updated!.form).toBe('new form')
  })

  it('rejects empty form text with an error', async () => {
    const { updateWordForm } = await import('./wordForm.service')
    await expect(updateWordForm(wordFormId, '')).rejects.toThrow()
  })

  it('rejects whitespace-only form text with an error', async () => {
    const { updateWordForm } = await import('./wordForm.service')
    await expect(updateWordForm(wordFormId, '   ')).rejects.toThrow()
  })
})

// ── getActiveWordFormsCount ──────────────────────────────────────────────────

describe('wordForm.service - getActiveWordFormsCount', () => {
  beforeEach(async () => {
    await Dexie.delete('LittleWordsDB')
    testDb = new AppDB()
    await testDb.open()
  })

  afterEach(async () => {
    testDb.close()
    await Dexie.delete('LittleWordsDB')
  })

  it('returns 0 when there are no word forms', async () => {
    const { getActiveWordFormsCount } = await import('./wordForm.service')
    expect(await getActiveWordFormsCount()).toBe(0)
  })

  it('excludes a word form that has no linked meanings at all', async () => {
    await testDb.wordForms.add({ form: 'unlinked', createdAt: '2025-01-01' })

    const { getActiveWordFormsCount } = await import('./wordForm.service')
    expect(await getActiveWordFormsCount()).toBe(0)
  })

  it('excludes a word form whose only linked meaning is inactive', async () => {
    const wordFormId = await testDb.wordForms.add({ form: 'ba', createdAt: '2025-01-01' }) as number
    const meaningId = await testDb.meanings.add({
      text: 'ball',
      categories: ['Nouns'],
      isActive: false,
      firstUseDate: '2025-01-01',
      lastUseDate: '2025-01-01',
    }) as number
    await testDb.wordFormMeanings.add({
      wordFormId,
      meaningId,
      firstObservationDate: '2025-01-01',
      lastUsedDate: '2025-01-01',
      isActive: false,
    })

    const { getActiveWordFormsCount } = await import('./wordForm.service')
    expect(await getActiveWordFormsCount()).toBe(0)
  })

  it('includes a word form with at least one active linked meaning', async () => {
    const wordFormId = await testDb.wordForms.add({ form: 'ma', createdAt: '2025-01-01' }) as number
    const meaningId = await testDb.meanings.add({
      text: 'mama',
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

    const { getActiveWordFormsCount } = await import('./wordForm.service')
    expect(await getActiveWordFormsCount()).toBe(1)
  })

  it('mixed set: counts only the active-linked word forms, not the total row count (regression for the over-count bug)', async () => {
    // Active word form: linked to an active meaning
    const activeFormId = await testDb.wordForms.add({ form: 'ma', createdAt: '2025-01-01' }) as number
    const activeMeaningId = await testDb.meanings.add({
      text: 'mama',
      categories: ['People'],
      isActive: true,
      firstUseDate: '2025-01-01',
      lastUseDate: '2025-06-01',
    }) as number
    await testDb.wordFormMeanings.add({
      wordFormId: activeFormId,
      meaningId: activeMeaningId,
      firstObservationDate: '2025-01-01',
      lastUsedDate: '2025-06-01',
      isActive: true,
    })

    // Inactive word form: linked only to an inactive meaning
    const inactiveFormId = await testDb.wordForms.add({ form: 'ba', createdAt: '2025-01-01' }) as number
    const inactiveMeaningId = await testDb.meanings.add({
      text: 'ball',
      categories: ['Nouns'],
      isActive: false,
      firstUseDate: '2025-01-01',
      lastUseDate: '2025-01-01',
    }) as number
    await testDb.wordFormMeanings.add({
      wordFormId: inactiveFormId,
      meaningId: inactiveMeaningId,
      firstObservationDate: '2025-01-01',
      lastUsedDate: '2025-01-01',
      isActive: false,
    })

    // Unlinked word form: no meanings at all
    await testDb.wordForms.add({ form: 'unlinked', createdAt: '2025-01-01' })

    const totalWordForms = await testDb.wordForms.count()
    expect(totalWordForms).toBe(3) // sanity check: naive count would wrongly report 3

    const { getActiveWordFormsCount } = await import('./wordForm.service')
    expect(await getActiveWordFormsCount()).toBe(1)
  })
})
