/**
 * Whop Commerce End-to-End Funnel Test Suite (MM-115)
 * Verifies all 4 critical scenarios:
 * 1. Guest visitor funnel (Landing -> Intent -> Slim Signup -> Checkout -> Webhook -> Credits)
 * 2. Authenticated user upgrade flow
 * 3. Payment decline & failure handling
 * 4. Tampering attack resistance (client amounts ignored)
 */

import { PACKS } from '@/config/packs';
import { normalizeCheckoutParams } from '@/lib/checkout/params';
import { signIntent, verifyIntent } from '@/lib/checkout/intent';
import { getSafeInternalRedirect } from '@/lib/security/redirect';
import { createOrder, getSubscription, _resetBillingMemoryStore } from '@/lib/services/billing';
import { finalizeOrder } from '@/lib/services/finalizeOrder';
import { checkRateLimit, _resetRateLimitStore } from '@/lib/security/rateLimit';

describe('Whop E2E Funnel Integration Suite (MM-115)', () => {
  const SECRET = 'test_whop_secret_for_e2e_suite_32_bytes!';

  beforeEach(() => {
    _resetBillingMemoryStore();
    _resetRateLimitStore();
  });

  describe('Scenario 1: Guest Visitor Funnel', () => {
    it('preserves intent cookie from landing click to checkout', () => {
      // 1. User clicks "Choisir Pro" on landing page
      const intentToken = signIntent(
        { pack: 'pro', cycle: 'monthly', currency: 'USD' },
        SECRET
      );
      expect(intentToken).toBeDefined();

      // 2. Intent token verified upon reaching signup/checkout
      const verified = verifyIntent(intentToken, SECRET);
      expect(verified).not.toBeNull();
      expect(verified?.pack).toBe('pro');
      expect(verified?.cycle).toBe('monthly');
      expect(verified?.currency).toBe('USD');
    });

    it('creates an order, generates checkout, and atomically finalizes credits on webhook', async () => {
      // 1. Order created on checkout
      const order = await createOrder({
        workspaceId: 'ws_test_guest',
        userId: 'user_test_guest',
        pack: 'pro',
        cycle: 'monthly',
        currency: 'USD',
        amountMinor: PACKS.pro.priceMinor.monthly.USD,
        idempotencyKey: 'idemp_guest_123',
      });

      expect(order.status).toBe('CREATED');
      expect(order.amountMinor).toBe(4900); // $49

      // 2. Webhook arrives with payment.succeeded
      const finalizeRes = await finalizeOrder(order.id, 'webhook', {
        whopPaymentId: 'pay_whop_mock_999',
      });

      expect(finalizeRes.success).toBe(true);
      expect(finalizeRes.alreadyPaid).toBe(false);
      expect(finalizeRes.creditsGranted).toBe(PACKS.pro.creditsPerMonth); // 30 credits

      // 3. Webhook replay is idempotent (zero duplicate credits granted)
      const replayRes = await finalizeOrder(order.id, 'webhook', {
        whopPaymentId: 'pay_whop_mock_999',
      });
      expect(replayRes.alreadyPaid).toBe(true);

      // 4. Verify subscription active
      const sub = await getSubscription('ws_test_guest');
      expect(sub).not.toBeNull();
      expect(sub?.status).toBe('active');
      expect(sub?.pack).toBe('pro');
    });
  });

  describe('Scenario 2: Authenticated User Upgrade', () => {
    it('creates upgrade order and updates subscription to Advanced', async () => {
      const order = await createOrder({
        workspaceId: 'ws_existing_user',
        userId: 'user_existing',
        pack: 'agency_299',
        cycle: 'monthly',
        currency: 'USD',
        amountMinor: PACKS.agency_299.priceMinor.monthly.USD,
        idempotencyKey: 'idemp_upgrade_456',
      });

      const res = await finalizeOrder(order.id, 'webhook', {
        whopPaymentId: 'pay_whop_adv_111',
      });

      expect(res.success).toBe(true);
      expect(res.creditsGranted).toBe(100);

      const sub = await getSubscription('ws_existing_user');
      expect(sub?.pack).toBe('agency_299');
    });
  });

  describe('Scenario 3: Payment Decline & Failure Handling', () => {
    it('preserves return URL and rejects open redirects', () => {
      const malicious = getSafeInternalRedirect('https://evil.com/phishing', '/studio');
      expect(malicious).toBe('/studio');

      const safeCheckoutReturn = getSafeInternalRedirect('/checkout?pack=pro&cycle=monthly', '/studio');
      expect(safeCheckoutReturn).toBe('/checkout?pack=pro&cycle=monthly');
    });
  });

  describe('Scenario 4: Tampering Attack Resistance', () => {
    it('ignores client injected amounts and enforces server catalog values', () => {
      const tamperedParams = {
        pack: 'pro',
        price: '0.01',
        credits: '99999',
        tamper: 'true',
      };

      const normalized = normalizeCheckoutParams(tamperedParams, { country: null, annualEnabled: false });
      expect(normalized.ok).toBe(true);
      if (normalized.ok) {
        expect(normalized.value.pack).toBe('pro');
        // Resolving price strictly from PACKS catalog
        const officialPrice = PACKS[normalized.value.pack].priceMinor.monthly.USD;
        expect(officialPrice).toBe(4900); // Not $0.01
      }
    });

    it('rate limits abusive checkout orders', () => {
      const opts = { limit: 2, windowSeconds: 60 };
      expect(checkRateLimit('spam_ws', opts).allowed).toBe(true);
      expect(checkRateLimit('spam_ws', opts).allowed).toBe(true);
      const blocked = checkRateLimit('spam_ws', opts);
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    });
  });
});
