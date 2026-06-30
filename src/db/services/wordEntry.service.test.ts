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

describe('wordEntry.service - addWordEntry', () => {
  beforeEach(async () => {
    await Dexie.delete('LittleWordsDB')
    testDb = new AppDB()
    await testDb.open()
    // Stub navigator.storage.persist to avoid JSDOM errors
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        ...globalThis.navigator,
        storage: {
          persist: vi.fn().mockResolvedValue(true),
          persisted: vi.fn().mockResolvedValue(true),
        },
      },
      configurable: true,
      writable: true,
    })
  })

  afterEach(async () => {
    testDb.close()
    await Dexie.delete('LittleWordsDB')
  })

  it('creates 1 WordForm + 1 Meaning + 1 junction row for a single meaning entry', async () => {
    const { addWordEntry } = await import('./wordEntry.service')
    const result = await addWordEntry({
      wordForm: 'pa',
      meanings: [
        {
          text: 'goodbye',
          categories: ['Social Communication'],
          firstUseDate: '2025-01-01',
        },
      ],
    })

    expect(result.wordFormId).toBeGreaterThan(0)
    expect(result.meaningIds).toHaveLength(1)
    expect(result.meaningIds[0]).toBeGreaterThan(0)

    const wfCount = await testDb.wordForms.count()
    const mCount = await testDb.meanings.count()
    const jCount = await testDb.wordFormMeanings.count()
    expect(wfCount).toBe(1)
    expect(mCount).toBe(1)
    expect(jCount).toBe(1)
  })

  it('creates multiple meanings and junction rows for multi-meaning entry', async () => {
    const { addWordEntry } = await import('./wordEntry.service')
    const result = await addWordEntry({
      wordForm: 'ba',
      meanings: [
        { text: 'bottle', categories: ['Food'], firstUseDate: '2025-01-01' },
        { text: 'ball', categories: ['Nouns'], firstUseDate: '2025-01-02' },
      ],
    })

    expect(result.meaningIds).toHaveLength(2)
    const jCount = await testDb.wordFormMeanings.count()
    expect(jCount).toBe(2)
  })

  it('reuses existing WordForm when called twice with same form (find-or-create)', async () => {
    const { addWordEntry } = await import('./wordEntry.service')
    const result1 = await addWordEntry({
      wordForm: 'pa',
      meanings: [{ text: 'papa', categories: ['People'], firstUseDate: '2025-01-01' }],
    })
    const result2 = await addWordEntry({
      wordForm: 'pa',
      meanings: [{ text: 'pasta', categories: ['Food'], firstUseDate: '2025-01-02' }],
    })

    expect(result1.wordFormId).toBe(result2.wordFormId)
    const wfCount = await testDb.wordForms.count()
    expect(wfCount).toBe(1)
  })

  it('is idempotent for junction rows — same meaning+wordForm pair twice creates only 1 link', async () => {
    const { addWordEntry } = await import('./wordEntry.service')
    await addWordEntry({
      wordForm: 'pa',
      meanings: [{ text: 'goodbye', categories: ['Social Communication'], firstUseDate: '2025-01-01' }],
    })
    // Add the same meaning text to the same word form again
    const meaning = await testDb.meanings.where('text').equals('goodbye').first()
    expect(meaning).toBeDefined()

    // Calling linkMeaningToWordForm with the same pair should not create duplicate
    const { linkMeaningToWordForm } = await import('./wordFormMeaning.service')
    const wf = await testDb.wordForms.where('form').equals('pa').first()
    await linkMeaningToWordForm(wf!.id!, meaning!.id!)
    await linkMeaningToWordForm(wf!.id!, meaning!.id!)

    const jCount = await testDb.wordFormMeanings.count()
    expect(jCount).toBe(1)
  })

  it('throws when wordForm is an empty string', async () => {
    const { addWordEntry } = await import('./wordEntry.service')
    await expect(
      addWordEntry({
        wordForm: '',
        meanings: [{ text: 'test', categories: ['Nouns'], firstUseDate: '2025-01-01' }],
      })
    ).rejects.toThrow('Word form cannot be empty')
  })

  it('throws when meanings array is empty', async () => {
    const { addWordEntry } = await import('./wordEntry.service')
    await expect(
      addWordEntry({
        wordForm: 'pa',
        meanings: [],
      })
    ).rejects.toThrow('At least one meaning is required')
  })

  it('returns correct wordFormId and meaningIds in result', async () => {
    const { addWordEntry } = await import('./wordEntry.service')
    const result = await addWordEntry({
      wordForm: 'mama',
      meanings: [
        { text: 'mother', categories: ['People'], firstUseDate: '2025-01-01' },
      ],
    })

    const storedWf = await testDb.wordForms.get(result.wordFormId)
    expect(storedWf).toBeDefined()
    expect(storedWf!.form).toBe('mama')

    const storedMeaning = await testDb.meanings.get(result.meaningIds[0])
    expect(storedMeaning).toBeDefined()
    expect(storedMeaning!.text).toBe('mother')
  })
})

describe('wordFormMeaning.service - linkMeaningToWordForm idempotency', () => {
  beforeEach(async () => {
    await Dexie.delete('LittleWordsDB')
    testDb = new AppDB()
    await testDb.open()
  })

  afterEach(async () => {
    testDb.close()
    await Dexie.delete('LittleWordsDB')
  })

  it('inserts a new junction row when link does not exist', async () => {
    const { linkMeaningToWordForm } = await import('./wordFormMeaning.service')
    await linkMeaningToWordForm(1, 2)
    const count = await testDb.wordFormMeanings.count()
    expect(count).toBe(1)
  })

  it('does NOT insert duplicate when same pair is linked twice', async () => {
    const { linkMeaningToWordForm } = await import('./wordFormMeaning.service')
    await linkMeaningToWordForm(1, 1)
    await linkMeaningToWordForm(1, 1)
    const count = await testDb.wordFormMeanings.count()
    expect(count).toBe(1)
  })

  it('inserts separately for different pairs', async () => {
    const { linkMeaningToWordForm } = await import('./wordFormMeaning.service')
    await linkMeaningToWordForm(1, 1)
    await linkMeaningToWordForm(1, 2)
    const count = await testDb.wordFormMeanings.count()
    expect(count).toBe(2)
  })

  it('existing linkMeaning export still works (backward compat)', async () => {
    const { linkMeaning } = await import('./wordFormMeaning.service')
    expect(typeof linkMeaning).toBe('function')
  })

  it('existing unlinkMeaning export still works (backward compat)', async () => {
    const { unlinkMeaning } = await import('./wordFormMeaning.service')
    expect(typeof unlinkMeaning).toBe('function')
  })
})
