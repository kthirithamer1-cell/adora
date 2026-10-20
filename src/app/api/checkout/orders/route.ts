import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentSession } from '@/lib/auth';
import { PACKS, PACK_IDS, PackId, Cycle, Currency } from '@/config/packs';
import { createOrder, getSubscription } from '@/lib/services/billing';
import { createWhopCheckoutSession } from '@/lib/whop';
import { checkRateLimit } from '@/lib/security/rateLimit';

const CreateOrderSchema = z.object({
  packId: z.enum(PACK_IDS),
  cycle: z.enum(['monthly', 'annual']).default('monthly'),
  currency: z.enum(['USD', 'USD']).optional(),
  idempotencyKey: z.string().optional(),
  returnTo: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Session & Workspace Verification
    const session = await getCurrentSession();
    if (!session || !session.user || !session.workspace) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vous devez être connecté à votre espace de travail pour commander.',
          code: 'UNAUTHENTICATED',
        },
        { status: 401 }
      );
    }

    const { user, workspace } = session;

    // Rate limit check: Max 10 orders per workspace per hour (MM-113)
    const rateCheck = checkRateLimit(`checkout_orders_${workspace.id}`, {
      limit: 10,
      windowSeconds: 3600,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Trop de tentatives de commande. Veuillez patienter avant de réessayer.',
          retryAfter: rateCheck.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) },
        }
      );
    }

    // 2. Body Validation with Zod
    const rawBody = await req.json();
    const parseResult = CreateOrderSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Paramètres de commande invalides.',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { packId, cycle } = parseResult.data;
    const currency: Currency = 'USD';

    // 3. Prevent duplicate active subscriptions (MM-108 AC1)
    const existingSub = await getSubscription(workspace.id);
    if (existingSub && existingSub.status === 'active' && existingSub.pack === packId) {
      return NextResponse.json(
        {
          success: false,
          error: `Votre espace de travail dispose déjà d'un forfait ${PACKS[packId].name} actif.`,
          code: 'ALREADY_SUBSCRIBED',
        },
        { status: 409 }
      );
    }

    // 4. Resolve prices strictly from server catalog (Never trust client body)
    if (packId === 'free') {
      return NextResponse.json({
        success: true,
        checkoutUrl: '/studio',
      });
    }

    const packDef = PACKS[packId];
    const amountMinor =
      cycle === 'annual'
        ? packDef.priceMinor.annual[currency]
        : packDef.priceMinor.monthly[currency];

    const idempotencyKey =
      parseResult.data.idempotencyKey ||
      `ord_${workspace.id}_${packId}_${cycle}_${Date.now()}`;

    // 5. Create Order in Billing Service & Database
    const order = await createOrder({
      workspaceId: workspace.id,
      userId: user.id,
      pack: packId,
      cycle,
      currency,
      amountMinor,
      gateway: 'whop',
      idempotencyKey,
      catalogSnapshot: {
        packName: packDef.name,
        creditsPerMonth: packDef.creditsPerMonth,
        features: packDef.features,
      },
    });

    // 6. Generate Whop Checkout URL (Strictly HTTPS required by Whop SDK)
    let appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host');

    if (!appUrl || appUrl.includes('localhost') || appUrl.includes('127.0.0.1')) {
      if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
        appUrl = `https://${forwardedHost}`;
      } else {
        appUrl = 'https://2535-196-177-82-10.ngrok-free.app';
      }
    }

    if (appUrl.startsWith('http://')) {
      appUrl = appUrl.replace(/^http:\/\//, 'https://');
    }
    appUrl = appUrl.replace(/\/$/, '');

    const returnTo = parseResult.data.returnTo || '/studio';
    const successUrl = `${appUrl}/payment/result?order_id=${encodeURIComponent(order.id)}&returnTo=${encodeURIComponent(returnTo)}`;

    const whopSession = await createWhopCheckoutSession({
      orderId: order.id,
      packId,
      workspaceId: workspace.id,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      successUrl,
    });

    if (!whopSession.success || !whopSession.checkoutUrl) {
      return NextResponse.json(
        {
          success: false,
          error: whopSession.error || 'Erreur lors de la création de la session Whop.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      checkoutUrl: whopSession.checkoutUrl,
      amountMinor,
      currency,
      pack: packId,
      cycle,
    });
  } catch (err: any) {
    console.error('[API Checkout Orders Error]:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Erreur lors de l’initialisation de la commande Whop.',
      },
      { status: 500 }
    );
  }
}
