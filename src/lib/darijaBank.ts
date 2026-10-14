/**
 * BANQUE VALIDÉE DE DARIJA TUNISIEN COMMERCIAL & NOUVEAUX FORMATS (ADORA-48)
 * 
 * Zéro faute grammaticale ou phonétique :
 * - Paiement : « El khlass waqt el livri » / « Khallas ki touslek el commande »
 * - Livraison : « Livri fisaa fi 24h-48h l tounes el kol »
 * - Commande DM : « Abathna message al privé bech treservi mteeek »
 * - Qualité : « Qualité oumourha wadha 100% originale »
 */

export interface DarijaHookCategory {
  categoryName: string;
  hooks: string[];
  callToAction: string;
}

export const DARIJA_COMMERCIAL_BANK: Record<string, DarijaHookCategory> = {
  paiement: {
    categoryName: 'Paiement à la livraison & Sécurité',
    hooks: [
      'El khlass waqt el livri l beb eddar ! Chouf el produit b 3inik 9bal ma tkhallas.',
      'Khallas ki touslek el commande fi ydik, qualité madhmouna 100%.',
      'Paiement sécurisé b carte bancaire flouci walla na9dan and el livrari.',
    ],
    callToAction: 'Commander & Khlass waqt el livri ➔',
  },
  livraison: {
    categoryName: 'Livraison Rapide 24 Gouvernorats',
    hooks: [
      'Livri fisaa fi 24h-48h l tounes el kol, men Bizerte l Tataouine !',
      'El commande touslek l beb eddar fi a9al men 48h.',
      'Livraison express disponible fi tounes el kobra w el wilayet el kol.',
    ],
    callToAction: 'Demander ma livraison rapide ➔',
  },
  commande_dm: {
    categoryName: 'Commandes privées WhatsApp & Instagram DM',
    hooks: [
      'Abathna message al privé tawwa bech treservi el commande mteek !',
      'Khaffef rou7ek w abathna al WhatsApp, el quantite mahich kbira.',
      'Cliquez al bouton w kellemna direct bech n3awnouk fi el choix.',
    ],
    callToAction: 'Envoyer un message WhatsApp ➔',
  },
  qualite_authenticite: {
    categoryName: 'Garantie d\'Authenticité & Qualité Pure',
    hooks: [
      'Qualité oumourha wadha 100% originale, bi3a w charya b thaboutha.',
      'Sel3a originale importée, zéro risque w satisfait walla marjou3.',
      'Produit certifié el top fi tounes, chouf les avis mtaa nos clients.',
    ],
    callToAction: 'Découvrir la qualité certifiée ➔',
  },
  urgence_stock: {
    categoryName: 'Offres Flash & Rupture Imminente',
    hooks: [
      'Akher ka3bet fel stock ! El offre toufa fi 24h.',
      'Promo flash ma tet3awedch, profitie men el soum el tayara tawwa.',
      'Stock limité barcha, awwel we7ed yeb3ath houwa li yerba7 !',
    ],
    callToAction: 'Profiter de l\'offre flash ➔',
  },
};

/**
 * STRUCTURES DES NOUVEAUX FORMATS :
 * 1. Carrousel Instagram / Facebook 5 slides
 * 2. Couverture de Reel Instagram 9:16
 * 3. Catalogue WhatsApp Business 1:1
 */

export interface CarouselSlide {
  slideNumber: number;
  slideType: 'hook' | 'product_discovery' | 'benefits_zoom' | 'social_proof' | 'offer_cta';
  headline: string;
  subheadline: string;
  badgeText: string;
  ctaText?: string;
}

export function generateFiveSlideCarousel(
  productName: string,
  priceTND: number,
  shopName: string
): CarouselSlide[] {
  return [
    {
      slideNumber: 1,
      slideType: 'hook',
      headline: `Fadit mel qualité el na9sa ?`,
      subheadline: `Découvrez la référence N°1 adoptée par les Tunisiens exigeants.`,
      badgeText: '⚠️ Problème ➔ Solution',
    },
    {
      slideNumber: 2,
      slideType: 'product_discovery',
      headline: productName,
      subheadline: `Conçu avec passion et précision pour sublimer votre quotidien.`,
      badgeText: '✨ Nouveau chez ' + shopName,
    },
    {
      slideNumber: 3,
      slideType: 'benefits_zoom',
      headline: `0% Compromis sur la Qualité`,
      subheadline: `Composants nobles, durabilité extrême et finition irréprochable.`,
      badgeText: '💎 100% Authentique',
    },
    {
      slideNumber: 4,
      slideType: 'social_proof',
      headline: `Plébiscité par +1 000 Clients`,
      subheadline: `Note moyenne de 4.9/5 étoiles sur toute la Tunisie.`,
      badgeText: '⭐ 5 Étoiles Certifié',
    },
    {
      slideNumber: 5,
      slideType: 'offer_cta',
      headline: `Offre Spéciale : Seulement ${priceTND} DT`,
      subheadline: `Livraison express 24-48h sur 24 gouvernorats • El khlass waqt el livri !`,
      badgeText: '🔥 Stock Limité',
      ctaText: 'Commander sur WhatsApp ➔',
    },
  ];
}
