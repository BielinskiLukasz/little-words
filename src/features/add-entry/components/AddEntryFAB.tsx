import { useUIStore } from '@/stores/ui.store'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export function AddEntryFAB() {
  const { t } = useTranslation('common')
  const setAddWordSheetOpen = useUIStore((s) => s.setAddWordSheetOpen)

  return (
    <Button
      className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg"
      onClick={() => setAddWordSheetOpen(true)}
      aria-label={t('addWord.title')}
    >
      <Plus size={24} />
    </Button>
  )
}
