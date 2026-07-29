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

/**
 * Get a single meaning by ID
 */
export async function getMeaningById(id: number): Promise<Meaning | undefined> {
  return db.meanings.get(id)
}

/**
 * Get meanings unused for 30+ days that are still active
 * Returns up to 3 meanings (Dashboard "Review these?" section)
 */
export async function getMeaningsUnused30Days(): Promise<Meaning[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  return db.meanings
    .where('lastUseDate')
    .below(thirtyDaysAgo)
    .and(m => m.isActive)
    .limit(3)
    .toArray()
}

/**
 * Update the lastUseDate of a meaning
 */
export async function updateLastUseDate(id: number, date: string): Promise<void> {
  await db.meanings.update(id, { lastUseDate: date })
}
