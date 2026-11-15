import { randomUUID } from 'crypto';

/**
 * Suivi serveur des éditions IA par génération.
 * Règle commerciale : la 1ère édition de chaque génération est offerte (0 crédit),
 * chaque édition suivante coûte 1 crédit.
 */

export const FREE_EDITS_PER_GENERATION = 1;
export const EDIT_CREDIT_COST = 1;

interface GenerationEditRecord {
  workspaceId: string;
  editsUsed: number;
  createdAt: number;
}

const TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 jours

// Stocké sur globalThis pour survivre au Hot Module Reload de Next.js en dev
const globalStore = globalThis as unknown as {
  __markmosaiqEditAllowance?: Map<string, GenerationEditRecord>;
};
const store: Map<string, GenerationEditRecord> =
  globalStore.__markmosaiqEditAllowance ?? (globalStore.__markmosaiqEditAllowance = new Map());

function purgeExpired(): void {
  const now = Date.now();
  for (const [id, rec] of store) {
    if (now - rec.createdAt > TTL_MS) store.delete(id);
  }
}

/** Enregistre une nouvelle génération et retourne son identifiant. */
export function registerGeneration(workspaceId: string): string {
  purgeExpired();
  const id = `gen_${randomUUID()}`;
  store.set(id, { workspaceId, editsUsed: 0, createdAt: Date.now() });
  return id;
}

/** Indique si la prochaine édition de cette génération est gratuite. */
export function isNextEditFree(generationId: string | undefined, workspaceId: string): boolean {
  if (!generationId) return false;
  const rec = store.get(generationId);
  if (!rec || rec.workspaceId !== workspaceId) return false;
  return rec.editsUsed < FREE_EDITS_PER_GENERATION;
}

/** Incrémente le compteur d'éditions et retourne le total utilisé. */
export function recordEdit(generationId: string | undefined, workspaceId: string): number {
  if (!generationId) return 0;
  const rec = store.get(generationId);
  if (!rec || rec.workspaceId !== workspaceId) return 0;
  rec.editsUsed += 1;
  return rec.editsUsed;
}

