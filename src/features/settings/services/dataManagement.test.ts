import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Dexie from 'dexie'
import { AppDB } from '@/db/db'
import type { BackupData } from './dataManagement'

let testDb: AppDB

vi.mock('@/db/db', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/db/db')>()
  return {
    ...original,
    get db() {
      return testDb
    },
  }
})

describe('dataManagement - buildBackupData', () => {
  it('returns schemaVersion === 2', () => {
    const go = async () => {
      const { buildBackupData } = await import('./dataManagement')
      const result = buildBackupData([], [], [], [])
      expect(result.schemaVersion).toBe(2)
    }
    return go()
  })

  it('returns exportedAt equal to now.toISOString() when now is provided', () => {
    const go = async () => {
      const { buildBackupData } = await import('./dataManagement')
      const now = new Date('2025-06-01T12:00:00.000Z')
      const result = buildBackupData([], [], [], [], now)
      expect(result.exportedAt).toBe(now.toISOString())
    }
    return go()
  })

  it('returns childProfile array equal to input', () => {
    const go = async () => {
      const { buildBackupData } = await import('./dataManagement')
      const childProfile = [{ name: 'Alex', birthDate: '2022-01-01', languages: ['pl'], createdAt: '2024-01-01' }]
      const result = buildBackupData(childProfile, [], [], [])
      expect(result.childProfile).toEqual(childProfile)
    }
    return go()
  })

  it('returns wordForms array equal to input', () => {
    const go = async () => {
      const { buildBackupData } = await import('./dataManagement')
      const wordForms = [{ id: 1, form: 'mama', createdAt: '2024-01-01' }]
      const result = buildBackupData([], wordForms, [], [])
      expect(result.wordForms).toEqual(wordForms)
    }
    return go()
  })

  it('returns meanings array equal to input', () => {
    const go = async () => {
      const { buildBackupData } = await import('./dataManagement')
      const meanings = [{ id: 1, text: 'mama', categories: ['People' as const], isActive: true, firstUseDate: '2024-01-01', lastUseDate: '2024-01-01' }]
      const result = buildBackupData([], [], meanings, [])
      expect(result.meanings).toEqual(meanings)
    }
    return go()
  })

  it('returns wordFormMeanings array equal to input', () => {
    const go = async () => {
      const { buildBackupData } = await import('./dataManagement')
      const wordFormMeanings = [{ id: 1, wordFormId: 1, meaningId: 2 }]
      const result = buildBackupData([], [], [], wordFormMeanings)
      expect(result.wordFormMeanings).toEqual(wordFormMeanings)
    }
    return go()
  })
})

describe('dataManagement - validateBackupData', () => {
  it('returns false for null', async () => {
    const { validateBackupData } = await import('./dataManagement')
    expect(validateBackupData(null)).toBe(false)
  })

  it('returns false for a plain string', async () => {
    const { validateBackupData } = await import('./dataManagement')
    expect(validateBackupData('not an object')).toBe(false)
  })

  it('returns false for an object missing schemaVersion', async () => {
    const { validateBackupData } = await import('./dataManagement')
    expect(validateBackupData({ childProfile: [], wordForms: [], meanings: [], wordFormMeanings: [] })).toBe(false)
  })

  it('returns false for schemaVersion !== 2 (e.g., schemaVersion: 1)', async () => {
    const { validateBackupData } = await import('./dataManagement')
    expect(validateBackupData({ schemaVersion: 1, childProfile: [], wordForms: [], meanings: [], wordFormMeanings: [] })).toBe(false)
  })

  it('returns false for schemaVersion=2 but missing childProfile array', async () => {
    const { validateBackupData } = await import('./dataManagement')
    expect(validateBackupData({ schemaVersion: 2, wordForms: [], meanings: [], wordFormMeanings: [] })).toBe(false)
  })

  it('returns false for schemaVersion=2 but meanings is not an array', async () => {
    const { validateBackupData } = await import('./dataManagement')
    expect(validateBackupData({ schemaVersion: 2, childProfile: [], wordForms: [], meanings: 'bad', wordFormMeanings: [] })).toBe(false)
  })

  it('returns true for a valid BackupData object with all four arrays present', async () => {
    const { validateBackupData } = await import('./dataManagement')
    const validBackup: BackupData = {
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      childProfile: [],
      wordForms: [],
      meanings: [],
      wordFormMeanings: [],
    }
    expect(validateBackupData(validBackup)).toBe(true)
  })
})

describe('dataManagement - buildMeaningsCSV', () => {
  it('returns a string starting with the header line', async () => {
    const { buildMeaningsCSV } = await import('./dataManagement')
    const result = buildMeaningsCSV([], [], [])
    expect(result.split('\n')[0]).toBe('label,categories,firstUseDate,lastUseDate,active,wordForms')
  })

  it('returns only the header row for an empty meanings array', async () => {
    const { buildMeaningsCSV } = await import('./dataManagement')
    const result = buildMeaningsCSV([], [], [])
    expect(result).toBe('label,categories,firstUseDate,lastUseDate,active,wordForms')
  })

  it('has the meaning text as the first column in each row', async () => {
    const { buildMeaningsCSV } = await import('./dataManagement')
    const meanings = [{ id: 1, text: 'mama', categories: ['People' as const], isActive: true, firstUseDate: '2024-01-01', lastUseDate: '2024-06-01' }]
    const result = buildMeaningsCSV(meanings, [], [])
    const rows = result.split('\n')
    expect(rows[1]).toMatch(/^mama,/)
  })

  it('joins categories with semicolons in the second column', async () => {
    const { buildMeaningsCSV } = await import('./dataManagement')
    const meanings = [{ id: 1, text: 'woda', categories: ['Food' as const, 'Nouns' as const], isActive: true, firstUseDate: '2024-01-01', lastUseDate: '2024-06-01' }]
    const result = buildMeaningsCSV(meanings, [], [])
    const row = result.split('\n')[1]
    expect(row.split(',')[1]).toBe('Food;Nouns')
  })

  it('active column is "true" for isActive=true', async () => {
    const { buildMeaningsCSV } = await import('./dataManagement')
    const meanings = [{ id: 1, text: 'dog', categories: ['Animals' as const], isActive: true, firstUseDate: '2024-01-01', lastUseDate: '2024-06-01' }]
    const result = buildMeaningsCSV(meanings, [], [])
    const row = result.split('\n')[1]
    const cols = row.split(',')
    expect(cols[4]).toBe('true')
  })

  it('active column is "false" for isActive=false', async () => {
    const { buildMeaningsCSV } = await import('./dataManagement')
    const meanings = [{ id: 1, text: 'cat', categories: ['Animals' as const], isActive: false, firstUseDate: '2024-01-01', lastUseDate: '2024-06-01' }]
    const result = buildMeaningsCSV(meanings, [], [])
    const row = result.split('\n')[1]
    const cols = row.split(',')
    expect(cols[4]).toBe('false')
  })

  it('has empty wordForms column for a meaning with no linked forms', async () => {
    const { buildMeaningsCSV } = await import('./dataManagement')
    const meanings = [{ id: 1, text: 'ball', categories: ['Nouns' as const], isActive: true, firstUseDate: '2024-01-01', lastUseDate: '2024-06-01' }]
    const result = buildMeaningsCSV(meanings, [], [])
    const row = result.split('\n')[1]
    const cols = row.split(',')
    expect(cols[5]).toBe('')
  })

  it('lists multiple linked word forms separated by semicolons', async () => {
    const { buildMeaningsCSV } = await import('./dataManagement')
    const meanings = [{ id: 10, text: 'eat', categories: ['Verbs' as const], isActive: true, firstUseDate: '2024-01-01', lastUseDate: '2024-06-01' }]
    const wordForms = [
      { id: 1, form: 'je', createdAt: '2024-01-01' },
      { id: 2, form: 'jedzenie', createdAt: '2024-01-01' },
    ]
    const wordFormMeanings = [
      { id: 1, wordFormId: 1, meaningId: 10 },
      { id: 2, wordFormId: 2, meaningId: 10 },
    ]
    const result = buildMeaningsCSV(meanings, wordFormMeanings, wordForms)
    const row = result.split('\n')[1]
    const cols = row.split(',')
    expect(cols[5]).toBe('je;jedzenie')
  })

  it('wraps cell values containing commas in double-quotes', async () => {
    const { buildMeaningsCSV } = await import('./dataManagement')
    const meanings = [{ id: 1, text: 'hello, world', categories: ['Social Communication' as const], isActive: true, firstUseDate: '2024-01-01', lastUseDate: '2024-06-01' }]
    const result = buildMeaningsCSV(meanings, [], [])
    const row = result.split('\n')[1]
    expect(row).toMatch(/^"hello, world"/)
  })
})

describe('dataManagement - importData', () => {
  beforeEach(async () => {
    await Dexie.delete('LittleWordsDB')
    testDb = new AppDB()
    await testDb.open()
  })

  afterEach(async () => {
    testDb.close()
    await Dexie.delete('LittleWordsDB')
  })

  it('imports childProfile records from a valid backup file', async () => {
    const { importData } = await import('./dataManagement')
    const backup: BackupData = {
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      childProfile: [{ name: 'Alex', birthDate: '2022-01-01', languages: ['pl'], createdAt: '2024-01-01' }],
      wordForms: [],
      meanings: [],
      wordFormMeanings: [],
    }
    const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' })
    await importData(file)
    const profiles = await testDb.childProfile.toArray()
    expect(profiles).toHaveLength(1)
    expect(profiles[0].name).toBe('Alex')
  })

  it('imports meanings records from a valid backup file', async () => {
    const { importData } = await import('./dataManagement')
    const backup: BackupData = {
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      childProfile: [],
      wordForms: [],
      meanings: [{ id: 5, text: 'mama', categories: ['People' as const], isActive: true, firstUseDate: '2024-01-01', lastUseDate: '2024-06-01' }],
      wordFormMeanings: [],
    }
    const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' })
    await importData(file)
    const meanings = await testDb.meanings.toArray()
    expect(meanings).toHaveLength(1)
    expect(meanings[0].text).toBe('mama')
  })

  it('throws for a corrupt JSON string', async () => {
    const { importData } = await import('./dataManagement')
    const file = new File(['not valid { json }'], 'backup.json', { type: 'application/json' })
    await expect(importData(file)).rejects.toThrow()
  })

  it('throws with wrong-schema-version message when schemaVersion is not 2', async () => {
    const { importData } = await import('./dataManagement')
    const backup = { schemaVersion: 1, childProfile: [], wordForms: [], meanings: [], wordFormMeanings: [] }
    const file = new File([JSON.stringify(backup)], 'backup.json', { type: 'application/json' })
    await expect(importData(file)).rejects.toThrow('wrong-schema-version')
  })
})
