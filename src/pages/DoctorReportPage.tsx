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

  const [notesValue, setNotesValue] = useState('')

  useEffect(() => {
    if (profile !== undefined) {
      setNotesValue(profile?.parentNotes ?? '')
    }
  }, [profile])

  if (profile === undefined || meanings === undefined || wordForms === undefined) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-muted-foreground">{t('common.loading')}</p>
      </div>
    )
  }

  const reportText = generateReport({
    profile,
    meanings,
    wordForms,
    t: t as (key: string, opts?: Record<string, unknown>) => string,
    now: new Date(),
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

      <pre className="mb-4 overflow-y-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
        {reportText}
      </pre>

      <Button variant="default" className="w-full" onClick={handleCopy}>
        {t('report.copyButton')}
      </Button>
    </div>
  )
}
