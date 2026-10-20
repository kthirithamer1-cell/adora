/**
 * Zero-PII Funnel Analytics Telemetry (MM-114).
 * Strictly forbids sensitive data (emails, passwords, names, IP addresses).
 * Only anonymized tokens, pack IDs, and transaction references are retained.
 */

import { PackId, Cycle, Currency } from '@/config/packs';

export type FunnelEventName =
  | 'funnel_plan_clicked'
  | 'funnel_signup_started'
  | 'funnel_signup_completed'
  | 'funnel_checkout_viewed'
  | 'funnel_whop_redirect'
  | 'funnel_payment_success'
  | 'funnel_payment_failed'
  | 'funnel_onboarding_completed';

export interface FunnelEventPayloadMap {
  funnel_plan_clicked: {
    pack: PackId;
    cycle: Cycle;
    currency: Currency;
  };
  funnel_signup_started: {
    plan?: string;
  };
  funnel_signup_completed: {
    plan?: string;
    hasIntent: boolean;
  };
  funnel_checkout_viewed: {
    pack: PackId;
    cycle: Cycle;
    currency: Currency;
    isGuest: boolean;
  };
  funnel_whop_redirect: {
    orderId: string;
    pack: PackId;
  };
  funnel_payment_success: {
    orderId: string;
    pack: string;
    creditsGranted: number;
  };
  funnel_payment_failed: {
    orderId: string;
    reason?: string;
  };
  funnel_onboarding_completed: {
    niche: string;
    hasLogo: boolean;
    channelsCount: number;
  };
}

/**
 * Validates that an analytics payload does not contain PII.
 */
function sanitizePayload(payload: Record<string, any>): Record<string, any> {
  const FORBIDDEN_KEYS = ['email', 'password', 'name', 'phone', 'token', 'secret', 'address', 'card'];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(payload)) {
    const lowerKey = key.toLowerCase();
    if (FORBIDDEN_KEYS.some((fk) => lowerKey.includes(fk))) {
      continue; // Filter out any PII key
    }
    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Tracks a privacy-preserving funnel telemetry event.
 */
export function trackFunnelEvent<E extends FunnelEventName>(
  eventName: E,
  payload: FunnelEventPayloadMap[E]
): void {
  const sanitized = sanitizePayload(payload);
  const eventRecord = {
    event: eventName,
    properties: sanitized,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Funnel Analytics] 📊 ${eventName}:`, sanitized);
  }

  // If in browser and analytics script exists (PostHog, Segment, GA4)
  if (typeof window !== 'undefined') {
    try {
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push(eventRecord);
      }
    } catch {
      // Non-blocking
    }
  }
}
