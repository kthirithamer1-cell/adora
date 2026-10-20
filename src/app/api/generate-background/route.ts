import { NextRequest, NextResponse } from 'next/server';
import { generateBackgroundWithGPTImageFlare25 } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, size, imageBase64, cutoutBase64 } = await req.json().catch(() => ({}));

    const effectivePrompt = (typeof prompt === 'string' && prompt.trim())
      ? prompt.trim()
      : 'Luxury minimalist commercial studio staging with warm directional lighting, pristine polished podium cleanly awaiting a product';

    const imageUrl = await generateBackgroundWithGPTImageFlare25(
      effectivePrompt,
      cutoutBase64 || imageBase64 || '',
      (size === '1024x1024' || size === '1536x1024' ? size : '1024x1536')
    );
    console.log('🌄 [API generate-background] Fond gpt-image-2.5-flare généré avec succès !');
    console.log('🔗 [API generate-background] Lien du fond:', imageUrl);
    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    console.error('API /api/generate-background error:', error);
    return NextResponse.json({ error: error.message || 'Erreur génération fond' }, { status: 500 });
  }
}
