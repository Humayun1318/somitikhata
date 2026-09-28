import { useTranslations } from 'next-intl';

type PageHeaderProps = {
  /** Key inside the `DashboardSidebar` messages, e.g. "mySavings". */
  titleKey: string;
};

// Standard heading for a dashboard page. Real pages add their content below it.
export function PageHeader({ titleKey }: PageHeaderProps) {
  const t = useTranslations('DashboardSidebar');

  return (
    <header>
      <h1 className="text-2xl font-semibold text-app-text">{t(titleKey)}</h1>
    </header>
  );
}
