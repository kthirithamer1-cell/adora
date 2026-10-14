import crypto from 'crypto';

/**
 * Configuration & Utilitaires Paddle Billing (Merchant of Record) — Adora SaaS
 */

export interface PaddlePriceConfig {
  id: string;
  priceId: string;
  name: string;
  credits: number;
  priceUSD: number;
  priceEUR?: number;
  priceTND: number;
  type: 'standard' | 'recurring';
}

export const PADDLE_PLANS: Record<string, PaddlePriceConfig> = {
  flash: {
    id: 'flash',
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_FLASH || 'pri_01m4ws2hrtnapcbvsk67dh63y1',
    name: 'Pack Starter Découverte',
    credits: 10,
    priceUSD: 19.0,
    priceTND: 59,
    type: 'standard',
  },
  pro: {
    id: 'pro',
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO || 'pri_01m4ws2hrtnapcbvsk67dh63y1',
    name: 'Pack Pro Lancement ⚡',
    credits: 30,
    priceUSD: 49.0,
    priceTND: 149,
    type: 'standard',
  },
  agency_299: {
    id: 'agency_299',
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_AGENCY || 'pri_01m4ws2hrtnapcbvsk67dh63y1',
    name: 'Abonnement Advanced Agence',
    credits: 100,
    priceUSD: 100.0,
    priceTND: 299,
    type: 'recurring',
  },
};

/**
 * Valide la signature cryptographique d'un webhook émis par Paddle Billing.
 * Header attendu : Paddle-Signature: ts=1671552000;h1=a984...
 */
export function verifyPaddleWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secretKey?: string
): boolean {
  const secret = secretKey || process.env.PADDLE_WEBHOOK_SECRET_KEY;
  if (!signatureHeader || !secret) {
    return false;
  }

  try {
    // 1. Extraire le timestamp et le hash h1
    const parts = signatureHeader.split(';').reduce((acc, part) => {
      const [key, val] = part.trim().split('=');
      if (key && val) acc[key] = val;
      return acc;
    }, {} as Record<string, string>);

    const ts = parts['ts'];
    const h1 = parts['h1'];

    if (!ts || !h1) {
      return false;
    }

    // 2. Construire la payload signée standard de Paddle : `${ts}:${rawBody}`
    const signedPayload = `${ts}:${rawBody}`;

    // 3. Calculer le HMAC-SHA256
    const calculatedHash = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // 4. Comparaison en temps constant pour éviter les attaques temporelles
    const hashBuffer = Buffer.from(calculatedHash, 'utf8');
    const h1Buffer = Buffer.from(h1, 'utf8');

    if (hashBuffer.length !== h1Buffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(hashBuffer, h1Buffer);
  } catch (err) {
    console.error('Erreur lors de la vérification de la signature Paddle :', err);
    return false;
  }
}
