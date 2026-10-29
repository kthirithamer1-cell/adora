import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveGeoLocale } from '@/lib/geo';
import { isValidLocale, DEFAULT_LOCALE, Locale } from '@/locales';

export const LOCALE_COOKIE_NAME = 'mm_locale';
// Doit rester identique à SESSION_COOKIE_NAME dans src/lib/auth.ts
const SESSION_COOKIE = 'MarkMosaiq_session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets, internal Next.js files, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') // static files like favicon.ico, logo.png, etc.
  ) {
    return NextResponse.next();
  }

  // 0. Pages applicatives réservées aux utilisateurs connectés → redirection vers /login
  // Note: /studio et /generate sont accessibles en mode test invité (1er design gratuit puis popup 5 crédits)
  const PROTECTED_PREFIXES = [
    '/cutout',
    '/dashboard',
    '/brand-kit',
    '/social',
    '/billing',
    '/team',
    '/admin',
    '/agency',
  ];
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    let hasSession = false;
    const rawSession = request.cookies.get(SESSION_COOKIE)?.value;
    if (rawSession) {
      try {
        const parsed = JSON.parse(rawSession);
        hasSession = Boolean(parsed?.userId || parsed?.email);
      } catch {
        hasSession = false;
      }
    }

    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 1. Check if user already has an explicit preference in cookie
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  let activeLocale: Locale;
  let shouldSetCookie = false;

  if (isValidLocale(cookieLocale)) {
    activeLocale = cookieLocale;
  } else {
    // 2. Resolve locale based on Geo-IP and browser headers
    const countryCode =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      request.headers.get('x-country-code');
    const acceptLanguage = request.headers.get('accept-language');

    activeLocale = resolveGeoLocale(countryCode, acceptLanguage);
    shouldSetCookie = true;
  }

  // 3. Clone request headers to inject the resolved locale for Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-markmosaiq-locale', activeLocale);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 4. If cookie was not set or invalid, persist the detected locale for future requests
  if (shouldSetCookie) {
    response.cookies.set({
      name: LOCALE_COOKIE_NAME,
      value: activeLocale,
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year persistence
      sameSite: 'lax',
    });
  }

  return response;
}

// Export par défaut pour conformité Next.js 16
export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all static files (.png, .jpg, .ico, etc.)
     */
    '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
  ],
};
