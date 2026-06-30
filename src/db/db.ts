import Dexie, { type EntityTable } from 'dexie'
import type { ChildProfile, WordForm, Meaning, WordFormMeaning } from './schema'

export class AppDB extends Dexie {
  childProfile!: EntityTable<ChildProfile, 'id'>
  wordForms!: EntityTable<WordForm, 'id'>
  meanings!: EntityTable<Meaning, 'id'>
  wordFormMeanings!: EntityTable<WordFormMeaning, 'id'>

  constructor() {
    super('LittleWordsDB')
    this.version(1).stores({
      childProfile: '++id',
      wordForms: '++id, form, createdAt',
      meanings: '++id, isActive, firstUseDate, lastUseDate, *categories',
      wordFormMeanings: '++id, wordFormId, meaningId, [wordFormId+meaningId]',
    })
  }
}

export const db = new AppDB()
