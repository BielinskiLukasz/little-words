export const CATEGORIES = [
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
] as const

export type Category = typeof CATEGORIES[number]

export interface ChildProfile {
  id?: number
  name: string
  birthDate: string
  languages: string[]
  createdAt: string
  // Phase 2 optional fields included in v1 schema to avoid migration (D-08)
  prematureBirth?: boolean
  speechTherapy?: boolean
  neurologicalCare?: boolean
  parentNotes?: string
}

export interface WordForm {
  id?: number
  form: string
  createdAt: string
}

export interface Meaning {
  id?: number
  text: string
  categories: Category[]
  isActive: boolean
  firstUseDate: string
  lastUseDate: string
}

export interface WordFormMeaning {
  id?: number
  wordFormId: number
  meaningId: number
}
