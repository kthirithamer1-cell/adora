import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { generateBackgroundWithGPTImageFlare25 } from '@/lib/openai';
import {
  FREE_PREVIEW_COOKIE,
  checkFreePreview,
  getClientIp,
  newPreviewToken,
  releaseFreePreview,
  reserveFreePreview,
} from '@/lib/freePreview';

export const maxDuration = 60;

const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const PREVIEW_PROMPT =
  'Premium studio product staging on an elegant stone pedestal, soft natural window light with botanical shadows, warm neutral palette, high-end e-commerce campaign';

/** Ajoute un filigrane "MARKMOSAIQ PREVIEW" et réduit la résolution (aperçu uniquement). */
async function watermarkPreview(dataUrl: string): Promise<string> {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const input = Buffer.from(base64, 'base64');
  const W = 1024;
  const resized = await sharp(input).resize({ width: W, withoutEnlargement: true }).toBuffer();
  const meta = await sharp(resized).metadata();
  const w = meta.width || W;
  const h = meta.height || W;
  const fontSize = Math.round(w * 0.06);

  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-28 ${w / 2} ${h / 2})" fill="#FFFFFF" fill-opacity="0.28"
         font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${fontSize}" text-anchor="middle">
        <text x="${w / 2}" y="${h * 0.3}">MARKMOSAIQ PREVIEW</text>
        <text x="${w / 2}" y="${h * 0.55}">MARKMOSAIQ PREVIEW</text>
        <text x="${w / 2}" y="${h * 0.8}">MARKMOSAIQ PREVIEW</text>
      </g>
    </svg>`;

  const out = await sharp(resized)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 90 })
    .toBuffer();
  return `data:image/jpeg;base64,${out.toString('base64')}`;
}

/**
 * API ROUTE: /api/master-shot/preview
 * Aperçu gratuit sans compte : 1 génération filigranée par visiteur, 0 crédit.
 */
export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  let reserved = false;
  try {
    const body = await req.json().catch(() => null);
    const imageBase64: unknown = body?.imageBase64;

    if (typeof imageBase64 !== 'string' || !/^data:image\/(png|jpe?g|webp);base64,/i.test(imageBase64)) {
      return NextResponse.json({ success: false, error: 'Please upload a JPG, PNG or WEBP image.' }, { status: 400 });
    }
    if (imageBase64.length * 0.75 > MAX_INPUT_BYTES) {
      return NextResponse.json({ success: false, error: 'Image too large (max 8 MB).' }, { status: 400 });
    }

    const eligibility = checkFreePreview(ip, Boolean(req.cookies.get(FREE_PREVIEW_COOKIE)?.value));
    if (!eligibility.allowed) {
      return NextResponse.json({
        success: false,
        code: eligibility.reason === 'ALREADY_USED' ? 'FREE_PREVIEW_USED' : 'FREE_PREVIEW_CAP',
        error: eligibility.reason === 'ALREADY_USED'
          ? 'You already used your free preview. Create a free account to get 5 credits.'
          : 'Free previews are busy today. Create a free account to keep generating.',
      }, { status: 429 });
    }

    reserveFreePreview(ip);
    reserved = true;

    const generated = await generateBackgroundWithGPTImageFlare25(PREVIEW_PROMPT, imageBase64, '1024x1024');
    const previewUrl = await watermarkPreview(generated);

    const res = NextResponse.json({
      success: true,
      masterVisualUrl: previewUrl,
      imageUrl: previewUrl,
      isFreePreview: true,
    });
    res.cookies.set(FREE_PREVIEW_COOKIE, newPreviewToken(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
    return res;
  } catch (error: any) {
    if (reserved) releaseFreePreview(ip);
    console.error('Erreur API /api/master-shot/preview:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Preview generation failed.',
    }, { status: 500 });
  }
}
