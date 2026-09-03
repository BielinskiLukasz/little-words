import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { getPairsWithDetails } from '@/db/services/wordFormMeaning.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'

type SortOrder = 'newest' | 'azForm' | 'azMeaning'

export function PairsPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const [sort, setSort] = useState<SortOrder>('newest')

  const pairs = useLiveQuery(() => getPairsWithDetails(), [])

  if (pairs === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('app.loading')}</p>
      </div>
    )
  }

  const sorted = [...pairs].sort((a, b) => {
    if (sort === 'newest') {
      return new Date(b.firstObservationDate).getTime() - new Date(a.firstObservationDate).getTime()
    } else if (sort === 'azForm') {
      return a.wordFormText.localeCompare(b.wordFormText)
    } else {
      return a.meaningText.localeCompare(b.meaningText)
    }
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('nav.pairs')}</h1>
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

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16">
          <h2 className="text-base font-medium">{t('pairs.emptyHeading')}</h2>
          <p className="text-sm text-muted-foreground text-center">{t('pairs.emptyBody')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map(pair => (
            <Collapsible key={pair.id} className="rounded-lg border border-border bg-card">
              <CollapsibleTrigger asChild>
                <div className="flex items-center gap-2 min-h-[44px] cursor-pointer px-3 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="truncate max-w-[45vw] min-w-0"
                    onClick={e => {
                      e.stopPropagation()
                      navigate('/word-forms/' + pair.wordFormId)
                    }}
                  >
                    {pair.wordFormText}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="truncate max-w-[45vw] min-w-0"
                    onClick={e => {
                      e.stopPropagation()
                      navigate('/meanings/' + pair.meaningId)
                    }}
                  >
                    {pair.meaningText}
                  </Button>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-2 gap-2 px-3 pb-3 text-sm text-muted-foreground">
                  <span>
                    {t('pair.firstObserved')}: {pair.firstObservationDate}
                  </span>
                  <span>
                    {t('pair.lastUsed')}: {pair.lastUsedDate}
                  </span>
                  <span className="col-span-2">
                    <Badge variant={pair.isActive ? 'default' : 'secondary'}>
                      {pair.isActive ? t('pair.active') : t('wordForm.inactive')}
                    </Badge>
                  </span>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  )
}
