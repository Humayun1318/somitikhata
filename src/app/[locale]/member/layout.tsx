import type { ReactNode } from 'react';
import { requireUser } from '@/lib/auth/session';

export default async function MemberLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireUser(locale, 'member');

  return children;
}
