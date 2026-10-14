import { NextRequest, NextResponse } from 'next/server';
import { uploadBase64Image } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, folder = 'renders' } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json({ success: false, error: 'Données imageBase64 manquantes' }, { status: 400 });
    }

    const result = await uploadBase64Image(imageBase64, folder);

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      size: result.size,
      provider: result.provider,
    });
  } catch (error: any) {
    console.error('API /api/upload error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur lors du téléversement' }, { status: 500 });
  }
}
