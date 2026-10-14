import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { updateBrandKitByWorkspace, BrandKit } from '@/lib/brandkit';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Clé API OpenAI manquante dans les variables d\'environnement.' },
        { status: 400 }
      );
    }

    const session = await getCurrentSession();
    const { url, instagram, description } = await req.json();

    if (!url && !instagram && !description) {
      return NextResponse.json(
        { success: false, error: 'Veuillez renseigner une URL de boutique, un compte Instagram ou une description.' },
        { status: 400 }
      );
    }

    const systemPrompt = `Tu es l'expert mondial en stratégie de marque et directeur artistique e-commerce d'Adora SaaS.
Ton objectif est d'extraire et structurer l'ADN complet de la marque pour un marchand en Tunisie à partir des informations fournies (site web, compte Instagram ou description).
Tu dois renvoyer STRICTEMENT un objet JSON conforme à cette structure :
{
  "shopName": "Nom clair de la boutique",
  "industry": "cosmetics" | "fashion" | "nutrition" | "jewelry" | "tech" | "food" | "home" | "general",
  "positioning": "luxury" | "premium" | "affordable" | "playful" | "athletic" | "artisan",
  "palette": {
    "primary": "#CodeHex (couleur identitaire principale)",
    "secondary": "#CodeHex",
    "accent": "#CodeHex (couleur vibrante pour les boutons et badges)",
    "background": "#07090E ou #FFFFFF"
  },
  "fonts": {
    "headline": "Nom de la police de titrage (ex: Outfit, Plus Jakarta Sans, Playfair Display)",
    "body": "Nom de la police de corps (ex: Plus Jakarta Sans, Inter)"
  },
  "voice": {
    "tone": "expert" | "complice" | "urgent" | "prestige" | "playful",
    "languages": ["fr", "darija"],
    "forbiddenWords": ["3 mots ou expressions interdites ou non appropriées pour ce positionnement"]
  },
  "audience": {
    "age": "Tranche d'âge cible (ex: 20-35 ans)",
    "gender": "all" | "women" | "men",
    "governorates": ["Tunis", "Sousse", "Sfax"],
    "painPoints": ["3 problèmes ou craintes majeurs des clients locaux"]
  },
  "visualStyle": {
    "mood": "Description du mood visuel en anglais (ex: Minimalist warm travertine stone, soft organic daylight)",
    "lighting": "Description de l'éclairage de scène en anglais (ex: Warm directional sunlight, soft diffused ambient fill)"
  },
  "sloganFr": "Slogan marquant en français orienté bénéfice",
  "sloganDarija": "Slogan percutant en vrai Darija tunisien",
  "offers": {
    "delivery": "Mention de livraison locale (ex: Livraison express 24-48h sur les 24 gouvernorats)",
    "payment": "Paiement à la livraison (El khlass waqt el livri) & Flouci",
    "guarantee": "Mention de garantie commerciale"
  }
}`;

    const userMessage = `Analyse cette boutique :
- URL du site : ${url || 'Non renseigné'}
- Compte Instagram : ${instagram || 'Non renseigné'}
- Description libre : ${description || 'Non renseignée'}`;

    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      }),
    });

    if (!openAiRes.ok) {
      const errText = await openAiRes.text();
      throw new Error(`OpenAI API error (${openAiRes.status}): ${errText}`);
    }

    const aiData = await openAiRes.json();
    const extracted = JSON.parse(aiData.choices[0].message.content);

    // Mise à jour automatique du Brand Kit du workspace actif
    const updatedKit = updateBrandKitByWorkspace(session.workspace.id, {
      shopName: extracted.shopName || session.workspace.name,
      industry: extracted.industry || 'general',
      positioning: extracted.positioning || 'premium',
      primaryColor: extracted.palette?.primary || '#00E5FF',
      secondaryColor: extracted.palette?.secondary || '#FF5722',
      accentColor: extracted.palette?.accent || '#10B981',
      fontFamily: `${extracted.fonts?.headline || 'Outfit'}, sans-serif`,
      sloganFr: extracted.sloganFr || '',
      sloganDarija: extracted.sloganDarija || '',
      palette: extracted.palette,
      fonts: extracted.fonts,
      voice: extracted.voice,
      audience: extracted.audience,
      visualStyle: extracted.visualStyle,
      offers: extracted.offers,
    });

    return NextResponse.json({
      success: true,
      data: updatedKit,
      rawExtraction: extracted,
      message: 'Brand Kit extrait et configuré avec succès par l\'IA !',
    });
  } catch (error: any) {
    console.error('API /api/brand-kit/extract error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de l\'extraction du Brand Kit.' },
      { status: 500 }
    );
  }
}
