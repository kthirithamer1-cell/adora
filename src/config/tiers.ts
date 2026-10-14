export interface Tier {
  name: 'Starter' | 'Pro' | 'Advanced';
  description: string;
  features: string[];
  priceId: { month: string; year: string };
  priceUSD: { month: string; year: string };
  badge?: string;
  highlight?: boolean;
}

export const TIERS: Tier[] = [
  {
    name: 'Starter',
    description: 'Pour lancer rapidement votre premier produit avec des visuels HD calibrés',
    features: [
      '10 Crédits de génération par mois',
      'Formats Feed 1:1 & Stories 9:16',
      'Accroches commerciales prêtes à poster',
      'Téléchargement direct haute résolution',
      'Support standard par e-mail',
    ],
    priceId: {
      month: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTH || 'pri_01m4ws2hrtnapcbvsk67dh63y1',
      year: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_YEAR || 'pri_01m4ws2hrtnapcbvsk67dh63y1',
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
      '30 Crédits de génération par mois',
      'Tous les formats (Feed, Stories, Bannières Web)',
      'Décors lifestyle & studio immersifs',
      'Exportation en archive ZIP structurée',
      'Contrôle qualité automatique IA (Vision Critic)',
      'Support prioritaire dédié WhatsApp 7j/7',
    ],
    priceId: {
      month: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTH || 'pri_01m4ws2hrtnapcbvsk67dh63y1',
      year: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_YEAR || 'pri_01m4ws2hrtnapcbvsk67dh63y1',
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
      '100 Crédits de génération par mois',
      'Mode Marque Blanche totale (Zéro watermark)',
      'Gestion multi-comptes et multi-boutiques',
      'Génération prioritaire ultra-rapide',
      'Facturation B2B conforme automatique',
      'Directeur de compte dédié 24/7',
    ],
    priceId: {
      month: process.env.NEXT_PUBLIC_PADDLE_PRICE_ADVANCED_MONTH || 'pri_01m4ws2hrtnapcbvsk67dh63y1',
      year: process.env.NEXT_PUBLIC_PADDLE_PRICE_ADVANCED_YEAR || 'pri_01m4ws2hrtnapcbvsk67dh63y1',
    },
    priceUSD: {
      month: '$100',
      year: '$990',
    },
    badge: 'PUISSANCE MAX',
  },
];
