import { describe, it, expect } from 'vitest'
import { CATEGORIES } from './schema'

describe('CATEGORIES', () => {
  it('has exactly 14 members', () => {
    expect(CATEGORIES).toHaveLength(14)
  })

  it('contains the exact category values in the correct order', () => {
    expect(CATEGORIES).toEqual([
      'Nouns',
      'Verbs',
      'Adjectives',
      'People',
      'Food',
      'Animals',
      'Vehicles',
      'Body Parts',
      'Onomatopoeia',
      'Requests',
      'Social Communication',
      'Emotions',
      'Places',
      'Other',
    ])
  })

  it('is a readonly const (assignable to string[])', () => {
    const arr: readonly string[] = CATEGORIES
    expect(arr).toBe(CATEGORIES)
  })
})
