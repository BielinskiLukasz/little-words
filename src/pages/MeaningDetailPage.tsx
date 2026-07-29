import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '@/db/db'
import { toggleMeaningActive, updateLastUseDate } from '@/db/services/meaning.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function MeaningDetailPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { id } = useParams()
  const [isSaving, setIsSaving] = useState(false)

  // Load meaning by ID
  const meaning = useLiveQuery(async () => {
    if (!id) return undefined
    return db.meanings.get(Number(id))
  }, [id])

  // Load linked word forms
  const linkedWordForms = useLiveQuery(async () => {
    if (!meaning?.id) return []
    const links = await db.wordFormMeanings
      .where('meaningId')
      .equals(meaning.id)
      .toArray()
    const wordFormIds = links.map(l => l.wordFormId)
    const forms = await db.wordForms.bulkGet(wordFormIds)
    return forms.filter((f): f is typeof forms[0] => f !== undefined)
  }, [meaning?.id])

  if (meaning === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('app.loading')}</p>
      </div>
    )
  }

  if (!meaning) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">
          {t('errors.somethingWentWrong')}
        </p>
      </div>
    )
  }

  const handleToggleActive = async (newState: boolean) => {
    setIsSaving(true)
    try {
      await toggleMeaningActive(meaning.id!, newState)
    } catch (err) {
      console.error('Failed to toggle active:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateDate = async (newDate: Date) => {
    setIsSaving(true)
    try {
      await updateLastUseDate(meaning.id!, newDate.toISOString())
    } catch (err) {
      console.error('Failed to update date:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="flex flex-col gap-6 p-6 pb-20">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="w-fit"
      >
        ← {t('common.back')}
      </Button>

      {/* Meaning Text */}
      <div>
        <label className="text-sm font-medium text-muted-foreground">
          {t('meaning.text')}
        </label>
        <h1 className="text-2xl font-bold text-foreground">
          {meaning.text}
        </h1>
      </div>

      {/* Categories */}
      {meaning.categories.length > 0 && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            {t('meaning.categories')}
          </label>
          <div className="flex flex-wrap gap-2 pt-2">
            {meaning.categories.map(cat => (
              <Badge key={cat} variant="outline">
                {cat}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* First Use Date */}
      <div>
        <label className="text-sm font-medium text-muted-foreground">
          {t('meaning.firstUseDate')}
        </label>
        <p className="text-foreground">
          {formatDate(meaning.firstUseDate)}
        </p>
      </div>

      {/* Active/Inactive Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <label htmlFor="active-toggle" className="text-sm font-medium">
          {t('meaning.isActive')}
        </label>
        <Switch
          id="active-toggle"
          checked={meaning.isActive}
          onCheckedChange={handleToggleActive}
          disabled={isSaving}
        />
      </div>

      {/* Last Use Date Picker */}
      <div>
        <label className="text-sm font-medium text-muted-foreground">
          {t('meaning.lastUseDate')}
        </label>
        <div className="pt-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {formatDate(meaning.lastUseDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={new Date(meaning.lastUseDate)}
                onSelect={(date) => {
                  if (date) {
                    handleUpdateDate(date)
                  }
                }}
                disabled={isSaving}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Linked Word Forms */}
      <div>
        <label className="text-sm font-medium text-muted-foreground">
          {t('meaning.linkedWordForms')}
        </label>
        {linkedWordForms === undefined ? (
          <p className="pt-2 text-sm text-muted-foreground">
            {t('app.loading')}
          </p>
        ) : linkedWordForms.length === 0 ? (
          <p className="pt-2 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
            {t('meaning.noLinkedWordForms')}
          </p>
        ) : (
          <div className="flex flex-col gap-2 pt-2">
            {linkedWordForms.map(form => {
              if (!form?.id) return null
              return (
                <div
                  key={form.id}
                  className="rounded-lg border border-border bg-card p-3 text-sm text-foreground"
                >
                  {form.form}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
