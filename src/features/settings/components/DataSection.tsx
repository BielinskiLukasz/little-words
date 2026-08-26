import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Upload, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { exportData, importData, exportMeaningsCSV } from '@/features/settings/services/dataManagement'
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [importConfirmOpen, setImportConfirmOpen] = useState(false)
  const [importErrorOpen, setImportErrorOpen] = useState(false)
  const [importErrorMessage, setImportErrorMessage] = useState('')
  const [isImporting, setIsImporting] = useState(false)

  const handleExportJson = async () => {
    try {
      await exportData()
    } catch (err) {
      console.error('Export JSON failed:', err)
      toast(t('errors.somethingWentWrong'))
    }
  }

  const handleExportCsv = async () => {
    try {
      await exportMeaningsCSV()
    } catch (err) {
      console.error('Export CSV failed:', err)
      toast(t('errors.somethingWentWrong'))
    }
  }

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      await importData(file)
      toast(t('settings.importSuccess'))
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('wrong-schema-version')) {
        setImportErrorMessage(t('settings.importErrorDescriptionVersion'))
      } else {
        setImportErrorMessage(t('settings.importErrorDescriptionCorrupt'))
      }
      setImportErrorOpen(true)
    } finally {
      setIsImporting(false)
      // Reset so the same file can be re-selected on the next attempt
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleImportConfirm = () => {
    setImportConfirmOpen(false)
    fileInputRef.current?.click()
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
        className="flex items-center gap-3 w-full py-3 px-4 rounded-lg hover:bg-muted text-left disabled:opacity-50"
        onClick={() => setImportConfirmOpen(true)}
        disabled={isImporting}
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
        onClick={handleExportCsv}
      >
        <FileText size={18} />
        <div className="flex-1">
          <span className="block text-sm font-medium">{t('settings.exportCsv')}</span>
          <span className="block text-xs text-muted-foreground">{t('settings.exportCsvDesc')}</span>
        </div>
        <FileText size={16} className="text-muted-foreground" />
      </button>

      {/* Hidden file input for import */}
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Import confirmation dialog */}
      <AlertDialog open={importConfirmOpen} onOpenChange={setImportConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.importConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('settings.importConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportConfirm}>
              {t('settings.importConfirmButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import error dialog */}
      <AlertDialog open={importErrorOpen} onOpenChange={setImportErrorOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('settings.importErrorTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{importErrorMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.back')}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
