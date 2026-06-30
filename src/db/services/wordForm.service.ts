import { db } from '../db'
import type { WordForm } from '../types'

export async function addWordForm(
  form: Omit<WordForm, 'id'>
): Promise<number> {
  return db.wordForms.add(form) as Promise<number>
}

export async function deleteWordForm(id: number): Promise<void> {
  await db.transaction('rw', [db.wordForms, db.wordFormMeanings], async () => {
    await db.wordForms.delete(id)
    await db.wordFormMeanings.where('wordFormId').equals(id).delete()
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
