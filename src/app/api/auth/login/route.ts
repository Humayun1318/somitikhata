import { NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';
import { sessionCookieName } from '@/lib/auth/constants';

export async function POST(request: Request) {
  const apiBaseUrl = getServerEnv().NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    return NextResponse.json(
      { message: 'Authentication service is not configured.' },
      { status: 503 },
    );
  }

  const response = await fetch(new URL('/auth/login', apiBaseUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(await request.json()),
    cache: 'no-store',
  });
  const payload = await response.text();
  const nextResponse = new NextResponse(payload, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('content-type') ?? 'application/json',
    },
  });
  const setCookie = response.headers.get('set-cookie');

  if (setCookie) {
    nextResponse.headers.set(
      'set-cookie',
      setCookie.replace(/^[^=]+=/, `${sessionCookieName}=`),
    );
  }

  return nextResponse;
}
