import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Upload, FileText } from 'lucide-react'
import { exportData } from '@/features/settings/services/dataManagement'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export function DataSection() {
  const { t } = useTranslation()
  const [importConfirmOpen, setImportConfirmOpen] = useState(false)

  const handleExportJson = async () => {
    try {
      await exportData()
    } catch (err) {
      console.error('Export JSON failed:', err)
    }
  }

  return (
    <div className="space-y-1">
      {/* Export JSON row */}
      <button
        className="flex items-center gap-3 w-full py-3 px-4 rounded-lg hover:bg-muted text-left"
        onClick={handleExportJson}
      >
        <Download size={18} />
        <div className="flex-1">
          <span className="block text-sm font-medium">{t('settings.exportJson')}</span>
          <span className="block text-xs text-muted-foreground">{t('settings.exportJsonDesc')}</span>
        </div>
        <Download size={16} className="text-muted-foreground" />
      </button>

      {/* Import JSON row */}
      <button
        className="flex items-center gap-3 w-full py-3 px-4 rounded-lg hover:bg-muted text-left"
        onClick={() => setImportConfirmOpen(true)}
      >
        <Upload size={18} />
        <div className="flex-1">
          <span className="block text-sm font-medium">{t('settings.importJson')}</span>
          <span className="block text-xs text-muted-foreground">{t('settings.importJsonDesc')}</span>
        </div>
        <Upload size={16} className="text-muted-foreground" />
      </button>

      {/* Export CSV row */}
      <button
        className="flex items-center gap-3 w-full py-3 px-4 rounded-lg hover:bg-muted text-left"
        onClick={() => {
          // Stub — wired in Task 3 when exportMeaningsCSV is implemented
        }}
      >
        <FileText size={18} />
        <div className="flex-1">
          <span className="block text-sm font-medium">{t('settings.exportCsv')}</span>
          <span className="block text-xs text-muted-foreground">{t('settings.exportCsvDesc')}</span>
        </div>
        <FileText size={16} className="text-muted-foreground" />
      </button>

      {/* Import confirmation dialog */}
      <AlertDialog open={importConfirmOpen} onOpenChange={setImportConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.importConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('settings.importConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => setImportConfirmOpen(false)}>
              {t('settings.importConfirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
