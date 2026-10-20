import { describe, it, expect } from 'vitest';
import { signIntent, verifyIntent, INTENT_COOKIE_OPTIONS, INTENT_COOKIE } from '../intent';
import { CheckoutParams } from '../params';

describe('Signed Intent Cookie (MM-105)', () => {
  const secret = 'super-secret-hmac-key-at-least-32-bytes-long';
  const params: CheckoutParams = {
    pack: 'pro',
    cycle: 'monthly',
    currency: 'USD',
  };

  it('AC4: signs and verifies a valid checkout intent', () => {
    const token = signIntent(params, secret);
    const verified = verifyIntent(token, secret);

    expect(verified).not.toBeNull();
    expect(verified?.pack).toBe('pro');
    expect(verified?.cycle).toBe('monthly');
    expect(verified?.currency).toBe('USD');
  });

  it('AC4: rejects tampered payload, signature mismatch, or wrong secret', () => {
    const token = signIntent(params, secret);
    const [payload, sig] = token.split('.');

    // Tampered signature
    const tamperedSigToken = `${payload}.${sig.slice(0, -3)}xyz`;
    expect(verifyIntent(tamperedSigToken, secret)).toBeNull();

    // Wrong secret
    expect(verifyIntent(token, 'different-wrong-secret-key-32-chars')).toBeNull();

    // Tampered payload
    const tamperedPayload = Buffer.from(JSON.stringify({ pack: 'agency_299', cycle: 'monthly', currency: 'USD', iat: Date.now() }))
      .toString('base64')
      .replace(/=/g, '');
    expect(verifyIntent(`${tamperedPayload}.${sig}`, secret)).toBeNull();
  });

  it('AC4: rejects expired token (> 7 days)', () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    const expiredToken = signIntent(params, secret, eightDaysAgo);
    expect(verifyIntent(expiredToken, secret, Date.now())).toBeNull();
  });

  it('AC4: rejects garbage input or malformed tokens', () => {
    expect(verifyIntent(undefined, secret)).toBeNull();
    expect(verifyIntent(null, secret)).toBeNull();
    expect(verifyIntent('', secret)).toBeNull();
    expect(verifyIntent('not-a-token', secret)).toBeNull();
    expect(verifyIntent('one.two.three', secret)).toBeNull();
  });

  it('AC5: cookie options match the security specification', () => {
    expect(INTENT_COOKIE_OPTIONS.name).toBe(INTENT_COOKIE);
    expect(INTENT_COOKIE_OPTIONS.httpOnly).toBe(true);
    expect(INTENT_COOKIE_OPTIONS.sameSite).toBe('lax');
    expect(INTENT_COOKIE_OPTIONS.path).toBe('/');
    expect(INTENT_COOKIE_OPTIONS.maxAge).toBe(7 * 24 * 60 * 60);
  });
});
