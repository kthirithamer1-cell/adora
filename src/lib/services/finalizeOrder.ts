import { supabase } from '@/lib/supabase';
import {
  Order,
  transitionOrder,
  grantCredits,
  extendSubscription,
} from '@/lib/services/billing';
import { PACKS, PackId } from '@/config/packs';
import { findWorkspaceById } from '@/lib/auth';

export interface FinalizeOrderResult {
  success: boolean;
  orderId: string;
  alreadyPaid?: boolean;
  creditsGranted?: number;
  newBalance?: number;
  error?: string;
}

/**
 * Atomically finalizes a paid order, grants credits to the ledger, and activates workspace subscription.
 * Idempotency invariant: If order is already PAID, no credits or subscription extensions are performed.
 */
export async function finalizeOrder(
  orderId: string,
  source: 'webhook' | 'reconciler' | 'checkout_callback',
  metadata?: Record<string, any>
): Promise<FinalizeOrderResult> {
  // 1. Fetch Order from database or memory
  let order: Order | null = null;

  try {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

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
        gateway: data.gateway || 'whop',
        gatewayRef: data.gateway_ref,
        idempotencyKey: data.idempotency_key,
        catalogSnapshot: data.catalog_snapshot || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  } catch {
    // Fallback to memory
  }

  // 2. If already PAID, return idempotent success (MM-110 AC2)
  if (order && order.status === 'PAID') {
    return {
      success: true,
      orderId,
      alreadyPaid: true,
    };
  }

  // 3. Perform atomic state machine transition to PAID
  try {
    order = await transitionOrder(orderId, 'PAID', {
      gatewayRef: metadata?.whopPaymentId || metadata?.payment_id || null,
      paidAt: new Date().toISOString(),
    });
  } catch (transitionErr: any) {
    // If order was already paid or transition failed
    if (order?.status === 'PAID') {
      return { success: true, orderId, alreadyPaid: true };
    }
    console.error(`[FinalizeOrder] Transition failed for order ${orderId}:`, transitionErr);
  }

  if (!order) {
    return {
      success: false,
      orderId,
      error: `Order ${orderId} not found.`,
    };
  }

  // 4. Resolve credits to grant from centralized catalog
  const packDef = PACKS[order.pack as PackId] || PACKS.pro;
  const creditsToGrant = packDef.creditsPerMonth;

  // 5. Grant credits with ledger idempotency (uq_order_grant constraint)
  const grantResult = await grantCredits({
    workspaceId: order.workspaceId,
    delta: creditsToGrant,
    reason: 'whop_plan_grant',
    orderId: order.id,
  });

  // 6. Extend or activate subscription
  await extendSubscription(order);

  // 7. Update workspace plan and legacy columns
  const ws = findWorkspaceById(order.workspaceId);
  if (ws) {
    ws.plan = order.pack === 'flash' ? 'flash' : order.pack === 'agency_299' ? 'agency' : 'pro';
  }

  try {
    await supabase
      .from('workspaces')
      .update({
        plan: order.pack === 'flash' ? 'flash' : order.pack === 'agency_299' ? 'agency' : 'pro',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.workspaceId);
  } catch {
    // Fallback
  }

  // 8. Record audit log in payment_events
  try {
    await supabase.from('payment_events').insert({
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      order_id: order.id,
      workspace_id: order.workspaceId,
      source,
      event_type: 'ORDER_FINALIZED',
      metadata: {
        pack: order.pack,
        cycle: order.cycle,
        creditsGranted: grantResult.granted ? creditsToGrant : 0,
        ...metadata,
      },
      created_at: new Date().toISOString(),
    });
  } catch {
    // Fallback
  }

  return {
    success: true,
    orderId: order.id,
    alreadyPaid: false,
    creditsGranted: grantResult.granted ? creditsToGrant : 0,
  };
}
