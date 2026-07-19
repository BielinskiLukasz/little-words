import { useTranslation } from 'react-i18next'

export function TimelinePage() {
  const { t } = useTranslation()
  return (
    <div className="flex h-full items-center justify-center p-6">
      <p className="text-muted-foreground">{t('more.timeline')} — {t('settings.comingSoon')}</p>
    </div>
  );
}
