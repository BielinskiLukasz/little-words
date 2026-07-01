import { useTranslation } from 'react-i18next'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useiOSInstallPrompt } from '../hooks/useiOSInstallPrompt'

export function iOSInstallPrompt() {
  const { t } = useTranslation()
  const { shouldShow, dismiss } = useiOSInstallPrompt()

  return (
    <Sheet open={shouldShow} onOpenChange={(open) => { if (!open) dismiss() }}>
      <SheetContent side="bottom" className="pb-8">
        <SheetHeader>
          <SheetTitle>{t('ios.title')}</SheetTitle>
        </SheetHeader>
        <ol className="mt-4 space-y-3 list-decimal list-inside text-sm text-muted-foreground">
          <li>{t('ios.step1')}</li>
          <li>{t('ios.step2')}</li>
          <li>{t('ios.step3')}</li>
        </ol>
        <div className="mt-6">
          <Button variant="outline" onClick={dismiss} className="w-full">
            {t('ios.dismiss')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
