import { useTranslation } from 'react-i18next'

export function DataPlaceholder() {
  const { t } = useTranslation()

  const rows = [
    { label: t('settings.exportJson') },
    { label: t('settings.importJson') },
    { label: t('settings.exportCsv') },
  ]

  return (
    <div className="space-y-1">
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between w-full py-3 px-4 rounded-lg opacity-50 cursor-not-allowed"
        >
          <span className="text-sm">{row.label}</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {t('settings.comingSoon')}
          </span>
        </div>
      ))}
    </div>
  )
}
