import { NextRequest, NextResponse } from 'next/server';
import { checkCreditBalance, deductCredit } from '@/lib/billing';
import { recordApiUsage } from '@/lib/apiUsageLogger';
import { getBrandKitByWorkspace } from '@/lib/brandkit';
import { buildArtDirectedPrompt } from '@/lib/artDirector';
import { generateBackgroundWithGPTImageFlare25 } from '@/lib/openai';

export const maxDuration = 60; // 60s timeout support for image generation

const SIZE_BY_ASPECT: Record<string, '1024x1024' | '1024x1536'> = {
  '1:1': '1024x1024',
  '9:16': '1024x1536',
  '1.91:1': '1024x1024',
};

/**
 * API ROUTE: /api/master-shot
 * 
 * Génération de visuel publicitaire d'élite avec préservation absolue du produit réel :
 * 1. La Direction Artistique et l'utilisateur définissent le prompt de mise en scène.
 * 2. Un appel direct à gpt-image-2.5-flare génère le décor studio/commercial haut de gamme avec socle vacant.
 * 3. Si un produit réel a été téléversé, il est détouré et incrusté fidèlement sur le décor avec ombres physiques réelles.
 * 4. Si aucun produit n'est fourni, l'image IA complète est renvoyée directement.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const {
      productName = 'Produit E-commerce',
      brandName,
      styleName,
      stylePrompt,
      userEditedPrompt,
      prompt,
      aspect = '1:1',
      workspaceId = 'ws_nutristore',
      intentId,
      cutoutBase64,
      imageBase64,
      brandLogoUrl,
    } = body;

    // 1. Vérification du solde de crédits
    const balanceCheck = await checkCreditBalance(workspaceId, 1);
    if (!balanceCheck.sufficient) {
      return NextResponse.json({
        success: false,
        error: `Solde insuffisant (${balanceCheck.remaining} crédit restant). Rechargez votre pack pour générer votre visuel.`,
        code: 'INSUFFICIENT_CREDITS',
        creditsRemaining: balanceCheck.remaining,
      }, { status: 402 });
    }

    // 2. Chargement de l'identité de marque du marchand
    const brandKit = getBrandKitByWorkspace(workspaceId);
    const effectiveBrand = brandName || brandKit?.shopName || '';

    // 3. Détection de la présence d'une image réelle de produit
    const rawProductImage = cutoutBase64 || imageBase64;
    const hasProductImage = Boolean(
      rawProductImage &&
      typeof rawProductImage === 'string' &&
      rawProductImage !== '/images/image.png' &&
      rawProductImage.length > 30
    );

    console.log(`📸 [master-shot] Produit détecté : hasProductImage=${hasProductImage}, rawLength=${rawProductImage?.length || 0}, isCutout=${Boolean(cutoutBase64)}`);

    // 4. Synthèse du prompt par la Direction Artistique (ou prompt édité par l'utilisateur)
    const rawPrompt = (userEditedPrompt || prompt || stylePrompt);
    const basePrompt = (rawPrompt && typeof rawPrompt === 'string' && rawPrompt.trim())
      ? rawPrompt.trim()
      : buildArtDirectedPrompt({
          productName,
          brandName: effectiveBrand,
          styleName,
          promptModifier: stylePrompt,
          intentId,
          aspect,
        });

    // Utiliser STRICTEMENT le prompt fourni par l'utilisateur sans ajout automatique
    const promptToSend = basePrompt;

    // 5. Détermination de la taille selon le format
    const targetSize = SIZE_BY_ASPECT[aspect] || '1024x1024';

    console.log('\n============================================================');
    console.log('🚀 [/api/master-shot] Appel gpt-image-2.5-flare');
    console.log(`📐 Aspect: ${aspect} (${targetSize}) | Produit: ${productName} | Préservation réelle: ${hasProductImage}`);
    console.log('📝 Prompt transmis :');
    console.log(promptToSend);
    console.log('============================================================\n');

    const artDirectionPrompt = promptToSend;
    const originalProductImageBase64 = imageBase64 || cutoutBase64 || '';
    const transparentProductCutoutBase64 = cutoutBase64 || imageBase64 || '';

    const result = await generateBackgroundWithGPTImageFlare25(
  artDirectionPrompt,
  originalProductImageBase64,
  SIZE_BY_ASPECT[aspect] || "1024x1024"
);

    const finalImageUrl = result;

    // 8. Déduction du crédit & Enregistrement de l'usage
    const deduction = await deductCredit(workspaceId, 1, {
      productName,
      category: 'studio',
      aspect,
    });

    recordApiUsage({
      workspaceId,
      endpoint: '/api/master-shot',
      model: 'gpt-image-2.5-flare',
      totalTokens: 1,
      latencyMs: Date.now() - startTime,
      statusCode: 200,
      status: 'SUCCESS',
      costUSD: 0.04,
      creditsDeducted: 1,
      productName,
      category: 'studio',
      details: {
        prompt: promptToSend,
        aspect,
        preservedRealProduct: hasProductImage,
      },
    });

    // 9. Retour du visuel généré
    return NextResponse.json({
      success: true,
      masterVisualUrl: finalImageUrl,
      imageUrl: finalImageUrl,
      promptUsed: promptToSend,
      formats: {
        feed: finalImageUrl,
        story: finalImageUrl,
        banner: finalImageUrl,
      },
      creditsRemaining: deduction.remaining,
      durationMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Erreur API /api/master-shot:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Erreur lors de la génération de l\'image.',
    }, { status: 500 });
  }
}
