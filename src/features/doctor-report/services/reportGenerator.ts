import { differenceInMonths, parseISO } from 'date-fns'
import type { ChildProfile, Meaning, WordForm } from '@/db/schema'
import { CATEGORIES } from '@/db/schema'

export interface ReportInput {
  profile: ChildProfile
  meanings: Meaning[]
  wordForms: WordForm[]
  t: (key: string, opts?: Record<string, unknown>) => string
  now?: Date
  meaningWordFormCounts?: Record<number, number>
}

export function generateReport(input: ReportInput): string {
  const { profile, meanings, wordForms, t, meaningWordFormCounts = {} } = input
  const now = input.now ?? new Date()

  // Age calculation (D-09): < 12 months → months only; >= 12 months → X years Y months
  const totalMonths = differenceInMonths(now, parseISO(profile.birthDate))
  let ageStr: string
  if (totalMonths < 12) {
    ageStr = t('report.months', { count: totalMonths })
  } else {
    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12
    ageStr = t('report.yearsMonths', { years, months })
  }

  // Meaning counts
  const activeMeanings = meanings.filter((m) => m.isActive)
  const inactiveMeanings = meanings.filter((m) => !m.isActive)
  // UTC arithmetic avoids date-fns local-time drift when timezone != UTC
  const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const newInLast3Months = activeMeanings.filter((m) => m.firstUseDate.slice(0, 10) >= cutoff).length

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

  // D-10: Per-category meaning list — one section per category that has active meanings
  const activeCategoriesAlpha = CATEGORIES.filter((cat) =>
    activeMeanings.some((m) => m.categories.includes(cat))
  ).sort()

  const byCategoryLines: string[] = [t('report.byCategory')]
  for (const cat of activeCategoriesAlpha) {
    byCategoryLines.push(t(`category.${cat}`))
    const catMeanings = activeMeanings
      .filter((m) => m.categories.includes(cat))
      .sort((a, b) => a.text.localeCompare(b.text))
    for (const meaning of catMeanings) {
      const count = meaningWordFormCounts[meaning.id!] ?? 0
      byCategoryLines.push(`  - ${meaning.text} (${count})`)
    }
  }

  // D-11: 5 most recently added active meanings (by firstUseDate desc)
  const recentAdditions = activeMeanings
    .slice()
    .sort((a, b) => b.firstUseDate.localeCompare(a.firstUseDate))
    .slice(0, 5)

  const recentAdditionsLines: string[] = [t('report.recentAdditions')]
  for (const meaning of recentAdditions) {
    recentAdditionsLines.push(`  - ${meaning.text}`)
  }

  // D-12: 5 most recently forgotten inactive meanings (by lastUseDate desc)
  const recentForgotten = inactiveMeanings
    .slice()
    .sort((a, b) => b.lastUseDate.localeCompare(a.lastUseDate))
    .slice(0, 5)

  const recentForgottenLines: string[] = [t('report.recentForgotten')]
  for (const meaning of recentForgotten) {
    recentForgottenLines.push(`  - ${meaning.text}`)
  }

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
