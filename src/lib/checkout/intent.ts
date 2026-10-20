import crypto from 'crypto';
import { CheckoutParams } from './params';
import { PACK_IDS, PackId, Cycle, Currency } from '@/config/packs';

export const INTENT_COOKIE = 'mm_intent';
export const INTENT_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

interface IntentPayload {
  pack: PackId;
  cycle: Cycle;
  currency: Currency;
  iat: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Cryptographically signs checkout parameters into a tamper-proof token using HMAC-SHA256.
 * Format: base64url(payload).base64url(hmac)
 */
export function signIntent(p: CheckoutParams, secret: string, now = Date.now()): string {
  const payload: IntentPayload = {
    pack: p.pack,
    cycle: p.cycle,
    currency: p.currency,
    iat: now,
  };

  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const hmac = crypto
    .createHmac('sha256', secret)
    .update(payloadEncoded)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${payloadEncoded}.${hmac}`;
}

/**
 * Verifies an intent token using constant-time comparison.
 * Returns CheckoutParams if valid, or null if tampered, expired (> 7 days), or malformed.
 */
export function verifyIntent(
  token: string | undefined | null,
  secret: string,
  now = Date.now()
): CheckoutParams | null {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [payloadEncoded, signature] = parts;

  // Re-generate expected HMAC
  const expectedHmac = crypto
    .createHmac('sha256', secret)
    .update(payloadEncoded)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Constant-time comparison
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedHmac);

  if (sigBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const jsonStr = base64UrlDecode(payloadEncoded);
    const parsed = JSON.parse(jsonStr) as Partial<IntentPayload>;

    if (!parsed.pack || !PACK_IDS.includes(parsed.pack as PackId)) {
      return null;
    }
    if (parsed.cycle !== 'monthly' && parsed.cycle !== 'annual') {
      return null;
    }
    if (parsed.currency !== 'USD') {
      return null;
    }
    if (!parsed.iat || typeof parsed.iat !== 'number') {
      return null;
    }

    // Check expiration: 7 days max age
    const maxAgeMs = INTENT_COOKIE_MAX_AGE * 1000;
    if (now - parsed.iat > maxAgeMs || parsed.iat > now + 60000) {
      return null; // Expired or future dated beyond 1 minute clock skew
    }

    return {
      pack: parsed.pack as PackId,
      cycle: parsed.cycle,
      currency: parsed.currency,
    };
  } catch {
    return null;
  }
}

/**
 * Standard cookie options for mm_intent.
 */
export const INTENT_COOKIE_OPTIONS = {
  name: INTENT_COOKIE,
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: INTENT_COOKIE_MAX_AGE,
};
