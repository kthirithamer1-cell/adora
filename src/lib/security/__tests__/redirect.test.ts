import { describe, it, expect } from 'vitest';
import { getSafeInternalRedirect, buildLoginUrl } from '../redirect';

describe('Safe Internal Redirect Helper (MM-103)', () => {
  it('AC1: rejects unsafe vectors and returns fallback', () => {
    const fallback = '/studio';

    // Null and empty
    expect(getSafeInternalRedirect(null, fallback)).toBe(fallback);
    expect(getSafeInternalRedirect('', fallback)).toBe(fallback);

    // Protocol schemes and external hosts
    expect(getSafeInternalRedirect('https://evil.com', fallback)).toBe(fallback);
    expect(getSafeInternalRedirect('http://evil.com', fallback)).toBe(fallback);
    expect(getSafeInternalRedirect('//evil.com', fallback)).toBe(fallback);

    // Backslash vectors
    expect(getSafeInternalRedirect('/\\evil.com', fallback)).toBe(fallback);
    expect(getSafeInternalRedirect('\\evil.com', fallback)).toBe(fallback);

    // Javascript and data URIs
    expect(getSafeInternalRedirect('javascript:alert(1)', fallback)).toBe(fallback);
    expect(getSafeInternalRedirect('data:text/html,evil', fallback)).toBe(fallback);

    // Encoded slashes or bypass attempts
    expect(getSafeInternalRedirect('/%2F%2Fevil.com', fallback)).toBe(fallback);

    // Non-allowlisted route (/login to avoid redirect loops)
    expect(getSafeInternalRedirect('/login', fallback)).toBe(fallback);
    expect(getSafeInternalRedirect('/login?foo=bar', fallback)).toBe(fallback);

    // Directory traversal
    expect(getSafeInternalRedirect('/checkout/../evil', fallback)).toBe(fallback);

    // Length > 2048 characters
    const longString = '/checkout?' + 'a'.repeat(2045);
    expect(getSafeInternalRedirect(longString, fallback)).toBe(fallback);

    // Strings with control characters (newline, tab)
    expect(getSafeInternalRedirect('/checkout\n/test', fallback)).toBe(fallback);
    expect(getSafeInternalRedirect('/checkout\t/test', fallback)).toBe(fallback);
    expect(getSafeInternalRedirect('/checkout\0', fallback)).toBe(fallback);

    // Leading whitespace
    expect(getSafeInternalRedirect(' /checkout', fallback)).toBe(fallback);
  });

  it('AC1: allows safe internal paths and drops fragment', () => {
    // Normal paths with query params
    expect(getSafeInternalRedirect('/checkout?pack=pro&cycle=monthly')).toBe('/checkout?pack=pro&cycle=monthly');
    expect(getSafeInternalRedirect('/checkout/step?x=1')).toBe('/checkout/step?x=1');
    expect(getSafeInternalRedirect('/studio')).toBe('/studio');
    expect(getSafeInternalRedirect('/payment/result?order=abc')).toBe('/payment/result?order=abc');
    expect(getSafeInternalRedirect('/studio')).toBe('/studio');
    expect(getSafeInternalRedirect('/onboarding')).toBe('/onboarding');
    expect(getSafeInternalRedirect('/billing')).toBe('/billing');

    // Drops fragment
    expect(getSafeInternalRedirect('/checkout#//evil.com')).toBe('/checkout');
    expect(getSafeInternalRedirect('/studio#top')).toBe('/studio');
  });

  it('AC2: buildLoginUrl properly encodes the target', () => {
    expect(buildLoginUrl('/checkout?pack=pro&cycle=monthly')).toBe(
      '/login?redirect=%2Fcheckout%3Fpack%3Dpro%26cycle%3Dmonthly'
    );
  });
});
