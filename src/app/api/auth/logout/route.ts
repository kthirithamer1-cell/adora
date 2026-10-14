import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({
    success: true,
    message: 'Déconnexion réussie',
  });

  res.cookies.set(SESSION_COOKIE_NAME, '', {
    path: '/',
    httpOnly: true,
    maxAge: 0,
  });

  return res;
}
