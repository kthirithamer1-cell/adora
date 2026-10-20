import { NextRequest, NextResponse } from 'next/server';
import { processClassicalCutout, ClassicalCutoutOptions } from '@/lib/classicalMatting';

export async function POST(req: NextRequest) {
  try {
    const { images, options = {} } = await req.json();

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Liste d’images requise pour le traitement par lot' },
        { status: 400 }
      );
    }

    // Limiter la taille du lot à 50 par requête pour préserver la mémoire du serveur
    const batchList = images.slice(0, 50);
    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < batchList.length; i++) {
      const item = batchList[i];
      const imageBase64 = typeof item === 'string' ? item : item.imageBase64;
      const fileName = (typeof item === 'object' && item.name) ? item.name : `produit_${i + 1}.png`;

      try {
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const inputBuffer = Buffer.from(base64Data, 'base64');

        const cutoutRes = await processClassicalCutout(inputBuffer, options as ClassicalCutoutOptions);

        results.push({
          success: true,
          fileName,
          transparentBase64: cutoutRes.transparentBase64,
          processedBase64: cutoutRes.processedBase64,
          width: cutoutRes.dimensions.width,
          height: cutoutRes.dimensions.height,
          confidenceScore: cutoutRes.analysis.confidenceScore,
          confidenceLevel: cutoutRes.analysis.confidenceLevel,
          processingTimeMs: cutoutRes.processingTimeMs,
        });
      } catch (err: any) {
        results.push({
          success: false,
          fileName,
          error: err.message,
        });
      }
    }

    const totalTimeMs = Date.now() - startTime;
    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      totalCount: batchList.length,
      successCount,
      totalTimeMs,
      results,
    });
  } catch (error: any) {
    console.error('Batch cutout error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
