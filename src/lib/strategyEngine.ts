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
  hookHeadlineEn: string;
  hookHeadlineFr: string;
  hookHeadlineAr: string;
  hookHeadlineAutre?: string;
  hookHeadlineDarija: string;
  badgeText: string;
  callToAction: string;
  sceneBrief: SceneBrief;
  metaAdCaptionEn: string;
  metaAdCaptionFr: string;
  metaAdCaptionAr: string;
  metaAdCaptionAutre?: string;
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
  copyLanguage?: 'en' | 'fr' | 'ar' | 'autre';
  customDialectNote?: string;
}

export function getBriefHeadline(brief: CreativeAngleBrief, lang: 'en' | 'fr' | 'ar' | 'autre'): string {
  if (lang === 'en') return brief.hookHeadlineEn || brief.hookHeadlineFr;
  if (lang === 'ar') return brief.hookHeadlineAr || brief.hookHeadlineFr;
  if (lang === 'autre') return brief.hookHeadlineAutre || brief.hookHeadlineDarija || brief.hookHeadlineFr;
  return brief.hookHeadlineFr || brief.hookHeadlineEn || brief.hookHeadlineAr || '';
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
 * Moteur de Stratégie Publicitaire (MarkMosaiq-44)
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
    const selectedLang = input.copyLanguage || 'fr';
    const isAutre = selectedLang === 'autre';
    const customDialectPrompt = input.customDialectNote
      ? `Consigne de dialecte spécifique pour l'option "Autre" : "${input.customDialectNote}"`
      : 'Dialecte régional ou Darija uniquement si explicitement demandé';

    const systemPrompt = `Tu es le Directeur Stratégique et Publicitaire Meta Ads N°1 d'MarkMosaiq SaaS.
Ton objectif est de transformer un produit e-commerce en 5 ANGLES CRÉATIFS PUBLICITAIRES DISTINCTS à fort taux de conversion.

RÈGLE D'OR DE LANGUES :
- Nous couvrons STRICTEMENT 3 langues :
  1. ANGLAIS ("en")
  2. FRANÇAIS ("fr")
  3. ARABE LITTÉRAIRE MODERNE / الفصحى ("ar")
- Ne JAMAIS forcer de mots dialectaux ou de Darija par défaut.
- Tout dialecte local (ex: Darija) est EXCLUSIVEMENT réservé au champ "hookHeadlineAutre" lorsque l'option "Autre" est demandée (${isAutre ? `ACTIVÉE: ${customDialectPrompt}` : 'DÉSACTIVÉE'}).

Pour CHAQUE angle, fournis STRICTEMENT un objet complet avec :
1. "angleId": l'un de ["problem_solution", "social_proof", "offer_urgency", "lifestyle_aspiration", "benefit_ingredient"]
2. "angleLabel": Titre français du concept publicitaire (ex: "L'Urgence Stock Limité")
3. "angleTagline": Phrase d'accroche stratégique en 1 ligne
4. "targetPainPoint": La frustration ou le désir précis visé chez le client
5. "hookHeadlineEn": Titre choc court (4-6 mots) en ANGLAIS (ex: "Elevate Your Routine Today")
6. "hookHeadlineFr": Titre choc court (4-6 mots) en FRANÇAIS (ex: "L'Excellence Sans Compromis")
7. "hookHeadlineAr": Titre choc court en ARABE LITTÉRAIRE الفصحى (ex: "الأناقة والجودة العالية بين يديك")
8. "hookHeadlineAutre": ${isAutre ? 'Titre choc dans le dialecte demandé' : 'null'}
9. "badgeText": Badge commercial percutant (ex: "🔥 Offre Limitée", "⭐ Best-Seller N°1")
10. "callToAction": Texte du bouton CTA (ex: "Commander", "Claim Offer")
11. "sceneBrief":
   - "conceptTitle": Titre de la mise en scène
   - "surfaceDescription": Description de la surface d'accueil (marbre, bois, velours, travertin)
   - "backgroundAtmosphere": Description de l'arrière-plan flou ou décoratif
   - "lightingScheme": Schéma d'éclairage (key light, rim light, ambient)
   - "dallePrompt": Prompt en anglais décrivant STRICTEMENT un podium/piédestal d'accueil VACANT, lisse et propre, sans jamais mentionner d'objet ou de texte
   - "recommendedAspect": "1:1" ou "9:16"
12. "metaAdCaptionEn": Légende Instagram/Facebook complète en ANGLAIS avec émojis et bénéfices
13. "metaAdCaptionFr": Légende Instagram/Facebook complète en FRANÇAIS avec émojis et bénéfices
14. "metaAdCaptionAr": Légende Instagram/Facebook complète en ARABE LITTÉRAIRE الفصحى
15. "metaAdCaptionAutre": ${isAutre ? 'Légende dans le dialecte demandé' : 'null'}

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
- Promesse livraison : ${brandKit.deliveryMention || 'Livraison rapide et soignée'}
- Mode de paiement : ${brandKit.offers?.payment || 'Paiement sécurisé'}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
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
      return parsed.briefs.map((brief: any) => {
        const darijaVetted = VETTED_DARIJA_BANK[brief.angleId as CreativeAngleType];
        return {
          ...brief,
          hookHeadlineEn: brief.hookHeadlineEn || brief.hookHeadlineFr || input.productName,
          hookHeadlineFr: brief.hookHeadlineFr || brief.hookHeadlineEn || input.productName,
          hookHeadlineAr: brief.hookHeadlineAr || brief.hookHeadlineFr || input.productName,
          hookHeadlineAutre: brief.hookHeadlineAutre || (isAutre ? darijaVetted?.hooks[0] : undefined),
          hookHeadlineDarija: brief.hookHeadlineDarija || darijaVetted?.hooks[0] || brief.hookHeadlineFr,
          metaAdCaptionEn: brief.metaAdCaptionEn || `🔥 Discover ${input.productName} by ${brandKit.shopName}!\n\n✓ 100% Certified Original\n📦 Fast & secure shipping\n💵 Satisfaction guaranteed\n\n👉 Order now at ${priceStr}!`,
          metaAdCaptionFr: brief.metaAdCaptionFr || `🔥 Découvrez ${input.productName} chez ${brandKit.shopName} !\n\n✓ Qualité certifiée 100% originale\n📦 ${brandKit.deliveryMention || 'Livraison rapide et sécurisée'}\n💵 ${brandKit.offers?.payment || 'Paiement sécurisé disponible'}\n\n👉 Commandez dès maintenant à ${priceStr} !`,
          metaAdCaptionAr: brief.metaAdCaptionAr || `🔥 اكتشف ${input.productName} من متجر ${brandKit.shopName}!\n\n✓ جودة أصلية ومضمونة 100%\n📦 شحن سريع ومباشر\n💵 دفع آمن ومريح\n\n👉 اطلب الآن بسعر خاص ${priceStr}!`,
          metaAdCaptionAutre: brief.metaAdCaptionAutre || (isAutre ? `${darijaVetted?.hooks[0]}\n\n✅ Weslet el commande fi boutique mteena !\n🚚 Livri fisaa fi 24h-48h\n💰 Khlass fel livraison\n\nAbathna message bech tcommondi tawwa !` : undefined),
          metaAdCaptionDarija: brief.metaAdCaptionDarija || `${darijaVetted?.hooks[0]}\n\n✅ Weslet el commande fi boutique mteena !\n🚚 Livri fisaa fi 24h-48h\n💰 Khlass fel livraison\n\nAbathna message bech tcommondi tawwa !`,
          sceneBrief: {
            ...brief.sceneBrief,
            dallePrompt: compileBrandPrompt(brandKit, brief.sceneBrief.dallePrompt, {
              isStory: brief.sceneBrief.recommendedAspect === '9:16',
              angleName: brief.angleLabel,
            }),
          },
        };
      });
    }

    return generateFallbackBriefs(input);
  } catch (error) {
    console.warn('Strategy Engine fallback activated:', error);
    return generateFallbackBriefs(input);
  }
}

/**
 * Fallback intelligent déterministe avec briefs riches par angle (EN, FR, AR, AUTRE)
 */
function generateFallbackBriefs(input: StrategyEngineInput): CreativeAngleBrief[] {
  const brandKit = input.brandKit;
  const prod = input.productName;
  const price = input.priceTND ? `${input.priceTND} DT` : 'Prix Spécial';

  const angles: {
    id: CreativeAngleType;
    label: string;
    tagline: string;
    painPoint: string;
    surface: string;
    bg: string;
    hookEn: string;
    hookFr: string;
    hookAr: string;
    badgeEn: string;
    badgeFr: string;
    badgeAr: string;
    ctaEn: string;
    ctaFr: string;
    ctaAr: string;
  }[] = [
    {
      id: 'problem_solution',
      label: 'Problème ➔ Solution Immédiate',
      tagline: 'Mettre fin aux frustrations du client avec la solution n°1',
      painPoint: 'Perte de temps et déception avec les produits bas de gamme',
      surface: 'sleek dark titanium surface with clean edges',
      bg: 'moody modern studio background with soft rim lights',
      hookEn: 'The Definitive Solution You Have Been Searching For',
      hookFr: `${prod} : La Solution Définitive`,
      hookAr: 'الحل الأمثل والنهائي الذي تبحث عنه',
      badgeEn: '✓ 100% Effective',
      badgeFr: '✓ 100% Efficace',
      badgeAr: '✓ فعالية مؤكدة 100%',
      ctaEn: 'Order Now',
      ctaFr: 'Commander Maintenant',
      ctaAr: 'اطلب الآن',
    },
    {
      id: 'social_proof',
      label: 'Preuve Sociale & Best-Seller',
      tagline: 'L\'approbation unanime de milliers de clients satisfaits',
      painPoint: 'Peur de se tromper ou d\'acheter un produit non fiable',
      surface: 'elevated polished black Nero Marquina marble podium',
      bg: 'prestigious ambient backdrop with soft bokeh spotlight',
      hookEn: 'Loved and Trusted by Over 1,200+ Happy Customers',
      hookFr: 'Recommandé par Plus de 1 200 Clients Satisfaits',
      hookAr: 'الخيار الأول المفضل لدى أكثر من 1200 عميل',
      badgeEn: '⭐ Best-Seller N°1',
      badgeFr: '⭐ Best-Seller N°1',
      badgeAr: '⭐ الأكثر مبيعاً N°1',
      ctaEn: 'View Reviews',
      ctaFr: 'Voir les Avis',
      ctaAr: 'عرض التقييمات',
    },
    {
      id: 'offer_urgency',
      label: 'Offre Choc & Promo Flash',
      tagline: 'Inciter au passage à l\'action immédiat avec stock limité',
      painPoint: 'Hésitation et procrastination d\'achat',
      surface: 'minimalist pedestal with vibrant accent lighting',
      bg: 'high-energy commercial studio gradient with warm glow',
      hookEn: 'Exclusive Flash Deal: Limited Stock Remaining',
      hookFr: 'Offre Flash Exclusive : Stock Très Limité',
      hookAr: 'عرض حصري محدود وكميات شارفت على النفاد',
      badgeEn: '🔥 Limited Offer',
      badgeFr: '🔥 Offre Limitée',
      badgeAr: '🔥 عرض لفترة محدودة',
      ctaEn: 'Claim Deal',
      ctaFr: 'Profiter de l\'Offre',
      ctaAr: 'احجز طلبك الآن',
    },
    {
      id: 'lifestyle_aspiration',
      label: 'Lifestyle & Immersion Quotidienne',
      tagline: 'Projetez votre client dans son quotidien sublimé',
      painPoint: 'Difficulté à se représenter le produit dans la vraie vie',
      surface: 'natural travertine stone table in foreground',
      bg: 'softly blurred sunlit modern interior, warm architectural sunlight',
      hookEn: 'Elevate Your Daily Routine with Timeless Elegance',
      hookFr: 'Sublimez Votre Quotidien avec Une Élégance Pure',
      hookAr: 'ارتقِ بتفاصيل يومك بأناقة ورقي لا مثيل له',
      badgeEn: '✨ Premium Edition',
      badgeFr: '✨ Édition Chic',
      badgeAr: '✨ إصدار متميز',
      ctaEn: 'Discover Collection',
      ctaFr: 'Découvrir la Collection',
      ctaAr: 'اكتشف التشكيلة',
    },
    {
      id: 'benefit_ingredient',
      label: 'Gros Plan Texture & Bénéfice Clé',
      tagline: 'La démonstration irréfutable de la pureté et de la finition',
      painPoint: 'Doute sur la composition réelle et les finitions',
      surface: 'macro smooth reflection acrylic plate with soft water mist',
      bg: 'soft monochrome seamless gradient with macro depth of field',
      hookEn: 'Pure Certified Craftsmanship and Unmatched Quality',
      hookFr: 'Une Qualité Pure Certifiée Sans Aucun Compromis',
      hookAr: 'جودة نقية معتمدة ومصنوعة بأعلى معايير الدقة',
      badgeEn: '💎 Pure Quality',
      badgeFr: '💎 Qualité Pure',
      badgeAr: '💎 جودة نقية',
      ctaEn: 'Product Details',
      ctaFr: 'Détails du Produit',
      ctaAr: 'تفاصيل المنتج',
    },
  ];

  return angles.map((a) => {
    const vettedDarija = VETTED_DARIJA_BANK[a.id];
    const basePrompt = `Commercial product staging set for ${prod}. Empty ${a.surface}, ${a.bg}. Clean vacant central top.`;
    const compiledDalle = compileBrandPrompt(brandKit, basePrompt);

    return {
      angleId: a.id,
      angleLabel: a.label,
      angleTagline: a.tagline,
      targetPainPoint: a.painPoint,
      hookHeadlineEn: a.hookEn,
      hookHeadlineFr: a.hookFr,
      hookHeadlineAr: a.hookAr,
      hookHeadlineAutre: vettedDarija.hooks[0],
      hookHeadlineDarija: vettedDarija.hooks[0],
      badgeText: a.badgeFr,
      callToAction: a.ctaFr,
      sceneBrief: {
        conceptTitle: a.label,
        surfaceDescription: a.surface,
        backgroundAtmosphere: a.bg,
        lightingScheme: 'Directional 45-degree key light with subtle ambient fill',
        dallePrompt: compiledDalle,
        recommendedAspect: a.id === 'offer_urgency' ? '9:16' : '1:1',
      },
      metaAdCaptionEn: `🔥 Discover ${prod} by ${brandKit.shopName}!\n\n✓ 100% Certified Original\n📦 Fast & secure shipping\n💵 Satisfaction guaranteed\n\n👉 Order now at ${price}!`,
      metaAdCaptionFr: `🔥 Découvrez ${prod} chez ${brandKit.shopName} !\n\n✓ Qualité certifiée 100% originale\n📦 ${brandKit.deliveryMention || 'Livraison rapide et sécurisée'}\n💵 ${brandKit.offers?.payment || 'Paiement sécurisé disponible'}\n\n👉 Commandez dès maintenant à seulement ${price} !`,
      metaAdCaptionAr: `🔥 اكتشف ${prod} من متجر ${brandKit.shopName}!\n\n✓ جودة أصلية ومضمونة 100%\n📦 شحن سريع ومباشر\n💵 دفع آمن ومريح\n\n👉 اطلب الآن بسعر خاص ${price}!`,
      metaAdCaptionAutre: `${vettedDarija.hooks[0]}\n\n✅ Weslet el commande fi boutique mteena !\n🚚 Livri fisaa fi 24h-48h\n💰 Khlass fel livraison\n\nAbathna message sur WhatsApp bech treservi mteeek tawwa !`,
      metaAdCaptionDarija: `${vettedDarija.hooks[0]}\n\n✅ Weslet el commande fi boutique mteena !\n🚚 Livri fisaa fi 24h-48h\n💰 Khlass fel livraison\n\nAbathna message sur WhatsApp bech treservi mteeek tawwa !`,
    };
  });
}
