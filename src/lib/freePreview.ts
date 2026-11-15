import { randomUUID } from 'crypto';

/**
 * Garde-fou des aperçus gratuits sans compte (Hero de la landing).
 * - 1 aperçu par visiteur (cookie httpOnly + adresse IP)
 * - Plafond global quotidien pour borner le coût OpenAI
 */

export const FREE_PREVIEW_COOKIE = 'mm_free_preview';
const DAILY_GLOBAL_CAP = Number(process.env.FREE_PREVIEW_DAILY_CAP || 200);
const IP_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 jours

interface PreviewStore {
  ips: Map<string, number>;
  day: string;
  countToday: number;
}

const g = globalThis as unknown as { __markmosaiqFreePreview?: PreviewStore };
const store: PreviewStore =
  g.__markmosaiqFreePreview ??
  (g.__markmosaiqFreePreview = { ips: new Map(), day: '', countToday: 0 });

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getClientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip') || 'unknown';
}

export interface PreviewEligibility {
  allowed: boolean;
  reason?: 'ALREADY_USED' | 'DAILY_CAP';
}

export function checkFreePreview(ip: string, hasCookie: boolean): PreviewEligibility {
  const now = Date.now();
  if (store.day !== today()) {
    store.day = today();
    store.countToday = 0;
  }
  for (const [key, ts] of store.ips) {
    if (now - ts > IP_TTL_MS) store.ips.delete(key);
  }
  if (hasCookie || (ip !== 'unknown' && store.ips.has(ip))) {
    return { allowed: false, reason: 'ALREADY_USED' };
  }
  if (store.countToday >= DAILY_GLOBAL_CAP) {
    return { allowed: false, reason: 'DAILY_CAP' };
  }
  return { allowed: true };
}

/** Réserve l'aperçu avant l'appel IA (évite les requêtes parallèles abusives). */
export function reserveFreePreview(ip: string): void {
  if (ip !== 'unknown') store.ips.set(ip, Date.now());
  store.countToday += 1;
}

/** Libère la réservation si la génération a échoué (le visiteur peut réessayer). */
export function releaseFreePreview(ip: string): void {
  if (ip !== 'unknown') store.ips.delete(ip);
  store.countToday = Math.max(0, store.countToday - 1);
}

export function newPreviewToken(): string {
  return randomUUID();
}
