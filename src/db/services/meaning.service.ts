import { db } from '../db'
import type { Meaning } from '../types'
import { CATEGORIES, type Category } from '../schema'

export async function addMeaning(
  meaning: Omit<Meaning, 'id'>
): Promise<number> {
  return db.meanings.add(meaning) as Promise<number>
}

/**
 * Recompute Meaning aggregate fields from all linked WordFormMeaning pairs.
 * Sets isActive, firstUseDate, lastUseDate on the Meaning row.
 * Edge case: if no pairs exist, leaves the meaning unchanged.
 *
 * D-02: Called on every pair write to keep Meaning in sync.
 */
export async function aggregateMeaningFromPairs(meaningId: number): Promise<void> {
  const pairs = await db.wordFormMeanings.where('meaningId').equals(meaningId).toArray()
  if (pairs.length === 0) return

  const isActive = pairs.some(p => p.isActive)
  const firstUseDateMs = Math.min(...pairs.map(p => new Date(p.firstObservationDate).getTime()))
  const lastUseDateMs = Math.max(...pairs.map(p => new Date(p.lastUsedDate).getTime()))
  const firstUseDate = new Date(firstUseDateMs).toISOString().slice(0, 10)
  const lastUseDate = new Date(lastUseDateMs).toISOString().slice(0, 10)

  await db.meanings.update(meaningId, { isActive, firstUseDate, lastUseDate })
}

/**
 * Update a meaning's text and categories.
 * Validates that text is non-empty (T-06-01-01).
 */
export async function updateMeaning(
  id: number,
  fields: { text: string; categories: Category[] }
): Promise<void> {
  if (fields.text.trim().length === 0) {
    throw new Error('Meaning text cannot be empty')
  }
  await db.meanings.update(id, { text: fields.text.trim(), categories: fields.categories })
}

export async function toggleMeaningActive(
  id: number,
  isActive: boolean
): Promise<void> {
  await db.meanings.update(id, { isActive })
}

/**
 * Delete a meaning and all its linked junction rows
 * Cascade delete ensures that deleting a meaning removes all wordFormMeanings links
 */
export async function deleteMeaning(meaningId: number): Promise<void> {
  await db.transaction('rw', [db.wordFormMeanings, db.meanings], async () => {
    // Cascade: delete all wordFormMeanings junction rows referencing this meaning
    await db.wordFormMeanings.where('meaningId').equals(meaningId).delete()
    // Then delete the meaning record itself
    await db.meanings.delete(meaningId)
  })
}

/**
 * Search meanings by case-insensitive prefix match on the text field.
 * Returns up to 10 results. Returns an empty array for empty prefix.
 */
export async function searchMeanings(prefix: string): Promise<Meaning[]> {
  if (prefix.length === 0) {
    return []
  }

  return db.meanings
    .where('text')
    .startsWithIgnoreCase(prefix)
    .limit(10)
    .toArray()
}

/**
 * Get a single meaning by ID
 */
export async function getMeaningById(id: number): Promise<Meaning | undefined> {
  return db.meanings.get(id)
}

/**
 * Get meanings unused for 30+ days that are still active
 * Returns up to 3 meanings (Dashboard "Review these?" section)
 */
export async function getMeaningsUnused30Days(): Promise<Meaning[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  return db.meanings
    .where('lastUseDate')
    .below(thirtyDaysAgo)
    .and(m => m.isActive)
    .limit(3)
    .toArray()
}

/**
 * Update the lastUseDate of a meaning
 */
export async function updateLastUseDate(id: number, date: string): Promise<void> {
  await db.meanings.update(id, { lastUseDate: date })
}

/**
 * Get meanings grouped by category with total count and inactive breakdown
 * Returns object where keys are category names and values are { total, inactive }
 */
export async function getMeaningsGroupedByCategory(): Promise<
  Record<string, { total: number; inactive: number }>
> {
  const allMeanings = await db.meanings.toArray()
  const grouped: Record<string, { total: number; inactive: number }> = {}

  // Initialize all categories with 0 counts
  for (const category of CATEGORIES) {
    grouped[category] = { total: 0, inactive: 0 }
  }

  // Count meanings per category
  for (const meaning of allMeanings) {
    for (const category of meaning.categories) {
      if (grouped[category]) {
        grouped[category].total++
        if (!meaning.isActive) {
          grouped[category].inactive++
        }
      }
    }
  }

  return grouped
}

/**
 * Get meanings grouped by month (YYYY-MM format)
 * Returns array of { month, count } for new meanings added in each month
 * Only includes active meanings
 * Filtered by optional date range
 */
export async function getMeaningsByMonth(
  startDate?: string,
  endDate?: string
): Promise<Array<{ month: string; count: number }>> {
  const now = new Date()
  let actualStartDate = startDate
  const actualEndDate = endDate || now.toISOString()

  if (!actualStartDate) {
    // Default to all time - get earliest meaning's date
    const earliest = await db.meanings
      .orderBy('firstUseDate')
      .first()
    actualStartDate = earliest?.firstUseDate || '2000-01-01T00:00:00.000Z'
  }

  const allMeanings = await db.meanings
    .where('firstUseDate')
    .between(actualStartDate, actualEndDate)
    .and(m => m.isActive)
    .toArray()

  // Group by month
  const monthMap: Record<string, number> = {}
  for (const meaning of allMeanings) {
    const date = new Date(meaning.firstUseDate)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthMap[month] = (monthMap[month] || 0) + 1
  }

  // Convert to sorted array
  const result = Object.entries(monthMap)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Fill in missing months with 0 count
  if (result.length > 0) {
    const months: Array<{ month: string; count: number }> = []
    const current = new Date(result[0].month + '-01')
    const endMonth = new Date(result[result.length - 1].month + '-01')

    while (current <= endMonth) {
      const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
      months.push({
        month: monthStr,
        count: monthMap[monthStr] || 0,
      })
      current.setMonth(current.getMonth() + 1)
    }

    return months
  }

  return []
}

/**
 * Get cumulative meanings by month
 * Returns array of { month, total } showing running total of active meanings over time
 * Filtered by optional date range
 */
export async function getCumulativeMeaningsByMonth(
  startDate?: string,
  endDate?: string
): Promise<Array<{ month: string; total: number }>> {
  const now = new Date()
  let actualStartDate = startDate
  const actualEndDate = endDate || now.toISOString()

  if (!actualStartDate) {
    // Default to all time - get earliest meaning's date
    const earliest = await db.meanings
      .orderBy('firstUseDate')
      .first()
    actualStartDate = earliest?.firstUseDate || '2000-01-01T00:00:00.000Z'
  }

  const allMeanings = await db.meanings
    .where('firstUseDate')
    .between(actualStartDate, actualEndDate)
    .and(m => m.isActive)
    .toArray()

  // Group by month and calculate cumulative
  const monthMap: Record<string, number> = {}
  for (const meaning of allMeanings) {
    const date = new Date(meaning.firstUseDate)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthMap[month] = (monthMap[month] || 0) + 1
  }

  // Convert to cumulative array sorted by month
  const entries = Object.entries(monthMap)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))

  let cumulativeTotal = 0
  const result = entries.map(({ month, count }) => {
    cumulativeTotal += count
    return { month, total: cumulativeTotal }
  })

  return result
}
