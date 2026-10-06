import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

type PageHeaderProps =
  | {
      /** Key inside the `DashboardSidebar` messages, e.g. "mySavings" (placeholder pages). */
      titleKey: string;
    }
  | {
      title: string;
      subtitle?: string;
      /** The page's main action, on the right (below the title on phones). */
      children?: ReactNode;
    };

// Standard heading for a dashboard page: title, short subtitle and main action.
export function PageHeader(props: PageHeaderProps) {
  const t = useTranslations('DashboardSidebar');

  const title = 'titleKey' in props ? t(props.titleKey) : props.title;
  const subtitle = 'titleKey' in props ? undefined : props.subtitle;
  const action = 'titleKey' in props ? undefined : props.children;

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-app-text">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-app-text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
