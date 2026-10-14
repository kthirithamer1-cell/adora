import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, sampleFile, threshold = 238 } = await req.json();

    let inputBuffer: Buffer;

    if (imageBase64 && typeof imageBase64 === 'string') {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      inputBuffer = Buffer.from(base64Data, 'base64');
    } else if (sampleFile && typeof sampleFile === 'string') {
      const fullPath = path.join(process.cwd(), 'public', sampleFile.replace(/^\//, ''));
      if (!fs.existsSync(fullPath)) {
        return NextResponse.json({ success: false, error: 'Fichier introuvable' }, { status: 404 });
      }
      inputBuffer = fs.readFileSync(fullPath);
    } else {
      return NextResponse.json({ success: false, error: 'Image manquante' }, { status: 400 });
    }

    // Traitement Sharp : suppression intelligente du fond studio (blanc, gris clair, dégradé studio)
    const { data, info } = await sharp(inputBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const width = info.width;
    const height = info.height;

    // 1. Échantillonnage adaptatif des 4 coins pour identifier la couleur réelle du fond studio
    const cornerSize = Math.min(15, Math.floor(width / 10), Math.floor(height / 10));
    let sumR = 0, sumG = 0, sumB = 0, sampleCount = 0;

    const samplePatch = (startX: number, startY: number) => {
      for (let y = startY; y < startY + cornerSize; y++) {
        for (let x = startX; x < startX + cornerSize; x++) {
          const idx = (y * width + x) * 4;
          sumR += data[idx];
          sumG += data[idx + 1];
          sumB += data[idx + 2];
          sampleCount++;
        }
      }
    };

    // 4 coins (haut-gauche, haut-droite, bas-gauche, bas-droite)
    samplePatch(0, 0);
    samplePatch(Math.max(0, width - cornerSize), 0);
    samplePatch(0, Math.max(0, height - cornerSize));
    samplePatch(Math.max(0, width - cornerSize), Math.max(0, height - cornerSize));

    const avgBgR = sampleCount > 0 ? sumR / sampleCount : 255;
    const avgBgG = sampleCount > 0 ? sumG / sampleCount : 255;
    const avgBgB = sampleCount > 0 ? sumB / sampleCount : 255;

    // Vérifier si le fond est clair/neutre (luminance > 160 et faible saturation)
    const bgLuminance = (avgBgR + avgBgG + avgBgB) / 3;
    const isNeutralStudioBg = bgLuminance >= 150 && 
      Math.abs(avgBgR - avgBgG) < 20 && 
      Math.abs(avgBgG - avgBgB) < 20;

    // Rayon de tolérance couleur
    const colorTolerance = isNeutralStudioBg ? Math.max(32, 255 - bgLuminance + 15) : 25;

    // Masquage chromatique et adaptatif
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Cas A : Blanc pur classique
      if (r >= threshold && g >= threshold && b >= threshold) {
        data[i + 3] = 0;
        continue;
      }

      // Cas B : Fond studio neutre échantillonné aux coins (gris clair, studio photo)
      if (isNeutralStudioBg) {
        const dist = Math.sqrt(
          Math.pow(r - avgBgR, 2) +
          Math.pow(g - avgBgG, 2) +
          Math.pow(b - avgBgB, 2)
        );

        if (dist <= colorTolerance) {
          data[i + 3] = 0;
        } else if (dist <= colorTolerance + 15) {
          // Antialiasing doux
          const factor = (dist - colorTolerance) / 15;
          data[i + 3] = Math.min(255, Math.max(0, Math.round(factor * 255)));
        }
      }
    }

    const pngBuffer = await sharp(data, {
      raw: { width, height, channels: 4 },
    })
      .png({ compressionLevel: 8 })
      .toBuffer();

    const outputBase64 = `data:image/png;base64,${pngBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      transparentBase64: outputBase64,
      width,
      height,
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
