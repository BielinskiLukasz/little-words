import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/features/settings/components/LanguageSwitcher'
import { ProfileEditLink } from '@/features/settings/components/ProfileEditLink'
import { DataPlaceholder } from '@/features/settings/components/DataPlaceholder'
import { AboutSection } from '@/features/settings/components/AboutSection'

export function SettingsPage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6 p-6 overflow-y-auto">
      <h1 className="text-xl font-bold">{t('settings.title')}</h1>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t('settings.language')}
        </h2>
        <LanguageSwitcher />
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t('settings.profile')}
        </h2>
        <ProfileEditLink />
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t('settings.data')}
        </h2>
        <DataPlaceholder />
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          {t('settings.about')}
        </h2>
        <AboutSection />
      </div>
    </div>
  )
}
