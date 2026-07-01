import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function ProfileEditLink() {
  const { t } = useTranslation()

  return (
    <Link
      to="/profile/edit"
      className="flex items-center justify-between w-full py-3 px-4 rounded-lg hover:bg-muted"
    >
      <span className="text-sm">{t('settings.editProfile')}</span>
      <ChevronRight size={16} className="text-muted-foreground" />
    </Link>
  )
}
