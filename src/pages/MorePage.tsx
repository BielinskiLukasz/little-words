import { Link } from 'react-router';
import { useTranslation } from 'react-i18next'

export function MorePage() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-4 p-6">
      <Link to="/categories" className="text-foreground hover:text-primary">{t('more.categories')}</Link>
      <Link to="/timeline" className="text-foreground hover:text-primary">{t('more.timeline')}</Link>
      <Link to="/doctor-report" className="text-foreground hover:text-primary">{t('more.doctorReport')}</Link>
      <Link to="/settings" className="text-foreground hover:text-primary">{t('more.settings')}</Link>
    </div>
  );
}
