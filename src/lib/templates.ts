import { PackConfig, VisualTemplate, StagingScene, SceneLighting, PedestalAnchor, SafeZones } from './types';
export type { StagingScene, PackConfig, VisualTemplate, SceneLighting, PedestalAnchor, SafeZones };

export const PACKS: Record<string, PackConfig> = {
  flash: {
    id: 'flash',
    name: 'Pack Flash Découverte',
    priceTND: 29,
    visualsCount: 10,
    breakdown: {
      studio: 3,
      lifestyle: 3,
      ads: 2,
      story: 2,
    },
    features: [
      '10 Visuels ultra-HD par produit',
      'Format Feed (1:1) & Stories (9:16)',
      'Badges locaux (Livraison 24 gouvernorats, Paiement à la livraison)',
      '1 Légende Instagram prête à copier',
      'Export instantané en .ZIP',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pack Lancement Pro (Recommandé)',
    priceTND: 59,
    visualsCount: 20,
    breakdown: {
      studio: 5,
      lifestyle: 5,
      ads: 5,
      story: 5,
    },
    features: [
      '20 Visuels complets multi-formats',
      '5 Visuels Studio 4K sur podium',
      '5 Visuels Gym & Lifestyle immersifs',
      '5 Visuels Ads à fort taux de clic',
      '5 Stories verticales 9:16 animables',
      '3 Légendes Instagram (Français & Darija)',
      'Support prioritaire & retouches',
    ],
  },
  omnipresence: {
    id: 'omnipresence',
    name: 'Abonnement Omniprésence',
    priceTND: 99,
    visualsCount: 100,
    breakdown: {
      studio: 25,
      lifestyle: 25,
      ads: 25,
      story: 25,
    },
    features: [
      '100 Visuels par mois (4 à 5 produits)',
      'Mises en avant promotions de fin de mois',
      'Génération prioritaire ultra-rapide',
      'Badges sur-mesure avec le logo de votre shop',
      'Export mensuel complet en 1 clic',
    ],
  },
};

export const TEMPLATES: VisualTemplate[] = [
  // STUDIO PODIUM
  {
    id: 'studio-carbon',
    name: 'Podium Carbone & Néon Rouge',
    category: 'studio',
    aspectRatio: '1:1',
    prompt: 'Commercial product staging set. Empty dark titanium and carbon fiber pedestal, dark modern athletic club backdrop, soft cyan and red rim lights, clean vacant surface.',
    thumbnail: '/images/whey_studio_podium.jpg',
    description: 'Rendu studio haut de gamme avec podium et éclairage néon athlétique.',
    badgeEligible: true,
    lighting: { keyLightDirection: 'top-left', keyLightAngleDeg: 45, ambientLightIntensity: 0.8, colorTemperatureK: 5600 },
    pedestalAnchor: { centerX: 0.5, surfaceY: 0.68, maxProductWidthRatio: 0.44, isGlossy: false },
    safeZones: { topPercent: 4, bottomPercent: 4 },
  },
  {
    id: 'studio-minimal-gold',
    name: 'Studio Minimal Or & Marbre',
    category: 'studio',
    aspectRatio: '1:1',
    prompt: 'Commercial product staging set. Empty black Nero Marquina marble slab with subtle brushed gold trim, soft diffuse studio ring light, seamless dark backdrop, clean vacant surface.',
    thumbnail: '/images/gnc_pro_whey_tub_1791150838901.jpg',
    description: 'Élégance sobre pour les isolats premium et les gammes Gold.',
    badgeEligible: true,
    lighting: { keyLightDirection: 'overhead', keyLightAngleDeg: 90, ambientLightIntensity: 0.75, colorTemperatureK: 5200 },
    pedestalAnchor: { centerX: 0.5, surfaceY: 0.70, maxProductWidthRatio: 0.42, isGlossy: true },
    safeZones: { topPercent: 4, bottomPercent: 4 },
  },
  // LIFESTYLE GYM
  {
    id: 'gym-bench-dumbbells',
    name: 'Banc de Musculation & Fonte',
    category: 'lifestyle',
    aspectRatio: '1:1',
    prompt: 'Commercial lifestyle staging set. Empty clean gym workout bench surface in foreground, softly blurred background with heavy iron dumbbells and power rack, moody gym atmosphere, directional warm spotlight.',
    thumbnail: '/images/hero_lifestyle.jpg',
    description: 'Ambiance salle de musculation authentique avec haltères et fonte.',
    badgeEligible: true,
    lighting: { keyLightDirection: 'top-left', keyLightAngleDeg: 35, ambientLightIntensity: 0.65, colorTemperatureK: 4500 },
    pedestalAnchor: { centerX: 0.5, surfaceY: 0.72, maxProductWidthRatio: 0.40, isGlossy: false },
    safeZones: { topPercent: 4, bottomPercent: 4 },
  },
  // STORIES 9:16
  {
    id: 'story-flash-promo',
    name: 'Story Instagram Promo Flash',
    category: 'story',
    aspectRatio: '9:16',
    prompt: 'Vertical 9:16 mobile staging set. Clean elevated pedestal anchored in the lower middle third, dramatic top spotlight, clean dark athletic gym atmosphere, generous clear headroom in top 14% and bottom 20%.',
    thumbnail: '/images/creatine_story.jpg',
    description: 'Format vertical plein écran avec safe zones pour stickers Instagram.',
    badgeEligible: true,
    lighting: { keyLightDirection: 'overhead', keyLightAngleDeg: 80, ambientLightIntensity: 0.7, colorTemperatureK: 5000 },
    pedestalAnchor: { centerX: 0.5, surfaceY: 0.65, maxProductWidthRatio: 0.52, isGlossy: false },
    safeZones: { topPercent: 14, bottomPercent: 20 },
  },
];

export const CURATED_SCENES: StagingScene[] = [
  {
    id: 'scene-nutrition-titanium',
    name: 'Podium Titane Sombre',
    niche: 'nutrition',
    category: 'studio',
    aspectRatio: '1:1',
    imageUrl: '/images/whey_studio_podium.jpg',
    lighting: { keyLightDirection: 'top-left', keyLightAngleDeg: 45, ambientLightIntensity: 0.8, colorTemperatureK: 5600 },
    pedestalAnchor: { centerX: 0.5, surfaceY: 0.68, maxProductWidthRatio: 0.44, isGlossy: false },
    safeZones: { topPercent: 4, bottomPercent: 4 },
    description: 'Idéal pour Whey, Pré-workout et compléments massifs.',
    tags: ['Fitness', 'Sombre', 'Studio Pro'],
  },
  {
    id: 'scene-nutrition-lifestyle',
    name: 'Banc Salle de Musculation',
    niche: 'nutrition',
    category: 'lifestyle',
    aspectRatio: '1:1',
    imageUrl: '/images/hero_lifestyle.jpg',
    lighting: { keyLightDirection: 'top-left', keyLightAngleDeg: 35, ambientLightIntensity: 0.65, colorTemperatureK: 4500 },
    pedestalAnchor: { centerX: 0.5, surfaceY: 0.72, maxProductWidthRatio: 0.40, isGlossy: false },
    safeZones: { topPercent: 4, bottomPercent: 4 },
    description: 'Ambiance fonte et entraînement réaliste.',
    tags: ['Musculation', 'Lifestyle', 'Fonte'],
  },
  {
    id: 'scene-story-neon',
    name: 'Story 9:16 Néon Flash',
    niche: 'nutrition',
    category: 'story',
    aspectRatio: '9:16',
    imageUrl: '/images/creatine_story.jpg',
    lighting: { keyLightDirection: 'overhead', keyLightAngleDeg: 80, ambientLightIntensity: 0.7, colorTemperatureK: 5000 },
    pedestalAnchor: { centerX: 0.5, surfaceY: 0.65, maxProductWidthRatio: 0.52, isGlossy: false },
    safeZones: { topPercent: 14, bottomPercent: 20 },
    description: 'Optimisé mobile avec respect des safe zones Instagram.',
    tags: ['Story', 'Reels', 'Promo Flash'],
  },
  {
    id: 'scene-gold-marble',
    name: 'Marbre Noir & Liseré Or',
    niche: 'general',
    category: 'studio',
    aspectRatio: '1:1',
    imageUrl: '/images/gnc_pro_whey_tub_1791150838901.jpg',
    lighting: { keyLightDirection: 'overhead', keyLightAngleDeg: 90, ambientLightIntensity: 0.75, colorTemperatureK: 5200 },
    pedestalAnchor: { centerX: 0.5, surfaceY: 0.70, maxProductWidthRatio: 0.42, isGlossy: true },
    safeZones: { topPercent: 4, bottomPercent: 4 },
    description: 'Luxe sobre avec réflexion miroir douce sur la surface.',
    tags: ['Luxe', 'Marbre', 'Or'],
  },
];

export const LOCAL_BADGES = [
  {
    id: 'livraison',
    label: '🚚 Livraison 24 Gouvernorats',
    subtitle: 'Toute la Tunisie en 24/48h',
    svgUrl: '/badges/livraison_24_gouv.svg',
    color: '#E11D48',
  },
  {
    id: 'cod',
    label: '💵 Paiement à la Livraison',
    subtitle: 'El Khlass waqt el Livri',
    svgUrl: '/badges/paiement_livraison.svg',
    color: '#059669',
  },
  {
    id: 'authentique',
    label: '🛡️ 100% Authentique & Certifié',
    subtitle: 'Import Officiel & Vérifié',
    svgUrl: '/badges/authentique_100.svg',
    color: '#D97706',
  },
  {
    id: 'promo',
    label: '🔥 Promo Flash / Stock Limité',
    subtitle: 'Quantité limitée en boutique',
    svgUrl: '/badges/stock_limite.svg',
    color: '#EA580C',
  },
  {
    id: 'shaker',
    label: '🎁 Cadeau avec Votre Pack',
    subtitle: 'Shaker ou accessoire offert',
    svgUrl: '/badges/cadeau_offert.svg',
    color: '#4F46E5',
  },
];

/**
 * Calcule les paramètres physiques de l'ombre relative selon la taille du produit et l'éclairage de la scène
 */
export function calculateRelativeShadow(
  productWidth: number,
  productHeight: number,
  lighting?: SceneLighting
): {
  contactBlur: number;
  contactHeight: number;
  castOffsetX: number;
  castOffsetY: number;
  castBlur: number;
  castOpacity: number;
} {
  const angle = lighting?.keyLightAngleDeg ?? 45;
  const isLeft = lighting?.keyLightDirection === 'top-left';
  const isOverhead = lighting?.keyLightDirection === 'overhead';

  // Flou et hauteur relatifs à la taille du produit (indépendant de la résolution brute)
  const contactBlur = Math.max(productWidth * 0.035, 4);
  const contactHeight = Math.max(productHeight * 0.04, 3);

  // Direction de projection opposée à la source lumineuse
  const castOffsetX = isOverhead ? 0 : (isLeft ? productWidth * 0.08 : -productWidth * 0.08);
  const castOffsetY = Math.max(productHeight * 0.06, 6);
  const castBlur = Math.max(productWidth * 0.07, 8);
  const castOpacity = lighting ? Math.min(lighting.ambientLightIntensity * 0.6, 0.6) : 0.45;

  return {
    contactBlur,
    contactHeight,
    castOffsetX,
    castOffsetY,
    castBlur,
    castOpacity,
  };
}

/**
 * Calcule le rectangle de destination normalisé pour poser le produit sur le piédestal
 */
export function calculateProductPlacementRect(
  canvasWidth: number,
  canvasHeight: number,
  productNativeWidth: number,
  productNativeHeight: number,
  anchor?: PedestalAnchor
): { x: number; y: number; width: number; height: number } {
  const centerX = (anchor?.centerX ?? 0.5) * canvasWidth;
  const surfaceY = (anchor?.surfaceY ?? 0.68) * canvasHeight;
  const maxWidthRatio = anchor?.maxProductWidthRatio ?? 0.45;

  // Largeur maximale autorisée sur le piédestal
  const maxW = canvasWidth * maxWidthRatio;
  const maxH = canvasHeight * 0.55;

  // Calcul du ratio d'aspect produit
  const productRatio = productNativeWidth / (productNativeHeight || 1);
  let renderW = maxW;
  let renderH = renderW / productRatio;

  if (renderH > maxH) {
    renderH = maxH;
    renderW = renderH * productRatio;
  }

  // Ancrage par la base (le bas du produit repose exactement sur surfaceY)
  const x = centerX - renderW / 2;
  const y = surfaceY - renderH;

  return { x, y, width: renderW, height: renderH };
}

