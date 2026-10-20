export interface Tier {
  name: 'Starter' | 'Pro' | 'Advanced';
  description: string;
  features: string[];
  planId: { month: string; year: string };
  priceUSD: { month: string; year: string };
  badge?: string;
  highlight?: boolean;
}

export const TIERS: Tier[] = [
  {
    name: 'Starter',
    description: 'Pour lancer rapidement votre premier produit avec des visuels HD calibrés',
    features: [
      '20 Crédits de génération par mois',
      'Formats Feed 1:1 & Stories 9:16',
      'Accroches commerciales prêtes à poster',
      'Téléchargement direct haute résolution',
      'Support standard par e-mail',
    ],
    planId: {
      month: process.env.WHOP_STARTER_PLAN || process.env.NEXT_PUBLIC_WHOP_PLAN_STARTER_MONTH || 'plan_now5GQaFOTRWk',
      year: process.env.NEXT_PUBLIC_WHOP_PLAN_STARTER_YEAR || 'plan_now5GQaFOTRWk',
    },
    priceUSD: {
      month: '$19',
      year: '$190',
    },
    badge: 'DÉMARRAGE',
  },
  {
    name: 'Pro',
    description: 'Le forfait complet pour dominer Instagram, Facebook et vos campagnes sponsorisées',
    features: [
      '50 Crédits de génération par mois',
      'Tous les formats (Feed, Stories, Bannières Web)',
      'Décors lifestyle & studio immersifs',
      'Exportation en archive ZIP structurée',
      'Contrôle qualité automatique IA (Vision Critic)',
      'Support prioritaire dédié WhatsApp 7j/7',
    ],
    planId: {
      month: process.env.WHOP_PRO_PLAN || process.env.NEXT_PUBLIC_WHOP_PLAN_PRO_MONTH || 'plan_PX0I2P5FGQMFi',
      year: process.env.NEXT_PUBLIC_WHOP_PLAN_PRO_YEAR || 'plan_PX0I2P5FGQMFi',
    },
    priceUSD: {
      month: '$49',
      year: '$490',
    },
    badge: 'LE PLUS POPULAIRE',
    highlight: true,
  },
  {
    name: 'Advanced',
    description: 'Pour les marques en forte croissance, e-commerçants multi-boutiques et agences',
    features: [
      '120 Crédits de génération par mois',
      'Mode Marque Blanche totale (Zéro watermark)',
      'Gestion multi-comptes et multi-boutiques',
      'Génération prioritaire ultra-rapide',
      'Facturation B2B conforme automatique',
      'Directeur de compte dédié 24/7',
    ],
    planId: {
      month: process.env.WHOP_AGENCY_PLAN || process.env.NEXT_PUBLIC_WHOP_PLAN_ADVANCED_MONTH || 'plan_7wfEWKIfYKb8P',
      year: process.env.NEXT_PUBLIC_WHOP_PLAN_ADVANCED_YEAR || 'plan_7wfEWKIfYKb8P',
    },
    priceUSD: {
      month: '$99',
      year: '$950',
    },
    badge: 'PUISSANCE MAX',
  },
];
