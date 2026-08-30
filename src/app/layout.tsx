import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SomitiKhata',
  description: 'Digital savings, loan, and shared-asset ledger for Bangladeshi cooperative societies.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
