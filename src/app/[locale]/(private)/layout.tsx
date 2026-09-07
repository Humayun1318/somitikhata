import type { ReactNode } from 'react';
import { requireUser } from '@/lib/auth/session';

export async function requirePrivateUser(
  locale: string,
  role?: 'member' | 'admin',
) {
  return requireUser(locale, role);
}

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return children;
}
