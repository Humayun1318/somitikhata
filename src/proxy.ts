import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import { sessionCookieName } from '@/lib/auth/constants';

export function proxy(request: NextRequest) {
  const response = createMiddleware(routing)(request);
  const pathname = request.nextUrl.pathname;
  const privateRoute = /^\/(?:en|bn)\/(?:member|admin)(?:\/|$)/.test(pathname);

  if (privateRoute && !request.cookies.has(sessionCookieName)) {
    const locale = pathname.split('/')[1];
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
