import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { db } from '@/db/db'
import { getChildProfile, updateChildProfile } from '@/db/services/childProfile.service'
import { generateReport } from '@/features/doctor-report/services/reportGenerator'
import { Button } from '@/components/ui/button'

export function DoctorReportPage() {
  const { t } = useTranslation()

  const profile = useLiveQuery(() => getChildProfile())
  const meanings = useLiveQuery(() => db.meanings.toArray())
  const wordForms = useLiveQuery(() => db.wordForms.toArray())
  const pairs = useLiveQuery(() => db.wordFormMeanings.toArray())

  const [notesValue, setNotesValue] = useState('')
  const [additionsInput, setAdditionsInput] = useState(5)
  const [forgottenInput, setForgottenInput] = useState(5)
  const [appliedAdditionsLimit, setAppliedAdditionsLimit] = useState(5)
  const [appliedForgottenLimit, setAppliedForgottenLimit] = useState(5)

  useEffect(() => {
    if (profile !== undefined) {
      setNotesValue(profile?.parentNotes ?? '')
    }
  }, [profile])

  if (profile === undefined || meanings === undefined || wordForms === undefined || pairs === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    )
  }

  const meaningWordFormCounts: Record<number, number> = {}
  pairs.forEach((p) => {
    meaningWordFormCounts[p.meaningId] = (meaningWordFormCounts[p.meaningId] ?? 0) + 1
  })

  const reportText = generateReport({
    profile,
    meanings,
    wordForms,
    t: t as (key: string, opts?: Record<string, unknown>) => string,
    now: new Date(),
    meaningWordFormCounts,
    recentAdditionsLimit: appliedAdditionsLimit,
    recentForgottenLimit: appliedForgottenLimit,
  })

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText)
      toast(t('report.copied'))
    } catch {
      toast(t('errors.somethingWentWrong'))
    }
  }

  const handleNotesBlur = () => {
    if (profile.id !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = profile
      updateChildProfile(profile.id, { ...rest, parentNotes: notesValue })
    }
  }

  const clampLimit = (v: number) => Math.max(1, Math.min(50, v))

  return (
    <div className="overflow-y-auto p-6 pb-24">
      <h1 className="mb-4 text-xl font-semibold">{t('report.title')}</h1>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium">{t('report.parentNotes')}</label>
        <textarea
          className="w-full min-h-[80px] resize-y rounded-md border p-2 text-sm"
          placeholder={t('report.parentNotesPlaceholder')}
          value={notesValue}
          onChange={(e) => setNotesValue(e.target.value)}
          onBlur={handleNotesBlur}
        />
      </div>

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm">
          <label>{t('report.recentAdditionsLabel')}</label>
          <input
            type="number"
            min="1"
            max="50"
            value={additionsInput}
            onChange={(e) =>
              setAdditionsInput(clampLimit(parseInt(e.target.value, 10) || 1))
            }
            className="w-20 rounded-md border p-1 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <label>{t('report.recentForgottenLabel')}</label>
          <input
            type="number"
            min="1"
            max="50"
            value={forgottenInput}
            onChange={(e) =>
              setForgottenInput(clampLimit(parseInt(e.target.value, 10) || 1))
            }
            className="w-20 rounded-md border p-1 text-sm"
          />
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setAppliedAdditionsLimit(additionsInput)
            setAppliedForgottenLimit(forgottenInput)
          }}
        >
          {t('report.regenerate')}
        </Button>
      </div>

      <pre className="mb-4 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
        {reportText}
      </pre>

      <Button variant="default" className="w-full" onClick={handleCopy}>
        {t('report.copyButton')}
      </Button>
    </div>
  )
}
