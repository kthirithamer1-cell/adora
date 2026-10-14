import { NextRequest, NextResponse } from 'next/server';
import { getBrandKitByWorkspace, compileBrandPrompt } from '@/lib/brandkit';
import { generateStrategyBriefs } from '@/lib/strategyEngine';
import { analyzeProductDNA, generateCreativeIntents } from '@/lib/artDirector';
import { getAdBenchmarksForProduct } from '@/lib/adBenchmarks';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Clé OpenAI manquante dans .env' }, { status: 400 });
    }

    const { imageBase64, userNotes, niche, workspaceId } = await req.json();
    const effectiveWsId = workspaceId || 'ws_nutristore';
    const brandKit = getBrandKitByWorkspace(effectiveWsId);

    const systemPrompt = `Tu es le directeur artistique IA et expert e-commerce d'ADORA. Tu analyses la photo produit soumise pour concevoir des campagnes publicitaires à fort taux de conversion pour le marché tunisien.
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
  "hookHeadline": "Titre choc 4 à 6 mots orienté bénéfice client",
  "promoBadge": "ex: 🔥 Offre Limitée ou 🚚 Livraison 24 Gouvernorats",
  "instagramCaption": "Texte court ultra-engageant avec bénéfices clés, appel à l'action et hashtags tunisiens populaires",
  "darijaHook": "Phrase d'accroche percutante en vrai Darija tunisien certifié (ex: Weslet el commande fi boutique mteena, el khlass waqt el livri)",
  "pricingAngle": "Offre ou prix conseillé en DT (ex: 49 DT au lieu de 79 DT)",
  "whatsappText": "Message direct prêt à envoyer sur WhatsApp pour finaliser la commande en 1 clic",
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
      "name": "Nom du style haut de gamme adapté à ce produit (ex: Écrin Titane & Studio Sombre)",
      "description": "Description en 1 phrase de l'ambiance et de la matière adaptées au produit",
      "promptModifier": "English prompt describing the empty pedestal/surface and lighting tuned specifically to this product type, pristine vacant central surface cleanly awaiting an object",
      "bgGradient": "linear-gradient(135deg, #0B0E14, #1E293B)",
      "intentId": "prestige_elevation"
    },
    {
      "id": "minimal",
      "name": "Nom du style épuré (ex: Pureté & Marbre Blanc)",
      "description": "Description du socle minimaliste et de la lumière naturelle",
      "promptModifier": "pure clean minimalist studio pedestal with soft diffused lighting, pristine vacant surface cleanly awaiting an object",
      "bgGradient": "linear-gradient(135deg, #F8FAFC, #E2E8F0)",
      "intentId": "prestige_elevation"
    },
    {
      "id": "dramatic",
      "name": "Nom du style dynamique (ex: Impact Néon & Contraste Fort)",
      "description": "Éclairage d'accentuation et fort contraste pour stopper le scroll",
      "promptModifier": "high-contrast bold commercial studio staging with dramatic rim lighting and deep atmospheric tones, vacant podium awaiting an object",
      "bgGradient": "linear-gradient(135deg, #0F172A, #6366F1)",
      "intentId": "conversion_flash"
    },
    {
      "id": "lifestyle",
      "name": "Nom du style lifestyle adapté (ex: Bureau Exécutif ou Intérieur Chaleureux)",
      "description": "Mise en situation réelle où le client utilise ce produit",
      "promptModifier": "authentic lifestyle setting with warm natural light and textured surface in foreground, clean empty surface awaiting an object",
      "bgGradient": "linear-gradient(135deg, #FED7AA, #FDBA74)",
      "intentId": "lifestyle_authentic"
    },
    {
      "id": "tunisian_terroir",
      "name": "Sidi Bou Saïd & Méditerranée",
      "description": "Lumière dorée tunisienne, pierre calcaire et atmosphère côtière",
      "promptModifier": "Sidi Bou Said Mediterranean terrace, sunlit warm limestone balustrade, soft morning coastal light, clean empty surface awaiting an object",
      "bgGradient": "linear-gradient(135deg, #0284C7, #F43F5E)",
      "intentId": "lifestyle_authentic"
    },
    {
      "id": "flash_promo",
      "name": "Nom du style offre flash (ex: Offre Flash & Podium Rouge/Or)",
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

    // Compilation des prompts avec le Brand Kit (ADORA-41)
    if (parsed.visualPrompts) {
      for (const key of Object.keys(parsed.visualPrompts)) {
        parsed.visualPrompts[key] = compileBrandPrompt(
          brandKit,
          parsed.visualPrompts[key],
          { isStory: key === 'story' }
        );
      }
    }

    // Génération des 5 angles stratégiques de conversion (ADORA-44)
    const strategyBriefs = await generateStrategyBriefs({
      productName: parsed.productName,
      category: parsed.category,
      brandKit,
      imageBase64,
    });

    // Moteur du Directeur Artistique : Extraction du ProductDNA & des 3 Intentions Créatives
    const productDNA = await analyzeProductDNA({
      imageBase64,
      productName: parsed.productName,
      brandKit,
      userNotes,
    });

    const creativeIntents = await generateCreativeIntents({
      productDNA,
      brandKit,
    });

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
