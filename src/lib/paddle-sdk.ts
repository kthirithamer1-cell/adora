'use client';

/**
 * Paddle SDK Client Wrapper pour Paddle Billing v2
 * Conforme aux spécifications :
 * - Échoue explicitement si NEXT_PUBLIC_PADDLE_ENV est absent ou invalide (jamais de fallback silencieux)
 * - N'expose AUCUNE clé secrète serveur
 * - Charge le client Paddle.js officiel et expose PricePreview et Checkout.open
 */

export interface PaddleSDKConfig {
  environment: 'sandbox' | 'production';
  token: string;
}

export interface PaddlePricePreviewItem {
  priceId: string;
  quantity?: number;
}

export interface PaddlePricePreviewParams {
  items: PaddlePricePreviewItem[];
  currencyCode?: string;
  address?: {
    countryCode?: string;
  };
}

export interface PaddleCheckoutOpenParams {
  items: { priceId: string; quantity: number }[];
  customer?: { email?: string };
  customData?: Record<string, any>;
  settings?: {
    displayMode?: 'overlay' | 'inline';
    variant?: 'one-page' | 'multi-page';
    theme?: 'light' | 'dark';
    locale?: string;
    successUrl?: string;
  };
}

export interface PaddleInstance {
  Environment: {
    set: (env: 'sandbox' | 'production') => void;
  };
  Initialize: (options: { token: string; eventCallback?: (event: any) => void }) => void;
  PricePreview: (params: PaddlePricePreviewParams) => Promise<any>;
  Checkout: {
    open: (params: PaddleCheckoutOpenParams) => void;
    close: () => void;
  };
}

declare global {
  interface Window {
    Paddle?: PaddleInstance;
  }
}

/**
 * Lit et valide strictement la configuration Paddle depuis les variables d'environnement publiques.
 * Échoue avec une exception explicite si manquante ou incohérente.
 */
export function getPaddleClientConfig(): PaddleSDKConfig {
  const env = process.env.NEXT_PUBLIC_PADDLE_ENV;

  if (!env) {
    throw new Error(
      "Paddle configuration missing: 'NEXT_PUBLIC_PADDLE_ENV' is required and must be explicitly set to 'sandbox' or 'production'."
    );
  }

  if (env !== 'sandbox' && env !== 'production') {
    throw new Error(
      `Paddle configuration invalid: 'NEXT_PUBLIC_PADDLE_ENV' must be 'sandbox' or 'production'. Received: '${env}'`
    );
  }

  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) {
    throw new Error(
      "Paddle configuration missing: 'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN' is required."
    );
  }

  if (env === 'sandbox' && !token.startsWith('test_')) {
    throw new Error(
      `Paddle configuration mismatch: In sandbox mode, 'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN' must start with 'test_'. Received: '${token}'`
    );
  }

  if (env === 'production' && !token.startsWith('live_')) {
    throw new Error(
      `Paddle configuration mismatch: In production mode, 'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN' must start with 'live_'. Received: '${token}'`
    );
  }

  return { environment: env, token };
}

let paddleInitPromise: Promise<PaddleInstance> | null = null;

/**
 * Initialise le runtime Paddle.js de manière asynchrone et idempotente.
 */
export async function getPaddleInstance(): Promise<PaddleInstance> {
  if (typeof window === 'undefined') {
    throw new Error('Paddle.js can only be initialized on the client side.');
  }

  if (window.Paddle) {
    return window.Paddle;
  }

  if (paddleInitPromise) {
    return paddleInitPromise;
  }

  paddleInitPromise = new Promise<PaddleInstance>((resolve, reject) => {
    try {
      const config = getPaddleClientConfig();

      const script = document.createElement('script');
      script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
      script.async = true;

      script.onload = () => {
        if (!window.Paddle) {
          reject(new Error('Paddle.js script loaded but window.Paddle is unavailable.'));
          return;
        }

        try {
          if (config.environment === 'sandbox') {
            window.Paddle.Environment.set('sandbox');
          }

          window.Paddle.Initialize({
            token: config.token,
            eventCallback: (event) => {
              if (event.name === 'checkout.completed') {
                console.log('[Paddle] Checkout finalisé :', event);
              }
            },
          });

          resolve(window.Paddle);
        } catch (initErr) {
          reject(initErr);
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load Paddle.js CDN script (https://cdn.paddle.com/paddle/v2/paddle.js).'));
      };

      document.head.appendChild(script);
    } catch (err) {
      reject(err);
    }
  });

  return paddleInitPromise;
}
