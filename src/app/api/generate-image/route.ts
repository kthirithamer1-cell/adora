import { NextRequest, NextResponse } from 'next/server';
import { checkCreditBalance, deductCredit } from '@/lib/billing';
import { recordApiUsage } from '@/lib/apiUsageLogger';
import { buildArtDirectedPrompt } from '@/lib/artDirector';
import { generateBackgroundWithGPTImageFlare25 } from '@/lib/openai';

// Tailles officielles supportées
const SIZE_BY_ASPECT: Record<string, '1024x1024' | '1024x1536' | '1536x1024'> = {
  '1:1': '1024x1024',
  '2:3': '1024x1536', // Portrait : Story, Reels
  '9:16': '1024x1536',
  '3:2': '1536x1024', // Paysage : Bannière web
  '1.91:1': '1536x1024',
};

/**
 * API ROUTE: /api/generate-image
 * 
 * Génération simplifiée d'image complète en un seul appel direct à OpenAI (gpt-image-2.5-flare).
 * Plus de double génération ni de compositing Sharp lourd.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const {
      prompt,
      aspect = '1:1',
      quality = 'medium',
      category,
      productName,
      brandName,
      style,
      workspaceId = 'ws_nutristore',
      imageBase64,
      cutoutBase64,
    } = body;
    const rawProductImage = cutoutBase64 || imageBase64;

    // 1. Vérification du solde avant exécution
    const balanceCheck = await checkCreditBalance(workspaceId, 1);
    if (!balanceCheck.sufficient) {
      return NextResponse.json({
        success: false,
        error: `Solde insuffisant (${balanceCheck.remaining} crédit restant). Rechargez votre pack pour générer de nouveaux visuels.`,
        code: 'INSUFFICIENT_CREDITS',
        creditsRemaining: balanceCheck.remaining,
      }, { status: 402 });
    }

    // 2. Formulation du prompt complet via la Direction Artistique
    const finalPrompt = (typeof prompt === 'string' && prompt.trim())
      ? prompt.trim()
      : buildArtDirectedPrompt({
        productName: productName || 'Produit E-commerce',
        brandName,
        category,
        styleName: style,
        aspect,
      });

    const size = SIZE_BY_ASPECT[aspect] || '1024x1024';

    console.log('\n============================================================');
    console.log('🖼️ [API /api/generate-image] Appel UNIQUE gpt-image-2.5-flare avec transmission base64');
    console.log(`📐 Aspect: ${aspect} (${size}) | Produit: ${productName || 'N/A'}`);
    console.log('📝 Prompt transmis:');
    console.log(finalPrompt);
    console.log('============================================================\n');

    const artDirectionPrompt = finalPrompt;
    const transparentProductCutoutBase64 = cutoutBase64 || rawProductImage || '';

    const imageUrl = await generateBackgroundWithGPTImageFlare25(
      artDirectionPrompt,
      transparentProductCutoutBase64,
      size
    );

    // 4. Débit du crédit
    const deductResult = await deductCredit(workspaceId, 1, {
      productName: productName || 'Scène Commerciale IA',
      category: category || 'studio',
      aspect,
    });

    const durationMs = Date.now() - startTime;
    recordApiUsage({
      workspaceId,
      endpoint: '/api/generate-image',
      model: 'gpt-image-2.5-flare',
      latencyMs: durationMs,
      statusCode: 200,
      status: 'SUCCESS',
      costUSD: 0.04,
      creditsDeducted: 1,
      productName: productName || 'Scène Commerciale IA',
      category: category || 'studio',
      details: { aspect, size, prompt: finalPrompt },
    });

    const finalFormats = {
      instagram: imageUrl,
      facebook: imageUrl,
      story: imageUrl,
    };

    return NextResponse.json({
      success: true,
      images: [imageUrl],
      url: imageUrl,
      aiBackdropUrl: imageUrl,
      formats: finalFormats,
      data: [{ url: imageUrl }],
      category,
      modelUsed: 'gpt-image-2.5-flare',
      size,
      creditsRemaining: deductResult.remaining,
      durationMs,
    });
  } catch (error: any) {
    console.error('API /api/generate-image error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Erreur lors de la génération de l\'image.',
    }, { status: 500 });
  }
}
