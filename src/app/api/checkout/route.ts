import { NextRequest, NextResponse } from 'next/server';
import { createWhopCheckout, WHOP_PLANS } from '@/lib/whop';
import { requireUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    // Récupérer le plan demandé s'il est spécifié dans le body
    let requestedPlanId: string | undefined;
    try {
      const body = await req.json();
      requestedPlanId = body?.planId || body?.packId;
    } catch {
      // Body vide ou non JSON, utilisation du plan par défaut
    }

    const planConfig = requestedPlanId && WHOP_PLANS[requestedPlanId]
      ? WHOP_PLANS[requestedPlanId]
      : WHOP_PLANS['pro'];

    const result = await createWhopCheckout({
      packId: planConfig.id,
      customerName: user.name,
      customerEmail: user.email,
      workspaceId: user.workspaceId,
      userId: user.id,
    });

    // Support des appels AJAX/Fetch API côté client
    const acceptHeader = req.headers.get('accept') || '';
    const contentType = req.headers.get('content-type') || '';
    if (acceptHeader.includes('application/json') || contentType.includes('application/json')) {
      return NextResponse.json({
        success: true,
        sessionId: result.checkoutId,
        redirectUrl: result.checkoutUrl,
      });
    }

    // Redirection standard 303
    return NextResponse.redirect(result.checkoutUrl, 303);
  } catch (error: any) {
    console.error('[Whop Checkout API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize Whop checkout' },
      { status: 500 }
    );
  }
}
