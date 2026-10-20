import { WhopClient, WhopEnvironment } from '@whop/sdk';
import crypto from 'crypto';

/**
 * Client officiel Whop SDK (Merchant of Record pour Logiciels & SaaS) — MarkMosaiq Studio
 * Documentation officielle : https://docs.whop.com
 */
export const isWhopSandbox =
  process.env.WHOP_SANDBOX === 'true' ||
  process.env.NEXT_PUBLIC_WHOP_SANDBOX === 'true';

export function extractPlanId(val?: string, fallback = ''): string {
  if (!val) return fallback;
  const match = val.match(/plan_[a-zA-Z0-9_-]+/);
  return match ? match[0] : val;
}

export function formatCheckoutUrl(rawUrl?: string, planId?: string): string {
  const domain = isWhopSandbox ? 'sandbox.whop.com' : 'whop.com';

  if (rawUrl && rawUrl.startsWith('http')) {
    try {
      const urlObj = new URL(rawUrl);
      if (isWhopSandbox && urlObj.hostname === 'whop.com') {
        urlObj.hostname = 'sandbox.whop.com';
      } else if (!isWhopSandbox && urlObj.hostname === 'sandbox.whop.com') {
        urlObj.hostname = 'whop.com';
      }
      return urlObj.toString();
    } catch {
      return rawUrl;
    }
  }

  const cleanPlanId = planId ? extractPlanId(planId) : '';
  if (cleanPlanId && cleanPlanId.startsWith('plan_')) {
    return `https://${domain}/checkout/${cleanPlanId}`;
  }

  return `https://${domain}/checkout/${cleanPlanId || 'plan_PX0I2P5FGQMFi'}`;
}

/**
 * Client officiel Whop SDK (Merchant of Record pour Logiciels & SaaS) — MarkMosaiq Studio
 * Dashboard & Checkout : sandbox.whop.com (test) | whop.com (production)
 * API Base URL : https://sandbox-api.whop.com/api/v1 (test) | https://api.whop.com/api/v1 (production)
 */
export const whop = new WhopClient({
  token: process.env.WHOP_COMPANY_API_KEY || process.env.WHOP_API_KEY || '',
  environment: isWhopSandbox ? WhopEnvironment.Sandbox : WhopEnvironment.Production,
});

export interface WhopPlanConfig {
  id: string;
  name: string;
  priceUSD: number;
  credits: number;
  planId: string;
  checkoutUrl?: string;
  description: string;
  priceTND?: number;
}

export const WHOP_PLANS: Record<string, WhopPlanConfig> = {
  flash: {
    id: 'flash',
    name: 'Starter Découverte',
    priceUSD: 19,
    credits: 20,
    planId:
      extractPlanId(process.env.NEXT_PUBLIC_WHOP_STARTER_PLAN_ID) ||
      extractPlanId(process.env.WHOP_STARTER_PLAN_ID) ||
      extractPlanId(process.env.NEXT_PUBLIC_WHOP_STARTER_PLAN) ||
      extractPlanId(process.env.WHOP_STARTER_PLAN) ||
      'plan_now5GQaFOTRWk',
    checkoutUrl:
      process.env.NEXT_PUBLIC_WHOP_STARTER_PLAN ||
      process.env.WHOP_STARTER_PLAN ||
      'https://sandbox.whop.com/checkout/plan_now5GQaFOTRWk',
    description: '20 Visuels 4K Haute Définition pour tester et lancer 1 produit rapidement',
  },
  pro: {
    id: 'pro',
    name: 'Pro Lancement ⚡',
    priceUSD: 49,
    credits: 50,
    planId:
      extractPlanId(process.env.NEXT_PUBLIC_WHOP_PRO_PLAN_ID) ||
      extractPlanId(process.env.WHOP_PRO_PLAN_ID) ||
      extractPlanId(process.env.NEXT_PUBLIC_WHOP_PRO_PLAN) ||
      extractPlanId(process.env.WHOP_PRO_PLAN) ||
      'plan_PX0I2P5FGQMFi',
    checkoutUrl:
      process.env.NEXT_PUBLIC_WHOP_PRO_PLAN ||
      process.env.WHOP_PRO_PLAN ||
      'https://sandbox.whop.com/checkout/plan_PX0I2P5FGQMFi',
    description: '50 Visuels complets multi-formats Feed, Stories & Pubs Facebook',
  },
  agency_299: {
    id: 'agency_299',
    name: 'Advanced Agence B2B 🏆',
    priceUSD: 99, // Confirmed: $99 (not $100)
    credits: 120,
    planId:
      extractPlanId(process.env.NEXT_PUBLIC_WHOP_AGENCY_PLAN_ID) ||
      extractPlanId(process.env.WHOP_AGENCY_PLAN_ID) ||
      extractPlanId(process.env.NEXT_PUBLIC_WHOP_AGENCY_PLAN) ||
      extractPlanId(process.env.WHOP_AGENCY_PLAN) ||
      'plan_7wfEWKIfYKb8P',
    checkoutUrl:
      process.env.NEXT_PUBLIC_WHOP_AGENCY_PLAN ||
      process.env.WHOP_AGENCY_PLAN ||
      'https://sandbox.whop.com/checkout/plan_7wfEWKIfYKb8P',
    description: '120 Crédits mensuels en Marque Blanche totale pour multi-boutiques et agences',
  },
};

export interface CreateWhopCheckoutParams {
  packId: string;
  customerName?: string;
  customerEmail?: string;
  workspaceId?: string;
  userId?: string;
  successUrl?: string;
  returnUrl?: string;
}

export interface WhopCheckoutResponse {
  success: boolean;
  checkoutId: string;
  checkoutUrl: string;
  planId: string;
  amountUSD: number;
  amountTND?: number;
  error?: string;
}

/**
 * Construit une session de checkout sécurisée Whop
 */
export async function createWhopCheckout(
  params: CreateWhopCheckoutParams
): Promise<WhopCheckoutResponse> {
  const plan = WHOP_PLANS[params.packId] || WHOP_PLANS['pro'];
  let appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === 'development' ? 'https://2535-196-177-82-10.ngrok-free.app' : 'https://app.MarkMosaiq.tn');
  if (appUrl.startsWith('http://localhost') || appUrl.startsWith('http://127.0.0.1')) {
    appUrl = 'https://2535-196-177-82-10.ngrok-free.app';
  }
  if (appUrl.startsWith('http://')) {
    appUrl = appUrl.replace(/^http:\/\//, 'https://');
  }
  let successUrl = params.successUrl || `${appUrl}/payment/result?pack=${plan.id}&returnTo=/studio`;
  if (successUrl.startsWith('http://')) {
    successUrl = successUrl.replace(/^http:\/\//, 'https://');
  }
  const workspaceId = params.workspaceId && /^[0-9a-f-]{36}$/i.test(params.workspaceId) ? params.workspaceId : 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
  const userId = params.userId && /^[0-9a-f-]{36}$/i.test(params.userId) ? params.userId : 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  // Si le planId commence par "plan_", nous utilisons le SDK Whop Server Session
  if (plan.planId && plan.planId.startsWith('plan_')) {
    try {
      const session = await whop.checkoutConfigurations.create({
        plan_id: plan.planId,
        mode: 'payment',
        redirect_url: successUrl,
        metadata: {
          userId,
          workspaceId,
          packId: plan.id,
          creditsToAdd: plan.credits,
          customerName: params.customerName || 'Client MarkMosaiq',
          customerEmail: params.customerEmail || '',
        },
      });

      const sessionData = (session as any)?.data || session;
      const sessionId = sessionData?.id || (session as any)?.id;
      // Le SDK Whop v2 retourne purchase_url ou on forme l'URL dynamique à partir de l'ID ch_
      const domain = isWhopSandbox ? 'sandbox.whop.com' : 'whop.com';
      const rawUrl =
        sessionData?.purchase_url ||
        (session as any)?.purchase_url ||
        (session as any)?.checkout_url ||
        (session as any)?.url ||
        (sessionId && sessionId.startsWith('ch_') ? `https://${domain}/checkout/${sessionId}` : undefined);

      const checkoutUrl = rawUrl
        ? formatCheckoutUrl(rawUrl)
        : (sessionId && sessionId.startsWith('ch_')
          ? `https://${domain}/checkout/${sessionId}`
          : formatCheckoutUrl(plan.checkoutUrl, plan.planId));

      return {
        success: true,
        checkoutId: sessionId || `whop_${plan.id}`,
        checkoutUrl,
        planId: plan.planId,
        amountUSD: plan.priceUSD,
        amountTND: plan.priceTND,
      };
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        console.warn(
          `[Whop SDK 401 Notice]: La clé API a été rejetée par ${isWhopSandbox ? 'Whop Sandbox (sandbox-api.whop.com)' : 'Whop Production (api.whop.com)'}. Assurez-vous que WHOP_API_KEY provient bien de ${isWhopSandbox ? 'https://sandbox.whop.com/studio/developer' : 'https://whop.com/studio/developer'}.`
        );
      } else {
        console.warn('[Whop SDK Session notice, falling back to direct URL]:', err.message);
      }
    }
  }

  // Redirection directe vers la page produit / checkout officielle Whop
  const checkoutId = `whop_${plan.id}_${Date.now()}`;
  const baseCheckoutUrl = plan.checkoutUrl || formatCheckoutUrl(undefined, plan.planId);
  const targetUrl = new URL(baseCheckoutUrl);

  if (params.customerEmail) targetUrl.searchParams.set('email', params.customerEmail);
  targetUrl.searchParams.set('metadata[workspace_id]', workspaceId);
  targetUrl.searchParams.set('metadata[userId]', userId);
  targetUrl.searchParams.set('metadata[pack_id]', plan.id);
  targetUrl.searchParams.set('redirect_uri', successUrl);
  targetUrl.searchParams.set('redirect_url', successUrl);
  targetUrl.searchParams.set('return_url', successUrl);

  return {
    success: true,
    checkoutId,
    checkoutUrl: targetUrl.toString(),
    planId: plan.planId,
    amountUSD: plan.priceUSD,
    amountTND: plan.priceTND,
  };
}

/**
 * Crée une session de paiement Whop avec timeout strict de 8 secondes et métadonnées injectées (MM-109).
 */
export async function createWhopCheckoutSession(params: {
  orderId: string;
  workspaceId: string;
  userId: string;
  packId: string;
  userEmail?: string;
  userName?: string;
  successUrl?: string;
}): Promise<{ success: boolean; checkoutUrl?: string; checkoutId?: string; error?: string }> {
  const timeoutPromise = new Promise<{ success: false; error: string }>((_, reject) =>
    setTimeout(() => reject(new Error('Délai d’attente dépassé pour Whop API (timeout 8s).')), 8000)
  );

  try {
    const sessionPromise = createWhopCheckout({
      packId: params.packId,
      workspaceId: params.workspaceId,
      userId: params.userId,
      customerEmail: params.userEmail,
      customerName: params.userName,
      successUrl: params.successUrl,
    });

    const res = await Promise.race([sessionPromise, timeoutPromise]);
    if ('success' in res && res.success) {
      return {
        success: true,
        checkoutId: res.checkoutId,
        checkoutUrl: res.checkoutUrl,
      };
    }
    return { success: false, error: (res as any).error || 'Échec de création de session Whop' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erreur réseau Whop' };
  }
}

/**
 * Valide la signature cryptographique d'un webhook émis par Whop.
 */
export function verifyWhopWebhookSignature(
  rawBody: string,
  headers: {
    signature?: string | null;
    timestamp?: string | null;
    id?: string | null;
  },
  secretKey?: string
): boolean {
  const secret = secretKey || process.env.WHOP_WEBHOOK_SECRET;

  if (!secret || secret.includes('your_live') || secret.includes('your_webhook_secret')) {
    console.warn('[Whop Webhook] WHOP_WEBHOOK_SECRET non configuré — validation tolérée pour test local');
    return true;
  }

  const signatureHeader = headers.signature;
  if (!signatureHeader) {
    console.warn('[Whop Webhook] Signature header manquante');
    return false;
  }

  try {
    const cleanSecret = secret.startsWith('whsec_') ? secret.replace('whsec_', '') : secret;
    const secretBuffer = Buffer.from(cleanSecret, 'base64').length > 0
      ? Buffer.from(cleanSecret, 'base64')
      : Buffer.from(cleanSecret, 'utf-8');

    if (headers.timestamp && headers.id) {
      const payloadToSign = `${headers.id}.${headers.timestamp}.${rawBody}`;
      const expectedSignature = crypto
        .createHmac('sha256', secretBuffer)
        .update(payloadToSign)
        .digest('base64');

      const signatures = signatureHeader.split(' ').map((s) => s.replace('v1,', '').replace('v1=', ''));
      const isValid = signatures.some((sig) => {
        try {
          return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSignature));
        } catch {
          return false;
        }
      });

      if (isValid) return true;
    }

    const directHmac = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const cleanSig = signatureHeader.replace('sha256=', '');
    if (cleanSig === directHmac) return true;

    return false;
  } catch (err) {
    console.error('[Whop Webhook] Erreur de vérification signature :', err);
    return false;
  }
}
