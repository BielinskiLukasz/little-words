import { useTranslation } from 'react-i18next'

export function AboutSection() {
  const { t } = useTranslation()
  const version = import.meta.env.VITE_APP_VERSION ?? '0.0.0'

  return (
    <div className="space-y-1 px-4 py-3">
      <p className="text-sm font-medium">{t('app.name')}</p>
      <p className="text-sm text-muted-foreground">{t('settings.version', { version })}</p>
    </div>
  )
}
