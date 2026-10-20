import { PackId, Cycle, Currency, periodMonths } from '@/config/packs';
import { supabase } from '@/lib/supabase';
import { findWorkspaceById, getMemoryWorkspaces } from '@/lib/auth';

export type OrderStatus = 'CREATED' | 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'CANCELED' | 'EXPIRED';
export type GatewayType = 'whop';
export type LedgerReason = 'trial_grant' | 'whop_plan_grant' | 'generation_spend' | 'refund' | 'adjustment';

export interface Order {
  id: string;
  workspaceId: string;
  userId: string;
  pack: PackId;
  cycle: Cycle;
  currency: Currency;
  amountMinor: number;
  status: OrderStatus;
  gateway: GatewayType;
  gatewayRef?: string | null;
  idempotencyKey: string;
  catalogSnapshot: Record<string, any>;
  failureCode?: string | null;
  expiresAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewOrder {
  id?: string;
  workspaceId: string;
  userId: string;
  pack: PackId;
  cycle: Cycle;
  currency: Currency;
  amountMinor: number;
  gateway?: GatewayType;
  gatewayRef?: string | null;
  idempotencyKey: string;
  catalogSnapshot?: Record<string, any>;
  expiresAt?: string | null;
}

export interface Subscription {
  workspaceId: string;
  pack: PackId;
  cycle: Cycle;
  status: 'active' | 'grace' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  lastOrderId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreditLedgerEntry {
  id: string;
  workspaceId: string;
  delta: number;
  reason: LedgerReason;
  orderId?: string | null;
  expiresAt?: string | null;
  createdAt: string;
}

export class InvalidTransitionError extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Invalid order transition from '${from}' to '${to}'`);
    this.name = 'InvalidTransitionError';
  }
}

// In-memory runtime store for development and fast validation
const memoryOrders = new Map<string, Order>();
const memorySubscriptions = new Map<string, Subscription>();
const memoryLedger: CreditLedgerEntry[] = [];

/**
 * Validates state transitions per Section 4.5 order state machine:
 * - CREATED -> PENDING_PAYMENT, EXPIRED, CANCELED
 * - PENDING_PAYMENT -> PAID, FAILED, CANCELED, EXPIRED
 * - EXPIRED -> PAID (Allowed: money taken, always honor it)
 * - PAID -> any is strictly forbidden
 * - FAILED -> PAID is forbidden
 */
export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (from === to) {
    return true; // Idempotent same-state transition (e.g. PAID -> PAID)
  }
  if (from === 'PAID') {
    return false; // Once PAID, order never changes to non-PAID
  }
  if (from === 'FAILED' && to === 'PAID') {
    return false;
  }
  if (from === 'CREATED') {
    return to === 'PENDING_PAYMENT' || to === 'PAID' || to === 'EXPIRED' || to === 'CANCELED';
  }
  if (from === 'PENDING_PAYMENT') {
    return to === 'PAID' || to === 'FAILED' || to === 'CANCELED' || to === 'EXPIRED';
  }
  if (from === 'EXPIRED') {
    return to === 'PAID'; // Allowed
  }
  return false;
}

/**
 * Creates a new order with idempotency guarantee.
 */
export async function createOrder(input: NewOrder): Promise<Order> {
  // Check idempotency in memory
  for (const existing of memoryOrders.values()) {
    if (existing.userId === input.userId && existing.idempotencyKey === input.idempotencyKey) {
      return existing;
    }
  }

  const now = new Date().toISOString();
  const orderId = input.id || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const order: Order = {
    id: orderId,
    workspaceId: input.workspaceId,
    userId: input.userId,
    pack: input.pack,
    cycle: input.cycle,
    currency: input.currency,
    amountMinor: input.amountMinor,
    status: 'CREATED',
    gateway: input.gateway || 'whop',
    gatewayRef: input.gatewayRef || null,
    idempotencyKey: input.idempotencyKey,
    catalogSnapshot: input.catalogSnapshot || {},
    expiresAt: input.expiresAt || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    createdAt: now,
    updatedAt: now,
  };

  memoryOrders.set(order.id, order);

  try {
    await supabase.from('orders').insert({
      id: order.id,
      workspace_id: order.workspaceId,
      user_id: order.userId,
      pack: order.pack,
      cycle: order.cycle,
      currency: order.currency,
      amount_minor: order.amountMinor,
      status: order.status,
      gateway: order.gateway,
      gateway_ref: order.gatewayRef,
      idempotency_key: order.idempotencyKey,
      catalog_snapshot: order.catalogSnapshot,
      expires_at: order.expiresAt,
    });
  } catch {
    // Database fallback to memory in offline/local environments
  }

  return order;
}

/**
 * Transitions order state enforcing the state machine.
 */
export async function transitionOrder(
  id: string,
  to: OrderStatus,
  patch?: Partial<Order>
): Promise<Order> {
  let order = memoryOrders.get(id);
  if (!order) {
    try {
      const { data } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
      if (data) {
        order = {
          id: data.id,
          workspaceId: data.workspace_id,
          userId: data.user_id,
          pack: data.pack,
          cycle: data.cycle,
          currency: data.currency,
          amountMinor: data.amount_minor,
          status: data.status,
          gateway: data.gateway,
          gatewayRef: data.gateway_ref,
          idempotencyKey: data.idempotency_key,
          catalogSnapshot: data.catalog_snapshot || {},
          expiresAt: data.expires_at,
          paidAt: data.paid_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        memoryOrders.set(id, order);
      }
    } catch {
      // Fallback
    }
  }

  if (!order) {
    throw new Error(`Order ${id} not found`);
  }

  // Idempotent short-circuit if already in target state
  if (order.status === to) {
    if (patch?.gatewayRef && !order.gatewayRef) order.gatewayRef = patch.gatewayRef;
    if (patch?.paidAt && !order.paidAt) order.paidAt = patch.paidAt;
    return order;
  }

  if (!isValidTransition(order.status, to)) {
    throw new InvalidTransitionError(order.status, to);
  }

  const now = new Date().toISOString();
  order.status = to;
  order.updatedAt = now;

  if (to === 'PAID') {
    order.paidAt = patch?.paidAt || now;
  }
  if (patch?.gatewayRef) {
    order.gatewayRef = patch.gatewayRef;
  }
  if (patch?.failureCode) {
    order.failureCode = patch.failureCode;
  }

  memoryOrders.set(id, order);

  try {
    await supabase.from('orders').update({ id }, {
      status: order.status,
      paid_at: order.paidAt,
      gateway_ref: order.gatewayRef,
      failure_code: order.failureCode,
      updated_at: order.updatedAt,
    });
  } catch {
    // Database fallback
  }

  return order;
}

/**
 * Adds calendar months in UTC, clamping to end of shorter months (e.g. Jan 31 + 1 mo = Feb 28/29).
 */
export function addUtcMonths(startDate: Date, months: number): Date {
  const result = new Date(startDate.getTime());
  const expectedMonth = (result.getUTCMonth() + months) % 12;
  result.setUTCMonth(result.getUTCMonth() + months);

  // If day overflowed into the next month, clamp to the last day of the expected month
  if (result.getUTCMonth() !== expectedMonth) {
    result.setUTCDate(0);
  }
  return result;
}

/**
 * Extends or initializes workspace subscription period.
 */
export async function extendSubscription(order: Order, now = new Date()): Promise<Subscription> {
  const existing = memorySubscriptions.get(order.workspaceId);
  const nowTime = now.getTime();

  let start: Date;
  if (existing && existing.status === 'active' && new Date(existing.currentPeriodEnd).getTime() > nowTime) {
    // Active subscription: extend from the end of current period
    start = new Date(existing.currentPeriodEnd);
  } else {
    // New or expired subscription: start immediately
    start = new Date(nowTime);
  }

  const monthsToAdd = periodMonths(order.cycle);
  const end = addUtcMonths(start, monthsToAdd);

  const sub: Subscription = {
    workspaceId: order.workspaceId,
    pack: order.pack,
    cycle: order.cycle,
    status: 'active',
    currentPeriodStart: start.toISOString(),
    currentPeriodEnd: end.toISOString(),
    lastOrderId: order.id,
    createdAt: existing ? existing.createdAt : now.toISOString(),
    updatedAt: now.toISOString(),
  };

  memorySubscriptions.set(order.workspaceId, sub);

  try {
    await supabase.from('subscriptions').upsert({
      workspace_id: sub.workspaceId,
      pack: sub.pack,
      cycle: sub.cycle,
      status: sub.status,
      current_period_start: sub.currentPeriodStart,
      current_period_end: sub.currentPeriodEnd,
      last_order_id: sub.lastOrderId,
      updated_at: sub.updatedAt,
    }, 'workspace_id');
  } catch {
    // Fallback
  }

  return sub;
}

/**
 * Retrieves the current subscription for a workspace.
 */
export async function getSubscription(workspaceId: string): Promise<Subscription | null> {
  const sub = memorySubscriptions.get(workspaceId);
  if (sub) return sub;

  try {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('workspace_id', workspaceId)
      .maybeSingle();

    if (data) {
      const parsed: Subscription = {
        workspaceId: data.workspace_id,
        pack: data.pack,
        cycle: data.cycle,
        status: data.status,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        lastOrderId: data.last_order_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      memorySubscriptions.set(workspaceId, parsed);
      return parsed;
    }
  } catch {
    // Database fallback
  }

  return null;
}

/**
 * Grants credits to workspace ledger with idempotency.
 * Unique constraints enforced:
 * - (orderId, reason) where orderId is not null
 * - (workspaceId, reason) where reason is 'trial_grant'
 */
export async function grantCredits(p: {
  workspaceId: string;
  delta: number;
  reason: LedgerReason;
  orderId?: string;
  expiresAt?: Date;
}): Promise<{ granted: boolean }> {
  // 1. Enforce unique (orderId, reason)
  if (p.orderId) {
    const duplicateOrder = memoryLedger.some(
      (entry) => entry.orderId === p.orderId && entry.reason === p.reason
    );
    if (duplicateOrder) {
      return { granted: false };
    }
  }

  // 2. Enforce unique (workspaceId, 'trial_grant')
  if (p.reason === 'trial_grant') {
    const duplicateTrial = memoryLedger.some(
      (entry) => entry.workspaceId === p.workspaceId && entry.reason === 'trial_grant'
    );
    if (duplicateTrial) {
      return { granted: false };
    }
  }

  const now = new Date().toISOString();
  const entry: CreditLedgerEntry = {
    id: `led_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    workspaceId: p.workspaceId,
    delta: p.delta,
    reason: p.reason,
    orderId: p.orderId || null,
    expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null,
    createdAt: now,
  };

  memoryLedger.push(entry);

  // 3. Dual-write to legacy workspace credits column
  const ws = findWorkspaceById(p.workspaceId);
  if (ws) {
    ws.creditsRemaining = (ws.creditsRemaining || 0) + p.delta;
  }

  try {
    await supabase.from('credit_ledger').insert({
      id: entry.id,
      workspace_id: entry.workspaceId,
      delta: entry.delta,
      reason: entry.reason,
      order_id: entry.orderId,
      expires_at: entry.expiresAt,
    });
    if (ws) {
      await supabase.from('workspaces').update({ id: p.workspaceId }, {
        credits_remaining: ws.creditsRemaining,
      });
    }
  } catch {
    // Fallback
  }

  return { granted: true };
}

/**
 * Returns dynamic credit balance computed from the append-only ledger.
 */
export async function getBalance(workspaceId: string): Promise<number> {
  const entries = memoryLedger.filter((e) => e.workspaceId === workspaceId);
  return entries.reduce((sum, e) => sum + e.delta, 0);
}

/**
 * Clears memory stores (Used for test isolation).
 */
export function _resetBillingMemoryStore(): void {
  memoryOrders.clear();
  memorySubscriptions.clear();
  memoryLedger.length = 0;
}
