import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { db } from '@/db/db'
import { getMeaningsByMonth, getCumulativeMeaningsByMonth } from '@/db/services/meaning.service'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type DateRange = '6m' | '12m' | 'all'
type TimelineTab = 'growth' | 'total'

export function TimelinePage() {
  const { t } = useTranslation('common')
  const [activeTab, setActiveTab] = useState<TimelineTab>('growth')
  const [dateRange, setDateRange] = useState<DateRange>('all')

  // Calculate date range
  const getDateRange = () => {
    const now = new Date()
    let startDate: string | undefined

    if (dateRange === '6m') {
      const sixMonthsAgo = new Date(now)
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      startDate = sixMonthsAgo.toISOString()
    } else if (dateRange === '12m') {
      const twelveMonthsAgo = new Date(now)
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)
      startDate = twelveMonthsAgo.toISOString()
    }

    return { startDate, endDate: now.toISOString() }
  }

  const { startDate, endDate } = getDateRange()

  // Total meanings count for empty state
  const totalMeanings = useLiveQuery(async () => {
    const count = await db.meanings
      .toCollection()
      .filter(m => m.isActive)
      .count()
    return count
  })

  // Get growth rate data (new meanings per month)
  const growthData = useLiveQuery(() => getMeaningsByMonth(startDate, endDate))

  // Get cumulative data (total vocabulary over time)
  const cumulativeData = useLiveQuery(() => getCumulativeMeaningsByMonth(startDate, endDate))

  if (totalMeanings === undefined || growthData === undefined || cumulativeData === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('app.loading')}</p>
      </div>
    )
  }

  // Empty state when no active meanings exist
  if (totalMeanings === 0) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-xl font-semibold">{t('timeline.title')}</h1>
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">{t('timeline.empty')}</p>
        </div>
      </div>
    )
  }

  // Empty state when no data in selected range
  const hasData = growthData.length > 0 && cumulativeData.length > 0
  if (!hasData) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <h1 className="text-xl font-semibold">{t('timeline.title')}</h1>
        <div className="flex flex-col gap-4">
          {/* Tab toggle */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'growth' ? 'default' : 'outline'}
              onClick={() => setActiveTab('growth')}
              size="sm"
            >
              {t('timeline.growthRate')}
            </Button>
            <Button
              variant={activeTab === 'total' ? 'default' : 'outline'}
              onClick={() => setActiveTab('total')}
              size="sm"
            >
              {t('timeline.totalVocabulary')}
            </Button>
          </div>

          {/* Date range selector */}
          <div className="flex gap-2">
            <Button
              variant={dateRange === '6m' ? 'default' : 'outline'}
              onClick={() => setDateRange('6m')}
              size="sm"
            >
              {t('timeline.last6Months')}
            </Button>
            <Button
              variant={dateRange === '12m' ? 'default' : 'outline'}
              onClick={() => setDateRange('12m')}
              size="sm"
            >
              {t('timeline.last12Months')}
            </Button>
            <Button
              variant={dateRange === 'all' ? 'default' : 'outline'}
              onClick={() => setDateRange('all')}
              size="sm"
            >
              {t('timeline.allTime')}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">{t('timeline.noDataInRange')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">{t('timeline.title')}</h1>

      {/* Tab toggle */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'growth' ? 'default' : 'outline'}
          onClick={() => setActiveTab('growth')}
          size="sm"
        >
          {t('timeline.growthRate')}
        </Button>
        <Button
          variant={activeTab === 'total' ? 'default' : 'outline'}
          onClick={() => setActiveTab('total')}
          size="sm"
        >
          {t('timeline.totalVocabulary')}
        </Button>
      </div>

      {/* Date range selector */}
      <div className="flex gap-2">
        <Button
          variant={dateRange === '6m' ? 'default' : 'outline'}
          onClick={() => setDateRange('6m')}
          size="sm"
        >
          {t('timeline.last6Months')}
        </Button>
        <Button
          variant={dateRange === '12m' ? 'default' : 'outline'}
          onClick={() => setDateRange('12m')}
          size="sm"
        >
          {t('timeline.last12Months')}
        </Button>
        <Button
          variant={dateRange === 'all' ? 'default' : 'outline'}
          onClick={() => setDateRange('all')}
          size="sm"
        >
          {t('timeline.allTime')}
        </Button>
      </div>

      {/* Chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <ResponsiveContainer width="100%" height={300}>
          {activeTab === 'growth' ? (
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name={t('timeline.newMeanings')} fill="#0891b2" />
            </BarChart>
          ) : (
            <LineChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="total" name={t('timeline.cumulativeTotal')} stroke="#0891b2" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Data Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted">
            <tr>
              <th className="px-4 py-2 text-left font-medium">{t('timeline.month')}</th>
              <th className="px-4 py-2 text-right font-medium">{t('timeline.newMeanings')}</th>
              <th className="px-4 py-2 text-right font-medium">{t('timeline.cumulativeTotal')}</th>
            </tr>
          </thead>
          <tbody>
            {cumulativeData.map((row, idx) => {
              const growthRow = growthData.find(d => d.month === row.month)
              const newCount = growthRow?.count || 0
              return (
                <tr key={row.month} className={idx % 2 === 0 ? 'bg-card' : 'bg-muted/50'}>
                  <td className="px-4 py-2">{row.month}</td>
                  <td className="px-4 py-2 text-right">{newCount}</td>
                  <td className="px-4 py-2 text-right font-semibold">{row.total}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
