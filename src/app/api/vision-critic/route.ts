import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getBrandKitByWorkspace } from '@/lib/brandkit';
import { evaluateImageVariant } from '@/lib/visionCritic';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const { imageUrl, productName, aspect } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Une URL d\'image est requise pour l\'évaluation.' },
        { status: 400 }
      );
    }

    const brandKit = getBrandKitByWorkspace(session.workspace.id);

    const evaluation = await evaluateImageVariant({
      imageUrl,
      productName,
      brandKit,
      aspect,
    });

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error: any) {
    console.error('API /api/vision-critic error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de l\'évaluation Vision Critic.' },
      { status: 500 }
    );
  }
}
