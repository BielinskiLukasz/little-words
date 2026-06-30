import { NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, BookOpen, MessageSquare, MoreHorizontal } from 'lucide-react';

const tabs = [
  { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' as const },
  { to: '/meanings', icon: BookOpen, labelKey: 'nav.meanings' as const },
  { to: '/word-forms', icon: MessageSquare, labelKey: 'nav.wordForms' as const },
  { to: '/more', icon: MoreHorizontal, labelKey: 'nav.more' as const },
];

export function BottomNav() {
  const { t } = useTranslation();

  return (
    <nav className="flex border-t border-border bg-background">
      {tabs.map(({ to, icon: Icon, labelKey }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            isActive
              ? 'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-primary'
              : 'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium text-muted-foreground hover:text-foreground'
          }
        >
          <Icon size={20} strokeWidth={1.5} />
          <span>{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
