import type { Metadata } from 'next';
import './globals.css';
import { getLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'SomitiKhata',
  description: 'Digital savings, loan, and shared-asset ledger for Bangladeshi cooperative business societies.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const local = await getLocale();
  return (
    <html lang={local}>
      <body>{children}</body>
    </html>
  );
}
