import { describe, it, expect } from 'vitest';
import { PACKS, getPriceMinor, periodMonths, formatPrice } from '@/config/packs';
import { normalizeCheckoutParams, buildCheckoutUrl } from '../params';

describe('Pack Catalog (MM-102)', () => {
  it('AC6: computes exact price minors for monthly and annual in USD', () => {
    expect(getPriceMinor('pro', 'monthly', 'USD')).toBe(4900);
    expect(getPriceMinor('pro', 'annual', 'USD')).toBe(47000);

    expect(getPriceMinor('flash', 'monthly', 'USD')).toBe(1900);
    expect(getPriceMinor('flash', 'annual', 'USD')).toBe(18200);
    expect(getPriceMinor('agency_299', 'monthly', 'USD')).toBe(9900);
    expect(getPriceMinor('agency_299', 'annual', 'USD')).toBe(95000);
  });

  it('computes period months', () => {
    expect(periodMonths('monthly')).toBe(1);
    expect(periodMonths('annual')).toBe(12);
  });

  it('formats prices correctly', () => {
    expect(formatPrice(1900, 'USD')).toBe('$19');
    expect(formatPrice(4900, 'USD')).toBe('$49');
    expect(formatPrice(9900, 'USD')).toBe('$99');
  });

  it('marks placeholder credits accurately', () => {
    expect(PACKS.flash.creditsArePlaceholder).toBe(false);
    expect(PACKS.pro.creditsArePlaceholder).toBe(false);
    expect(PACKS.agency_299.creditsArePlaceholder).toBe(false);
  });
});

describe('Checkout Parameters Normalization (MM-102)', () => {
  it('AC1: input plan=pro returns pack pro; input with both pack=flash and plan=pro returns flash', () => {
    const res1 = normalizeCheckoutParams({ plan: 'pro' }, { annualEnabled: true });
    expect(res1.ok).toBe(true);
    if (res1.ok) {
      expect(res1.value.pack).toBe('pro');
    }

    const res2 = normalizeCheckoutParams(new URLSearchParams('pack=flash&plan=pro'), { annualEnabled: true });
    expect(res2.ok).toBe(true);
    if (res2.ok) {
      expect(res2.value.pack).toBe('flash');
    }
  });

  it('AC2: pack=PRO returns pro; pack=enterprise or an empty pack returns INVALID_PACK', () => {
    const resUpper = normalizeCheckoutParams({ pack: 'PRO' }, { annualEnabled: true });
    expect(resUpper.ok).toBe(true);
    if (resUpper.ok) {
      expect(resUpper.value.pack).toBe('pro');
    }

    const resInvalid = normalizeCheckoutParams({ pack: 'enterprise' }, { annualEnabled: true });
    expect(resInvalid.ok).toBe(false);
    if (!resInvalid.ok) {
      expect(resInvalid.reason).toBe('INVALID_PACK');
    }

    const resEmpty = normalizeCheckoutParams({}, { annualEnabled: true });
    expect(resEmpty.ok).toBe(false);
    if (!resEmpty.ok) {
      expect(resEmpty.reason).toBe('INVALID_PACK');
    }
  });

  it('AC3: cycle=weekly returns monthly; cycle=annual with annualEnabled false returns monthly', () => {
    const resWeekly = normalizeCheckoutParams({ pack: 'pro', cycle: 'weekly' }, { annualEnabled: true });
    expect(resWeekly.ok).toBe(true);
    if (resWeekly.ok) {
      expect(resWeekly.value.cycle).toBe('monthly');
    }

    const resAnnualDisabled = normalizeCheckoutParams({ pack: 'pro', cycle: 'annual' }, { annualEnabled: false });
    expect(resAnnualDisabled.ok).toBe(true);
    if (resAnnualDisabled.ok) {
      expect(resAnnualDisabled.value.cycle).toBe('monthly');
    }

    const resAnnualEnabled = normalizeCheckoutParams({ pack: 'pro', cycle: 'annual' }, { annualEnabled: true });
    expect(resAnnualEnabled.ok).toBe(true);
    if (resAnnualEnabled.ok) {
      expect(resAnnualEnabled.value.cycle).toBe('annual');
    }
  });

  it('AC4: currency is strictly normalized to USD', () => {
    const resFR = normalizeCheckoutParams({ pack: 'pro' }, { country: 'FR', annualEnabled: true });
    expect(resFR.ok).toBe(true);
    if (resFR.ok) {
      expect(resFR.value.currency).toBe('USD');
    }

    const resTN = normalizeCheckoutParams({ pack: 'pro' }, { country: 'TN', annualEnabled: true });
    expect(resTN.ok).toBe(true);
    if (resTN.ok) {
      expect(resTN.value.currency).toBe('USD');
    }

    const resExplicitUSD = normalizeCheckoutParams({ pack: 'pro', currency: 'USD' }, { country: 'TN', annualEnabled: true });
    expect(resExplicitUSD.ok).toBe(true);
    if (resExplicitUSD.ok) {
      expect(resExplicitUSD.value.currency).toBe('USD');
    }
  });

  it('AC5: pack=pro&pack=flash takes first value', () => {
    const res = normalizeCheckoutParams({ pack: ['pro', 'flash'] }, { annualEnabled: true });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.pack).toBe('pro');
    }
  });

  it('AC7: query parameters amount, price and credits never appear in result', () => {
    const res = normalizeCheckoutParams({ pack: 'pro', amount: '1', price: '0', credits: '9999' }, { annualEnabled: true });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect((res.value as any).amount).toBeUndefined();
      expect((res.value as any).price).toBeUndefined();
      expect((res.value as any).credits).toBeUndefined();
    }
  });

  it('buildCheckoutUrl formats in exact order', () => {
    const url = buildCheckoutUrl({ pack: 'pro', cycle: 'monthly', currency: 'USD' });
    expect(url).toBe('/checkout?pack=pro&cycle=monthly&currency=USD');
  });
});
