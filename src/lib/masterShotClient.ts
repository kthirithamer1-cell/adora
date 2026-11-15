/**
 * Client partagé pour le moteur de génération /api/master-shot.
 * Utilisé par le Studio et par le Hero de la landing page (une seule implémentation).
 */

export type MasterShotAspect = '1:1' | '9:16' | '1.91:1';

export interface MasterShotPayload {
  cutoutBase64?: string;
  imageBase64: string;
  productName?: string;
  priceTND?: string | number;
  intentId?: string;
  aspect?: MasterShotAspect | (string & {});
  workspaceId: string;
  customHook?: string;
  copyLanguage?: string;
  reassuranceBadge?: boolean;
  stylePrompt?: string;
  userEditedPrompt?: string;
  model?: string;
  brandName?: string;
  brandLogoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface MasterShotResponse {
  success: boolean;
  generationId?: string;
  masterVisualUrl?: string;
  imageUrl?: string;
  url?: string;
  images?: string[];
  data?: { url?: string }[];
  formats?: { feed?: string; story?: string; banner?: string };
  creditsRemaining?: number;
  code?: string;
  error?: string;
  [key: string]: any;
}

export interface MasterShotResult {
  ok: boolean;
  status: number;
  insufficientCredits: boolean;
  /** Aperçu gratuit déjà consommé ou plafond atteint (visiteur sans compte) */
  previewLimitReached: boolean;
  imageUrl: string | null;
  data: MasterShotResponse;
}

/** Extrait l'URL du visuel principal quelle que soit la forme de la réponse. */
export function extractMasterShotImageUrl(data: MasterShotResponse | null | undefined): string | null {
  if (!data) return null;
  return data.masterVisualUrl || data.imageUrl || data.url || data.images?.[0] || data.data?.[0]?.url || null;
}

/** Requête commune aux endpoints de génération (normalise la réponse, jamais de throw HTTP). */
async function postGeneration(endpoint: string, body: Record<string, unknown>): Promise<MasterShotResult> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let data: MasterShotResponse;
  try {
    data = await res.json();
  } catch {
    data = { success: false, error: `Réponse invalide du serveur (HTTP ${res.status})` };
  }

  return {
    ok: res.ok && Boolean(data.success),
    status: res.status,
    insufficientCredits: res.status === 402 || data.code === 'INSUFFICIENT_CREDITS',
    previewLimitReached: data.code === 'FREE_PREVIEW_USED' || data.code === 'FREE_PREVIEW_CAP',
    imageUrl: extractMasterShotImageUrl(data),
    data,
  };
}

/** Génération authentifiée (débite les crédits du workspace). */
export function requestMasterShot(payload: MasterShotPayload): Promise<MasterShotResult> {
  return postGeneration('/api/master-shot', { model: 'gpt-image-2.5-flare', ...payload });
}

/** Aperçu gratuit sans compte : 1 visuel filigrané par visiteur. */
export function requestFreePreview(imageBase64: string): Promise<MasterShotResult> {
  return postGeneration('/api/master-shot/preview', { imageBase64 });
}
