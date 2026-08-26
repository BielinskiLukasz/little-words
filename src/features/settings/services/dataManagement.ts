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

// Type guard — validates that data is a well-formed BackupData with schemaVersion=2
export function validateBackupData(data: unknown): data is BackupData {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  if (d.schemaVersion !== 2) return false
  if (!Array.isArray(d.childProfile)) return false
  if (!Array.isArray(d.wordForms)) return false
  if (!Array.isArray(d.meanings)) return false
  if (!Array.isArray(d.wordFormMeanings)) return false
  return true
}

// RFC 4180: wrap if the value contains commas, double-quotes, or newlines;
// escape internal double-quotes by doubling them.
function escapeCSVCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return '"' + value.replace(/"/g, '""') + '"'
  }
  return value
}

// Pure function — builds a CSV string from meanings + join data (no DB access)
export function buildMeaningsCSV(
  meanings: Meaning[],
  wordFormMeanings: WordFormMeaning[],
  wordForms: WordForm[],
): string {
  const header = 'label,categories,firstUseDate,lastUseDate,active,wordForms'
  const rows = meanings.map((meaning) => {
    const linkedForms = wordFormMeanings
      .filter((wfm) => wfm.meaningId === meaning.id)
      .map((wfm) => wordForms.find((wf) => wf.id === wfm.wordFormId)?.form ?? '')
      .filter(Boolean)
      .join(';')
    const cells = [
      meaning.text,
      meaning.categories.join(';'),
      meaning.firstUseDate,
      meaning.lastUseDate,
      String(meaning.isActive),
      linkedForms,
    ]
    return cells.map(escapeCSVCell).join(',')
  })
  return [header, ...rows].join('\n')
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

// Downloads a CSV file of all meanings with linked word forms
export async function exportMeaningsCSV(): Promise<void> {
  const [meanings, wordFormMeanings, wordForms] = await Promise.all([
    db.meanings.toArray(),
    db.wordFormMeanings.toArray(),
    db.wordForms.toArray(),
  ])

  const csv = buildMeaningsCSV(meanings, wordFormMeanings, wordForms)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const href = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = 'little-words-meanings.csv'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(href)
}

// Restores all app data from a JSON backup file.
// Throws with message 'wrong-schema-version' if schemaVersion !== 2.
// Throws with message 'corrupt' if the file cannot be parsed or is not a valid backup.
// The caller (DataSection) is responsible for showing error/success UI.
export async function importData(file: File): Promise<void> {
  const text = await file.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('corrupt')
  }

  // Check schema version first to provide a more specific error message
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    'schemaVersion' in parsed &&
    typeof (parsed as Record<string, unknown>).schemaVersion === 'number' &&
    (parsed as Record<string, unknown>).schemaVersion !== 2
  ) {
    throw new Error('wrong-schema-version')
  }

  if (!validateBackupData(parsed)) {
    throw new Error('corrupt')
  }

  const data = parsed as BackupData

  await db.transaction('rw', [db.childProfile, db.wordForms, db.meanings, db.wordFormMeanings], async () => {
    await db.childProfile.clear()
    await db.wordForms.clear()
    await db.meanings.clear()
    await db.wordFormMeanings.clear()
    await db.childProfile.bulkAdd(data.childProfile)
    await db.wordForms.bulkAdd(data.wordForms)
    await db.meanings.bulkAdd(data.meanings)
    await db.wordFormMeanings.bulkAdd(data.wordFormMeanings)
  })
}
