import { describe, it, expect, beforeEach } from 'vitest';
import {
  createOrder,
  transitionOrder,
  extendSubscription,
  grantCredits,
  getBalance,
  addUtcMonths,
  InvalidTransitionError,
  _resetBillingMemoryStore,
} from '../billing';

describe('Billing Domain Services (MM-104)', () => {
  beforeEach(() => {
    _resetBillingMemoryStore();
  });

  it('AC2: validates state machine transitions and throws InvalidTransitionError', async () => {
    const order = await createOrder({
      workspaceId: 'ws_test',
      userId: 'usr_1',
      pack: 'pro',
      cycle: 'monthly',
      currency: 'USD',
      amountMinor: 149000,
      idempotencyKey: 'idem_1',
    });

    expect(order.status).toBe('CREATED');

    // CREATED -> PENDING_PAYMENT
    const pending = await transitionOrder(order.id, 'PENDING_PAYMENT');
    expect(pending.status).toBe('PENDING_PAYMENT');

    // PENDING_PAYMENT -> PAID
    const paid = await transitionOrder(order.id, 'PAID');
    expect(paid.status).toBe('PAID');
    expect(paid.paidAt).toBeDefined();

    // PAID -> anything is strictly forbidden
    await expect(transitionOrder(order.id, 'CANCELED')).rejects.toThrow(InvalidTransitionError);
    await expect(transitionOrder(order.id, 'FAILED')).rejects.toThrow(InvalidTransitionError);
  });

  it('AC2: EXPIRED to PAID is allowed (money taken must be honored)', async () => {
    const order = await createOrder({
      workspaceId: 'ws_test',
      userId: 'usr_2',
      pack: 'flash',
      cycle: 'monthly',
      currency: 'USD',
      amountMinor: 1900,
      idempotencyKey: 'idem_2',
    });

    await transitionOrder(order.id, 'EXPIRED');
    const paid = await transitionOrder(order.id, 'PAID');
    expect(paid.status).toBe('PAID');
  });

  it('AC2: FAILED to PAID is strictly rejected', async () => {
    const order = await createOrder({
      workspaceId: 'ws_test',
      userId: 'usr_3',
      pack: 'pro',
      cycle: 'monthly',
      currency: 'USD',
      amountMinor: 149000,
      idempotencyKey: 'idem_3',
    });

    await transitionOrder(order.id, 'PENDING_PAYMENT');
    await transitionOrder(order.id, 'FAILED');
    await expect(transitionOrder(order.id, 'PAID')).rejects.toThrow(InvalidTransitionError);
  });

  it('AC3: enforces idempotency on grantCredits', async () => {
    const res1 = await grantCredits({
      workspaceId: 'ws_test',
      delta: 30,
      reason: 'whop_plan_grant',
      orderId: 'ord_100',
    });
    expect(res1.granted).toBe(true);

    // Replay with exact same orderId and reason
    const res2 = await grantCredits({
      workspaceId: 'ws_test',
      delta: 30,
      reason: 'whop_plan_grant',
      orderId: 'ord_100',
    });
    expect(res2.granted).toBe(false);

    // Trial grant can only be awarded once per workspace
    const trial1 = await grantCredits({
      workspaceId: 'ws_test',
      delta: 10,
      reason: 'trial_grant',
    });
    expect(trial1.granted).toBe(true);

    const trial2 = await grantCredits({
      workspaceId: 'ws_test',
      delta: 10,
      reason: 'trial_grant',
    });
    expect(trial2.granted).toBe(false);
  });

  it('AC4: extendSubscription date calculations', async () => {
    const order = await createOrder({
      workspaceId: 'ws_sub_test',
      userId: 'usr_sub',
      pack: 'pro',
      cycle: 'monthly',
      currency: 'USD',
      amountMinor: 149000,
      idempotencyKey: 'idem_sub',
    });

    const now = new Date('2026-01-15T12:00:00Z');
    const sub1 = await extendSubscription(order, now);

    expect(sub1.currentPeriodStart).toBe('2026-01-15T12:00:00.000Z');
    expect(sub1.currentPeriodEnd).toBe('2026-02-15T12:00:00.000Z');

    // Subsequent renewal while active extends from existing period end
    const sub2 = await extendSubscription(order, new Date('2026-02-01T12:00:00Z'));
    expect(sub2.currentPeriodStart).toBe('2026-02-15T12:00:00.000Z');
    expect(sub2.currentPeriodEnd).toBe('2026-03-15T12:00:00.000Z');
  });

  it('AC4: addUtcMonths clamps to end of shorter months (Jan 31 + 1 mo = Feb 28)', () => {
    const jan31 = new Date(Date.UTC(2026, 0, 31, 10, 0, 0)); // Jan 31 2026
    const febEnd = addUtcMonths(jan31, 1);
    expect(febEnd.getUTCMonth()).toBe(1); // February
    expect(febEnd.getUTCDate()).toBe(28); // 2026 is not a leap year
  });

  it('AC5: getBalance equals sum of deltas', async () => {
    await grantCredits({ workspaceId: 'ws_bal', delta: 10, reason: 'trial_grant' });
    await grantCredits({ workspaceId: 'ws_bal', delta: 30, reason: 'whop_plan_grant', orderId: 'ord_x' });
    await grantCredits({ workspaceId: 'ws_bal', delta: -5, reason: 'generation_spend' });

    const balance = await getBalance('ws_bal');
    expect(balance).toBe(35); // 10 + 30 - 5 = 35
  });
});
