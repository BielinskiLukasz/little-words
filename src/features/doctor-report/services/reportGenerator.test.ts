import { describe, it, expect } from 'vitest'
import { generateReport } from './reportGenerator'
import type { ChildProfile, Meaning, WordForm } from '@/db/schema'

// Stub t function: returns count as string for count options, key name otherwise
const t = (key: string, opts?: Record<string, unknown>): string => {
  if (opts?.count !== undefined) return String(opts.count)
  return key
}

const baseProfile: ChildProfile = {
  id: 1,
  name: 'Anna',
  birthDate: '2022-01-01',
  languages: ['pl', 'en'],
  createdAt: '2024-01-01',
  prematureBirth: false,
  speechTherapy: true,
  neurologicalCare: false,
  parentNotes: 'Some notes',
}

const now = new Date('2026-01-01T00:00:00.000Z')

const activeMeaning = (overrides: Partial<Meaning> = {}): Meaning => ({
  id: 1,
  text: 'test',
  categories: ['Nouns'],
  isActive: true,
  firstUseDate: '2025-10-01',
  lastUseDate: '2025-12-01',
  ...overrides,
})

const inactiveMeaning = (overrides: Partial<Meaning> = {}): Meaning => ({
  id: 2,
  text: 'inactive',
  categories: ['Verbs'],
  isActive: false,
  firstUseDate: '2024-01-01',
  lastUseDate: '2024-06-01',
  ...overrides,
})

const baseWordForm: WordForm = {
  id: 1,
  form: 'mama',
  createdAt: '2025-01-01',
}

describe('generateReport', () => {
  it('output contains profile.name', () => {
    const result = generateReport({ profile: baseProfile, meanings: [], wordForms: [], t, now })
    expect(result).toContain('Anna')
  })

  it('active count equals meanings.filter(m => m.isActive).length', () => {
    const meanings = [activeMeaning(), activeMeaning({ id: 2 }), inactiveMeaning()]
    const result = generateReport({ profile: baseProfile, meanings, wordForms: [], t, now })
    // t('report.activeMeanings') returns key, count is 2
    expect(result).toContain('report.activeMeanings: 2')
  })

  it('inactive count equals meanings.filter(m => !m.isActive).length', () => {
    const meanings = [activeMeaning(), inactiveMeaning(), inactiveMeaning({ id: 3 })]
    const result = generateReport({ profile: baseProfile, meanings, wordForms: [], t, now })
    expect(result).toContain('report.inactiveMeanings: 2')
  })

  it('newInLast3Months counts only active meanings within 90 days before now', () => {
    // now = 2026-01-01; 90 days before = ~2025-10-03
    const recentActive = activeMeaning({ firstUseDate: '2025-11-01', id: 1 })
    const oldActive = activeMeaning({ firstUseDate: '2025-01-01', id: 2 })
    const recentInactive = inactiveMeaning({ firstUseDate: '2025-11-01', id: 3 })
    const result = generateReport({
      profile: baseProfile,
      meanings: [recentActive, oldActive, recentInactive],
      wordForms: [],
      t,
      now,
    })
    expect(result).toContain('report.newInLast3Months: 1')
  })

  it('active word form count equals wordForms.length', () => {
    const wordForms = [baseWordForm, { ...baseWordForm, id: 2, form: 'tata' }]
    const result = generateReport({ profile: baseProfile, meanings: [], wordForms, t, now })
    expect(result).toContain('report.activeWordForms: 2')
  })

  it('top 3 categories ranked by count of active meanings (top 3 only)', () => {
    const meanings: Meaning[] = [
      activeMeaning({ id: 1, categories: ['Nouns'] }),
      activeMeaning({ id: 2, categories: ['Nouns'] }),
      activeMeaning({ id: 3, categories: ['Nouns'] }),
      activeMeaning({ id: 4, categories: ['Verbs'] }),
      activeMeaning({ id: 5, categories: ['Verbs'] }),
      activeMeaning({ id: 6, categories: ['Adjectives'] }),
      activeMeaning({ id: 7, categories: ['People'] }),
    ]
    const result = generateReport({ profile: baseProfile, meanings, wordForms: [], t, now })
    expect(result).toContain('Nouns: 3')
    expect(result).toContain('Verbs: 2')
    expect(result).toContain('Adjectives: 1')
    // People is 4th — should not appear
    expect(result).not.toContain('People: 1')
  })

  it('medical flags always appear with yes/no', () => {
    const result = generateReport({ profile: baseProfile, meanings: [], wordForms: [], t, now })
    // prematureBirth=false → report.no; speechTherapy=true → report.yes; neurologicalCare=false → report.no
    expect(result).toContain('report.prematureBirth: report.no')
    expect(result).toContain('report.speechTherapy: report.yes')
    expect(result).toContain('report.neurologicalCare: report.no')
  })

  it('age < 2 years → uses month count', () => {
    // Child born 18 months before now
    const profile: ChildProfile = { ...baseProfile, birthDate: '2024-07-01' }
    const result = generateReport({ profile, meanings: [], wordForms: [], t, now })
    // t('report.ageMonths', {count: 18}) returns '18'
    expect(result).toContain('report.age: 18')
    expect(result).not.toContain('report.ageYears')
  })

  it('age >= 2 years → uses year count', () => {
    // Child born 3 years before now
    const profile: ChildProfile = { ...baseProfile, birthDate: '2023-01-01' }
    const result = generateReport({ profile, meanings: [], wordForms: [], t, now })
    expect(result).toContain('report.age: 3')
  })

  it('parentNotes appears in output with empty value when empty', () => {
    const profile: ChildProfile = { ...baseProfile, parentNotes: '' }
    const result = generateReport({ profile, meanings: [], wordForms: [], t, now })
    expect(result).toContain('report.parentNotes:')
  })

  it('languages joined with ", "', () => {
    const result = generateReport({ profile: baseProfile, meanings: [], wordForms: [], t, now })
    expect(result).toContain('pl, en')
  })
})

describe('generateReport — edge cases', () => {
  // Fixed reference point for deterministic date math
  const now = new Date('2026-01-01T00:00:00.000Z')

  it('child aged 0 years (11 months) → uses month count not year count', () => {
    const profile: ChildProfile = { ...baseProfile, birthDate: '2025-02-01' }
    const result = generateReport({ profile, meanings: [], wordForms: [], t, now })
    // t('report.ageMonths', {count: N}) returns N as string
    // t('report.ageYears', ...) returns 'report.ageYears' — should NOT appear as age
    expect(result).not.toContain('report.ageYears')
    // The age line should contain a number (months count), not 'report.ageYears'
    const ageLineMatch = result.match(/report\.age: (.+)/)
    expect(ageLineMatch).not.toBeNull()
    const ageValue = ageLineMatch![1]
    // Should be a numeric string (months), not the ageYears key
    expect(Number.isNaN(Number(ageValue))).toBe(false)
  })

  it('child aged exactly 2 years → uses year count', () => {
    const profile: ChildProfile = { ...baseProfile, birthDate: '2024-01-01' }
    const result = generateReport({ profile, meanings: [], wordForms: [], t, now })
    // t('report.ageYears', {count: 2}) returns '2'
    expect(result).toContain('report.age: 2')
  })

  it('child aged 3 years → uses year count', () => {
    const profile: ChildProfile = { ...baseProfile, birthDate: '2023-01-01' }
    const result = generateReport({ profile, meanings: [], wordForms: [], t, now })
    expect(result).toContain('report.age: 3')
  })

  it('all meanings inactive → active=0, inactive=total', () => {
    const meanings = [
      inactiveMeaning({ id: 1 }),
      inactiveMeaning({ id: 2 }),
      inactiveMeaning({ id: 3 }),
    ]
    const result = generateReport({ profile: baseProfile, meanings, wordForms: [], t, now })
    expect(result).toContain('report.activeMeanings: 0')
    expect(result).toContain('report.inactiveMeanings: 3')
  })

  it('zero meanings → all counts 0', () => {
    const result = generateReport({ profile: baseProfile, meanings: [], wordForms: [], t, now })
    expect(result).toContain('report.activeMeanings: 0')
    expect(result).toContain('report.inactiveMeanings: 0')
    expect(result).toContain('report.newInLast3Months: 0')
  })

  it('meaning with firstUseDate exactly 91 days before now and isActive → NOT counted', () => {
    const firstUseDate = new Date(now.getTime() - 91 * 24 * 60 * 60 * 1000).toISOString()
    const meanings = [activeMeaning({ id: 1, firstUseDate })]
    const result = generateReport({ profile: baseProfile, meanings, wordForms: [], t, now })
    expect(result).toContain('report.newInLast3Months: 0')
  })

  it('meaning with firstUseDate exactly 89 days before now and isActive → IS counted', () => {
    const firstUseDate = new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000).toISOString()
    const meanings = [activeMeaning({ id: 1, firstUseDate })]
    const result = generateReport({ profile: baseProfile, meanings, wordForms: [], t, now })
    expect(result).toContain('report.newInLast3Months: 1')
  })

  it('inactive meaning within 90 days → NOT counted in newInLast3Months', () => {
    const firstUseDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const meanings = [inactiveMeaning({ id: 1, firstUseDate })]
    const result = generateReport({ profile: baseProfile, meanings, wordForms: [], t, now })
    expect(result).toContain('report.newInLast3Months: 0')
  })

  it('meaning with date-only firstUseDate exactly at cutoff day (90 days) → IS counted', () => {
    // now = 2026-01-01; cutoff = 2025-10-03 (date-only after WR-04 fix)
    // string comparison '2025-10-03' >= '2025-10-03' must be true
    const meanings = [activeMeaning({ id: 1, firstUseDate: '2025-10-03' })]
    const result = generateReport({ profile: baseProfile, meanings, wordForms: [], t, now })
    expect(result).toContain('report.newInLast3Months: 1')
  })

  it('only 2 categories have active meanings → topCategories contains exactly 2 entries', () => {
    const meanings: Meaning[] = [
      activeMeaning({ id: 1, categories: ['Nouns'] }),
      activeMeaning({ id: 2, categories: ['Verbs'] }),
    ]
    const result = generateReport({ profile: baseProfile, meanings, wordForms: [], t, now })
    expect(result).toContain('Nouns: 1')
    expect(result).toContain('Verbs: 1')
    // No 3rd category line (other categories have 0)
    const lines = result.split('\n').filter((l) => /^  \w.+: \d+$/.test(l))
    expect(lines.length).toBe(2)
  })

  it('zero categories have active meanings → topCategories section is empty', () => {
    const result = generateReport({ profile: baseProfile, meanings: [], wordForms: [], t, now })
    // No category count lines
    const lines = result.split('\n').filter((l) => /^  \w.+: \d+$/.test(l))
    expect(lines.length).toBe(0)
  })

  it('tie at rank 3 → all tied categories appear; total is 3', () => {
    const meanings: Meaning[] = [
      // Nouns: 3, Verbs: 2, Adjectives: 1, People: 1 (tie for 3rd)
      activeMeaning({ id: 1, categories: ['Nouns'] }),
      activeMeaning({ id: 2, categories: ['Nouns'] }),
      activeMeaning({ id: 3, categories: ['Nouns'] }),
      activeMeaning({ id: 4, categories: ['Verbs'] }),
      activeMeaning({ id: 5, categories: ['Verbs'] }),
      activeMeaning({ id: 6, categories: ['Adjectives'] }),
      activeMeaning({ id: 7, categories: ['People'] }),
    ]
    const result = generateReport({ profile: baseProfile, meanings, wordForms: [], t, now })
    // Top 3: Nouns(3), Verbs(2), Adjectives(1) — People(1) is 4th by CATEGORIES order
    const catLines = result.split('\n').filter((l) => /^  \w.+: \d+$/.test(l))
    expect(catLines.length).toBe(3)
    expect(result).toContain('Nouns: 3')
    expect(result).toContain('Verbs: 2')
  })

  it('prematureBirth=undefined → output contains report.no', () => {
    const profile: ChildProfile = { ...baseProfile, prematureBirth: undefined }
    const result = generateReport({ profile, meanings: [], wordForms: [], t, now })
    expect(result).toContain('report.prematureBirth: report.no')
  })

  it('speechTherapy=false → output contains report.no', () => {
    const profile: ChildProfile = { ...baseProfile, speechTherapy: false }
    const result = generateReport({ profile, meanings: [], wordForms: [], t, now })
    expect(result).toContain('report.speechTherapy: report.no')
  })

  it('neurologicalCare=true → output contains report.yes', () => {
    const profile: ChildProfile = { ...baseProfile, neurologicalCare: true }
    const result = generateReport({ profile, meanings: [], wordForms: [], t, now })
    expect(result).toContain('report.neurologicalCare: report.yes')
  })

  it('parentNotes=undefined → does not throw; contains parentNotes label', () => {
    const profile: ChildProfile = { ...baseProfile, parentNotes: undefined }
    expect(() => generateReport({ profile, meanings: [], wordForms: [], t, now })).not.toThrow()
    const result = generateReport({ profile, meanings: [], wordForms: [], t, now })
    expect(result).toContain('report.parentNotes:')
  })

  it("parentNotes='' → contains parentNotes label", () => {
    const profile: ChildProfile = { ...baseProfile, parentNotes: '' }
    const result = generateReport({ profile, meanings: [], wordForms: [], t, now })
    expect(result).toContain('report.parentNotes:')
  })

  it("languages=['pl', 'en'] → output contains 'pl, en'", () => {
    const result = generateReport({ profile: baseProfile, meanings: [], wordForms: [], t, now })
    expect(result).toContain('pl, en')
  })
})
