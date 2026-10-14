import { BrandKit, compileBrandPrompt } from './brandkit';

export type CreativeAngleType =
  | 'problem_solution'
  | 'social_proof'
  | 'offer_urgency'
  | 'lifestyle_aspiration'
  | 'benefit_ingredient';

export interface SceneBrief {
  conceptTitle: string;
  surfaceDescription: string;
  backgroundAtmosphere: string;
  lightingScheme: string;
  dallePrompt: string;
  recommendedAspect: '1:1' | '9:16' | '1.91:1';
}

export interface CreativeAngleBrief {
  angleId: CreativeAngleType;
  angleLabel: string;
  angleTagline: string;
  targetPainPoint: string;
  hookHeadlineFr: string;
  hookHeadlineDarija: string;
  badgeText: string;
  callToAction: string;
  sceneBrief: SceneBrief;
  metaAdCaptionFr: string;
  metaAdCaptionDarija: string;
}

export interface StrategyEngineInput {
  productName: string;
  brandName?: string;
  category?: string;
  priceTND?: number;
  originalPriceTND?: number;
  productDescription?: string;
  imageBase64?: string;
  brandKit: BrandKit;
}

/**
 * Banque validée et certifiée de Darija tunisien commercial (Zero-Typo Mandate)
 */
export const VETTED_DARIJA_BANK: Record<CreativeAngleType, { hooks: string[]; cta: string; badge: string }> = {
  problem_solution: {
    hooks: [
      'Fadit mel mouchkla hedhi ? El 7al el s7i7 l9inehoulk fi boutique mteena !',
      'Ma 3adech tdaya3 waqtek w flousek, a7sen choix fi tounes weslek.',
      'Ken tlawwej 3la 7aja thabta w mjarba, hadha el produit li lezmek.',
    ],
    cta: 'Commander tawwa',
    badge: '✓ 100% Efficace',
  },
  social_proof: {
    hooks: [
      'Akther produit yetbe3 fi Tounes ! Chouf 3lech el kol thabbou.',
      'Plus de 1 000 clients radhyin fi 24 gouvernorats. Chnouwa testanna ?',
      'El numéro 1 mtaa el e-commerce fi Tounes, qualité thabta 5 étoiles.',
    ],
    cta: 'Chouf el avis',
    badge: '⭐ Best-Seller N°1',
  },
  offer_urgency: {
    hooks: [
      'Promo flash w stock ma 93ad fih chay ! El khlass waqt el livri l beb eddar.',
      'A9wa offre fi tounes el kol : Soum tayara w livri fisaa fi 24h-48h.',
      'Abathna message al privé fisaa bech treservi el pot mteeek 9bal ma youfa !',
    ],
    cta: 'Régler à la livraison',
    badge: '🔥 Offre Limitée',
  },
  lifestyle_aspiration: {
    hooks: [
      'Badel el mood mteek w a3tihom el chic fi kol blasa.',
      'El top de gamme li yestahel ykoun fi dimatek.',
      'Khellik dima fi el niveau el 3ali m3a el qualité l\'originale.',
    ],
    cta: 'Découvrir la collection',
    badge: '✨ Édition Chic',
  },
  benefit_ingredient: {
    hooks: [
      'Qualité oumourha wadha 100% originale w khedma ndhifa.',
      'Formule pure zéro compromis, el résultat tchoufou men awwel marra.',
      '9meche 7orr w finition de luxe li t3ich m3ak.',
    ],
    cta: 'Détails du produit',
    badge: '💎 Qualité Pure',
  },
};

/**
 * Moteur de Stratégie Publicitaire (ADORA-44)
 * Génère 3 à 5 angles marketing de conversion distincts pour un produit donné
 */
export async function generateStrategyBriefs(
  input: StrategyEngineInput
): Promise<CreativeAngleBrief[]> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY;
  const brandKit = input.brandKit;
  const priceStr = input.priceTND ? `${input.priceTND} DT` : 'Prix attractif';

  if (!apiKey || apiKey.startsWith('sk-placeholder')) {
    return generateFallbackBriefs(input);
  }

  try {
    const systemPrompt = `Tu es le Directeur Stratégique et Publicitaire Meta Ads N°1 d'Adora SaaS.
Ton objectif est de transformer un produit e-commerce en 5 ANGLES CRÉATIFS PUBLICITAIRES DISTINCTS conçus pour générer des ventes massives sur le marché tunisien (Instagram, Facebook Ads, TikTok).

Pour CHAQUE angle, fournis STRICTEMENT un objet complet avec :
1. "angleId": l'un de ["problem_solution", "social_proof", "offer_urgency", "lifestyle_aspiration", "benefit_ingredient"]
2. "angleLabel": Titre français du concept publicitaire (ex: "L'Urgence Stock Limité")
3. "angleTagline": Phrase d'accroche stratégique en 1 ligne
4. "targetPainPoint": La frustration ou le désir précis visé chez le client
5. "hookHeadlineFr": Titre choc court (4-6 mots) en français
6. "hookHeadlineDarija": Accroche percutante en vrai Darija tunisien naturel (zéro faute)
7. "badgeText": Badge commercial percutant (ex: "🔥 Promo Flash -30%", "⭐ Best-Seller N°1")
8. "callToAction": Texte du bouton CTA (ex: "Commander en 1 Clic", "Khlass waqt el livri")
9. "sceneBrief":
   - "conceptTitle": Titre de la mise en scène
   - "surfaceDescription": Description de la surface d'accueil (marbre, bois, velours, travertin)
   - "backgroundAtmosphere": Description de l'arrière-plan flou ou décoratif
   - "lightingScheme": Schéma d'éclairage (key light, rim light, ambient)
   - "dallePrompt": Prompt en anglais décrivant STRICTEMENT un podium/piédestal d'accueil VACANT, lisse et propre, sans jamais mentionner d'objet ou de texte
   - "recommendedAspect": "1:1" ou "9:16"
10. "metaAdCaptionFr": Légende Instagram/Facebook complète avec émojis, bénéfices, garantie et appel à l'action
11. "metaAdCaptionDarija": Légende en Darija tunisien complète prête à copier-coller

RÈGLE D'OR : Les 5 angles doivent être RADICALEMENT DIFFÉRENTS les uns des autres pour permettre un A/B testing optimal.
Format de retour : un objet JSON { "briefs": [ ... 5 objets ... ] }`;

    const userPrompt = `Produit à analyser :
- Nom : ${input.productName}
- Marque : ${input.brandName || brandKit.shopName}
- Catégorie : ${input.category || brandKit.industry || 'Général'}
- Prix de vente : ${priceStr}
- Description : ${input.productDescription || 'Produit e-commerce tendance'}

Brand Kit de l'entreprise :
- Nom : ${brandKit.shopName}
- Secteur : ${brandKit.industry || 'E-commerce'}
- Positionnement : ${brandKit.positioning || 'Premium'}
- Palette de couleurs : Primaire ${brandKit.palette?.primary || brandKit.primaryColor}, Accent ${brandKit.palette?.accent || brandKit.accentColor}
- Tonalité de voix : ${brandKit.voice?.tone || 'Expert & Convaincant'}
- Promesse livraison : ${brandKit.deliveryMention || 'Livraison 24-48h sur toute la Tunisie'}
- Mode de paiement : ${brandKit.offers?.payment || 'Paiement à la livraison (COD)'}`;

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
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.statusText}`);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    if (Array.isArray(parsed.briefs) && parsed.briefs.length > 0) {
      return parsed.briefs.map((brief: CreativeAngleBrief) => ({
        ...brief,
        sceneBrief: {
          ...brief.sceneBrief,
          dallePrompt: compileBrandPrompt(brandKit, brief.sceneBrief.dallePrompt, {
            isStory: brief.sceneBrief.recommendedAspect === '9:16',
            angleName: brief.angleLabel,
          }),
        },
      }));
    }

    return generateFallbackBriefs(input);
  } catch (error) {
    console.warn('Strategy Engine fallback activated:', error);
    return generateFallbackBriefs(input);
  }
}

/**
 * Fallback intelligent déterministe avec briefs riches par angle
 */
function generateFallbackBriefs(input: StrategyEngineInput): CreativeAngleBrief[] {
  const brandKit = input.brandKit;
  const prod = input.productName;
  const price = input.priceTND ? `${input.priceTND} DT` : 'Prix Spécial';

  const angles: { id: CreativeAngleType; label: string; tagline: string; painPoint: string; surface: string; bg: string }[] = [
    {
      id: 'problem_solution',
      label: 'Problème ➔ Solution Immédiate',
      tagline: 'Mettre fin aux frustrations du client avec la solution n°1',
      painPoint: 'Perte de temps et déception avec les produits bas de gamme',
      surface: 'sleek dark titanium surface with clean edges',
      bg: 'moody modern studio background with soft rim lights',
    },
    {
      id: 'social_proof',
      label: 'Preuve Sociale & Best-Seller',
      tagline: 'L\'approbation unanime de milliers de clients satisfaits',
      painPoint: 'Peur de se tromper ou d\'acheter un produit non fiable',
      surface: 'elevated polished black Nero Marquina marble podium',
      bg: 'prestigious ambient backdrop with soft bokeh spotlight',
    },
    {
      id: 'offer_urgency',
      label: 'Offre Choc & Promo Flash',
      tagline: 'Inciter au passage à l\'action immédiat avec stock limité',
      painPoint: 'Hésitation et procrastination d\'achat',
      surface: 'minimalist pedestal with vibrant accent lighting',
      bg: 'high-energy commercial studio gradient with warm glow',
    },
    {
      id: 'lifestyle_aspiration',
      label: 'Lifestyle & Immersion Quotidienne',
      tagline: 'Projetez votre client dans son quotidien sublimé',
      painPoint: 'Difficulté à se représenter le produit dans la vraie vie',
      surface: 'natural travertine stone table in foreground',
      bg: 'softly blurred sunlit modern interior, warm architectural sunlight',
    },
    {
      id: 'benefit_ingredient',
      label: 'Gros Plan Texture & Bénéfice Clé',
      tagline: 'La démonstration irréfutable de la pureté et de la finition',
      painPoint: 'Doute sur la composition réelle et les finitions',
      surface: 'macro smooth reflection acrylic plate with soft water mist',
      bg: 'soft monochrome seamless gradient with macro depth of field',
    },
  ];

  return angles.map((a) => {
    const vetted = VETTED_DARIJA_BANK[a.id];
    const basePrompt = `Commercial product staging set for ${prod}. Empty ${a.surface}, ${a.bg}. Clean vacant central top.`;
    const compiledDalle = compileBrandPrompt(brandKit, basePrompt);

    return {
      angleId: a.id,
      angleLabel: a.label,
      angleTagline: a.tagline,
      targetPainPoint: a.painPoint,
      hookHeadlineFr: `${prod} : Le Choix Sans Compromis`,
      hookHeadlineDarija: vetted.hooks[0],
      badgeText: vetted.badge,
      callToAction: vetted.cta,
      sceneBrief: {
        conceptTitle: a.label,
        surfaceDescription: a.surface,
        backgroundAtmosphere: a.bg,
        lightingScheme: 'Directional 45-degree key light with subtle ambient fill',
        dallePrompt: compiledDalle,
        recommendedAspect: a.id === 'offer_urgency' ? '9:16' : '1:1',
      },
      metaAdCaptionFr: `🔥 Découvrez ${prod} chez ${brandKit.shopName} !\n\n✓ Qualité certifiée 100% originale\n📦 ${brandKit.deliveryMention || 'Livraison 24-48h sur toute la Tunisie'}\n💵 ${brandKit.offers?.payment || 'Paiement à la livraison disponible'}\n\n👉 Commandez dès maintenant à seulement ${price} !`,
      metaAdCaptionDarija: `${vetted.hooks[0]}\n\n✅ Weslet el commande fi boutique mteena !\n🚚 Livri fisaa fi 24h-48h l tounes el kol\n💰 El khlass waqt el livri\n\nAbathna message sur WhatsApp bech treservi mteeek tawwa !`,
    };
  });
}
