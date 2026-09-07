import { NextResponse } from 'next/server';
import { sessionCookieName } from '@/lib/auth/constants';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set({
    name: sessionCookieName,
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
