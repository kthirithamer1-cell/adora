import { PACK_IDS, PackId, Cycle, Currency } from '@/config/packs';

export interface CheckoutParams {
  pack: PackId;
  cycle: Cycle;
  currency: Currency;
}

export type ParamsResult =
  | { ok: true; value: CheckoutParams }
  | { ok: false; reason: 'INVALID_PACK' };

export interface NormalizationContext {
  country?: string | null;
  annualEnabled: boolean;
}

/**
 * Normalizes query parameters into a validated CheckoutParams object.
 *
 * Rules:
 * 1. Read `plan` only when `pack` is missing.
 * 2. Lowercase `pack` and `cycle`, uppercase `currency`.
 * 3. Array inputs take the first element.
 * 4. Invalid or missing `cycle` becomes `monthly`.
 * 5. `annual` becomes `monthly` when `annualEnabled` is false.
 * 6. Currency default is `USD` when country is 'TN' or empty/null, `USD` otherwise.
 * 7. A valid explicit currency ('USD' or 'USD') in input wins over country default.
 * 8. Never reads amount, price, or credits from input.
 * 9. Returns INVALID_PACK if pack is not one of PACK_IDS.
 */
export function normalizeCheckoutParams(
  input: URLSearchParams | Record<string, string | string[] | undefined>,
  ctx: NormalizationContext
): ParamsResult {
  const getParam = (key: string): string | undefined => {
    if (input instanceof URLSearchParams) {
      return input.get(key) || undefined;
    }
    const val = input[key];
    if (Array.isArray(val)) {
      return val[0];
    }
    return val;
  };

  // 1. Resolve raw pack, falling back to legacy 'plan' if 'pack' is absent
  const rawPack = getParam('pack') || getParam('plan');
  if (!rawPack) {
    return { ok: false, reason: 'INVALID_PACK' };
  }

  const normalizedPack = rawPack.trim().toLowerCase() as PackId;
  if (!PACK_IDS.includes(normalizedPack)) {
    return { ok: false, reason: 'INVALID_PACK' };
  }

  // 2. Resolve cycle
  const rawCycle = getParam('cycle');
  let cycle: Cycle = 'monthly';
  if (rawCycle) {
    const cleanedCycle = rawCycle.trim().toLowerCase();
    if (cleanedCycle === 'annual') {
      cycle = ctx.annualEnabled ? 'annual' : 'monthly';
    } else {
      cycle = 'monthly';
    }
  }

  // 3. Resolve currency (Strictly base in USD per user instruction)
  const currency: Currency = 'USD';

  return {
    ok: true,
    value: {
      pack: normalizedPack,
      cycle,
      currency,
    },
  };
}

/**
 * Builds canonical checkout URL with parameters in exact order: pack, cycle, currency.
 */
export function buildCheckoutUrl(p: CheckoutParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set('pack', p.pack);
  searchParams.set('cycle', p.cycle);
  searchParams.set('currency', p.currency);
  return `/checkout?${searchParams.toString()}`;
}
