import { db } from '../db'

export async function linkMeaning(
  wordFormId: number,
  meaningId: number
): Promise<number> {
  return db.wordFormMeanings.add({ wordFormId, meaningId })
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
