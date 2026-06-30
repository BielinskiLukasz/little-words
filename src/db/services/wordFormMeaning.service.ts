import { db } from '../db'

/**
 * Idempotent link: creates a junction row between a word form and a meaning.
 * If the pair already exists, does nothing (no duplicate insert).
 *
 * Security (T-02-02-T2): Checks for existing pair via compound index
 * [wordFormId+meaningId] before inserting to prevent duplicate junction rows.
 */
export async function linkMeaningToWordForm(
  wordFormId: number,
  meaningId: number
): Promise<void> {
  const existing = await db.wordFormMeanings
    .where('[wordFormId+meaningId]')
    .equals([wordFormId, meaningId])
    .first()

  if (existing) {
    return
  }

  await db.wordFormMeanings.add({ wordFormId, meaningId })
}

/** @deprecated Use linkMeaningToWordForm instead (non-idempotent, kept for backward compat) */
export async function linkMeaning(
  wordFormId: number,
  meaningId: number
): Promise<number> {
  return db.wordFormMeanings.add({ wordFormId, meaningId }) as Promise<number>
}

export async function unlinkMeaning(
  wordFormId: number,
  meaningId: number
): Promise<void> {
  await db.wordFormMeanings
    .where('[wordFormId+meaningId]')
    .equals([wordFormId, meaningId])
    .delete()
}
