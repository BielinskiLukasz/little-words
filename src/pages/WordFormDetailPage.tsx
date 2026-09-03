import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { db } from '@/db/db'
import { deleteWordForm, updateWordForm } from '@/db/services/wordForm.service'
import { updatePairFields } from '@/db/services/wordFormMeaning.service'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function WordFormDetailPage() {
  const { t, i18n } = useTranslation('common')
  const navigate = useNavigate()
  const { id } = useParams()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Load word form by ID
  const wordForm = useLiveQuery(async () => {
    if (!id) return undefined
    return db.wordForms.get(Number(id))
  }, [id])

  // Load pairs for this word form (WordFormMeaning rows with dates + isActive)
  const pairs = useLiveQuery(async () => {
    if (!wordForm?.id) return []
    return db.wordFormMeanings.where('wordFormId').equals(wordForm.id).toArray()
  }, [wordForm?.id])

  // Load linked meanings (for display text in pair rows)
  const linkedMeanings = useLiveQuery(async () => {
    if (!wordForm?.id) return []
    const links = await db.wordFormMeanings
      .where('wordFormId')
      .equals(wordForm.id)
      .toArray()
    const meaningIds = links.map(l => l.meaningId)
    const meanings = await db.meanings.bulkGet(meaningIds)
    return meanings.filter((m): m is typeof meanings[0] => m !== undefined)
  }, [wordForm?.id])

  if (wordForm === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('app.loading')}</p>
      </div>
    )
  }

  if (!wordForm) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">
          {t('errors.somethingWentWrong')}
        </p>
      </div>
    )
  }

  const enterEditMode = () => {
    setEditForm(wordForm.form)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (editForm.trim().length === 0) return
    setIsSaving(true)
    try {
      await updateWordForm(wordForm.id!, editForm)
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to save word form:', err)
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
      await deleteWordForm(wordForm!.id!)
      navigate('/word-forms')
    } catch (err) {
      console.error('Failed to delete word form:', err)
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

      {/* Word Form Text + Edit Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground">
            {t('wordForm.text')}
          </label>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={enterEditMode}>
              {t('common.edit')}
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-3">
            <input
              type="text"
              className="border rounded-md px-2 py-1 text-2xl font-bold w-full focus:outline-none focus:ring-2 focus:ring-ring"
              value={editForm}
              onChange={e => setEditForm(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                disabled={isSaving || editForm.trim().length === 0}
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
          <h1 className="text-2xl font-bold text-foreground">
            {wordForm.form}
          </h1>
        )}
      </div>

      {/* First Use Date */}
      <div>
        <label className="text-sm font-medium text-muted-foreground">
          {t('wordForm.firstUseDate')}
        </label>
        <p className="text-foreground">
          {formatDate(wordForm.createdAt)}
        </p>
      </div>

      {/* Linked Meanings — per-pair expandable Collapsible rows (D-07) */}
      <div>
        <label className="text-sm font-medium text-muted-foreground">
          {t('wordForm.linkedMeanings')}
        </label>
        {pairs === undefined || linkedMeanings === undefined ? (
          <p className="pt-2 text-sm text-muted-foreground">
            {t('app.loading')}
          </p>
        ) : pairs.length === 0 ? (
          <p className="pt-2 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
            {t('wordForm.noLinkedMeanings')}
          </p>
        ) : (
          <div className="flex flex-col gap-2 pt-2">
            {pairs.map(pair => {
              const meaning = linkedMeanings.find(m => m?.id === pair.meaningId)
              const meaningText = meaning?.text ?? ''
              return (
                <Collapsible key={pair.id} className="rounded-lg border border-border bg-card">
                  <CollapsibleTrigger asChild>
                    <div className="flex items-center justify-between px-3 cursor-pointer">
                      <div className="min-h-[44px] flex items-center">
                        <span className="text-sm text-foreground">{meaningText}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t('pair.goToMeaning')}
                        onClick={e => {
                          e.stopPropagation()
                          navigate('/meanings/' + pair.meaningId)
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
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="self-start">
            {t('wordForm.delete')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('wordForm.deleteConfirm.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('wordForm.deleteConfirm.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3">
            <AlertDialogCancel>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('common.deleting') : t('common.delete')}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
