import { db } from '../db'
import type { Meaning } from '../types'

export async function addMeaning(
  meaning: Omit<Meaning, 'id'>
): Promise<number> {
  return db.meanings.add(meaning) as Promise<number>
}

export async function toggleMeaningActive(
  id: number,
  isActive: boolean
): Promise<void> {
  await db.meanings.update(id, { isActive })
}

/**
 * Search meanings by case-insensitive prefix match on the text field.
 * Returns up to 10 results. Returns an empty array for empty prefix.
 */
export async function searchMeanings(prefix: string): Promise<Meaning[]> {
  if (prefix.length === 0) {
    return []
  }

  return db.meanings
    .where('text')
    .startsWithIgnoreCase(prefix)
    .limit(10)
    .toArray()
}
