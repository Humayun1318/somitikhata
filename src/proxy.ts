import { NextRequest, NextResponse } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl;

  if (url.pathname === '/') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
