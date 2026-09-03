import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { db } from '@/db/db'
import type { Category } from '@/db/schema'
import { deleteMeaning, updateMeaning } from '@/db/services/meaning.service'
import { updatePairFields } from '@/db/services/wordFormMeaning.service'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { CategoryChips } from '@/features/add-entry/components/CategoryChips'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function MeaningDetailPage() {
  const { t, i18n } = useTranslation('common')
  const navigate = useNavigate()
  const { id } = useParams()
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [editCategories, setEditCategories] = useState<Category[]>([])

  // Load meaning by ID
  const meaning = useLiveQuery(async () => {
    if (!id) return undefined
    return db.meanings.get(Number(id))
  }, [id])

  // Load linked word forms (WordForm objects for display text)
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

  // Load pairs for this meaning (WordFormMeaning rows with dates + isActive)
  const pairs = useLiveQuery(async () => {
    if (!meaning?.id) return []
    return db.wordFormMeanings.where('meaningId').equals(meaning.id).toArray()
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

  const enterEditMode = () => {
    setEditText(meaning.text)
    setEditCategories(meaning.categories)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (editText.trim().length === 0) return
    setIsSaving(true)
    try {
      await updateMeaning(meaning.id!, { text: editText, categories: editCategories })
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to save meaning:', err)
      toast.error(t('errors.somethingWentWrong'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    setIsEditing(false)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteMeaning(meaning.id!)
      navigate('/meanings')
    } catch (error) {
      console.error('Failed to delete meaning:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePairDateBlur = async (
    pairId: number,
    field: 'firstObservationDate' | 'lastUsedDate',
    value: string
  ) => {
    if (!value) return
    try {
      await updatePairFields(pairId, { [field]: value })
    } catch (err) {
      console.error('Failed to update pair date:', err)
      toast.error(t('errors.somethingWentWrong'))
    }
  }

  const handlePairActiveChange = async (pairId: number, checked: boolean) => {
    try {
      await updatePairFields(pairId, { isActive: checked })
    } catch (err) {
      console.error('Failed to update pair active state:', err)
      toast.error(t('errors.somethingWentWrong'))
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(i18n.language, {
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

      {/* Meaning Text + Edit Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">
            {t('meaning.text')}
          </label>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={enterEditMode}>
              {t('common.edit')}
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-3">
            <textarea
              className="w-full border rounded-md p-2 text-base resize-none"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={3}
            />
            <CategoryChips value={editCategories} onChange={setEditCategories} />
            <div className="flex gap-2">
              <Button
                disabled={isSaving || editText.trim().length === 0}
                onClick={handleSave}
              >
                {isSaving ? (
                  <span className="animate-spin">...</span>
                ) : (
                  t('common.saveChanges')
                )}
              </Button>
              <Button variant="ghost" onClick={handleDiscard}>
                {t('common.discardChanges')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-base text-foreground">{meaning.text}</p>
        )}
      </div>

      {/* Categories (read mode only — in edit mode CategoryChips handles display) */}
      {!isEditing && meaning.categories.length > 0 && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            {t('meaning.categories')}
          </label>
          <div className="flex flex-wrap gap-2 pt-2">
            {meaning.categories.map(cat => (
              <Badge key={cat} variant="outline">
                {t(`category.${cat}`)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* First Observed (read-only, aggregated from pairs) */}
      <div>
        <label className="text-sm font-medium text-muted-foreground">
          {t('meaning.firstUseDate')}
        </label>
        <p className="text-foreground">
          {formatDate(meaning.firstUseDate)}
        </p>
      </div>

      {/* Active Status (read-only Badge, derived from pairs — D-02) */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <label className="text-sm font-medium">
          {t('meaning.isActive')}
        </label>
        <Badge variant={meaning.isActive ? 'default' : 'secondary'}>
          {meaning.isActive ? t('pair.active') : t('wordForm.inactive')}
        </Badge>
      </div>

      {/* Linked Word Forms — per-pair expandable Collapsible rows (D-06) */}
      <div>
        <label className="text-sm font-medium text-muted-foreground">
          {t('meaning.linkedWordForms')}
        </label>
        {pairs === undefined || linkedWordForms === undefined ? (
          <p className="pt-2 text-sm text-muted-foreground">
            {t('app.loading')}
          </p>
        ) : pairs.length === 0 ? (
          <p className="pt-2 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
            {t('meaning.noLinkedWordForms')}
          </p>
        ) : (
          <div className="flex flex-col gap-2 pt-2">
            {pairs.map(pair => {
              const wordForm = linkedWordForms.find(wf => wf?.id === pair.wordFormId)
              const wordFormText = wordForm?.form ?? ''
              return (
                <Collapsible key={pair.id} className="rounded-lg border border-border bg-card">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between px-3 cursor-pointer">
                      <div className="min-h-[44px] flex items-center">
                        <span className="text-sm text-foreground">{wordFormText}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('pair.goToWordForm')}
                        onClick={e => {
                          e.stopPropagation()
                          navigate('/word-forms/' + pair.wordFormId)
                        }}
                      >
                        →
                      </Button>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="grid grid-cols-2 gap-3 px-3 pb-3">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          {t('pair.firstObserved')}
                        </label>
                        <input
                          type="date"
                          defaultValue={pair.firstObservationDate}
                          onBlur={e =>
                            handlePairDateBlur(pair.id!, 'firstObservationDate', e.target.value)
                          }
                          className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          {t('pair.lastUsed')}
                        </label>
                        <input
                          type="date"
                          defaultValue={pair.lastUsedDate}
                          onBlur={e =>
                            handlePairDateBlur(pair.id!, 'lastUsedDate', e.target.value)
                          }
                          className="border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-full"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">
                          {t('pair.active')}
                        </label>
                        <Switch
                          checked={pair.isActive}
                          onCheckedChange={checked => handlePairActiveChange(pair.id!, checked)}
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Button with Confirmation */}
      <div>
        <Button
          variant="destructive"
          onClick={() => setShowDeleteConfirm(true)}
          className="self-start"
        >
          {t('meaning.delete')}
        </Button>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('meaning.deleteConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('meaning.deleteConfirm.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
