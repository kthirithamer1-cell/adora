import { NextRequest, NextResponse } from 'next/server';
import sharp, { OverlayOptions } from 'sharp';
import path from 'path';
import fs from 'fs';
import { MasterSceneSpec } from '@/lib/artDirector';
import { getBrandKitByWorkspace } from '@/lib/brandkit';

/**
 * Charge un buffer image depuis base64 ou chemin /images/ public
 */
async function loadBufferFromInput(input?: string): Promise<Buffer | null> {
  if (!input) return null;
  if (input.startsWith('data:')) {
    const cleanBase64 = input.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(cleanBase64, 'base64');
  }
  if (input.startsWith('/images/')) {
    const localPath = path.join(process.cwd(), 'public', input.replace(/^\//, ''));
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }
  }
  if (input.startsWith('http://') || input.startsWith('https://')) {
    try {
      const res = await fetch(input);
      if (res.ok) {
        const arr = await res.arrayBuffer();
        return Buffer.from(arr);
      }
    } catch {
      // ignore
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const {
      masterBackgroundBase64,
      cutoutBase64,
      sceneSpec,
      refineAction,
      parameters = {},
      workspaceId = 'ws_nutristore',
    } = body;

    if (!masterBackgroundBase64 || !cutoutBase64) {
      return NextResponse.json({
        success: false,
        error: 'Éléments visuels requis manquants pour le raffinement ciblé.',
      }, { status: 400 });
    }

    const brandKit = getBrandKitByWorkspace(workspaceId);
    const updatedSpec: MasterSceneSpec = sceneSpec ? JSON.parse(JSON.stringify(sceneSpec)) : {
      version: 'scene/v2',
      intentId: 'prestige_elevation',
      aspectRatio: '1:1',
      pedestalAnchor: { x: 0.5, y: 0.72, widthRatio: 0.48 },
      safeZones: { topPercent: 5, bottomPercent: 5 },
      lighting: { keyLightDirection: 'top-left', angleDeg: 45, temperatureK: 4500, accentColorHex: '#00E5FF' },
      surface: { material: 'marble', finish: 'glossy', contactBlurRatio: 0.035, contactHeightRatio: 0.04 },
      background: 'studio',
      compiledPositivePrompt: '',
      brandOverlay: {
        logoUrl: brandKit.logoUrl || '/images/Adora_logo.png',
        logoPosition: 'top-left',
        logoTopPx: 45,
        headlineFont: 'Outfit, sans-serif',
        primaryColor: '#00E5FF',
        accentColor: '#FF5722',
        sloganDarija: 'El qualité el behya b a7sen aswem fi tounes !',
        deliveryMention: 'Livraison 24-48h sur 24 gouvernorats',
      },
    };

    // Application chirurgicale des modifications demandées
    if (refineAction === 'adjust_shadow') {
      const intensity = parameters.shadowIntensity ?? 1.2;
      updatedSpec.surface.contactBlurRatio = 0.035 * intensity;
      updatedSpec.surface.contactHeightRatio = 0.04 * intensity;
    } else if (refineAction === 'change_aspect') {
      const newAspect = parameters.aspect || '9:16';
      updatedSpec.aspectRatio = newAspect;
      if (newAspect === '9:16') {
        updatedSpec.pedestalAnchor = { x: 0.5, y: 0.65, widthRatio: 0.55 };
        updatedSpec.safeZones = { topPercent: 14, bottomPercent: 20 };
        updatedSpec.brandOverlay.logoTopPx = 240;
      } else if (newAspect === '1.91:1') {
        updatedSpec.pedestalAnchor = { x: 0.5, y: 0.76, widthRatio: 0.40 };
        updatedSpec.safeZones = { topPercent: 5, bottomPercent: 5 };
        updatedSpec.brandOverlay.logoTopPx = 45;
      } else {
        updatedSpec.pedestalAnchor = { x: 0.5, y: 0.72, widthRatio: 0.48 };
        updatedSpec.safeZones = { topPercent: 5, bottomPercent: 5 };
        updatedSpec.brandOverlay.logoTopPx = 45;
      }
    } else if (refineAction === 'reposition_product') {
      if (typeof parameters.yOffset === 'number') {
        updatedSpec.pedestalAnchor.y = Math.min(0.85, Math.max(0.5, updatedSpec.pedestalAnchor.y + parameters.yOffset));
      }
      if (typeof parameters.scaleMultiplier === 'number') {
        updatedSpec.pedestalAnchor.widthRatio = Math.min(0.75, Math.max(0.3, updatedSpec.pedestalAnchor.widthRatio * parameters.scaleMultiplier));
      }
    }

    const chosenAspect = updatedSpec.aspectRatio || '1:1';
    const W = chosenAspect === '9:16' ? 1080 : chosenAspect === '1.91:1' ? 1200 : 1080;
    const H = chosenAspect === '9:16' ? 1920 : chosenAspect === '1.91:1' ? 628 : 1080;

    const bgBuffer = await loadBufferFromInput(masterBackgroundBase64);
    const prodCutoutBuffer = await loadBufferFromInput(cutoutBase64);
    const logoBuffer = await loadBufferFromInput(updatedSpec.brandOverlay.logoUrl || brandKit.logoUrl);

    if (!bgBuffer || !prodCutoutBuffer) {
      return NextResponse.json({
        success: false,
        error: 'Buffers introuvables pour le raffinement.',
      }, { status: 400 });
    }

    // In-memory compositing via Sharp (<500ms, 0 credit OpenAI)
    const resizedBg = await sharp(bgBuffer).resize(W, H, { fit: 'cover' }).toBuffer();
    const prodMeta = await sharp(prodCutoutBuffer).metadata();
    const origW = prodMeta.width || 500;
    const origH = prodMeta.height || 700;

    const maxProdW = Math.round(W * updatedSpec.pedestalAnchor.widthRatio);
    const maxProdH = Math.round(H * 0.52);
    const scale = Math.min(maxProdW / origW, maxProdH / origH, 1.0);
    const pw = Math.max(Math.round(origW * scale), 120);
    const ph = Math.max(Math.round(origH * scale), 120);

    const resizedProd = await sharp(prodCutoutBuffer)
      .resize(pw, ph, { fit: 'inside' })
      .toBuffer();

    const contactBlur = Math.max(Math.round(pw * updatedSpec.surface.contactBlurRatio), 6);
    const contactHeight = Math.max(Math.round(ph * updatedSpec.surface.contactHeightRatio), 8);
    const shadowRx = Math.round(pw * 0.46);
    const shadowRy = contactHeight;
    const shadowCx = Math.round(W * updatedSpec.pedestalAnchor.x);
    const shadowCy = Math.round(H * updatedSpec.pedestalAnchor.y);
    const shadowOffsetX = updatedSpec.lighting.keyLightDirection === 'top-left' ? Math.round(contactBlur * 0.6) : -Math.round(contactBlur * 0.6);
    const shadowOffsetY = Math.round(contactHeight * 0.7);

    const shadowSvg = `
      <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="contactBlurFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="${Math.max(contactBlur * 0.4, 3)}" />
          </filter>
          <filter id="castShadowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="${contactBlur}" />
          </filter>
          <radialGradient id="occlusionGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#000000" stop-opacity="0.85" />
            <stop offset="60%" stop-color="#000000" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#000000" stop-opacity="0" />
          </radialGradient>
          <radialGradient id="castGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#05070B" stop-opacity="0.65" />
            <stop offset="70%" stop-color="#05070B" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#05070B" stop-opacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="${shadowCx + shadowOffsetX}" cy="${shadowCy + shadowOffsetY}" rx="${shadowRx * 1.1}" ry="${shadowRy * 1.3}" fill="url(#castGrad)" filter="url(#castShadowFilter)" />
        <ellipse cx="${shadowCx}" cy="${shadowCy}" rx="${shadowRx}" ry="${shadowRy}" fill="url(#occlusionGrad)" filter="url(#contactBlurFilter)" />
      </svg>
    `;

    const shadowBuffer = await sharp(Buffer.from(shadowSvg)).png().toBuffer();
    const layers: OverlayOptions[] = [
      { input: shadowBuffer, top: 0, left: 0 },
    ];

    const prodLeft = Math.round(shadowCx - pw / 2);
    const prodTop = Math.round(shadowCy - ph + shadowRy * 0.5);
    layers.push({
      input: resizedProd,
      left: Math.max(0, prodLeft),
      top: Math.max(0, prodTop),
    });

    if (logoBuffer) {
      try {
        const resizedLogo = await sharp(logoBuffer)
          .resize({ width: Math.round(W * 0.22), height: 56, fit: 'inside' })
          .png()
          .toBuffer();
        const logoMeta = await sharp(resizedLogo).metadata();
        const lw = logoMeta.width || 140;
        const logoLeft = updatedSpec.brandOverlay.logoPosition === 'top-center'
          ? Math.round((W - lw) / 2)
          : Math.round(W * 0.06);

        layers.push({
          input: resizedLogo,
          top: updatedSpec.brandOverlay.logoTopPx,
          left: logoLeft,
        });
      } catch {
        // ignore
      }
    }

    const updatedBuffer = await sharp(resizedBg)
      .composite(layers)
      .jpeg({ quality: 93 })
      .toBuffer();

    const updatedVisualUrl = `data:image/jpeg;base64,${updatedBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      updatedVisualUrl,
      updatedSceneSpec: updatedSpec,
      durationMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Erreur API /api/master-shot/refine:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Erreur lors du raffinement ciblé.',
    }, { status: 500 });
  }
}
