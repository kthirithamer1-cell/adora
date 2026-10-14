import { NextRequest, NextResponse } from 'next/server';
import { analyzeProductWithGPT4o } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image requise' }, { status: 400 });
    }

    const analysis = await analyzeProductWithGPT4o(imageBase64);
    return NextResponse.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('API /api/analyze error:', error);
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}
