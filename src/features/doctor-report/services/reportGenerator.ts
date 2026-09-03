import { differenceInMonths, parseISO } from 'date-fns'
import type { ChildProfile, Meaning, WordForm } from '@/db/schema'
import { CATEGORIES } from '@/db/schema'

export interface ReportInput {
  profile: ChildProfile
  meanings: Meaning[]
  wordForms: WordForm[]
  t: (key: string, opts?: Record<string, unknown>) => string
  now?: Date
  /** Word-form count per meaning id — computed by DoctorReportPage from wordFormMeanings */
  meaningWordFormCounts?: Record<number, number>
}

/** Returns a section with a heading followed by indented bullet items */
function bulletSection(heading: string, items: string[]): string[] {
  return [heading, ...items.map((text) => `  - ${text}`)]
}

export function generateReport(input: ReportInput): string {
  const { profile, meanings, wordForms, t, meaningWordFormCounts = {} } = input
  const now = input.now ?? new Date()

  // --- Age (D-09) ---
  // < 12 months → months only;  >= 12 months → X years Y months
  const totalMonths = differenceInMonths(now, parseISO(profile.birthDate))
  const ageStr =
    totalMonths < 12
      ? t('report.months', { count: totalMonths })
      : t('report.yearsMonths', {
          years: Math.floor(totalMonths / 12),
          months: totalMonths % 12,
        })

  // --- Meaning counts ---
  const activeMeanings = meanings.filter((m) => m.isActive)
  const inactiveMeanings = meanings.filter((m) => !m.isActive)
  // UTC arithmetic avoids date-fns local-time drift when timezone != UTC
  const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const newInLast3Months = activeMeanings.filter((m) => m.firstUseDate.slice(0, 10) >= cutoff).length

  // --- Top 3 categories ---
  const topCategoriesLines = CATEGORIES.map((cat) => ({
    cat,
    count: activeMeanings.filter((m) => m.categories.includes(cat)).length,
  }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((entry) => `  ${t(`category.${entry.cat}`)}: ${entry.count}`)

  // --- D-10: Per-category meaning list ---
  // Categories with active meanings, sorted alphabetically; meanings sorted alphabetically within each
  const byCategoryLines: string[] = [t('report.byCategory')]
  for (const cat of CATEGORIES.filter((c) => activeMeanings.some((m) => m.categories.includes(c))).sort()) {
    byCategoryLines.push(t(`category.${cat}`))
    for (const meaning of activeMeanings
      .filter((m) => m.categories.includes(cat))
      .sort((a, b) => a.text.localeCompare(b.text))) {
      byCategoryLines.push(`  - ${meaning.text} (${meaningWordFormCounts[meaning.id!] ?? 0})`)
    }
  }

  // --- D-11: 5 most recently added active meanings ---
  const recentAdditionsLines = bulletSection(
    t('report.recentAdditions'),
    activeMeanings
      .slice()
      .sort((a, b) => b.firstUseDate.localeCompare(a.firstUseDate))
      .slice(0, 5)
      .map((m) => m.text)
  )

  // --- D-12: 5 most recently forgotten inactive meanings ---
  const recentForgottenLines = bulletSection(
    t('report.recentForgotten'),
    inactiveMeanings
      .slice()
      .sort((a, b) => b.lastUseDate.localeCompare(a.lastUseDate))
      .slice(0, 5)
      .map((m) => m.text)
  )

  // --- Medical flags ---
  const flagLine = (key: string, value: boolean | undefined) =>
    `${t(key)}: ${value ? t('report.yes') : t('report.no')}`

  // --- Assemble report ---
  const reportDate = now.toISOString().split('T')[0]
  const lines: string[] = [
    `${t('report.date')}: ${reportDate}`,
    `${t('report.child')}: ${profile.name}`,
    `${t('report.age')}: ${ageStr}`,
    `${t('report.activeMeanings')}: ${activeMeanings.length}`,
    `${t('report.inactiveMeanings')}: ${inactiveMeanings.length}`,
    `${t('report.newInLast3Months')}: ${newInLast3Months}`,
    `${t('report.activeWordForms')}: ${wordForms.length}`,
    `${t('report.topCategories')}:`,
    ...topCategoriesLines,
    '',
    ...byCategoryLines,
    '',
    ...recentAdditionsLines,
    '',
    ...recentForgottenLines,
    '',
    `${t('report.languages')}: ${profile.languages.join(', ')}`,
    `${t('report.medicalContext')}:`,
    `  ${flagLine('report.prematureBirth', profile.prematureBirth)}`,
    `  ${flagLine('report.speechTherapy', profile.speechTherapy)}`,
    `  ${flagLine('report.neurologicalCare', profile.neurologicalCare)}`,
    `${t('report.parentNotes')}: ${profile.parentNotes ?? ''}`,
  ]

  return lines.join('\n')
}
