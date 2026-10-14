import { NextRequest, NextResponse } from 'next/server';
import { checkCreditBalance, deductCredit } from '@/lib/billing';
import { recordApiUsage, calculateApiCost } from '@/lib/apiUsageLogger';
import { recordGenerationAction } from '@/actions/generations.actions';

// Tailles officielles supportées par OpenAI Images API
const SIZE_BY_ASPECT: Record<string, '1024x1024' | '1024x1792' | '1792x1024'> = {
  '1:1': '1024x1024',
  '2:3': '1024x1792', // Portrait : Story, Reels
  '9:16': '1024x1792',
  '3:2': '1792x1024', // Paysage : Bannière web
  '1.91:1': '1792x1024',
};

function compileCommercialPrompt(
  rawPrompt: string,
  category?: string,
  aspect?: string,
  options: { withIntegratedProduct?: boolean; brandName?: string } = {}
): { prompt: string; metadata: any } {
  const isVertical = aspect === '2:3' || aspect === '9:16';
  const isLandscape = aspect === '3:2' || aspect === '1.91:1';

  // Composition adaptée au format et respect des zones de sécurité mobile (14% haut, 20% bas sur Story)
  const framingDirective = isVertical
    ? 'Vertical 9:16 mobile composition with central pedestal anchored at lower-middle, spacious clean headroom in the upper 14% and clear footer space in the lower 20%'
    : isLandscape
    ? 'Wide panoramic commercial composition, pedestal centered with generous horizontal margins and soft diffuse gradient'
    : 'Balanced square 1:1 commercial feed composition, camera at eye-level 15 degrees elevation, clean open margins around central pedestal';

  let positiveStaging = '';
  if (options.withIntegratedProduct) {
    const brandRef = options.brandName ? ` for ${options.brandName}` : '';
    positiveStaging = `Seamless commercial advertising staging${brandRef}. Photorealistic studio lighting seamlessly integrating the staged product and brand emblem onto a luxurious pedestal. Soft physical contact shadows, realistic surface reflections, directional studio softbox key light from upper-left at 45 degrees, matching ambient fill, high-end e-commerce campaign aesthetic.`;
  } else {
    positiveStaging = 'The central pedestal top surface is completely vacant, pristine, matte and polished, smoothly awaiting an object. Directional studio softbox key light positioned from upper-left at 45 degrees, gentle diffuse fill light, clean contact surface with soft natural gradient falloff. Clean seamless solid background with shallow depth of field.';
  }

  const compiled = `Professional commercial studio staging set. ${rawPrompt.trim()}. ${positiveStaging} ${framingDirective}.`;

  const metadata = {
    lightDirection: 'top-left',
    lightAngleDeg: 45,
    cameraElevationDeg: 15,
    pedestalAnchor: {
      x: 0.5,
      y: isVertical ? 0.65 : 0.68,
      widthRatio: isVertical ? 0.55 : 0.45,
    },
    safeZones: {
      topPercent: isVertical ? 14 : 4,
      bottomPercent: isVertical ? 20 : 4,
    },
  };

  return { prompt: compiled, metadata };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY;

    const body = await req.json();
    const {
      prompt,
      aspect = '1:1',
      quality = 'standard',
      model = 'gpt-image-2.5-flare',
      n,
      category,
      runQa = false,
      productImageBase64,
      cutoutBase64,
      logoBase64,
      productName,
      brandName,
      price,
      badgeText,
      style,
      copyLanguage,
      objective,
      workspaceId = 'ws_nutristore',
    } = body;

    // 1. GARDE-FOU CRÉDITS (ADORA-73) : Vérification du solde avant exécution
    const balanceCheck = checkCreditBalance(workspaceId, 1);
    if (!balanceCheck.sufficient) {
      return NextResponse.json({
        success: false,
        error: `Solde insuffisant (${balanceCheck.remaining} crédit restant). Rechargez votre pack en Dinars (DT) pour générer de nouveaux visuels.`,
        code: 'INSUFFICIENT_CREDITS',
        creditsRemaining: balanceCheck.remaining,
      }, { status: 402 });
    }

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Clé API OpenAI manquante (OPEN_AI_KEY non configurée).',
      }, { status: 500 });
    }

    const effectivePrompt = (typeof prompt === 'string' && prompt.trim()) 
      ? prompt.trim() 
      : 'Sidi Bou Said Mediterranean luxury terrace staging, sunlit stone balustrade, vibrant bougainvillea flowers';

    const size = SIZE_BY_ASPECT[aspect] || '1024x1024';
    const chosenQuality = quality === 'hd' ? 'hd' : 'standard';

    const effectiveProduct = cutoutBase64 || (productImageBase64 && !productImageBase64.includes('image.png') ? productImageBase64 : undefined);
    const effectiveLogo = logoBase64 && !logoBase64.includes('Adora_logo.png') ? logoBase64 : (logoBase64 || undefined);
    const hasProductForAiStaging = Boolean(effectiveProduct && typeof effectiveProduct === 'string' && effectiveProduct.startsWith('data:image'));

    const { prompt: compiledPrompt, metadata: sceneMetadata } = compileCommercialPrompt(
      effectivePrompt,
      category,
      aspect,
      { withIntegratedProduct: hasProductForAiStaging, brandName }
    );

    // Préparation optionnelle du canevas transparent 1024x1024 avec produit + logo pour /v1/images/edits
    let stagingTransparentBuffer: Buffer | null = null;
    if (hasProductForAiStaging && effectiveProduct) {
      try {
        const sharp = (await import('sharp')).default;
        const cleanB64 = effectiveProduct.replace(/^data:image\/\w+;base64,/, '');
        const prodBuf = Buffer.from(cleanB64, 'base64');
        const prodMeta = await sharp(prodBuf).metadata();
        const pWidth = prodMeta.width || 500;
        const pHeight = prodMeta.height || 500;

        const targetW = Math.round(1024 * 0.44);
        const targetH = Math.round((targetW / pWidth) * pHeight);
        const resizedProd = await sharp(prodBuf).resize(targetW, targetH, { fit: 'inside' }).toBuffer();

        const posX = Math.round((1024 - targetW) / 2);
        const posY = Math.min(640, 1024 - targetH - 120);

        const composites: any[] = [
          { input: resizedProd, left: posX, top: posY }
        ];

        if (effectiveLogo && typeof effectiveLogo === 'string' && effectiveLogo.startsWith('data:image')) {
          try {
            const cleanLogo = effectiveLogo.replace(/^data:image\/\w+;base64,/, '');
            const logoBuf = Buffer.from(cleanLogo, 'base64');
            const resizedLogo = await sharp(logoBuf).resize(160, 56, { fit: 'inside' }).toBuffer();
            composites.push({ input: resizedLogo, left: 60, top: 50 });
          } catch (lErr) {
            console.warn('Prep logo edit notice:', lErr);
          }
        }

        stagingTransparentBuffer = await sharp({
          create: {
            width: 1024,
            height: 1024,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        })
          .composite(composites)
          .png()
          .toBuffer();
      } catch (canvErr) {
        console.warn('Canvas staging prep notice:', canvErr);
      }
    }

    const callGenerationsApi = async (modelName: string, sz: string) => {
      const payload: Record<string, any> = {
        model: modelName,
        prompt: compiledPrompt,
        n: 1,
        size: sz,
      };
      return fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });
    };

    const callEditsApi = async (modelName: string, imgBuf: Buffer) => {
      const formData = new FormData();
      const blob = new Blob([imgBuf], { type: 'image/png' });
      formData.append('image', blob, 'staging_canvas.png');
      formData.append('prompt', compiledPrompt);
      formData.append('model', modelName);
      formData.append('n', '1');
      formData.append('size', '1024x1024');

      return fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });
    };

    // 2. SÉLECTION ET APPEL DU MOTEUR IA OPENAI
    // Modèle par défaut : gpt-image-2.5-flare (premier choix économique et rapide)
    let chosenModel = typeof model === 'string' && model && model !== 'gpt-image-1' 
      ? model 
      : 'gpt-image-2.5-flare';

    console.log(`🚀 [API generate-image] Lancement génération IA via ${chosenModel}...`);

    let openAiRes: Response | null = null;
    let result: any = null;
    let wasEditsApi = false;

    // Tentative A : Intégration IA directe (produit + logo dans la scène) via /v1/images/edits
    if (stagingTransparentBuffer) {
      console.log(`✨ [API generate-image] Tentative d'intégration directe IA (produit + logo) via /v1/images/edits (${chosenModel})...`);
      try {
        const editsRes = await callEditsApi(chosenModel, stagingTransparentBuffer);
        const editsJson = await editsRes.json().catch(() => null);
        if (editsRes.ok && editsJson?.data?.[0]) {
          openAiRes = editsRes;
          result = editsJson;
          wasEditsApi = true;
          console.log(`🎉 [API generate-image] Intégration IA directe réussie via /v1/images/edits (${chosenModel}) !`);
        } else {
          console.log(`ℹ️ [API generate-image] Edits API non disponible pour ${chosenModel} (${editsRes.status}):`, editsJson?.error?.message || 'Bascule vers Generations API');
        }
      } catch (editsErr) {
        console.warn('Notice appel edits API:', editsErr);
      }
    }

    // Tentative B : Génération du décor IA inédit via /v1/images/generations
    if (!openAiRes || !openAiRes.ok) {
      openAiRes = await callGenerationsApi(chosenModel, size);
      result = await openAiRes.json().catch(() => null);

      // Fallback dynamique ordonné si le modèle initial est indisponible
      if (!openAiRes.ok) {
        const errMessage = result?.error?.message || '';
        console.warn(`[API generate-image] ${chosenModel} a répondu (${openAiRes.status}):`, errMessage);
        
        const fallbackCandidates = [
          'gpt-image-2.5-flare',
          'gpt-image-2.5-sunburst',
          'gpt-image-2',
          'chatgpt-image-latest',
          'dall-e-3',
          'dall-e-2'
        ].filter(m => m !== chosenModel);

        for (const fallbackModel of fallbackCandidates) {
          console.log(`🔄 [API generate-image] Tentative fallback IA vers ${fallbackModel}...`);
          const fallbackSize = fallbackModel === 'dall-e-2' ? '512x512' : size;
          const fbRes = await callGenerationsApi(fallbackModel, fallbackSize);
          const fbResult = await fbRes.json().catch(() => null);
          if (fbRes.ok) {
            openAiRes = fbRes;
            result = fbResult;
            chosenModel = fallbackModel;
            console.log(`✅ [API generate-image] Génération réussie avec le modèle fallback ${chosenModel} !`);
            break;
          }
        }
      }
    }

    // Si OpenAI échoue après tous les essais
    if (!openAiRes || !openAiRes.ok) {
      const errorMsg = result?.error?.message || `Erreur OpenAI (${openAiRes?.status || 500})`;
      console.error(`❌ [API generate-image] Échec génération OpenAI :`, errorMsg);
      return NextResponse.json({
        success: false,
        error: `Erreur Moteur IA OpenAI (${openAiRes?.status || 500}) : ${errorMsg}`,
        modelAttempted: chosenModel,
        status: openAiRes?.status || 500,
      }, { status: openAiRes?.status && openAiRes.status >= 400 && openAiRes.status < 600 ? openAiRes.status : 500 });
    }

    // 3. EXTRACTION DU VISUEL GÉNÉRÉ PAR L'IA
    let images: string[] = (result?.data || [])
      .map((d: { url?: string; b64_json?: string }) =>
        d.url ? d.url : d.b64_json ? `data:image/png;base64,${d.b64_json}` : ''
      )
      .filter(Boolean);

    if (images.length === 0) {
      return NextResponse.json({ success: false, error: 'Aucune image générée par OpenAI' }, { status: 502 });
    }

    const aiGeneratedUrl = images[0];
    console.log(`🎨 [API generate-image] Rendu IA brut généré avec succès ! (${aiGeneratedUrl.slice(0, 70)}...)`);

    // 4. RÉCUPÉRATION DU BUFFER DE L'IMAGE IA POUR LE COMPOSITING ET MULTI-FORMATS
    let aiBackdropBuffer: Buffer | null = null;
    try {
      if (aiGeneratedUrl.startsWith('data:')) {
        const cleanB64 = aiGeneratedUrl.replace(/^data:image\/\w+;base64,/, '');
        aiBackdropBuffer = Buffer.from(cleanB64, 'base64');
      } else if (aiGeneratedUrl.startsWith('http')) {
        const imgFetch = await fetch(aiGeneratedUrl);
        if (imgFetch.ok) {
          const arrBuffer = await imgFetch.arrayBuffer();
          aiBackdropBuffer = Buffer.from(arrBuffer);
        }
      }
    } catch (buffErr) {
      console.warn('Impossible de charger le buffer IA en mémoire:', buffErr);
    }

    // 5. INTÉGRATION MULTI-FORMATS DÉTERMINISTE SANS SURCOÛT (SHARP)
    let finalFormats: { instagram: string; facebook: string; story: string } = {
      instagram: aiGeneratedUrl,
      facebook: aiGeneratedUrl,
      story: aiGeneratedUrl,
    };
    let primaryUrl = aiGeneratedUrl;

    if (aiBackdropBuffer) {
      console.log(`✨ [API generate-image] Préparation des formats publicitaires (wasEditsApi: ${wasEditsApi})...`);
      const { generateAllAdFormats } = await import('@/lib/imageEditor');
      
      const allFormats = await generateAllAdFormats({
        productImageBase64: effectiveProduct || '',
        cutoutBase64: effectiveProduct,
        logoBase64: effectiveLogo,
        backgroundBuffer: aiBackdropBuffer,
        prompt: prompt || 'High-end commercial staging',
        quality: chosenQuality,
        productName,
        brandName,
        price,
        badgeText,
        style,
        copyLanguage,
        objective,
        skipProductComposite: wasEditsApi, // Si déjà intégré par l'IA via edits, pas besoin de ré-incruster
      });

      finalFormats = allFormats;
      primaryUrl = aspect === '9:16' || aspect === '2:3'
        ? allFormats.story
        : aspect === '1.91:1' || aspect === '3:2'
        ? allFormats.facebook
        : allFormats.instagram;

      // Sécurité absolue
      if (!primaryUrl || primaryUrl.includes('image.png')) {
        primaryUrl = aiGeneratedUrl;
      }
      if (!finalFormats.instagram || finalFormats.instagram.includes('image.png')) {
        finalFormats.instagram = aiGeneratedUrl;
      }
      if (!finalFormats.facebook || finalFormats.facebook.includes('image.png')) {
        finalFormats.facebook = aiGeneratedUrl;
      }
      if (!finalFormats.story || finalFormats.story.includes('image.png')) {
        finalFormats.story = aiGeneratedUrl;
      }
    }

    // 6. DÉBIT DU CRÉDIT & AUDIT TRAIL RÉEL (ADORA-73 & ADORA-74)
    const deductResult = deductCredit(workspaceId, 1, {
      productName: productName || 'Scène Commerciale IA',
      category: category || 'studio',
      aspect,
    });

    const durationMs = Date.now() - startTime;
    const apiCost = calculateApiCost(chosenModel, { resolution: size, quality: chosenQuality });
    
    recordApiUsage({
      workspaceId,
      workspaceName: workspaceId === 'ws_hypergrowth' ? 'HyperGrowth Agence' : 'NutriStore Tunisie',
      endpoint: '/api/generate-image',
      model: chosenModel,
      resolution: size,
      latencyMs: durationMs,
      statusCode: 200,
      status: 'SUCCESS',
      costUSD: apiCost.costUSD,
      costTND: apiCost.costTND,
      creditsDeducted: 1,
      productName: productName || 'Scène Commerciale IA',
      category: category || 'studio',
      details: { aspect, size, quality: chosenQuality, modelUsed: chosenModel },
    });

    // Enregistrement persistant dans Supabase via Server Action
    try {
      await recordGenerationAction({
        productId: typeof productId === 'string' ? productId : undefined,
        promptUsed: typeof prompt === 'string' ? prompt : 'Staging Publicitaire Studio',
        creditsCost: 1,
        assets: [
          {
            formatType: 'story',
            aspectRatio: '9:16',
            finalImageUrl: finalFormats.story || primaryUrl,
            backgroundUrl: aiGeneratedUrl,
            headline: productName ? `Découvrez ${productName}` : 'Offre Spéciale',
            subheadlineDarija: 'Livri fisaa fi tounes el kol (24-48h)',
            ctaText: 'Commander',
            priceDisplayed: '49 DT',
          },
          {
            formatType: 'facebook',
            aspectRatio: '1.91:1',
            finalImageUrl: finalFormats.facebook || primaryUrl,
            backgroundUrl: aiGeneratedUrl,
            headline: productName ? `Nouvel arrivage : ${productName}` : 'Sponsorisé',
            subheadlineDarija: 'Paiement à la livraison garanti',
            ctaText: 'Acheter',
            priceDisplayed: '49 DT',
          },
          {
            formatType: 'instagram_post',
            aspectRatio: '1:1',
            finalImageUrl: finalFormats.feedSquare || primaryUrl,
            backgroundUrl: aiGeneratedUrl,
            headline: productName || 'Collection Officielle',
            subheadlineDarija: 'A7sen aswem fi tounes',
            ctaText: 'Commander',
            priceDisplayed: '49 DT',
          },
        ],
      });
    } catch (saveErr) {
      console.warn('Persistance Supabase génération notice :', saveErr);
    }

    console.log(`🎉 [API generate-image] Succès total via ${chosenModel} ! Latence: ${durationMs}ms, Crédits: ${deductResult.remaining}`);

    return NextResponse.json({
      success: true,
      images: [primaryUrl],
      url: primaryUrl,
      aiBackdropUrl: aiGeneratedUrl,
      formats: finalFormats,
      data: [{ url: primaryUrl }],
      category,
      modelUsed: chosenModel,
      size,
      quality: chosenQuality,
      sceneMetadata,
      creditsRemaining: deductResult.remaining,
      apiCostTND: apiCost.costTND,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('API /api/generate-image error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
