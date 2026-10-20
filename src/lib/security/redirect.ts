/**
 * Open-redirect protection helper for login, checkout, and post-authentication flows.
 *
 * Rules:
 * 1. Allowlisted path prefixes: '/checkout', '/payment', '/onboarding', '/studio', '/studio', '/billing'.
 * 2. Rejects any string with control characters or backslash.
 * 3. Rejects protocol schemes, host manipulation, and open-redirect vectors.
 * 4. Never calls decodeURIComponent (input from searchParams.get is already single-decoded).
 * 5. Drops any URL hash fragment.
 */

const ALLOWED = ['/checkout', '/payment', '/onboarding', '/studio', '/studio', '/billing'];

function hasUnsafeChar(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 32 || c === 127 || c === 92) {
      return true; // control characters and backslash (\)
    }
  }
  return false;
}

/**
 * Validates and sanitizes a raw redirect target string.
 * @param raw Value directly from searchParams.get('redirect').
 * @param fallback Safe default destination (defaults to '/studio').
 */
export function getSafeInternalRedirect(raw: string | null | undefined, fallback = '/studio'): string {
  if (!raw || raw.length > 2048 || hasUnsafeChar(raw)) {
    return fallback;
  }

  // Must start with exactly one forward slash, not '//' and not starting with spaces
  if (!raw.startsWith('/') || raw.startsWith('//')) {
    return fallback;
  }

  let url: URL;
  try {
    url = new URL(raw, 'http://internal.invalid');
  } catch {
    return fallback;
  }

  if (url.origin !== 'http://internal.invalid') {
    return fallback;
  }

  const ok = ALLOWED.some((p) => url.pathname === p || url.pathname.startsWith(p + '/'));
  return ok ? url.pathname + url.search : fallback; // hash fragment intentionally dropped
}

/**
 * Builds a secure login URL preserving the return path.
 */
export const buildLoginUrl = (returnTo: string): string =>
  '/login?redirect=' + encodeURIComponent(returnTo);
