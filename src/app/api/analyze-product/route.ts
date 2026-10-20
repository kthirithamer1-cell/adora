import { NextRequest, NextResponse } from 'next/server';
import { getBrandKitByWorkspace, compileBrandPrompt } from '@/lib/brandkit';
import { generateStrategyBriefs } from '@/lib/strategyEngine';
import { getAdBenchmarksForProduct } from '@/lib/adBenchmarks';

export async function POST(req: NextRequest) {
  // Désactivé temporairement selon la demande utilisateur
  return NextResponse.json({
    success: true,
    deactivated: true,
    message: 'L\'analyse de produit est temporairement désactivée.',
    data: {
      category: 'E-commerce',
      dominantColors: ['#00E5FF', '#1E293B'],
      strategyBriefs: [],
      tailoredStyles: [],
    },
  });

  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé OpenAI manquante dans .env' }, { status: 400 });
    }

    const { imageBase64, userNotes, niche, workspaceId, copyLanguage, customDialectNote } = await req.json();
    const effectiveWsId = workspaceId || 'ws_nutristore';
    const brandKit = getBrandKitByWorkspace(effectiveWsId);
    const activeLang = copyLanguage || 'fr';
    const isAutre = activeLang === 'autre';

    const systemPrompt = `Tu es le directeur artistique IA et expert e-commerce d'MarkMosaiq. Tu analyses la photo produit soumise pour concevoir des campagnes publicitaires e-commerce à fort taux de conversion.

RÈGLE D'OR DE LANGUES :
- Nous couvrons STRICTEMENT 3 langues universelles :
  1. ANGLAIS ("en")
  2. FRANÇAIS ("fr")
  3. ARABE LITTÉRAIRE MODERNE / الفصحى ("ar")
- Ne JAMAIS mentionner de mots dialectaux tunisiens ou de Darija par défaut.
- Tout dialecte local (ex: Darija) est EXCLUSIVEMENT réservé au champ optionnel "customDialectHook" lorsque l'option "Autre" est expressément demandée (${isAutre ? `ACTIVÉE avec consigne: "${customDialectNote || 'Dialecte demandé'}"` : 'DÉSACTIVÉE'}).

RÈGLE D'OR POUR visualPrompts : Décrire STRICTEMENT l'environnement physique et le piédestal d'accueil de manière 100% positive. Le sommet du piédestal doit être décrit comme complètement vide, propre et lisse pour accueillir le produit. Ne JAMAIS utiliser de formulation négative ("no bottles", "no text") car cela incite les modèles de diffusion à en générer.

Identité de la marque cliente (${brandKit.shopName}) :
- Secteur : ${brandKit.industry || 'E-commerce'}
- Positionnement : ${brandKit.positioning || 'Premium'}
- Palette de couleurs : ${brandKit.primaryColor} et ${brandKit.secondaryColor}
- Tonalité : ${brandKit.voice?.tone || 'Expert & Convaincant'}

Réponds STRICTEMENT sous format JSON avec ces champs:
{
  "productName": "Nom clair et commercial du produit",
  "category": "Catégorie précise (Nutrition Sportive, Cosmétique & Soins, Mode & Sneakers, Horlogerie & Bijoux, High-Tech, Maison)",
  "dominantColors": ["nom de couleur descriptif (ex: matte charcoal, warm amber, off-white)", "deuxième couleur"],
  "hookHeadlineEn": "Accroche percutante 4 à 6 mots en ANGLAIS (ex: Elevate Your Everyday Style)",
  "hookHeadlineFr": "Accroche percutante 4 à 6 mots en FRANÇAIS (ex: L'Élégance Pure au Quotidien)",
  "hookHeadlineAr": "Accroche percutante en ARABE LITTÉRAIRE الفصحى (ex: الأناقة والجودة العالية بين يديك)",
  "hookHeadline": "Accroche principale dans la langue demandée (${activeLang})",
  "promoBadge": "ex: 🔥 Offre Limitée ou ⭐ Best-Seller",
  "instagramCaption": "Texte court ultra-engageant avec bénéfices clés et appel à l'action dans la langue demandée (${activeLang})",
  "customDialectHook": ${isAutre ? '"Accroche dans le dialecte demandé"' : 'null'},
  "pricingAngle": "Offre ou prix conseillé (ex: 49 DT ou 49 USD)",
  "whatsappText": "Message direct prêt à envoyer pour finaliser la commande en 1 clic",
  "visualPrompts": {
    "productPro": "Prompt en anglais décrivant un piédestal de luxe (marbre, travertin ou titane selon le produit) avec éclairage softbox directionnel à 45 degrés et sommet du piédestal parfaitement vide et lisse",
    "lifestyle": "Prompt en anglais pour une scène de vie authentique floue en arrière-plan, avec une surface d'accueil nette et dégagée au premier plan",
    "ecommerce": "Prompt en anglais pour un packshot catalogue fond clair doux et piédestal minimaliste prêt à recevoir un produit",
    "promo": "Prompt en anglais pour une scène dynamique avec éclairage d'accentuation contrasté et podium central libre",
    "story": "Prompt en anglais pour format vertical 9:16 avec spot directionnel et espaces réservés nets pour les stickers",
    "banner": "Prompt en anglais panoramique pour bannière de site web avec piédestal d'exposition central"
  },
  "tailoredStyles": [
    {
      "id": "luxury",
      "name": "Écrin Titane & Studio Sombre",
      "description": "Ambiance haut de gamme et matière noble adaptée au produit",
      "promptModifier": "English prompt describing the empty pedestal/surface and lighting tuned specifically to this product type, pristine vacant central surface cleanly awaiting an object",
      "bgGradient": "linear-gradient(135deg, #0B0E14, #1E293B)",
      "intentId": "prestige_elevation"
    },
    {
      "id": "minimal",
      "name": "Pureté & Marbre Blanc",
      "description": "Socle minimaliste et lumière naturelle douce",
      "promptModifier": "pure clean minimalist studio pedestal with soft diffused lighting, pristine vacant surface cleanly awaiting an object",
      "bgGradient": "linear-gradient(135deg, #F8FAFC, #E2E8F0)",
      "intentId": "prestige_elevation"
    },
    {
      "id": "dramatic",
      "name": "Impact Néon & Contraste Fort",
      "description": "Éclairage d'accentuation et fort contraste pour stopper le scroll",
      "promptModifier": "high-contrast bold commercial studio staging with dramatic rim lighting and deep atmospheric tones, vacant podium awaiting an object",
      "bgGradient": "linear-gradient(135deg, #0F172A, #6366F1)",
      "intentId": "conversion_flash"
    },
    {
      "id": "lifestyle",
      "name": "Mise en Situation & Lumière Chaleureuse",
      "description": "Scène de vie élégante et naturelle où le produit trouve sa place",
      "promptModifier": "authentic lifestyle setting with warm natural light and textured surface in foreground, clean empty surface awaiting an object",
      "bgGradient": "linear-gradient(135deg, #FED7AA, #FDBA74)",
      "intentId": "lifestyle_authentic"
    },
    {
      "id": "mediterranean_light",
      "name": "Méditerranée & Pierre Calcaire",
      "description": "Lumière dorée naturelle, pierre calcaire douce et atmosphère côtière",
      "promptModifier": "warm sunlit Mediterranean terrace, sunlit limestone balustrade, soft morning coastal light, clean empty surface awaiting an object",
      "bgGradient": "linear-gradient(135deg, #0284C7, #F43F5E)",
      "intentId": "lifestyle_authentic"
    },
    {
      "id": "flash_promo",
      "name": "Offre Flash & Podium Vibrant",
      "description": "Décor à fort impact pour campagne promotionnelle et vente immédiate",
      "promptModifier": "vibrant high-energy commercial advertising podium with sharp glossy accents and dynamic lighting, clean surface awaiting an object",
      "bgGradient": "linear-gradient(135deg, #E11D48, #FF5722)",
      "intentId": "conversion_flash"
    }
  ]
}`;

    const userContent: any[] = [];
    userContent.push({ type: 'text', text: `Niche: ${niche || brandKit.industry || 'Général'}. Notes vendeur: ${userNotes || 'Aucune note'}.` });

    if (imageBase64 && typeof imageBase64 === 'string' && imageBase64.startsWith('data:image')) {
      userContent.push({
        type: 'image_url',
        image_url: { url: imageBase64, detail: 'low' }, // Detail low = 85 tokens
      });
    }

    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1600,
        temperature: 0.7,
      }),
    });

    if (!openAiRes.ok) {
      const errBody = await openAiRes.text();
      throw new Error(`OpenAI API error (${openAiRes.status}): ${errBody}`);
    }

    const data = await openAiRes.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    // Compilation des prompts avec le Brand Kit (MarkMosaiq-41)
    if (parsed.visualPrompts) {
      for (const key of Object.keys(parsed.visualPrompts)) {
        parsed.visualPrompts[key] = compileBrandPrompt(
          brandKit,
          parsed.visualPrompts[key],
          { isStory: key === 'story' }
        );
      }
    }

    // Génération des 5 angles stratégiques de conversion (MarkMosaiq-44)
    const strategyBriefs = await generateStrategyBriefs({
      productName: parsed.productName,
      category: parsed.category,
      brandKit,
      imageBase64,
      copyLanguage: activeLang,
      customDialectNote,
    });

    // Moteur du Directeur Artistique : Extraction directe de l'ADN et des 3 Intentions Créatives depuis l'analyse IA
    const primaryCol = brandKit.palette?.primary || brandKit.primaryColor || '#00E5FF';
    const productDNA = {
      productName: parsed.productName || 'Produit E-commerce',
      brandName: brandKit.shopName || '',
      category: (parsed.category || brandKit.industry || 'general') as any,
      packagingMaterials: Array.isArray(parsed.dominantColors) ? parsed.dominantColors : [],
      dominantTones: Array.isArray(parsed.dominantColors) ? parsed.dominantColors : [primaryCol],
      perceivedPriceLevel: (brandKit.positioning === 'luxury' ? 'luxury' : 'premium') as any,
      lightingAffinity: 'warm_golden' as any,
      surfaceRequirements: parsed.visualPrompts?.productPro || 'clean commercial studio staging pedestal',
      brandKitAlignmentScore: 94,
      brandKitNotes: `Aligné avec la charte de ${brandKit.shopName}.`,
    };

    const priceDisplay = parsed.pricingAngle || 'Offre Spéciale';
    const creativeIntents = [
      {
        id: 'prestige_elevation' as const,
        titleFr: `Écrin Prestige — ${parsed.productName}`,
        subtitle: `Mise en majesté haut de gamme de ${parsed.productName}`,
        targetEmotion: 'Exclusivité, statut et raffinement',
        audienceAngle: 'Clientèle premium et exigeante',
        hookEn: parsed.hookHeadlineEn || `${parsed.productName}: Pure Uncompromising Quality`,
        hookFr: parsed.hookHeadlineFr || `${parsed.productName} : Le Raffinement Sans Compromis`,
        hookAr: parsed.hookHeadlineAr || `${parsed.productName} : قمة التميز والأناقة الحقيقية`,
        hookAutre: parsed.customDialectHook || parsed.hookHeadlineFr,
        hookDarija: parsed.customDialectHook || parsed.hookHeadlineFr,
        badgeText: '✨ Édition Prestige',
        ctaText: 'Découvrir la Collection ➔',
        moodDescription: `Luxury commercial staging for ${parsed.productName}`,
        surfaceMaterial: 'polished Carrara marble pedestal with soft beveled edge',
        surfaceDescriptionFr: 'Socle en marbre noble poli avec éclairage studio zénithal',
        backgroundAtmosphere: 'warm architectural studio interior with soft diffused atmospheric bokeh',
        isRecommended: brandKit.positioning === 'luxury' || brandKit.positioning === 'premium',
      },
      {
        id: 'conversion_flash' as const,
        titleFr: `Offre Flash — ${parsed.productName}`,
        subtitle: `Opportunité immédiate et conversion directe`,
        targetEmotion: 'Urgence d\'achat et opportunité exclusive',
        audienceAngle: 'Acheteurs spontanés et décidés',
        hookEn: parsed.hookHeadlineEn ? `Flash Deal: ${parsed.hookHeadlineEn}` : `Limited Deal: ${parsed.productName}`,
        hookFr: parsed.hookHeadlineFr || `Offre Flash Limitée : ${parsed.productName} (${priceDisplay})`,
        hookAr: parsed.hookHeadlineAr ? `عرض حصري: ${parsed.hookHeadlineAr}` : `عرض حصري محدود على ${parsed.productName}`,
        hookAutre: parsed.customDialectHook || `Offre spéciale sur ${parsed.productName} à ${priceDisplay}`,
        hookDarija: parsed.customDialectHook || `Offre spéciale sur ${parsed.productName} à ${priceDisplay}`,
        badgeText: parsed.promoBadge || '🔥 Offre Limitée',
        ctaText: 'Commander Immédiatement ➔',
        moodDescription: `High impact commercial studio with vibrant ${primaryCol} rim accents`,
        surfaceMaterial: 'matte dark titanium podium with micro-chamfered edge',
        surfaceDescriptionFr: 'Podium titane sombre avec halo lumineux d\'accentuation',
        backgroundAtmosphere: 'clean high-contrast modern studio background with directional softbox',
        isRecommended: brandKit.positioning === 'athletic' || (brandKit.positioning as string) === 'accessible',
      },
      {
        id: 'lifestyle_authentic' as const,
        titleFr: `Authenticité & Quotidien — ${parsed.productName}`,
        subtitle: `Mise en situation naturelle et sincère`,
        targetEmotion: 'Confiance absolue et authenticité',
        audienceAngle: 'Acheteurs en quête de naturel et de recommandation sincère',
        hookEn: parsed.hookHeadlineEn || `Everyday Perfection with ${parsed.productName}`,
        hookFr: parsed.hookHeadlineFr || `L'Authenticité Garantie : Adoptez ${parsed.productName}`,
        hookAr: parsed.hookHeadlineAr || `جودة حقيقية وموثوقة مع ${parsed.productName}`,
        hookAutre: parsed.customDialectHook || `La qualité éprouvée de ${parsed.productName}`,
        hookDarija: parsed.customDialectHook || `La qualité éprouvée de ${parsed.productName}`,
        badgeText: '✓ 100% Authentique',
        ctaText: 'Commander Maintenant ➔',
        moodDescription: `Warm authentic lifestyle atmosphere for ${parsed.productName}`,
        surfaceMaterial: 'natural warm stone plinth with organic texture',
        surfaceDescriptionFr: 'Socle en pierre naturelle et lumière douce du matin',
        backgroundAtmosphere: 'sunlit interior terrace with gentle natural daylight',
        isRecommended: brandKit.positioning === 'artisan' || brandKit.industry === 'food',
      },
    ];

    // Recherche et association des 6 affiches de référence réelles à fort taux de conversion
    const benchmarkStyles = getAdBenchmarksForProduct(parsed.category, parsed.productName);

    return NextResponse.json({
      success: true,
      data: {
        ...parsed,
        tailoredStyles: benchmarkStyles,
        strategyBriefs,
        productDNA,
        creativeIntents,
        brandKitApplied: {
          shopName: brandKit.shopName,
          primaryColor: brandKit.primaryColor,
          industry: brandKit.industry,
        },
      },
    });
  } catch (error: any) {
    console.error('API /api/analyze-product error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
