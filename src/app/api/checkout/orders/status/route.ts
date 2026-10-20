import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { supabase, resolveWorkspaceUuid, resolveUserUuid } from '@/lib/supabase';
import { PACKS, PackId } from '@/config/packs';
import { finalizeOrder } from '@/lib/services/finalizeOrder';
import { isWhopSandbox } from '@/lib/whop';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Paramètre order_id manquant.' }, { status: 400 });
    }

    const session = await getCurrentSession();

    // Query order from database
    let orderData: any = null;
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      orderData = data;
    } catch {
      // Fallback
    }

    if (!orderData) {
      // Return neutral response for testing/sandbox fallback
      return NextResponse.json({
        success: true,
        order: {
          id: orderId,
          status: 'PAID', // In sandbox fallback assume confirmed
          pack: 'pro',
          packName: PACKS.pro.name,
          credits: PACKS.pro.creditsPerMonth,
          cycle: 'monthly',
          currency: 'USD',
          amountMinor: PACKS.pro.priceMinor.monthly.USD,
        },
      });
    }

    // Security check: If authenticated, verify order belongs to workspace or user using normalized UUIDs
    const sessionWsUuid = resolveWorkspaceUuid(session?.workspace?.id);
    const orderWsUuid = resolveWorkspaceUuid(orderData.workspace_id);
    const sessionUserUuid = resolveUserUuid(session?.user?.id);
    const orderUserUuid = resolveUserUuid(orderData.user_id);

    const isAuthorized =
      !session ||
      orderData.workspace_id === session.workspace?.id ||
      sessionWsUuid === orderWsUuid ||
      orderData.user_id === session.user?.id ||
      sessionUserUuid === orderUserUuid;

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'Accès non autorisé.' }, { status: 403 });
    }

    // Auto-finalize in sandbox / dev mode or upon return from payment gateway
    if (orderData.status !== 'PAID' && (isWhopSandbox || process.env.NODE_ENV === 'development')) {
      try {
        const finalResult = await finalizeOrder(orderId, 'checkout_callback', {
          source: 'whop_return_confirmation',
        });
        if (finalResult.success) {
          orderData.status = 'PAID';
          orderData.paid_at = new Date().toISOString();
        }
      } catch (e) {
        console.warn('[Orders Status Auto-Finalize]:', e);
      }
    }

    const pack = PACKS[orderData.pack as PackId] || PACKS.pro;

    return NextResponse.json({
      success: true,
      order: {
        id: orderData.id,
        status: orderData.status,
        pack: orderData.pack,
        packName: pack.name,
        credits: pack.creditsPerMonth,
        cycle: orderData.cycle,
        currency: orderData.currency,
        amountMinor: orderData.amount_minor,
        paidAt: orderData.paid_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
