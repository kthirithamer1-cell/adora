/**
 * Single source of truth for MarkMosaiq subscription packs, pricing, and Whop plans.
 * Minor units:
 * - USD: millimes (1 DT = 1000 millimes)
 * - USD: cents ($1 = 100 cents)
 */

export const PACK_IDS = ['free', 'flash', 'pro', 'agency_299'] as const;
export type PackId = (typeof PACK_IDS)[number];
export type Cycle = 'monthly' | 'annual';
export type Currency = 'USD' | 'EUR';

export interface PackDef {
  id: PackId;
  name: string; // Free, Starter, Pro, Advanced
  creditsPerMonth: number;
  creditsArePlaceholder: boolean; // Flagged true when credit amount is a placeholder
  priceMinor: Record<Cycle, Record<Currency, number>>;
  whopPlanEnvVar: string;
  defaultWhopPlanId: string;
  features: string[];
}

export const PACKS: Record<PackId, PackDef> = {
  free: {
    id: 'free',
    name: 'Free',
    creditsPerMonth: 5,
    creditsArePlaceholder: false,
    priceMinor: {
      monthly: {
        USD: 0,
        EUR: 0,
      },
      annual: {
        USD: 0,
        EUR: 0,
      },
    },
    whopPlanEnvVar: '',
    defaultWhopPlanId: '',
    features: [
      '5 Crédits Studio 4K d\'essai offerts',
      'Multi-formats 1:1 Feed & 9:16 Stories',
      'Détourage IA instantané sans filigrane',
      'Exportation Haute Définition PNG & JPG',
      'Sans carte bancaire requise',
    ],
  },
  flash: {
    id: 'flash',
    name: 'Starter',
    creditsPerMonth: 20,
    creditsArePlaceholder: false,
    priceMinor: {
      monthly: {
        USD: 1900,  // $19
        EUR: 1800,  // €18
      },
      annual: {
        USD: 18200,  // $182 (-20% rounded, $15/mo)
        EUR: 16800,  // €168 (-20% rounded, €14/mo)
      },
    },
    whopPlanEnvVar: 'WHOP_PLAN_FLASH',
    defaultWhopPlanId: 'plan_C5UC5OslFfbUI',
    features: [
      '20 Crédits Studio 4K (Droits Commerciaux)',
      'Multi-formats 1:1 Feed & 9:16 Stories',
      'Éclairage Studio & Ombres Portées Physiques',
      'Exportation Haute Définition PNG & JPG',
      'Support Standard par E-mail',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    creditsPerMonth: 50,
    creditsArePlaceholder: false,
    priceMinor: {
      monthly: {
        USD: 4900,   // $49
        EUR: 4500,   // €45
      },
      annual: {
        USD: 47000,   // $470 (-20% rounded, $39/mo)
        EUR: 43200,   // €432 (-20% rounded, €36/mo)
      },
    },
    whopPlanEnvVar: 'WHOP_PLAN_PRO',
    defaultWhopPlanId: 'plan_7I2SQLGuwRwkv',
    features: [
      '50 Crédits Studio 4K / mois',
      'Pack Publicitaire Complet (Feed + Stories + Bannières)',
      'Contrôle Qualité IA Automatique (Vision Critic)',
      'Téléchargement ZIP Structuré en 1 Clic',
      'Support Créateur Prioritaire 24/7',
    ],
  },
  agency_299: {
    id: 'agency_299',
    name: 'Advanced',
    creditsPerMonth: 120,
    creditsArePlaceholder: false,
    priceMinor: {
      monthly: {
        USD: 9900,   // $99 (Confirmed)
        EUR: 8900,   // €89
      },
      annual: {
        USD: 95000,  // $950 (-20% rounded, $79/mo)
        EUR: 86400,  // €864 (-20% rounded, €72/mo)
      },
    },
    whopPlanEnvVar: 'WHOP_PLAN_AGENCY',
    defaultWhopPlanId: 'plan_7wfEWKIfYKb8P',
    features: [
      '120 Crédits Studio 4K / mois',
      '100% Marque Blanche (Zéro logo MarkMosaiq)',
      'Gestion Multi-Marques & Multi-Boutiques',
      'Rendu GPU Prioritaire Haute Vitesse',
      'Directeur de Compte Dédié',
    ],
  },
};

export function getPriceMinor(pack: PackId, cycle: Cycle, currency: Currency = 'USD'): number {
  const packDef = PACKS[pack];
  if (!packDef) {
    throw new Error(`Unknown pack ID: ${pack}`);
  }
  return packDef.priceMinor[cycle]?.[currency] ?? packDef.priceMinor[cycle]?.USD ?? 4900;
}

export function periodMonths(cycle: Cycle): 1 | 12 {
  return cycle === 'annual' ? 12 : 1;
}

export function formatPrice(minor: number, currency: Currency = 'USD'): string {
  const amount = minor / 100;
  const formatted = Number.isInteger(amount) ? `${amount}` : `${amount.toFixed(2)}`;
  return currency === 'EUR' ? `€${formatted}` : `$${formatted}`;
}
