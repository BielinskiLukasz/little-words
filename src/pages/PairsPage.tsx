import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { getPairsWithDetails } from '@/db/services/wordFormMeaning.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

type SortOrder = 'newest' | 'azForm' | 'azMeaning'

export function PairsPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const [sort, setSort] = useState<SortOrder>('newest')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [firstObservedFrom, setFirstObservedFrom] = useState('')
  const [firstObservedTo, setFirstObservedTo] = useState('')
  const [lastUsedFrom, setLastUsedFrom] = useState('')
  const [lastUsedTo, setLastUsedTo] = useState('')

  const pairs = useLiveQuery(() => getPairsWithDetails(), [])

  if (pairs === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('app.loading')}</p>
      </div>
    )
  }

  const lowerSearch = searchText.toLowerCase()

  const filtered = pairs.filter(p => {
    if (searchText && !p.wordFormText.toLowerCase().includes(lowerSearch) && !p.meaningText.toLowerCase().includes(lowerSearch)) return false
    if (statusFilter === 'active' && !p.isActive) return false
    if (statusFilter === 'inactive' && p.isActive) return false
    if (firstObservedFrom && p.firstObservationDate < firstObservedFrom) return false
    if (firstObservedTo && p.firstObservationDate > firstObservedTo) return false
    if (lastUsedFrom && p.lastUsedDate < lastUsedFrom) return false
    if (lastUsedTo && p.lastUsedDate > lastUsedTo) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'newest') {
      return new Date(b.firstObservationDate).getTime() - new Date(a.firstObservationDate).getTime()
    } else if (sort === 'azForm') {
      return a.wordFormText.localeCompare(b.wordFormText)
    } else {
      return a.meaningText.localeCompare(b.meaningText)
    }
  })

  const isAnyFilterActive = searchText !== '' || statusFilter !== 'all' || firstObservedFrom !== '' || firstObservedTo !== '' || lastUsedFrom !== '' || lastUsedTo !== ''

  const clearFilters = () => {
    setSearchText('')
    setStatusFilter('all')
    setFirstObservedFrom('')
    setFirstObservedTo('')
    setLastUsedFrom('')
    setLastUsedTo('')
  }

  const handleDownloadCsv = () => {
    const headers = [
      t('wordForm.text'),
      t('meaning.text'),
      t('pair.firstObserved'),
      t('pair.lastUsed'),
      t('pair.active'),
    ]
    const headerRow = headers.join(',')
    const dataRows = sorted.map(pair => {
      const wordFormText = `"${pair.wordFormText.replace(/"/g, '""')}"`
      const meaningText = `"${pair.meaningText.replace(/"/g, '""')}"`
      const firstObserved = pair.firstObservationDate
      const lastUsed = pair.lastUsedDate
      const activeStr = pair.isActive ? t('pair.active') : t('wordForm.inactive')
      return [wordFormText, meaningText, firstObserved, lastUsed, activeStr].join(',')
    })
    const csvContent = '﻿' + [headerRow, ...dataRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'little-words-pairs.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.pairs')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadCsv}>
            {t('pairs.downloadCsv')}
          </Button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as SortOrder)}
            className="rounded border border-border bg-background px-2 py-1 text-sm"
          >
            <option value="newest">{t('sort.newestFirst')}</option>
            <option value="azForm">{t('sort.azWordForm')}</option>
            <option value="azMeaning">{t('sort.azMeaning')}</option>
          </select>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-2">
        {/* Row 1 — search input */}
        <input
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder={t('pairs.searchPlaceholder')}
          className="w-full rounded border border-border bg-background px-3 py-1 text-sm placeholder:text-muted-foreground"
        />
        {/* Row 2 — status toggle, date presets, and clear */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status toggle */}
          <div className="flex items-center gap-1">
            <Button size="sm" variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>
              {t('pairs.filterAll')}
            </Button>
            <Button size="sm" variant={statusFilter === 'active' ? 'default' : 'outline'} onClick={() => setStatusFilter('active')}>
              {t('pairs.filterActive')}
            </Button>
            <Button size="sm" variant={statusFilter === 'inactive' ? 'default' : 'outline'} onClick={() => setStatusFilter('inactive')}>
              {t('pairs.filterInactive')}
            </Button>
          </div>
          {/* First observed range */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">{t('pairs.firstObservedFrom')}</span>
            <input
              type="date"
              value={firstObservedFrom}
              onChange={e => setFirstObservedFrom(e.target.value)}
              className="rounded border border-border bg-background px-2 py-1 text-sm"
            />
            <span className="text-sm text-muted-foreground">{t('pairs.firstObservedTo')}</span>
            <input
              type="date"
              value={firstObservedTo}
              onChange={e => setFirstObservedTo(e.target.value)}
              className="rounded border border-border bg-background px-2 py-1 text-sm"
            />
          </div>
          {/* Last used range */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">{t('pairs.lastUsedFrom')}</span>
            <input
              type="date"
              value={lastUsedFrom}
              onChange={e => setLastUsedFrom(e.target.value)}
              className="rounded border border-border bg-background px-2 py-1 text-sm"
            />
            <span className="text-sm text-muted-foreground">{t('pairs.lastUsedTo')}</span>
            <input
              type="date"
              value={lastUsedTo}
              onChange={e => setLastUsedTo(e.target.value)}
              className="rounded border border-border bg-background px-2 py-1 text-sm"
            />
          </div>
          {/* Clear filters */}
          {isAnyFilterActive && (
            <button className="text-xs text-muted-foreground underline" onClick={clearFilters}>
              {t('pairs.clearFilters')}
            </button>
          )}
        </div>
      </div>

      {pairs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16">
          <h2 className="text-base font-medium">{t('pairs.emptyHeading')}</h2>
          <p className="text-sm text-muted-foreground text-center">{t('pairs.emptyBody')}</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16">
          <p className="text-sm text-muted-foreground text-center">{t('pairs.noResults')}</p>
          <button className="text-xs text-muted-foreground underline" onClick={clearFilters}>
            {t('pairs.clearFilters')}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('wordForm.text')}</TableHead>
                <TableHead>{t('meaning.text')}</TableHead>
                <TableHead>{t('pair.firstObserved')}</TableHead>
                <TableHead>{t('pair.lastUsed')}</TableHead>
                <TableHead>{t('pair.active')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map(pair => (
                <TableRow key={pair.id}>
                  <TableCell>
                    <Button
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => navigate('/word-forms/' + pair.wordFormId)}
                    >
                      {pair.wordFormText}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => navigate('/meanings/' + pair.meaningId)}
                    >
                      {pair.meaningText}
                    </Button>
                  </TableCell>
                  <TableCell>{pair.firstObservationDate}</TableCell>
                  <TableCell>{pair.lastUsedDate}</TableCell>
                  <TableCell>
                    <Badge variant={pair.isActive ? 'default' : 'secondary'}>
                      {pair.isActive ? t('pair.active') : t('wordForm.inactive')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
