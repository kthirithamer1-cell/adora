import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { removeBackgroundWithOpenAI } from '@/lib/openai';
import { checkCreditBalance, deductCredit } from '@/lib/billing';
import { recordApiUsage } from '@/lib/apiUsageLogger';
import { getCurrentSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { imageBase64, sampleFile, workspaceId } = await req.json();

    // 1. Détermination du workspace actif
    let targetWorkspaceId = workspaceId;
    if (!targetWorkspaceId) {
      const session = await getCurrentSession();
      if (session?.workspace?.id) {
        targetWorkspaceId = session.workspace.id;
      } else {
        targetWorkspaceId = 'ws_nutristore';
      }
    }

    // 2. Vérification préalable du solde (1 crédit par détourage IA)
    const balanceCheck = checkCreditBalance(targetWorkspaceId, 1);
    if (!balanceCheck.sufficient) {
      return NextResponse.json({
        success: false,
        error: `Solde insuffisant (${balanceCheck.remaining} crédit restant). Rechargez votre pack pour détourer vos produits.`,
        code: 'INSUFFICIENT_CREDITS',
        creditsRemaining: balanceCheck.remaining,
      }, { status: 402 });
    }

    let inputBase64 = imageBase64;

    if (!inputBase64 && sampleFile && typeof sampleFile === 'string') {
      const fullPath = path.join(process.cwd(), 'public', sampleFile.replace(/^\//, ''));
      if (!fs.existsSync(fullPath)) {
        return NextResponse.json({ success: false, error: 'Fichier introuvable' }, { status: 404 });
      }
      const buffer = fs.readFileSync(fullPath);
      inputBase64 = `data:image/png;base64,${buffer.toString('base64')}`;
    }

    if (!inputBase64) {
      return NextResponse.json({ success: false, error: 'Image manquante' }, { status: 400 });
    }

    // Utilisation exclusive de la fonction IA removeBackgroundWithOpenAI
    const transparentBase64 = await removeBackgroundWithOpenAI(inputBase64);

    let width = 1024;
    let height = 1024;
    try {
      const buf = Buffer.from(transparentBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      const meta = await sharp(buf).metadata();
      if (meta.width) width = meta.width;
      if (meta.height) height = meta.height;
    } catch {
      // ignore
    }

    // 3. Débit du crédit après confirmation du détourage réussi
    const deductResult = deductCredit(targetWorkspaceId, 1, {
      productName: 'Détourage IA Produit',
      category: 'cutout',
      aspect: `${width}x${height}`,
    });

    const durationMs = Date.now() - startTime;
    recordApiUsage({
      workspaceId: targetWorkspaceId,
      endpoint: '/api/cutout',
      model: 'openai-vision-cutout',
      latencyMs: durationMs,
      statusCode: 200,
      status: 'SUCCESS',
      costUSD: 0.02,
      creditsDeducted: 1,
      productName: 'Détourage IA Produit',
      category: 'cutout',
      details: { width, height },
    });

    return NextResponse.json({
      success: true,
      transparentBase64,
      width,
      height,
      creditsRemaining: deductResult.remaining,
      creditsDeducted: 1,
    });
  } catch (error: any) {
    console.error('API /api/cutout error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// GET pour générer automatiquement les assets transparents par défaut
export async function GET() {
  try {
    const publicImages = path.join(process.cwd(), 'public', 'images');
    const gncPath = path.join(publicImages, 'gnc_pro_whey_tub_1791150838901.jpg');
    const outPath = path.join(publicImages, 'whey_gnc_clean.png');

    if (fs.existsSync(gncPath)) {
      const { data, info } = await sharp(gncPath)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (r >= 240 && g >= 240 && b >= 240) {
          data[i + 3] = 0;
        } else if (r >= 222 && g >= 222 && b >= 222) {
          const avg = (r + g + b) / 3;
          const factor = (240 - avg) / 18;
          data[i + 3] = Math.min(255, Math.max(0, Math.round(factor * 255)));
        }
      }

      await sharp(data, {
        raw: { width: info.width, height: info.height, channels: 4 },
      })
        .png()
        .toFile(outPath);
    }

    return NextResponse.json({ success: true, message: 'Clean cutout ready' });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
