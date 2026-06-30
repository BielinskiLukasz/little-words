import { db } from '../db'
import type { WordForm } from '../types'

export async function addWordForm(
  form: Omit<WordForm, 'id'>
): Promise<number> {
  return db.wordForms.add(form)
}

export async function deleteWordForm(id: number): Promise<void> {
  await db.transaction('rw', [db.wordForms, db.wordFormMeanings], async () => {
    await db.wordForms.delete(id)
    await db.wordFormMeanings.where('wordFormId').equals(id).delete()
  })
}
