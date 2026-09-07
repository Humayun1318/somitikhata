import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerEnv } from '@/lib/env';
import { sessionCookieName } from './constants';

export type UserRole = 'member' | 'admin';

export type CurrentUser = {
  id: string;
  name: string;
  role: UserRole;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = (await cookies()).get(sessionCookieName)?.value;
  const apiBaseUrl = getServerEnv().NEXT_PUBLIC_API_BASE_URL;

  if (!session || !apiBaseUrl) {
    return null;
  }

  const response = await fetch(new URL('/auth/me', apiBaseUrl), {
    headers: { Cookie: `${sessionCookieName}=${session}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    user?: { id?: string; name?: string; role?: UserRole };
  };
  const user = payload.user;

  if (!user?.id || !user.name || (user.role !== 'member' && user.role !== 'admin')) {
    return null;
  }

  return user as CurrentUser;
}

export async function requireUser(locale: string, role?: UserRole) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  if (role && user.role !== role) {
    redirect(`/${locale}/unauthorized`);
  }

  return user;
}
