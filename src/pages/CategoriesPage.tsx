import { useTranslation } from 'react-i18next'

export function CategoriesPage() {
  const { t } = useTranslation()
  return (
    <div className="flex h-full items-center justify-center p-6">
      <p className="text-muted-foreground">{t('more.categories')} — {t('settings.comingSoon')}</p>
    </div>
  );
}
