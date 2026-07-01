import { useTranslation } from 'react-i18next'
import { useSettings } from '../hooks/useSettings'

export function LanguageSwitcher() {
  const { t } = useTranslation()
  const { currentLanguage, setLanguage } = useSettings()

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{t('settings.language')}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setLanguage('pl')}
          className={
            currentLanguage === 'pl'
              ? 'px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground'
              : 'px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground'
          }
        >
          PL
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={
            currentLanguage === 'en'
              ? 'px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground'
              : 'px-4 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground'
          }
        >
          EN
        </button>
      </div>
    </div>
  )
}
