import type { Metadata } from 'next';
import './globals.css';
import { getLocale } from 'next-intl/server';
import { hindSiliguri, inter } from './fonts';

export const metadata: Metadata = {
  title: 'SomitiKhata',
  description: 'Digital savings, loan, and shared-asset ledger for Bangladeshi cooperative business societies.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const local = await getLocale();
  return (
    <html lang={local} className={`${inter.variable} ${hindSiliguri.variable}`}>
      <body>{children}</body>
    </html>
  );
}
