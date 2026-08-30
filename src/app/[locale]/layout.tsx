import type { ReactNode } from 'react';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'bn' }];
}

export default function LocaleLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
