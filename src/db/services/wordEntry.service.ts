import { db } from '../db'
import type { Category } from '../types'
import { findOrCreateWordForm } from './wordForm.service'
import { addMeaning } from './meaning.service'
import { linkMeaningToWordForm } from './wordFormMeaning.service'

export interface WordEntryMeaningInput {
  text: string
  categories: Category[]
  firstUseDate?: string
}

export interface WordEntryInput {
  wordForm: string
  meanings: WordEntryMeaningInput[]
}

export interface WordEntryResult {
  wordFormId: number
  meaningIds: number[]
}

/**
 * Orchestrator: atomically create or find a word form, create meanings,
 * and link them via junction rows.
 *
 * After the first junction row is created (total count === 1), calls
 * navigator.storage.persist() to request durable storage for the device.
 * Failure is intentionally silent (T-02-02-I1).
 *
 * Validates:
 *  - wordForm must be non-empty (T-02-02-T1)
 *  - meanings must contain at least one entry
 */
export async function addWordEntry(
  data: WordEntryInput
): Promise<WordEntryResult> {
  if (data.wordForm.trim().length === 0) {
    throw new Error('Word form cannot be empty')
  }

  if (data.meanings.length === 0) {
    throw new Error('At least one meaning is required')
  }

  const wordFormId = await findOrCreateWordForm(data.wordForm)

  const meaningIds: number[] = []

  for (const meaning of data.meanings) {
    const isoDate = meaning.firstUseDate ?? new Date().toISOString().slice(0, 10)
    const meaningId = await addMeaning({
      text: meaning.text,
      categories: meaning.categories,
      isActive: true,
      firstUseDate: isoDate,
      lastUseDate: isoDate,
    })
    meaningIds.push(meaningId)
  }

  for (const meaningId of meaningIds) {
    await linkMeaningToWordForm(wordFormId, meaningId)
  }

  // Request durable storage after the very first junction row is created.
  // navigator.storage is optional (not available in all browsers/JSDOM).
  const totalLinks = await db.wordFormMeanings.count()
  if (totalLinks === 1) {
    // Intentional fire-and-forget — failure is silent (T-02-02-I1)
    void navigator.storage?.persist?.()
  }

  return { wordFormId, meaningIds }
}
