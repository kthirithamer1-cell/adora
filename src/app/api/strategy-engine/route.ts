import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getBrandKitByWorkspace } from '@/lib/brandkit';
import { generateStrategyBriefs, StrategyEngineInput } from '@/lib/strategyEngine';
import { recordApiUsage, calculateApiCost } from '@/lib/apiUsageLogger';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await getCurrentSession();
    const body = await req.json();

    const {
      productName,
      brandName,
      category,
      priceTND,
      originalPriceTND,
      productDescription,
      imageBase64,
    } = body;

    if (!productName) {
      return NextResponse.json(
        { success: false, error: 'Le nom du produit est requis.' },
        { status: 400 }
      );
    }

    const brandKit = getBrandKitByWorkspace(session.workspace.id);

    const input: StrategyEngineInput = {
      productName,
      brandName,
      category,
      priceTND: priceTND ? Number(priceTND) : undefined,
      originalPriceTND: originalPriceTND ? Number(originalPriceTND) : undefined,
      productDescription,
      imageBase64,
      brandKit,
    };

    const briefs = await generateStrategyBriefs(input);

    const durationMs = Date.now() - startTime;
    const estimatedPromptTokens = 420;
    const estimatedCompletionTokens = 350;
    const totalTokens = estimatedPromptTokens + estimatedCompletionTokens;
    const apiCost = calculateApiCost('gpt-4o-mini', {
      promptTokens: estimatedPromptTokens,
      completionTokens: estimatedCompletionTokens,
    });

    recordApiUsage({
      workspaceId: session.workspace.id,
      workspaceName: session.workspace.name,
      endpoint: '/api/strategy-engine',
      model: 'gpt-4o-mini',
      promptTokens: estimatedPromptTokens,
      completionTokens: estimatedCompletionTokens,
      totalTokens,
      latencyMs: durationMs,
      statusCode: 200,
      status: 'SUCCESS',
      costUSD: apiCost.costUSD,
      costTND: apiCost.costTND,
      creditsDeducted: 0,
      productName,
      category: category || 'ecommerce',
      details: { anglesCount: briefs.length },
    });

    return NextResponse.json({
      success: true,
      data: briefs,
      count: briefs.length,
      tokensUsed: totalTokens,
      apiCostTND: apiCost.costTND,
      brandKitUsed: {
        shopName: brandKit.shopName,
        industry: brandKit.industry,
        positioning: brandKit.positioning,
        primaryColor: brandKit.primaryColor,
      },
    });
  } catch (error: any) {
    console.error('API /api/strategy-engine error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la génération des angles stratégiques.' },
      { status: 500 }
    );
  }
}
