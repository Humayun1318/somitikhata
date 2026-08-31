import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

export function proxy(request: NextRequest) {
  return createMiddleware(routing)(request);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
