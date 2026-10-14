import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { checkCreditBalance, deductCredit } from '@/lib/billing';
import { recordApiUsage } from '@/lib/apiUsageLogger';
import { getBrandKitByWorkspace } from '@/lib/brandkit';
import {
  analyzeProductDNA,
  generateCreativeIntents,
  compileMasterSceneSpec,
  CreativeIntentType,
  MasterSceneSpec,
} from '@/lib/artDirector';
import { evaluateImageVariant } from '@/lib/visionCritic';
import { generateBackgroundWithDALLE, generateIntegratedSceneWithGPT1 } from '@/lib/openai';

export const maxDuration = 60; // 60s timeout support for Vision + DALL-E

const SIZE_BY_ASPECT: Record<string, '1024x1024' | '1024x1792'> = {
  '1:1': '1024x1024',
  '9:16': '1024x1792',
  '1.91:1': '1024x1024',
};

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

/**
 * Compositor déterministe haute fidélité respectant les règles physiques (Constitution 3.2 & 3.3)
 */
async function compositeMasterVisual(params: {
  bgBuffer: Buffer;
  productCutoutBuffer: Buffer;
  logoBuffer?: Buffer | null;
  sceneSpec: MasterSceneSpec;
  targetWidth: number;
  targetHeight: number;
}): Promise<Buffer> {
  const { bgBuffer, productCutoutBuffer, logoBuffer, sceneSpec, targetWidth: W, targetHeight: H } = params;

  // 1. Redimensionner le fond
  const resizedBg = await sharp(bgBuffer).resize(W, H, { fit: 'cover' }).toBuffer();

  // 2. Mesurer et adapter le cutout produit
  const prodMeta = await sharp(productCutoutBuffer).metadata();
  const origW = prodMeta.width || 500;
  const origH = prodMeta.height || 700;

  // Hauteur et largeur cibles selon le ratio du socle (pedestalAnchor)
  const maxProdW = Math.round(W * sceneSpec.pedestalAnchor.widthRatio);
  const maxProdH = Math.round(H * 0.52);

  const scale = Math.min(maxProdW / origW, maxProdH / origH, 1.0);
  const pw = Math.max(Math.round(origW * scale), 120);
  const ph = Math.max(Math.round(origH * scale), 120);

  const resizedProd = await sharp(productCutoutBuffer)
    .resize(pw, ph, { fit: 'inside' })
    .toBuffer();

  // 3. Calcul physique de l'ombre de contact (Constitution 3.3)
  // Contact Blur : W_product * 0.035
  const contactBlur = Math.max(Math.round(pw * sceneSpec.surface.contactBlurRatio), 6);
  // Contact Height : H_product * 0.04
  const contactHeight = Math.max(Math.round(ph * sceneSpec.surface.contactHeightRatio), 8);

  const shadowRx = Math.round(pw * 0.46);
  const shadowRy = contactHeight;
  const shadowCx = Math.round(W * sceneSpec.pedestalAnchor.x);
  const shadowCy = Math.round(H * sceneSpec.pedestalAnchor.y);

  // Décalage opposé à la lumière dominante (keyLightDirection)
  const shadowOffsetX = sceneSpec.lighting.keyLightDirection === 'top-left' ? Math.round(contactBlur * 0.6) : -Math.round(contactBlur * 0.6);
  const shadowOffsetY = Math.round(contactHeight * 0.7);

  const shadowSvg = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Contact Blur Ambient Occlusion sous la base -->
        <filter id="contactBlurFilter" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="${Math.max(contactBlur * 0.4, 3)}" />
        </filter>
        <!-- Ombre projetée directionnelle -->
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
      <!-- Ombre portée douce décalée -->
      <ellipse cx="${shadowCx + shadowOffsetX}" cy="${shadowCy + shadowOffsetY}" rx="${shadowRx * 1.1}" ry="${shadowRy * 1.3}" fill="url(#castGrad)" filter="url(#castShadowFilter)" />
      <!-- Occlusion de contact dense sous l'assise du produit -->
      <ellipse cx="${shadowCx}" cy="${shadowCy}" rx="${shadowRx}" ry="${shadowRy}" fill="url(#occlusionGrad)" filter="url(#contactBlurFilter)" />
    </svg>
  `;

  const shadowBuffer = await sharp(Buffer.from(shadowSvg)).png().toBuffer();

  const layers: sharp.OverlayOptions[] = [
    { input: shadowBuffer, top: 0, left: 0 },
  ];

  // Reflet spéculaire subtil si surface brillante (Carrara marble)
  if (sceneSpec.surface.finish === 'glossy') {
    try {
      const mirrorHeight = Math.round(ph * 0.28);
      const mirrorCrop = await sharp(resizedProd)
        .extract({ left: 0, top: Math.max(0, ph - mirrorHeight), width: pw, height: mirrorHeight })
        .flip()
        .modulate({ brightness: 0.65 })
        .toBuffer();

      const mirrorSvgFade = `
        <svg width="${pw}" height="${mirrorHeight}">
          <defs>
            <linearGradient id="fadeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0.0"/>
            </linearGradient>
            <mask id="fadeMask">
              <rect width="${pw}" height="${mirrorHeight}" fill="url(#fadeGrad)"/>
            </mask>
          </defs>
          <rect width="${pw}" height="${mirrorHeight}" fill="#FFFFFF" mask="url(#fadeMask)"/>
        </svg>
      `;

      const mirrorLayer = await sharp(mirrorCrop)
        .composite([{ input: Buffer.from(mirrorSvgFade), blend: 'dest-in' }])
        .png()
        .toBuffer();

      layers.push({
        input: mirrorLayer,
        top: Math.round(shadowCy + shadowRy * 0.2),
        left: Math.round(shadowCx - pw / 2),
      });
    } catch {
      // Ignorer si échec du reflet
    }
  }

  // Produit détouré physique calé sur le socle
  const prodLeft = Math.round(shadowCx - pw / 2);
  const prodTop = Math.round(shadowCy - ph + shadowRy * 0.5);

  layers.push({
    input: resizedProd,
    left: Math.max(0, prodLeft),
    top: Math.max(0, prodTop),
  });

  // Logo officiel du marchand dans la zone sûre (Safe Zone > 14% en story)
  if (logoBuffer) {
    try {
      const resizedLogo = await sharp(logoBuffer)
        .resize({ width: Math.round(W * 0.22), height: 56, fit: 'inside' })
        .png()
        .toBuffer();

      const logoMeta = await sharp(resizedLogo).metadata();
      const lw = logoMeta.width || 140;
      const logoLeft = sceneSpec.brandOverlay.logoPosition === 'top-center'
        ? Math.round((W - lw) / 2)
        : Math.round(W * 0.06);

      layers.push({
        input: resizedLogo,
        top: sceneSpec.brandOverlay.logoTopPx,
        left: logoLeft,
      });
    } catch {
      // Ignorer si échec du logo
    }
  }

  return await sharp(resizedBg)
    .composite(layers)
    .jpeg({ quality: 93 })
    .toBuffer();
}

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Incrustation publicitaire professionnelle de la marque, du prix, du nom de produit et des badges
 * directement dans le visuel généré par IA (Haute conversion e-commerce tunisien).
 */
async function applyAdOverlayToBuffer(params: {
  imageBuffer: Buffer;
  productName: string;
  priceTND: string;
  brandName: string;
  primaryColor: string;
  secondaryColor?: string;
  badgeText?: string;
  hookText?: string;
  aspect: '1:1' | '9:16' | '1.91:1';
  logoBuffer?: Buffer | null;
}): Promise<Buffer> {
  const {
    imageBuffer,
    productName,
    priceTND,
    brandName,
    primaryColor,
    badgeText,
    hookText,
    aspect,
    logoBuffer,
  } = params;

  const meta = await sharp(imageBuffer).metadata();
  const W = meta.width || (aspect === '9:16' ? 1080 : aspect === '1.91:1' ? 1200 : 1080);
  const H = meta.height || (aspect === '9:16' ? 1920 : aspect === '1.91:1' ? 628 : 1080);

  const isStory = aspect === '9:16';
  const isBanner = aspect === '1.91:1';

  const safeTop = isStory ? 150 : 50;
  const cardH = isStory ? 140 : isBanner ? 96 : 116;
  const cardW = Math.round(W * 0.92);
  const cardX = Math.round((W - cardW) / 2);
  const cardY = isStory ? H - 380 : isBanner ? H - 125 : H - 156;

  const cleanProdName = escapeXml(productName.length > 34 ? productName.slice(0, 34) + '...' : productName);
  const cleanPrice = escapeXml(priceTND.includes('DT') || priceTND.includes('TND') ? priceTND : `${priceTND} DT`);
  const cleanBrand = escapeXml(brandName || 'Adora Studio');
  const cleanBadge = escapeXml(badgeText || '✓ 100% Efficace');
  const cleanHook = escapeXml(hookText || 'Livraison 24-48h • Paiement à la réception');

  const pricePillW = Math.max(130, cleanPrice.length * 16 + 36);

  const overlaySvg = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="adShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="14" flood-color="#000000" flood-opacity="0.75" />
        </filter>
        <linearGradient id="priceGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${primaryColor}" />
          <stop offset="100%" stop-color="#FF5722" />
        </linearGradient>
      </defs>

      <!-- Badge Promo / Réassurance (Haut Droite) -->
      <g transform="translate(${W - 250}, ${safeTop})" filter="url(#adShadow)">
        <rect width="202" height="44" rx="22" fill="rgba(11, 14, 23, 0.88)" stroke="${primaryColor}" stroke-width="1.8" />
        <text x="101" y="27" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="900" fill="${primaryColor}">${cleanBadge}</text>
      </g>

      <!-- Badge Marque (Haut Gauche si pas de logo fichier) -->
      ${!logoBuffer ? `
      <g transform="translate(48, ${safeTop})" filter="url(#adShadow)">
        <rect width="${Math.max(160, cleanBrand.length * 11 + 46)}" height="44" rx="22" fill="rgba(11, 14, 23, 0.88)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
        <circle cx="22" cy="22" r="7" fill="${primaryColor}" />
        <text x="38" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="800" fill="#FFFFFF">${cleanBrand}</text>
      </g>
      ` : ''}

      <!-- Cartouche Bas Publicitaire (Nom + Prix + Accroche) -->
      <g filter="url(#adShadow)">
        <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="18" fill="rgba(11, 14, 23, 0.88)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1.6" />
        
        <!-- Nom du Produit -->
        <text x="${cardX + 28}" y="${cardY + 44}" font-family="system-ui, -apple-system, sans-serif" font-size="${isBanner ? '20' : '23'}" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">
          ${cleanProdName}
        </text>

        <!-- Accroche / Réassurance -->
        <text x="${cardX + 28}" y="${cardY + (isBanner ? 74 : 82)}" font-family="system-ui, -apple-system, sans-serif" font-size="${isBanner ? '13' : '14'}" font-weight="600" fill="#94A3B8">
          ${cleanHook}
        </text>

        <!-- Badge Prix Stylisé -->
        <g transform="translate(${cardX + cardW - pricePillW - 24}, ${cardY + (cardH - 54) / 2})">
          <rect width="${pricePillW}" height="54" rx="14" fill="url(#priceGrad)" />
          <text x="${pricePillW / 2}" y="34" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="900" fill="#FFFFFF">
            ${cleanPrice}
          </text>
        </g>
      </g>
    </svg>
  `;

  const layers: sharp.OverlayOptions[] = [
    { input: Buffer.from(overlaySvg), top: 0, left: 0 },
  ];

  if (logoBuffer) {
    try {
      const resizedLogo = await sharp(logoBuffer)
        .resize({ width: Math.round(W * 0.22), height: 46, fit: 'inside' })
        .png()
        .toBuffer();
      layers.push({
        input: resizedLogo,
        top: safeTop,
        left: 48,
      });
    } catch {
      // ignore
    }
  }

  return await sharp(imageBuffer)
    .composite(layers)
    .jpeg({ quality: 93 })
    .toBuffer();
}


export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const {
      imageBase64,
      cutoutBase64,
      productName = 'Produit E-commerce',
      priceTND,
      intentId,
      aspect = '1:1',
      workspaceId = 'ws_nutristore',
      userNotes,
    } = body;

    // 1. GARDE-FOU CRÉDITS (ADORA-73) : Vérification du solde
    const balanceCheck = checkCreditBalance(workspaceId, 1);
    if (!balanceCheck.sufficient) {
      return NextResponse.json({
        success: false,
        error: `Solde insuffisant (${balanceCheck.remaining} crédit restant). Rechargez votre pack en Dinars (DT) pour générer votre Master Shot.`,
        code: 'INSUFFICIENT_CREDITS',
        creditsRemaining: balanceCheck.remaining,
      }, { status: 402 });
    }

    // 2. CHARGEMENT DU BRAND KIT EXISTANT (Pilier N°0 Anchor)
    const brandKit = getBrandKitByWorkspace(workspaceId);

    // 3. ÉTAPE 01 — Product Understanding : Analyse Vision du produit réel
    const rawInputImage = cutoutBase64 || imageBase64;
    const productDNA = await analyzeProductDNA({
      imageBase64: rawInputImage,
      productName,
      brandKit,
      userNotes,
    });

    // 4. ÉTAPE 02 — Creative Direction : 3 Intentions créatives filtrées par la charte
    const numericPrice = typeof priceTND === 'string'
      ? parseFloat(priceTND.replace(/[^0-9.]/g, '')) || 0
      : (typeof priceTND === 'number' ? priceTND : undefined);

    const intents = await generateCreativeIntents({
      productDNA,
      brandKit,
      priceTND: numericPrice,
    });

    const chosenIntent = intents.find((i) => i.id === intentId)
      || intents.find((i) => i.isRecommended)
      || intents[0];

    if (body.customHook && typeof body.customHook === 'string' && body.customHook.trim()) {
      chosenIntent.hookDarija = body.customHook.trim();
      chosenIntent.hookFr = body.customHook.trim();
    }

    // 5. ÉTAPE 03 — Composition Strategy : Calcule le SceneSpec déterministe
    const chosenAspect = (aspect || '1:1') as '1:1' | '9:16' | '1.91:1';
    const sceneSpec = compileMasterSceneSpec({
      intent: chosenIntent,
      productDNA,
      brandKit,
      aspect: chosenAspect,
    });

    // Intégration du prompt de thème personnalisé si transmis
    if (body.stylePrompt && typeof body.stylePrompt === 'string' && body.stylePrompt.trim()) {
      sceneSpec.compiledPositivePrompt = `${body.stylePrompt.trim()}, ${sceneSpec.compiledPositivePrompt}`;
    }

    // 6. ÉTAPE 04 — First Master Generation : Cliché Maître Intégré (gpt-image-1) ou Composité
    const dalleSize = SIZE_BY_ASPECT[chosenAspect] || '1024x1024';
    const prodCutoutBuffer = await loadBufferFromInput(rawInputImage)
      || await loadBufferFromInput('/images/whey_studio_podium.jpg');
    const logoBuffer = await loadBufferFromInput(brandKit.logoUrl || '/images/Adora_logo.png');

    let masterBuffer: Buffer | null = null;
    let bgBuffer: Buffer | null = null;

    // Tentative 1 : Intégration directe et native du produit dans le décor par GPT Image (gpt-image-1)
    if (prodCutoutBuffer) {
      try {
        const stageCanvas = await sharp({
          create: {
            width: 1024,
            height: 1024,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          },
        })
          .composite([
            {
              input: await sharp(prodCutoutBuffer).resize(550, 550, { fit: 'inside' }).toBuffer(),
              gravity: 'center',
            },
          ])
          .png()
          .toBuffer();

        const editPrompt = `High-end commercial e-commerce advertising staging for "${productName}". Harmoniously integrate this product on the central surface in this environment: ${sceneSpec.compiledPositivePrompt}. Realistic lighting, soft ambient contact shadows and reflections matching the scene. Luxury brand studio photography.`;

        const integratedUrl = await generateIntegratedSceneWithGPT1({
          imageBuffer: stageCanvas,
          prompt: editPrompt,
          size: dalleSize,
        });

        if (integratedUrl) {
          masterBuffer = await loadBufferFromInput(integratedUrl);
        }
      } catch (err) {
        console.warn('Staging intégré notice:', err);
      }
    }

    // Tentative 2 : Fallback haute fidélité avec décor généré (gpt-image-1 / dall-e-3) + Compositing Sharp
    if (!masterBuffer) {
      const bgUrl = await generateBackgroundWithDALLE(sceneSpec.compiledPositivePrompt, dalleSize);
      bgBuffer = await loadBufferFromInput(bgUrl);

      if (!bgBuffer || !prodCutoutBuffer) {
        return NextResponse.json({
          success: false,
          error: 'Impossible de charger les composants visuels nécessaires au compositing.',
        }, { status: 500 });
      }

      const targetW = chosenAspect === '9:16' ? 1080 : chosenAspect === '1.91:1' ? 1200 : 1080;
      const targetH = chosenAspect === '9:16' ? 1920 : chosenAspect === '1.91:1' ? 628 : 1080;

      masterBuffer = await compositeMasterVisual({
        bgBuffer,
        productCutoutBuffer: prodCutoutBuffer,
        logoBuffer,
        sceneSpec,
        targetWidth: targetW,
        targetHeight: targetH,
      });
    }

    // Génération instantanée des déclinaisons multi-formats associées
    const feedBuffer = chosenAspect === '1:1'
      ? masterBuffer
      : (bgBuffer
          ? await compositeMasterVisual({
              bgBuffer,
              productCutoutBuffer: prodCutoutBuffer,
              logoBuffer,
              sceneSpec: { ...sceneSpec, aspectRatio: '1:1', pedestalAnchor: { x: 0.5, y: 0.72, widthRatio: 0.48 } },
              targetWidth: 1080,
              targetHeight: 1080,
            })
          : await sharp(masterBuffer).resize(1080, 1080, { fit: 'cover' }).toBuffer());

    const storyBuffer = chosenAspect === '9:16'
      ? masterBuffer
      : (bgBuffer
          ? await compositeMasterVisual({
              bgBuffer,
              productCutoutBuffer: prodCutoutBuffer,
              logoBuffer,
              sceneSpec: { ...sceneSpec, aspectRatio: '9:16', pedestalAnchor: { x: 0.5, y: 0.65, widthRatio: 0.55 }, safeZones: { topPercent: 14, bottomPercent: 20 } },
              targetWidth: 1080,
              targetHeight: 1920,
            })
          : await sharp(masterBuffer).resize(1080, 1920, { fit: 'cover' }).toBuffer());

    const bannerBuffer = chosenAspect === '1.91:1'
      ? masterBuffer
      : (bgBuffer
          ? await compositeMasterVisual({
              bgBuffer,
              productCutoutBuffer: prodCutoutBuffer,
              logoBuffer,
              sceneSpec: { ...sceneSpec, aspectRatio: '1.91:1', pedestalAnchor: { x: 0.5, y: 0.76, widthRatio: 0.40 } },
              targetWidth: 1200,
              targetHeight: 628,
            })
          : await sharp(masterBuffer).resize(1200, 628, { fit: 'cover' }).toBuffer());

    // 6.5 APPLICATION DE L'HABILLAGE PUBLICITAIRE (Logo, Nom du produit, Prix en Dinars, Badges & Couleurs de marque)
    const cleanPriceDisplay = typeof priceTND === 'string'
      ? (priceTND.includes('DT') || priceTND.includes('TND') ? priceTND : `${priceTND} DT`)
      : (typeof priceTND === 'number' ? `${priceTND} DT` : '89 DT');

    const brandPrimary = brandKit.palette?.primary || brandKit.primaryColor || '#00E5FF';
    const brandShopName = brandKit.shopName || brandKit.name || 'Adora Studio';
    const finalBadgeText = chosenIntent.badgeText || (body.reassuranceBadge ? '🚚 Livraison 24-48h' : '✨ Best-Seller');
    const finalHookText = chosenIntent.hookFr || chosenIntent.hookDarija || 'Paiement à la livraison partout en Tunisie';

    const masterWithOverlay = await applyAdOverlayToBuffer({
      imageBuffer: masterBuffer,
      productName: productDNA.productName || productName,
      priceTND: cleanPriceDisplay,
      brandName: brandShopName,
      primaryColor: brandPrimary,
      badgeText: finalBadgeText,
      hookText: finalHookText,
      aspect: chosenAspect,
      logoBuffer,
    });

    const feedWithOverlay = await applyAdOverlayToBuffer({
      imageBuffer: feedBuffer,
      productName: productDNA.productName || productName,
      priceTND: cleanPriceDisplay,
      brandName: brandShopName,
      primaryColor: brandPrimary,
      badgeText: finalBadgeText,
      hookText: finalHookText,
      aspect: '1:1',
      logoBuffer,
    });

    const storyWithOverlay = await applyAdOverlayToBuffer({
      imageBuffer: storyBuffer,
      productName: productDNA.productName || productName,
      priceTND: cleanPriceDisplay,
      brandName: brandShopName,
      primaryColor: brandPrimary,
      badgeText: '🔥 Offre Limitée',
      hookText: chosenIntent.hookDarija || 'El khlass waqt el livri l beb eddar',
      aspect: '9:16',
      logoBuffer,
    });

    const bannerWithOverlay = await applyAdOverlayToBuffer({
      imageBuffer: bannerBuffer,
      productName: productDNA.productName || productName,
      priceTND: cleanPriceDisplay,
      brandName: brandShopName,
      primaryColor: brandPrimary,
      badgeText: finalBadgeText,
      hookText: finalHookText,
      aspect: '1.91:1',
      logoBuffer,
    });

    const masterVisualUrl = `data:image/jpeg;base64,${masterWithOverlay.toString('base64')}`;

    const formats = {
      feed: `data:image/jpeg;base64,${feedWithOverlay.toString('base64')}`,
      story: `data:image/jpeg;base64,${storyWithOverlay.toString('base64')}`,
      banner: `data:image/jpeg;base64,${bannerWithOverlay.toString('base64')}`,
    };

    // 7. ÉTAPE 05 — Quality Review : Évaluation Vision Critic (/100)
    const evaluation = await evaluateImageVariant({
      imageUrl: masterVisualUrl,
      productName: productDNA.productName,
      brandKit,
      aspect: chosenAspect,
    });

    // 8. DÉDUCTION DE CRÉDIT & LOGGING AUDIT
    const deduction = deductCredit(
      workspaceId,
      1,
      `Master Shot Dirigé IA — ${chosenIntent.titleFr} (${productDNA.productName})`
    );

    recordApiUsage({
      endpoint: '/api/master-shot',
      model: 'dall-e-3 + sharp-compositor',
      tokensUsed: 600,
      generationTimeMs: Date.now() - startTime,
      workspaceId,
      metadata: {
        productName: productDNA.productName,
        intent: chosenIntent.id,
        aspect: chosenAspect,
        visionScore: evaluation.totalScore,
      },
    });

    return NextResponse.json({
      success: true,
      masterVisualUrl,
      formats,
      productDNA,
      intents,
      selectedIntent: chosenIntent,
      sceneSpec,
      evaluation,
      creditsRemaining: deduction.remaining,
      durationMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('Erreur API /api/master-shot:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Erreur lors de la génération du Master Shot.',
    }, { status: 500 });
  }
}
