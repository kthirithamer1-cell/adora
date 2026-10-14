import { NextRequest, NextResponse } from 'next/server';
import { generateBackgroundWithDALLE } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, size } = await req.json().catch(() => ({}));

    const effectivePrompt = (typeof prompt === 'string' && prompt.trim())
      ? prompt.trim()
      : 'Sidi Bou Said Mediterranean terrace, sunlit warm stone balustrade, vibrant bougainvillea flowers';

    const imageUrl = await generateBackgroundWithDALLE(effectivePrompt, size || '1024x1024');
    console.log('🌄 [API generate-background] Fond généré avec succès !');
    console.log('🔗 [API generate-background] Lien du fond:', imageUrl);
    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('API /api/generate-background error:', error);
    return NextResponse.json({ error: error.message || 'Erreur DALL-E' }, { status: 500 });
  }
}
