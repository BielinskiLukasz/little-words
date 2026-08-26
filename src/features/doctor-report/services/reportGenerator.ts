import { differenceInYears, differenceInMonths, parseISO, subDays } from 'date-fns'
import type { ChildProfile, Meaning, WordForm } from '@/db/schema'
import { CATEGORIES } from '@/db/schema'

export interface ReportInput {
  profile: ChildProfile
  meanings: Meaning[]
  wordForms: WordForm[]
  t: (key: string, opts?: Record<string, unknown>) => string
  now?: Date
}

export function generateReport(input: ReportInput): string {
  const { profile, meanings, wordForms, t } = input
  const now = input.now ?? new Date()

  // Age calculation
  const ageYears = differenceInYears(now, parseISO(profile.birthDate))
  const ageMonths = differenceInMonths(now, parseISO(profile.birthDate))
  const ageStr =
    ageYears < 2
      ? t('report.ageMonths', { count: ageMonths })
      : t('report.ageYears', { count: ageYears })

  // Meaning counts
  const activeMeanings = meanings.filter((m) => m.isActive)
  const inactiveMeanings = meanings.filter((m) => !m.isActive)
  // date-only cutoff — safe for string comparison against date-only firstUseDate values
  const cutoff = subDays(now, 90).toISOString().split('T')[0]
  const newInLast3Months = activeMeanings.filter((m) => m.firstUseDate >= cutoff).length

  // Word form count
  const activeWordForms = wordForms.length

  // Top 3 categories by active meaning count
  const categoryCounts = CATEGORIES.map((cat) => ({
    cat,
    count: activeMeanings.filter((m) => m.categories.includes(cat)).length,
  }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  const topCategoriesLines = categoryCounts.map(
    (entry) => `  ${t(`category.${entry.cat}`)}: ${entry.count}`
  )

  // Medical flags — always show all three
  const flagLine = (key: string, value: boolean | undefined) =>
    `${t(key)}: ${value ? t('report.yes') : t('report.no')}`

  // Build report lines
  const reportDate = now.toISOString().split('T')[0]
  const lines: string[] = [
    `${t('report.date')}: ${reportDate}`,
    `${t('report.child')}: ${profile.name}`,
    `${t('report.age')}: ${ageStr}`,
    `${t('report.activeMeanings')}: ${activeMeanings.length}`,
    `${t('report.inactiveMeanings')}: ${inactiveMeanings.length}`,
    `${t('report.newInLast3Months')}: ${newInLast3Months}`,
    `${t('report.activeWordForms')}: ${activeWordForms}`,
    `${t('report.topCategories')}:`,
    ...topCategoriesLines,
    `${t('report.languages')}: ${profile.languages.join(', ')}`,
    `${t('report.medicalContext')}:`,
    `  ${flagLine('report.prematureBirth', profile.prematureBirth)}`,
    `  ${flagLine('report.speechTherapy', profile.speechTherapy)}`,
    `  ${flagLine('report.neurologicalCare', profile.neurologicalCare)}`,
    `${t('report.parentNotes')}: ${profile.parentNotes ?? ''}`,
  ]

  return lines.join('\n')
}
