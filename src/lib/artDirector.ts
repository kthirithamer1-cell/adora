/**
 * MOTEUR DU DIRECTEUR ARTISTIQUE VIRTUEL D'ADORA SAAS (ADORA-DIRECTOR-V2)
 * 
 * Implémente le pipeline de génération dirigé en 6 étapes et le système de décision à 3 niveaux :
 * - Niveau 1 (Stratégie) : Choix commercial du marchand
 * - Niveau 2 (Direction Artistique) : 3 Intentions créatives filtrées par le Brand Kit
 * - Niveau 3 (Exécution Technique) : Composition déterministe, focal, lighting & safe-zones
 * 
 * Pilier N°0 : Le Brand Kit existant (palette, logo, tonalité, polices) verrouille la charte.
 */

import { BrandKit, compileBrandPrompt } from './brandkit';
import { VETTED_DARIJA_BANK } from './strategyEngine';
import { DARIJA_COMMERCIAL_BANK } from './darijaBank';

export interface ProductDNA {
  productName: string;
  brandName: string;
  category: 'cosmetics' | 'fashion' | 'nutrition' | 'jewelry' | 'tech' | 'food' | 'home' | 'general';
  packagingMaterials: string[];
  dominantTones: string[];
  perceivedPriceLevel: 'luxury' | 'premium' | 'accessible';
  lightingAffinity: 'warm_golden' | 'cool_tech' | 'high_key_cosmetic' | 'dramatic_rim';
  surfaceRequirements: string;
  brandKitAlignmentScore: number; // 0 à 100
  brandKitNotes: string;
}

export type CreativeIntentType = 'conversion_flash' | 'prestige_elevation' | 'lifestyle_authentic';

export interface CreativeIntent {
  id: CreativeIntentType;
  titleFr: string;
  subtitle: string;
  targetEmotion: string;
  audienceAngle: string;
  hookFr: string;
  hookDarija: string;
  badgeText: string;
  ctaText: string;
  moodDescription: string;
  surfaceMaterial: string;
  surfaceDescriptionFr?: string;
  backgroundAtmosphere: string;
  isRecommended: boolean;
}

export interface MasterSceneSpec {
  version: 'scene/v2';
  intentId: CreativeIntentType;
  aspectRatio: '1:1' | '9:16' | '1.91:1';
  pedestalAnchor: {
    x: number;
    y: number;
    widthRatio: number;
  };
  safeZones: {
    topPercent: number; // Ex: 14% en Story pour dégager le header Instagram
    bottomPercent: number; // Ex: 20% en Story pour le champ réponse
  };
  lighting: {
    keyLightDirection: 'top-left' | 'top-right' | 'overhead';
    angleDeg: number;
    temperatureK: number;
    accentColorHex: string;
  };
  surface: {
    material: string;
    finish: 'matte' | 'glossy' | 'satin';
    contactBlurRatio: number; // 0.035
    contactHeightRatio: number; // 0.04
  };
  background: string;
  compiledPositivePrompt: string;
  brandOverlay: {
    logoUrl: string;
    logoPosition: 'top-left' | 'top-center' | 'top-right';
    logoTopPx: number;
    headlineFont: string;
    primaryColor: string;
    accentColor: string;
    sloganDarija: string;
    deliveryMention: string;
  };
}

/**
 * 01 — Product Understanding : Analyse vision du produit physique et alignement avec le Brand Kit
 */
export async function analyzeProductDNA(params: {
  imageBase64?: string;
  productName?: string;
  brandKit: BrandKit;
  userNotes?: string;
}): Promise<ProductDNA> {
  const { imageBase64, productName, brandKit, userNotes } = params;
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY;

  const fallbackDNA: ProductDNA = {
    productName: productName || 'Produit E-commerce',
    brandName: brandKit.shopName,
    category: (brandKit.industry as any) || 'cosmetics',
    packagingMaterials: ['flacon en verre', 'bouchon premium', 'étiquette satinée'],
    dominantTones: [brandKit.palette?.primary || brandKit.primaryColor, '#F59E0B', '#07090E'],
    perceivedPriceLevel: brandKit.positioning === 'luxury' ? 'luxury' : 'premium',
    lightingAffinity: brandKit.positioning === 'luxury' ? 'warm_golden' : 'high_key_cosmetic',
    surfaceRequirements: 'smooth ivory travertine stone plinth with polished bevel',
    brandKitAlignmentScore: 94,
    brandKitNotes: `Alignement parfait avec le positionnement ${brandKit.positioning || 'premium'} de ${brandKit.shopName}.`,
  };

  if (!apiKey || apiKey.startsWith('sk-placeholder') || !imageBase64) {
    return fallbackDNA;
  }

  try {
    const systemPrompt = `Tu es le Directeur Artistique en Chef d'Adora SaaS.
Analyse la photo produit soumise et confronte-la avec l'identité de marque du marchand (Brand Kit).
Évalue les matériaux réels du packaging (verre, plastique mat, métal, cuir, textile) et détermine les besoins de mise en scène.

Identité de la marque marchande (${brandKit.shopName}) :
- Secteur : ${brandKit.industry || 'Général'}
- Positionnement : ${brandKit.positioning || 'Premium'}
- Palette de couleurs : ${brandKit.primaryColor} et ${brandKit.secondaryColor}
- Ambiance visuelle : ${brandKit.visualStyle?.mood || 'Studio épuré et moderne'}

Réponds STRICTEMENT avec un objet JSON suivant ce schéma :
{
  "productName": "Nom clair du produit",
  "brandName": "Nom de la marque",
  "category": "cosmetics" | "fashion" | "nutrition" | "jewelry" | "tech" | "food" | "home" | "general",
  "packagingMaterials": ["matériau 1", "matériau 2"],
  "dominantTones": ["#CodeHex1", "#CodeHex2"],
  "perceivedPriceLevel": "luxury" | "premium" | "accessible",
  "lightingAffinity": "warm_golden" | "cool_tech" | "high_key_cosmetic" | "dramatic_rim",
  "surfaceRequirements": "description en anglais de la surface d'accueil idéale (marbre, travertin, bois d'olivier, titane)",
  "brandKitAlignmentScore": number (0 à 100),
  "brandKitNotes": "Synthèse de conformité avec la charte du Brand Kit en 1 phrase"
}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Produit: ${productName || 'À identifier'}. Notes marchand: ${userNotes || 'Aucune note'}.` },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'auto',
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 600,
        temperature: 0.2, // Température basse pour une analyse rigoureuse
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      return {
        ...fallbackDNA,
        ...parsed,
        brandName: brandKit.shopName || parsed.brandName,
      };
    }
  } catch (err) {
    console.warn('Erreur analyse ProductDNA:', err);
  }

  return fallbackDNA;
}

/**
 * 02 — Creative Direction : Génère 3 concepts d'intention éditoriaux filtrés par le Brand Kit
 */
export async function generateCreativeIntents(params: {
  productDNA: ProductDNA;
  brandKit: BrandKit;
  priceTND?: number;
}): Promise<CreativeIntent[]> {
  const { productDNA, brandKit, priceTND } = params;
  const priceDisplay = priceTND ? `${priceTND} DT` : 'Offre Spéciale';
  const primaryCol = brandKit.palette?.primary || brandKit.primaryColor || '#00E5FF';

  // Banque de Darija validée
  const vettedUrgency = VETTED_DARIJA_BANK.offer_urgency.hooks[0];
  const vettedPrestige = VETTED_DARIJA_BANK.lifestyle_aspiration.hooks[0];
  const vettedAuthentic = DARIJA_COMMERCIAL_BANK.qualite_authenticite.hooks[0];

  const intents: CreativeIntent[] = [
    {
      id: 'prestige_elevation',
      titleFr: 'Écrin Minéral & Or Solaire',
      subtitle: 'Élégance Pure, Désirabilité & Statut Haute-Couture',
      targetEmotion: 'Exclusivité, fierté et sentiment de posséder une pièce d\'exception',
      audienceAngle: 'Clientèle exigeante (Grand Tunis, Sousse, Sfax) en quête de raffinement',
      hookFr: `${productDNA.productName} : Le Raffinement Sans Compromis`,
      hookDarija: vettedPrestige,
      badgeText: '✨ Édition Prestige',
      ctaText: 'Commander la Collection ➔',
      moodDescription: 'Luxury editorial staging, polished Carrara marble and warm morning sunlight',
      surfaceMaterial: 'polished Carrara white marble pedestal with soft beveled perimeter',
      surfaceDescriptionFr: 'Socle : Marbre Blanc de Carrare • Ambiance Luxe & Solaire',
      backgroundAtmosphere: 'soft sun-drenched architectural interior with subtle pastel bokeh',
      isRecommended: brandKit.positioning === 'luxury' || brandKit.positioning === 'premium',
    },
    {
      id: 'conversion_flash',
      titleFr: 'Impact Studio & Offre Flash',
      subtitle: 'Contraste Publicitaire Puissant & Passage à l\'Action Immédiat',
      targetEmotion: 'Urgence d\'achat, opportunité rare et peur de rater le stock',
      audienceAngle: 'Acheteurs spontanés sur Instagram et TikTok cherchant le meilleur prix',
      hookFr: `Stock Très Limité : ${productDNA.productName} à seulement ${priceDisplay}`,
      hookDarija: vettedUrgency,
      badgeText: '🔥 Offre Limitée',
      ctaText: 'Commander sur WhatsApp ➔',
      moodDescription: `High-impact commercial studio with vibrant ${primaryCol} rim lights`,
      surfaceMaterial: 'minimalist dark titanium pedestal with pristine micro-chamfered edge',
      surfaceDescriptionFr: 'Socle : Titane Sombre Minimaliste • Ambiance Studio & Contraste Élevé',
      backgroundAtmosphere: 'modern moody studio gradient with sharp directional softbox fill',
      isRecommended: brandKit.positioning === 'athletic' || brandKit.positioning === 'affordable',
    },
    {
      id: 'lifestyle_authentic',
      titleFr: 'Terroir Méditerranéen & Naturel',
      subtitle: 'Lumière Naturelle de Sidi Bou Saïd & Réassurance Locale',
      targetEmotion: 'Confiance absolue, authenticité tunisienne et sécurité du paiement',
      audienceAngle: 'Familles et acheteurs soucieux de la qualité et du paiement à la livraison',
      hookFr: `La Référence N°1 Certifiée Disponible sur les 24 Gouvernorats`,
      hookDarija: vettedAuthentic,
      badgeText: '✓ 100% Authentique',
      ctaText: 'Payer à la Livraison ➔',
      moodDescription: 'Warm Mediterranean lifestyle atmosphere, natural warm travertine stone',
      surfaceMaterial: 'natural warm travertine stone plinth with gentle organic texture',
      surfaceDescriptionFr: 'Socle : Pierre Naturelle ou Bois d\'Olivier • Ambiance Chaleureuse & Terroir',
      backgroundAtmosphere: 'sunlit coastal terrace backdrop, soft warm Mediterranean glow',
      isRecommended: brandKit.positioning === 'artisan' || brandKit.industry === 'food',
    },
  ];

  return intents;
}

/**
 * 03 — Composition Strategy : Calcule le SceneSpec déterministe avec Brand Kit et safe-zones
 */
export function compileMasterSceneSpec(params: {
  intent: CreativeIntent;
  productDNA: ProductDNA;
  brandKit: BrandKit;
  aspect: '1:1' | '9:16' | '1.91:1';
}): MasterSceneSpec {
  const { intent, brandKit, aspect } = params;
  const isStory = aspect === '9:16';
  const isBanner = aspect === '1.91:1';

  // Calcul du calage géométrique
  const pedestalAnchor = {
    x: 0.5,
    y: isStory ? 0.65 : isBanner ? 0.76 : 0.72,
    widthRatio: isStory ? 0.55 : isBanner ? 0.40 : 0.48,
  };

  // Safe-zones officielles des réseaux sociaux (Instagram Stories : 14% haut, 20% bas)
  const safeZones = {
    topPercent: isStory ? 14 : 5,
    bottomPercent: isStory ? 20 : 5,
  };

  // Paramètres d'éclairage
  const primaryCol = brandKit.palette?.primary || brandKit.primaryColor || '#00E5FF';
  const lighting = {
    keyLightDirection: 'top-left' as const,
    angleDeg: 45,
    temperatureK: intent.id === 'prestige_elevation' ? 4200 : intent.id === 'lifestyle_authentic' ? 3800 : 5500,
    accentColorHex: primaryCol,
  };

  // PROTOCOLE CRITIQUE ZERO-HALLUCINATION (Constitution Rule 3.1 & 3.2) :
  // Le prompt de diffusion décrit STRICTEMENT un décor vacant immaculé sans jamais mentionner d'objet ou de texte.
  const vacancyMandate = 'The central pedestal top surface is completely vacant, pristine, smooth and polished, cleanly awaiting an object. Clean contact surface with soft natural gradient falloff. Clean seamless background.';

  const framingDirective = isStory
    ? 'Vertical 9:16 composition, extended clean upper headroom and footer area, central pedestal cleanly anchored at lower-middle.'
    : isBanner
    ? 'Wide panoramic commercial composition, pedestal centered with generous horizontal negative space.'
    : 'Balanced square 1:1 commercial feed composition, camera at 15 degrees elevation.';

  const basePrompt = `Commercial luxury advertising staging. Empty ${intent.surfaceMaterial}. ${intent.backgroundAtmosphere}. Directional 45-degree softbox key light from upper-left with subtle ${primaryCol} rim accents. ${framingDirective} ${vacancyMandate}`;

  const compiledPositivePrompt = compileBrandPrompt(brandKit, basePrompt, {
    isStory,
    angleName: intent.titleFr,
  });

  // Calcul du placement du logo officiel dans le respect des safe-zones
  const logoTopPx = isStory ? 240 : 45; // 240px sur 1792px = ~13.5% (juste sous la zone rouge des 14%)

  return {
    version: 'scene/v2',
    intentId: intent.id,
    aspectRatio: aspect,
    pedestalAnchor,
    safeZones,
    lighting,
    surface: {
      material: intent.surfaceMaterial,
      finish: intent.id === 'prestige_elevation' ? 'glossy' : 'matte',
      contactBlurRatio: 0.035, // Règle constitutionnelle 3.3
      contactHeightRatio: 0.04,
    },
    background: intent.backgroundAtmosphere,
    compiledPositivePrompt,
    brandOverlay: {
      logoUrl: brandKit.logoUrl || '/images/Adora_logo.png',
      logoPosition: 'top-left',
      logoTopPx,
      headlineFont: brandKit.fonts?.headline || brandKit.fontFamily || 'Outfit, sans-serif',
      primaryColor: primaryCol,
      accentColor: brandKit.palette?.accent || brandKit.accentColor || '#FF5722',
      sloganDarija: brandKit.sloganDarija || 'El qualité el behya b a7sen aswem fi tounes !',
      deliveryMention: brandKit.deliveryMention || 'Livraison 24-48h sur les 24 gouvernorats',
    },
  };
}

export interface DynamicDirectorQuestion {
  id: string;
  level: 1 | 2 | 3;
  levelTitle: string;
  levelSubtitle: string;
  questionText: string;
  contextHint: string;
  options: {
    id: string;
    title: string;
    subtitle: string;
    tag?: string;
    targetIntentId?: CreativeIntentType;
    icon?: string;
  }[];
}

/**
 * Génère dynamiquement les questions ciblées du système de décision à 3 niveaux
 * Chaque question est présentée isolément sur un écran dédié (Une question par page)
 */
export async function generateDynamicDirectorQuestions(params: {
  productDNA: ProductDNA;
  brandKit: BrandKit;
  priceTND?: number;
}): Promise<DynamicDirectorQuestion[]> {
  const { productDNA, brandKit, priceTND } = params;
  const priceDisplay = priceTND ? `${priceTND} DT` : 'votre offre';
  const category = productDNA.category || 'general';

  // Décors contextualisés selon la catégorie réelle du produit (Recommandation 5)
  let decorOptions = [
    {
      id: 'opt_dark_titanium',
      title: 'Studio Sombre & Liseré Lumineux',
      subtitle: `Contraste publicitaire puissant avec halo d'accentuation ${brandKit.primaryColor || '#00E5FF'}.`,
      tag: '⚡ Studio & Impact',
      targetIntentId: 'conversion_flash' as CreativeIntentType,
      icon: '🎯',
    },
    {
      id: 'opt_mineral_marble',
      title: 'Marbre Blanc de Carrare & Soleil Doux',
      subtitle: 'Surface minérale immaculée, biseau poli, reflets doux et clarté solaire matinale.',
      tag: '💎 Minéral & Élégance',
      targetIntentId: 'prestige_elevation' as CreativeIntentType,
      icon: '🏛️',
    },
    {
      id: 'opt_mediterranean_terrace',
      title: 'Balustrade en Travertin & Clarté Méditerranéenne',
      subtitle: 'Lumière naturelle ensoleillée de Sidi Bou Saïd, textures organiques et clarté côtière.',
      tag: '☀️ Terroir & Naturel',
      targetIntentId: 'lifestyle_authentic' as CreativeIntentType,
      icon: '🌿',
    },
  ];

  if (category === 'food') {
    decorOptions = [
      {
        id: 'opt_olive_wood',
        title: 'Bois d\'Olivier Noble & Lumière Naturelle',
        subtitle: 'Authenticité du terroir tunisien, veinage chaleureux et lumière matinale bienfaisante.',
        tag: '🌿 Terroir Authentique',
        targetIntentId: 'lifestyle_authentic' as CreativeIntentType,
        icon: '🫒',
      },
      {
        id: 'opt_mediterranean_terrace',
        title: 'Balustrade en Travertin & Soleil Doux',
        subtitle: 'Ambiance méditerranéenne ensoleillée de terrasse côtière tunisienne.',
        tag: '☀️ Solaire & Naturel',
        targetIntentId: 'lifestyle_authentic' as CreativeIntentType,
        icon: '☀️',
      },
      {
        id: 'opt_mineral_marble',
        title: 'Marbre Clair Contemporain & Éclairage Zénithal',
        subtitle: 'Présentation culinaire saine, épurée et moderne mettant en majesté les ingrédients.',
        tag: '💎 Moderne & Frais',
        targetIntentId: 'prestige_elevation' as CreativeIntentType,
        icon: '🍽️',
      },
    ];
  } else if (category === 'cosmetics' || category === 'jewelry') {
    decorOptions = [
      {
        id: 'opt_mineral_marble',
        title: 'Marbre Blanc de Carrare & Lumière Solaire',
        subtitle: 'Socle biseauté immaculé, reflets subtils et mise en majesté des flacons et textures.',
        tag: '💎 Haute Parfumerie',
        targetIntentId: 'prestige_elevation' as CreativeIntentType,
        icon: '🏛️',
      },
      {
        id: 'opt_soft_podium',
        title: 'Podium Satiné & Voile de Lumière Matinale',
        subtitle: 'Atmosphère aérienne, douceur poudrée et ombres de contact physiques impeccables.',
        tag: '🌸 Douceur & Pureté',
        targetIntentId: 'lifestyle_authentic' as CreativeIntentType,
        icon: '✨',
      },
      {
        id: 'opt_dark_titanium',
        title: 'Studio Sombre & Éclairage de Contraste',
        subtitle: `Halo rasé aux couleurs de votre logo (${brandKit.primaryColor || '#00E5FF'}) pour un look audacieux.`,
        tag: '⚡ Contraste Chic',
        targetIntentId: 'conversion_flash' as CreativeIntentType,
        icon: '🎯',
      },
    ];
  }

  return [
    {
      id: 'q_level_1_strategy',
      level: 1,
      levelTitle: 'Étape 1/3 — Objectif Publicitaire',
      levelSubtitle: 'Que voulez-vous que cette publicité accomplisse en priorité ?',
      questionText: `Quel est l'objectif prioritaire pour la campagne de ${productDNA.productName} ?`,
      contextHint: 'Le badge Réassurance (Paiement à la livraison) reste cumulable sur tous les objectifs.',
      options: [
        {
          id: 'opt_urgency',
          title: '💥 Vente Flash & Promotion Immédiate',
          subtitle: `Mettre en valeur l'opportunité flash à ${priceDisplay} et le risque d'épuisement rapide des stocks.`,
          tag: '🔥 Ventes Rapides',
          targetIntentId: 'conversion_flash',
          icon: '⚡',
        },
        {
          id: 'opt_prestige',
          title: '👑 Image de Marque & Notoriété',
          subtitle: 'Faire ressentir l\'exclusivité, l\'élégance et la qualité irréprochable de votre boutique.',
          tag: '✨ Notoriété & Prestige',
          targetIntentId: 'prestige_elevation',
          icon: '👑',
        },
        {
          id: 'opt_dm_orders',
          title: '📱 Commandes WhatsApp & Messages Privés',
          subtitle: 'Inciter les clients à envoyer un message privé immédiatement pour commander sans friction.',
          tag: '💬 Commandes Directes',
          targetIntentId: 'lifestyle_authentic',
          icon: '🤝',
        },
      ],
    },
    {
      id: 'q_level_2_art_direction',
      level: 2,
      levelTitle: 'Étape 2/3 — Ambiance & Décor',
      levelSubtitle: 'Quel décor mettra en valeur les matières et le packaging réel de votre produit ?',
      questionText: `Dans quel univers visuel souhaitez-vous sublimer ${productDNA.productName} ?`,
      contextHint: `Recommandations adaptées à votre catégorie : ${category}. Zéro texte généré par l'IA dans le décor.`,
      options: decorOptions,
    },
    {
      id: 'q_level_3_copy_hook',
      level: 3,
      levelTitle: 'Étape 3/3 — Langue & Accroche Commerciale',
      levelSubtitle: 'Comment vos clients tunisiens préfèrent-ils lire votre message ?',
      questionText: `Choisissez le style de langue pour le texte publicitaire superposé :`,
      contextHint: 'Vous pourrez modifier ou personnaliser le texte exact avant de lancer la création.',
      options: [
        {
          id: 'opt_lang_3arbi',
          title: '⚡ 3arbi (Franco-Arabe Tunisien)',
          subtitle: '« Promo flash w stock ma 93ad fih chay ! El khlass waqt el livri. »',
          tag: 'Plus populaire',
          targetIntentId: 'conversion_flash',
          icon: '⚡',
        },
        {
          id: 'opt_lang_arabic',
          title: '🇹🇳 عربي تونسي (Alphabet Arabe)',
          subtitle: '« برومو فلاش والكمية محدودة ! الخلاص عند الاستلام لباب الدار. »',
          tag: 'Arabe Authentique',
          targetIntentId: 'lifestyle_authentic',
          icon: '🇹🇳',
        },
        {
          id: 'opt_lang_french',
          title: '🇫🇷 Français Commercial',
          subtitle: '« Offre flash très limitée : Profitez de notre remise avec paiement à la livraison. »',
          tag: 'Français Chic',
          targetIntentId: 'prestige_elevation',
          icon: '🇫🇷',
        },
      ],
    },
  ];
}

