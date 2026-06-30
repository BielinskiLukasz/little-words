import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui.store'
import { useTranslation } from 'react-i18next'
import { useAddEntry } from '../hooks/useAddEntry'
import { WordFormInput } from './WordFormInput'
import { MeaningInput } from './MeaningInput'

export function AddEntrySheet() {
  const { t } = useTranslation('common')
  const isOpen = useUIStore((s) => s.addWordSheetOpen)
  const setAddWordSheetOpen = useUIStore((s) => s.setAddWordSheetOpen)

  const {
    wordForm,
    setWordForm,
    meaningRows,
    addMeaningRow,
    updateMeaningRow,
    handleSave,
    isLoading,
  } = useAddEntry()

  return (
    <Sheet open={isOpen} onOpenChange={setAddWordSheetOpen}>
      <SheetContent side="bottom" className="h-[90dvh] flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-2">
          <SheetTitle>{t('addWord.title')}</SheetTitle>
        </SheetHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <WordFormInput value={wordForm} onChange={setWordForm} />

          {meaningRows.map((row) => (
            <MeaningInput
              key={row.id}
              row={row}
              onChange={(partial) => updateMeaningRow(row.id, partial)}
            />
          ))}

          <Button
            variant="ghost"
            onClick={addMeaningRow}
            className="w-full"
          >
            {t('addWord.addAnotherMeaning')}
          </Button>
        </div>

        {/* Sticky save button */}
        <div className="px-4 py-3 border-t border-border">
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? t('addWord.saving') : t('addWord.save')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
