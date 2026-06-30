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
