import { db } from '../db'
import type { WordForm, Meaning, WordFormMeaning } from '../types'
import { aggregateMeaningFromPairs } from './meaning.service'

/**
 * Idempotent link: creates a junction row between a word form and a meaning.
 * If the pair already exists, does nothing (no duplicate insert).
 *
 * Security (T-02-02-T2): Checks for existing pair via compound index
 * [wordFormId+meaningId] before inserting to prevent duplicate junction rows.
 *
 * D-04: Accepts optional pairFields to store firstObservationDate, lastUsedDate,
 * and isActive on the new row. Defaults to today's date and isActive=true.
 */
export async function linkMeaningToWordForm(
  wordFormId: number,
  meaningId: number,
  pairFields?: { firstObservationDate: string; lastUsedDate: string; isActive?: boolean }
): Promise<void> {
  const existing = await db.wordFormMeanings
    .where('[wordFormId+meaningId]')
    .equals([wordFormId, meaningId])
    .first()

  if (existing) {
    return
  }

  const today = new Date().toISOString().slice(0, 10)
  const fields = pairFields ?? { firstObservationDate: today, lastUsedDate: today }

  await db.wordFormMeanings.add({
    wordFormId,
    meaningId,
    firstObservationDate: fields.firstObservationDate,
    lastUsedDate: fields.lastUsedDate,
    isActive: fields.isActive ?? true,
  })
}

/** @deprecated Use linkMeaningToWordForm instead (non-idempotent, kept for backward compat) */
export async function linkMeaning(
  wordFormId: number,
  meaningId: number
): Promise<number> {
  const today = new Date().toISOString().slice(0, 10)
  return db.wordFormMeanings.add({
    wordFormId,
    meaningId,
    firstObservationDate: today,
    lastUsedDate: today,
    isActive: true,
  }) as Promise<number>
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

/**
 * Update fields on a WordFormMeaning pair and re-aggregate the parent Meaning.
 * Runs inside a single transaction so pair + meaning stay in sync (D-02).
 */
export async function updatePairFields(
  pairId: number,
  fields: Partial<Pick<WordFormMeaning, 'firstObservationDate' | 'lastUsedDate' | 'isActive'>>
): Promise<void> {
  await db.transaction('rw', [db.wordFormMeanings, db.meanings], async () => {
    await db.wordFormMeanings.update(pairId, fields)
    const pair = await db.wordFormMeanings.get(pairId)
    if (pair) {
      await aggregateMeaningFromPairs(pair.meaningId)
    }
  })
}

/**
 * Return all WordFormMeaning pairs enriched with word form text and meaning text.
 * Pairs whose word form or meaning cannot be found are filtered out (defensive).
 */
export async function getPairsWithDetails(): Promise<Array<{
  id: number
  wordFormId: number
  meaningId: number
  wordFormText: string
  meaningText: string
  firstObservationDate: string
  lastUsedDate: string
  isActive: boolean
}>> {
  const pairs = await db.wordFormMeanings.toArray()
  if (pairs.length === 0) return []

  const wordFormIds = [...new Set(pairs.map(p => p.wordFormId))]
  const meaningIds = [...new Set(pairs.map(p => p.meaningId))]

  const wordForms = await db.wordForms.bulkGet(wordFormIds)
  const meanings = await db.meanings.bulkGet(meaningIds)

  const wordFormMap = new Map<number, WordForm>(
    wordForms
      .filter((wf): wf is WordForm => wf !== undefined && wf.id !== undefined)
      .map(wf => [wf.id!, wf])
  )
  const meaningMap = new Map<number, Meaning>(
    meanings
      .filter((m): m is Meaning => m !== undefined && m.id !== undefined)
      .map(m => [m.id!, m])
  )

  return pairs
    .map(pair => {
      const wordForm = wordFormMap.get(pair.wordFormId)
      const meaning = meaningMap.get(pair.meaningId)
      if (!wordForm || !meaning) return null
      return {
        id: pair.id!,
        wordFormId: pair.wordFormId,
        meaningId: pair.meaningId,
        wordFormText: wordForm.form,
        meaningText: meaning.text,
        firstObservationDate: pair.firstObservationDate,
        lastUsedDate: pair.lastUsedDate,
        isActive: pair.isActive,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
}
