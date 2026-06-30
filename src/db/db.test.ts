import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import Dexie from 'dexie'
import { AppDB } from './db'

describe('AppDB', () => {
  let db: AppDB

  beforeEach(async () => {
    await Dexie.delete('LittleWordsDB')
    db = new AppDB()
  })

  afterEach(async () => {
    db.close()
    await Dexie.delete('LittleWordsDB')
  })

  it('opens without throwing', async () => {
    await expect(db.open()).resolves.not.toThrow()
  })

  it('has a childProfile table', () => {
    expect(db.childProfile).toBeDefined()
  })

  it('has a wordForms table', () => {
    expect(db.wordForms).toBeDefined()
  })

  it('has a meanings table', () => {
    expect(db.meanings).toBeDefined()
  })

  it('has a wordFormMeanings table', () => {
    expect(db.wordFormMeanings).toBeDefined()
  })

  it('wordForms table has an index on "form"', async () => {
    await db.open()
    const indexNames = db.wordForms.schema.indexes.map((idx) => idx.name)
    expect(indexNames).toContain('form')
  })

  it('meanings table has a multi-entry index on "categories"', async () => {
    await db.open()
    const categoriesIndex = db.meanings.schema.indexes.find(
      (idx) => idx.name === 'categories'
    )
    expect(categoriesIndex).toBeDefined()
    expect(categoriesIndex?.multiEntry).toBe(true)
  })

  it('wordFormMeanings table has a compound index "[wordFormId+meaningId]"', async () => {
    await db.open()
    const indexNames = db.wordFormMeanings.schema.indexes.map((idx) => idx.name)
    expect(indexNames).toContain('[wordFormId+meaningId]')
  })
})
