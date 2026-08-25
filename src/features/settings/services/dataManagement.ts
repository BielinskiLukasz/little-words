import type { ChildProfile, WordForm, Meaning, WordFormMeaning } from '@/db/schema'
import { db } from '@/db/db'

export interface BackupData {
  schemaVersion: number
  exportedAt: string
  childProfile: ChildProfile[]
  wordForms: WordForm[]
  meanings: Meaning[]
  wordFormMeanings: WordFormMeaning[]
}

// Pure function — no DB access; assembles BackupData from provided arrays
export function buildBackupData(
  childProfile: ChildProfile[],
  wordForms: WordForm[],
  meanings: Meaning[],
  wordFormMeanings: WordFormMeaning[],
  now?: Date,
): BackupData {
  return {
    schemaVersion: 2,
    exportedAt: (now ?? new Date()).toISOString(),
    childProfile,
    wordForms,
    meanings,
    wordFormMeanings,
  }
}

// Type guard stub — will be implemented in Task 2 (TDD)
export function validateBackupData(_data: unknown): _data is BackupData {
  return false
}

// Pure function stub — will be implemented in Task 2 (TDD)
export function buildMeaningsCSV(
  _meanings: Meaning[],
  _wordFormMeanings: WordFormMeaning[],
  _wordForms: WordForm[],
): string {
  throw new Error('not implemented')
}

// Downloads a JSON backup of all app data
export async function exportData(): Promise<void> {
  const [childProfile, wordForms, meanings, wordFormMeanings] = await Promise.all([
    db.childProfile.toArray(),
    db.wordForms.toArray(),
    db.meanings.toArray(),
    db.wordFormMeanings.toArray(),
  ])

  const data = buildBackupData(childProfile, wordForms, meanings, wordFormMeanings, new Date())
  const json = JSON.stringify(data, null, 2)
  const filename = `little-words-backup-${new Date().toISOString().split('T')[0]}.json`

  const blob = new Blob([json], { type: 'application/json' })
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(href)
}

// Stub — will be implemented in Task 2 (TDD)
export async function exportMeaningsCSV(): Promise<void> {
  throw new Error('not implemented')
}

// Stub — will be implemented in Task 2 (TDD)
export async function importData(_file: File): Promise<void> {
  throw new Error('not implemented')
}
