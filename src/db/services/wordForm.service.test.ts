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
