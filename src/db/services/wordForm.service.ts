import { db } from '../db'
import type { WordForm } from '../types'
import { aggregateMeaningFromPairs } from './meaning.service'

export async function addWordForm(
  form: Omit<WordForm, 'id'>
): Promise<number> {
  return db.wordForms.add(form) as Promise<number>
}

export async function deleteWordForm(id: number): Promise<void> {
  await db.transaction('rw', [db.wordForms, db.wordFormMeanings, db.meanings], async () => {
    // Collect affected meaningIds before deleting pairs so we can re-aggregate
    const pairs = await db.wordFormMeanings.where('wordFormId').equals(id).toArray()
    const affectedMeaningIds = [...new Set(pairs.map(p => p.meaningId))]

    await db.wordForms.delete(id)
    await db.wordFormMeanings.where('wordFormId').equals(id).delete()

    // Re-aggregate each affected meaning so its fields stay correct (D-02)
    for (const meaningId of affectedMeaningIds) {
      await aggregateMeaningFromPairs(meaningId)
    }
  })
}

/**
 * Atomically find an existing word form by case-insensitive match or create a new one.
 * Returns the ID of the found or newly created word form.
 *
 * Security (T-02-02-T1): Validates non-empty input before transaction;
 * Dexie auto-escapes values written to IndexedDB.
 */
export async function findOrCreateWordForm(formText: string): Promise<number> {
  if (formText.trim().length === 0) {
    throw new Error('Word form cannot be empty')
  }

  const normalized = formText.toLowerCase()

  return db.transaction('rw', db.wordForms, async () => {
    const existing = await db.wordForms
      .where('form')
      .equals(normalized)
      .first()

    if (existing) {
      return existing.id!
    }

    return (await db.wordForms.add({
      form: normalized,
      createdAt: new Date().toISOString(),
    })) as number
  })
}

/**
 * Update a word form's text.
 * Normalizes to lowercase and validates non-empty (T-06-01-01).
 */
export async function updateWordForm(id: number, form: string): Promise<void> {
  if (form.trim().length === 0) {
    throw new Error('Word form cannot be empty')
  }
  await db.wordForms.update(id, { form: form.trim().toLowerCase() })
}

/**
 * Fetch a single word form by ID
 */
export async function getWordFormById(id: number): Promise<WordForm | undefined> {
  return db.wordForms.get(id)
}

/**
 * Fetch a word form with a count of linked meanings
 */
export async function getWordFormWithMeaningCount(
  id: number
): Promise<(WordForm & { meaningCount: number }) | undefined> {
  const form = await db.wordForms.get(id)
  if (!form || !form.id) return undefined

  const meaningCount = await db.wordFormMeanings
    .where('wordFormId')
    .equals(form.id)
    .count()

  return { ...form, meaningCount }
}

/**
 * Fetch all word forms with a count of their active linked meanings
 * A meaning is active if isActive === true
 * Returns word forms enriched with activeMeaningCount field
 */
export async function getWordFormsWithActiveMeaningCount(): Promise<
  Array<WordForm & { activeMeaningCount: number }>
> {
  const wordForms = await db.wordForms.toArray()
  return Promise.all(
    wordForms.map(async (wf) => {
      // Get all links for this word form
      const links = await db.wordFormMeanings
        .where('wordFormId')
        .equals(wf.id!)
        .toArray()

      // Get all meanings and count the active ones
      const meaningIds = links.map((l) => l.meaningId)
      const meanings = meaningIds.length > 0
        ? await db.meanings.bulkGet(meaningIds)
        : []

      const activeMeaningCount = meanings.filter(
        (m): m is typeof meanings[0] => m !== undefined && m.isActive === true
      ).length

      return { ...wf, activeMeaningCount }
    })
  )
}
