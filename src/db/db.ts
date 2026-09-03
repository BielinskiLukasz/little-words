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
    // v2: adds text index on meanings for searchMeanings (startsWithIgnoreCase)
    this.version(2).stores({
      childProfile: '++id',
      wordForms: '++id, form, createdAt',
      meanings: '++id, text, isActive, firstUseDate, lastUseDate, *categories',
      wordFormMeanings: '++id, wordFormId, meaningId, [wordFormId+meaningId]',
    })
    // v3: adds firstObservationDate, lastUsedDate, isActive to WordFormMeaning (D-01)
    // No index changes — upgrade copies Meaning aggregate values to existing pairs (D-03)
    this.version(3).stores({
      childProfile: '++id',
      wordForms: '++id, form, createdAt',
      meanings: '++id, text, isActive, firstUseDate, lastUseDate, *categories',
      wordFormMeanings: '++id, wordFormId, meaningId, [wordFormId+meaningId]',
    }).upgrade(async (tx) => {
      const today = new Date().toISOString().slice(0, 10)
      const pairs = await tx.table('wordFormMeanings').toArray()
      for (const pair of pairs) {
        const meaning = await tx.table('meanings').get(pair.meaningId)
        if (meaning) {
          await tx.table('wordFormMeanings').update(pair.id, {
            firstObservationDate: meaning.firstUseDate,
            lastUsedDate: meaning.lastUseDate,
            isActive: meaning.isActive,
          })
        } else {
          // Orphan pair (should not occur in practice): set safe defaults
          await tx.table('wordFormMeanings').update(pair.id, {
            firstObservationDate: today,
            lastUsedDate: today,
            isActive: false,
          })
        }
      }
    })
  }
}

export const db = new AppDB()
