import { NextRequest, NextResponse } from 'next/server';
import { checkCreditBalance, deductCredit } from '@/lib/billing';
import { recordApiUsage } from '@/lib/apiUsageLogger';
import { editGeneratedImageWithGPTImageFlare25 } from '@/lib/openai';
import { EDIT_CREDIT_COST, isNextEditFree, recordEdit } from '@/lib/editAllowance';

export const maxDuration = 60;

const SIZE_BY_ASPECT: Record<string, '1024x1024' | '1024x1536'> = {
  '1:1': '1024x1024',
  '9:16': '1024x1536',
  '1.91:1': '1024x1024',
};

/**
 * API ROUTE: /api/master-shot/edit
 * Édition IA d'un visuel généré. 1ère édition par génération offerte, ensuite 1 crédit.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const {
      generationId,
      imageBase64,
      instruction,
      aspect = '1:1',
      workspaceId = 'ws_nutristore',
      productName = 'Produit E-commerce',
      primaryColor,
      secondaryColor,
    } = body ?? {};

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ success: false, error: 'Visuel à éditer manquant.' }, { status: 400 });
    }
    if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
      return NextResponse.json({ success: false, error: "Décrivez la modification souhaitée." }, { status: 400 });
    }

    const isFree = isNextEditFree(generationId, workspaceId);

    if (!isFree) {
      const balance = await checkCreditBalance(workspaceId, EDIT_CREDIT_COST);
      if (!balance.sufficient) {
        return NextResponse.json({
          success: false,
          error: `Solde insuffisant (${balance.remaining} crédit restant). Votre édition gratuite a déjà été utilisée pour ce visuel.`,
          code: 'INSUFFICIENT_CREDITS',
          creditsRemaining: balance.remaining,
        }, { status: 402 });
      }
    }

    const editedUrl = await editGeneratedImageWithGPTImageFlare25(
      imageBase64,
      instruction,
      SIZE_BY_ASPECT[aspect] || '1024x1024',
      { primary: primaryColor, secondary: secondaryColor }
    );

    let creditsRemaining: number | undefined;
    if (!isFree) {
      const deduction = await deductCredit(workspaceId, EDIT_CREDIT_COST, {
        productName,
        category: 'studio_edit',
        aspect,
      });
      creditsRemaining = deduction.remaining;
    }
    const editsUsed = recordEdit(generationId, workspaceId);

    recordApiUsage({
      workspaceId,
      endpoint: '/api/master-shot/edit',
      model: 'gpt-image-2.5-flare',
      totalTokens: 1,
      latencyMs: Date.now() - startTime,
      statusCode: 200,
      status: 'SUCCESS',
      costUSD: 0.04,
      creditsDeducted: isFree ? 0 : EDIT_CREDIT_COST,
      productName,
      category: 'studio_edit',
      details: { instruction, aspect, generationId, wasFree: isFree },
    });

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: editedUrl,
        wasFree: isFree,
        creditsCharged: isFree ? 0 : EDIT_CREDIT_COST,
        editsUsed,
        creditsRemaining,
      },
    });
  } catch (error: any) {
    console.error('Erreur API /api/master-shot/edit:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || "Erreur lors de l'édition du visuel.",
    }, { status: 500 });
  }
}

