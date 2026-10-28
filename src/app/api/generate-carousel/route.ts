import { NextRequest, NextResponse } from 'next/server';
import { checkCreditBalance, deductCredit } from '@/lib/billing';
import { recordApiUsage } from '@/lib/apiUsageLogger';
import { generateCarouselWithGPTImageFlare25 } from '@/lib/openai';

// Format fixe pour la feuille carrousel 3-en-1 (3 panneaux 1024x1536 = 3232x1440)
const CAROUSEL_SHEET_SIZE = '3232x1440';

/**
 * API ROUTE: /api/generate-carousel
 * 
 * Simple prompt-driven carousel generation using generateCarouselWithGPTImageFlare25.
 * Focuses directly on the user prompt without art direction, style matrices, or predefined headlines.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const {
      imageBase64,
      cutoutBase64,
      prompt = '',
      productName = 'Produit E-commerce',
      aspect = '4:5',
      quality = 'medium',
      workspaceId = 'ws_nutristore',
    } = body;

    const rawProductImage = cutoutBase64 || imageBase64;
    if (!rawProductImage) {
      return NextResponse.json(
        { success: false, error: 'Une image du produit est obligatoire.' },
        { status: 400 }
      );
    }

    // 1. Vérification du solde (3 crédits requis pour 3 slides)
    const requiredCredits = 3;
    const balanceCheck = await checkCreditBalance(workspaceId, requiredCredits);
    if (!balanceCheck.sufficient) {
      return NextResponse.json(
        {
          success: false,
          error: `Solde insuffisant pour un carrousel (${balanceCheck.remaining} crédit(s) restant(s), 3 requis). Veuillez recharger vos crédits.`,
          code: 'INSUFFICIENT_CREDITS',
          creditsRemaining: balanceCheck.remaining,
        },
        { status: 402 }
      );
    }

    console.log('\n============================================================');
    console.log(`🎠 [API /api/generate-carousel] Direct Prompt Generation with GPT-Image-Flare-2.5`);
    console.log(`📦 Produit: "${productName}" | Format Contact Sheet: ${CAROUSEL_SHEET_SIZE}`);
    console.log(`🎯 Prompt: "${prompt}"`);
    console.log('============================================================\n');

    // 2. Génération directe via GPT-Image-Flare-2.5 avec la dimension panoramique fixe 3232x1440
    const slides = await generateCarouselWithGPTImageFlare25(rawProductImage, {
      prompt,
      productName,
      size: CAROUSEL_SHEET_SIZE,
      quality,
      slideCount: 3,
    });

    // 3. Débit des crédits
    const deductResult = await deductCredit(workspaceId, requiredCredits, {
      productName,
      category: 'carousel_gpt_image_flare25',
      aspect,
    });

    const durationMs = Date.now() - startTime;

    // 4. Enregistrement analytique
    recordApiUsage({
      workspaceId,
      endpoint: '/api/generate-carousel',
      model: 'gpt-image-2.5-flare',
      latencyMs: durationMs,
      statusCode: 200,
      status: 'SUCCESS',
      costUSD: 0.12,
      creditsDeducted: requiredCredits,
      productName,
      category: 'carousel_direct_prompt',
      details: {
        aspect,
        size: CAROUSEL_SHEET_SIZE,
        slidesCount: slides.length,
        prompt,
      },
    });

    return NextResponse.json({
      success: true,
      slides,
      aspect,
      size: CAROUSEL_SHEET_SIZE,
      creditsDeducted: requiredCredits,
      creditsRemaining: deductResult.remaining,
      durationMs,
    });
  } catch (error: any) {
    console.error('API /api/generate-carousel error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Erreur lors de la génération de la campagne carrousel.',
      },
      { status: 500 }
    );
  }
}

