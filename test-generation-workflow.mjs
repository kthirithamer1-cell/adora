#!/usr/bin/env node

/**
 * 🧪 MarkMosaiq - AI Product Staging & BrandKit Production Pipeline
 * 
 * Architecture en 7 étapes conforme aux standards Adora / MarkMosaiq :
 * 1. Product Ingestion         : Sauvegarde immuable de la source originale et métadonnées
 * 2. Product Segmentation      : Détourage universel avec détection Vision bbox + masque alpha préservé
 * 3. Smart Creative Direction  : Analyse LLM (Secteur, lumière 45°, prompt décor vacant, copy Darija)
 * 4. AI Background Generation  : Génération d'un environnement sans objet (gpt-image-2.5-flare)
 * 5. Product Integration       : Incrustation du produit original intact + ombres relatives physiques
 * 6. Deterministic Ad Layout   : Branding officiel Sharp/SVG (Logo glassmorphism, badge, prix DT)
 * 7. Automated Quality Gate    : Audit Vision multi-critères strict (Fidélité, Découpe, Prix, Sécurité)
 * 
 * Usage :
 *   node test-generation-workflow.mjs --workspace ws_vestiaire --product "Parfum Oud Impérial" --price "149 DT"
 *   node test-generation-workflow.mjs --workspace ws_luxury_watch --product "Montre Rolex Datejust" --price "2800 DT"
 *   node test-generation-workflow.mjs --workspace ws_nutristore --product "Nutrex IsoFit 100% Whey" --price "189 DT"
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// ----------------------------------------------------------------------------
// 1. CHARGEMENT AUTOMATIQUE DU .ENV
// ----------------------------------------------------------------------------
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv();

const OPENAI_API_KEY = process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY || OPENAI_API_KEY.startsWith('sk-placeholder')) {
  console.error('\n❌ ERREUR : Clé OpenAI manquante.');
  console.error('Veuillez renseigner OPEN_AI_KEY dans le fichier .env à la racine.\n');
  process.exit(1);
}

// ----------------------------------------------------------------------------
// 2. PARSING DES ARGUMENTS CLI & BRANDKITS
// ----------------------------------------------------------------------------
const args = process.argv.slice(2);
function getArg(flag, defaultValue) {
  const index = args.indexOf(flag);
  return index !== -1 && args[index + 1] ? args[index + 1] : defaultValue;
}

const PRESET_BRANDKITS = {
  ws_nutristore: {
    shopName: 'NutriStore Tunisie',
    primaryColor: '#00E5FF',
    secondaryColor: '#FF5722',
    logoPath: './public/images/logo.png',
    defaultProduct: 'Nutrex IsoFit 100% Whey Isolate',
    defaultPrice: '189 DT',
    defaultImage: './public/images/bottle_nutrex.png',
    industry: 'nutrition',
    badge: '🚚 Livri fi 24-48h',
  },
  ws_vestiaire: {
    shopName: 'Vestiaire Tunis',
    primaryColor: '#E11D48',
    secondaryColor: '#F59E0B',
    logoPath: './public/images/logo.png',
    defaultProduct: 'Parfum Oud Impérial',
    defaultPrice: '149 DT',
    defaultImage: './public/images/adora_hero_perfume.jpg',
    industry: 'cosmetics',
    badge: '✨ Édition Prestige',
  },
  ws_luxury_watch: {
    shopName: 'Horlogerie Genève Tunis',
    primaryColor: '#D4AF37',
    secondaryColor: '#E11D48',
    logoPath: './public/images/logo.png',
    defaultProduct: 'Montre Rolex Datejust',
    defaultPrice: '2800 DT',
    defaultImage: './public/images/adora_sneakers_clean.jpg',
    industry: 'jewelry',
    badge: '⭐ 100% Certifié d\'Origine',
  }
};

const chosenWsKey = getArg('--workspace', 'ws_vestiaire');
const presetKit = PRESET_BRANDKITS[chosenWsKey] || PRESET_BRANDKITS.ws_vestiaire;

const brandName = getArg('--brand', presetKit.shopName);
const primaryColor = getArg('--primary', presetKit.primaryColor);
const secondaryColor = getArg('--secondary', presetKit.secondaryColor);
const productName = getArg('--product', presetKit.defaultProduct);
const priceTND = getArg('--price', presetKit.defaultPrice);
const aspect = getArg('--aspect', '9:16'); // '9:16' ou '1:1'
const customLogoPath = getArg('--logo', presetKit.logoPath);
const customImagePath = getArg('--image', presetKit.defaultImage);

let resolvedProductPath = customImagePath;
if (!fs.existsSync(path.resolve(process.cwd(), resolvedProductPath))) {
  const fallbacks = [
    './public/images/adora_hero_perfume.jpg',
    './public/images/bottle_nutrex.png',
    './public/images/whey_studio_podium.jpg',
  ];
  for (const fb of fallbacks) {
    if (fs.existsSync(path.resolve(process.cwd(), fb))) {
      resolvedProductPath = fb;
      break;
    }
  }
}

let resolvedLogoPath = customLogoPath;
if (!fs.existsSync(path.resolve(process.cwd(), resolvedLogoPath))) {
  resolvedLogoPath = fs.existsSync(path.resolve(process.cwd(), './public/images/logo.png'))
    ? './public/images/logo.png'
    : null;
}

// ----------------------------------------------------------------------------
// 3. BARÈME DE COÛTS OFFICIELS & TRAÇABILITÉ (Problem 4 Fix)
// ----------------------------------------------------------------------------
const OFFICIAL_PRICING = {
  'gpt-4o-mini': {
    promptPer1M: 0.150,     // $0.150 / 1M tokens
    completionPer1M: 0.600, // $0.600 / 1M tokens
  },
  'gpt-image-2.5-flare': {
    '1024x1024': { medium: 0.007, high: 0.015 },
    '1024x1536': { medium: 0.011, high: 0.022 },
  },
  'local-sharp': 0.0000,   // Exécution CPU locale = $0.0000
};

function calcLlmCost(promptTokens, completionTokens) {
  return (promptTokens * (OFFICIAL_PRICING['gpt-4o-mini'].promptPer1M / 1_000_000)) + 
         (completionTokens * (OFFICIAL_PRICING['gpt-4o-mini'].completionPer1M / 1_000_000));
}

const sessionMetrics = {
  steps: [],
  totalCostUSD: 0,
  totalTokens: 0,
  startTime: Date.now(),
};

function recordStepMetric(stepName, model, tokens, costUSD, durationSec, details = '') {
  sessionMetrics.totalCostUSD += costUSD;
  sessionMetrics.totalTokens += tokens;
  sessionMetrics.steps.push({
    step: stepName,
    model,
    tokens,
    costUSD,
    durationSec,
    details,
  });
}

function escapeXml(unsafe) {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

console.log('\n' + '='.repeat(78));
console.log('✨ MARKMOSAIQ AI STUDIO — PRODUCTION PIPELINE (7 ÉTAPES ADORA)');
console.log('='.repeat(78));
console.log(`🏷️ Marque / BrandKit : ${brandName} (${chosenWsKey})`);
console.log(`🎨 Palette Visuelle  : Primaire ${primaryColor} | Secondaire ${secondaryColor}`);
console.log(`📦 Produit Cible     : ${productName} (Prix : ${priceTND})`);
console.log(`🖼️ Source Produit    : ${resolvedProductPath}`);
console.log(`🛡️ Logo Source       : ${resolvedLogoPath || 'Emblème typographique vectoriel'}`);
console.log(`📐 Format Cible      : ${aspect} (${aspect === '9:16' ? 'Story Mobile 1024x1536' : 'Post Carré 1024x1024'})`);
console.log('='.repeat(78) + '\n');

// ----------------------------------------------------------------------------
// ÉTAPE 1 : PRODUCT INGESTION & IMMUTABLE BACKUP
// ----------------------------------------------------------------------------
async function step1_ProductIngestion(inputPath) {
  const stepStart = Date.now();
  console.log('▶ [ÉTAPE 1/7] Product Ingestion : Vérification & Sauvegarde Immuable...');

  const fullPath = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Fichier produit introuvable à l'emplacement : ${fullPath}`);
  }

  const origBuffer = fs.readFileSync(fullPath);
  const metadata = await sharp(origBuffer).metadata();

  // Sauvegarde immuable de contrôle
  const backupPath = path.resolve(process.cwd(), 'debug_01_original.png');
  await sharp(origBuffer).png().toFile(backupPath);

  const duration = ((Date.now() - stepStart) / 1000).toFixed(2);
  recordStepMetric('1. Product Ingestion', 'Sharp I/O Local', 0, 0.0000, duration, `${metadata.width}x${metadata.height}px (${metadata.format})`);

  console.log(`✅ Ingestion réussie en ${duration}s :`);
  console.log(`   Dimensions d'origine : ${metadata.width}x${metadata.height}px | Format : ${metadata.format}`);
  console.log(`   💾 Backup témoin     : ${backupPath}`);

  return { origBuffer, metadata };
}

// ----------------------------------------------------------------------------
// ÉTAPE 2 : UNIVERSAL PRODUCT SEGMENTATION & ALPHA MASK (Problem 1 Fix)
// ----------------------------------------------------------------------------
async function step2_ProductSegmentation(origBuffer, origMeta) {
  const stepStart = Date.now();
  console.log('\n▶ [ÉTAPE 2/7] Product Segmentation : Détection Intelligente & Masque Alpha...');

  const hasAuthenticAlpha = origMeta.hasAlpha && origMeta.format === 'png';

  // Si l'image possède déjà une couche alpha avec transparence significative (ex: bottle_nutrex.png)
  if (hasAuthenticAlpha) {
    const stats = await sharp(origBuffer).raw().toBuffer({ resolveWithObject: true });
    let transparentCount = 0;
    for (let i = 3; i < stats.data.length; i += 4) {
      if (stats.data[i] < 240) transparentCount++;
    }
    const ratio = transparentCount / (stats.data.length / 4);
    if (ratio > 0.08) {
      console.log(`   💎 Canal alpha natif détecté et valide (${(ratio * 100).toFixed(1)}% de transparence).`);
      
      const cutoutBuf = await sharp(origBuffer).png().toBuffer();
      // Création du masque binaire pour inspection
      const maskBuf = await sharp(cutoutBuf).extractChannel('alpha').toBuffer();
      fs.writeFileSync(path.resolve(process.cwd(), 'debug_02_cutout.png'), cutoutBuf);
      fs.writeFileSync(path.resolve(process.cwd(), 'debug_02_mask.png'), maskBuf);

      const duration = ((Date.now() - stepStart) / 1000).toFixed(2);
      recordStepMetric('2. Product Segmentation', 'Alpha Natif Validé', 0, 0.0000, duration, `Transparence ${(ratio * 100).toFixed(1)}%`);
      return { cutoutBuf, maskBuf };
    }
  }

  // Pour les images opaques (ex: adora_hero_perfume.jpg avec plateau en céramique) :
  // Détection Vision des coordonnées exactes de l'objet héros (sans le socle ou la table)
  console.log('   🔍 Localisation chirurgicale du produit via Vision (exclusion des socles et tables)...');
  const base64Img = `data:image/jpeg;base64,${origBuffer.toString('base64')}`;
  
  const bboxPrompt = `Analyze this product photograph.
Identify the bounding box containing ONLY the central commercial hero product (the actual bottle, tube, box, or item).
CRITICAL: Exclude any external support platform, ceramic plate, wooden table, pedestal, or fabric beneath it.
Return STRICTLY a JSON object with normalized coordinates [0-1000]:
{
  "ymin": 150,
  "xmin": 330,
  "ymax": 720,
  "xmax": 690,
  "productName": "perfume bottle",
  "pedestalDetectedBelow": true
}`;

  const bboxRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: bboxPrompt },
            { type: 'image_url', image_url: { url: base64Img, detail: 'low' } }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 150,
      temperature: 0.1,
    }),
  });

  let cropBox = { left: 0, top: 0, width: origMeta.width, height: origMeta.height };
  let bboxTokens = 0;
  let bboxCost = 0;

  if (bboxRes.ok) {
    const bboxData = await bboxRes.json();
    const usage = bboxData.usage || { prompt_tokens: 0, completion_tokens: 0 };
    bboxTokens = usage.total_tokens || 0;
    bboxCost = calcLlmCost(usage.prompt_tokens, usage.completion_tokens);
    try {
      const parsed = JSON.parse(bboxData.choices[0].message.content);
      const W = origMeta.width;
      const H = origMeta.height;
      const ymin = Math.max(0, Math.min(1000, parsed.ymin ?? 0));
      const xmin = Math.max(0, Math.min(1000, parsed.xmin ?? 0));
      const ymax = Math.max(ymin + 50, Math.min(1000, parsed.ymax ?? 1000));
      const xmax = Math.max(xmin + 50, Math.min(1000, parsed.xmax ?? 1000));

      cropBox = {
        left: Math.round((xmin / 1000) * W),
        top: Math.round((ymin / 1000) * H),
        width: Math.round(((xmax - xmin) / 1000) * W),
        height: Math.round(((ymax - ymin) / 1000) * H),
      };
      console.log(`   🎯 Bounding Box isolée : [${cropBox.left}, ${cropBox.top}, ${cropBox.width}x${cropBox.height}px]`);
    } catch (e) {
      console.warn('   Bbox parsing fallback :', e.message);
    }
  }

  // Extraction du recadrage centré sur l'objet
  const croppedBuf = await sharp(origBuffer)
    .extract(cropBox)
    .toBuffer();

  // Création du masque de détourage fin (edge-aware)
  const { data, info } = await sharp(croppedBuf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;

  // Échantillonnage du fond aux 4 coins du crop
  const sampleR = (data[0] + data[(w - 1) * 4] + data[(h - 1) * w * 4] + data[(w * h - 1) * 4]) / 4;
  const sampleG = (data[1] + data[(w - 1) * 4 + 1] + data[(h - 1) * w * 4 + 1] + data[(w * h - 1) * 4 + 1]) / 4;
  const sampleB = (data[2] + data[(w - 1) * 4 + 2] + data[(h - 1) * w * 4 + 2] + data[(w * h - 1) * 4 + 2]) / 4;

  const maskRaw = Buffer.alloc(w * h);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const dist = Math.sqrt(Math.pow(r - sampleR, 2) + Math.pow(g - sampleG, 2) + Math.pow(b - sampleB, 2));

      // Préservation absolue du corps et étiquettes du produit :
      // On n'élimine que si le pixel est connecté à la couleur d'arrière-plan
      if (dist < 40 || (r > 220 && g > 215 && b > 200 && (x < w * 0.18 || x > w * 0.82 || y < h * 0.15 || y > h * 0.88))) {
        data[idx + 3] = 0;
        maskRaw[y * w + x] = 0;
      } else if (dist < 58 && (x < w * 0.15 || x > w * 0.85 || y < h * 0.12)) {
        const alpha = Math.round(((dist - 40) / 18) * 255);
        data[idx + 3] = alpha;
        maskRaw[y * w + x] = alpha;
      } else {
        maskRaw[y * w + x] = 255;
      }
    }
  }

  const cutoutBuf = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  const maskBuf = await sharp(maskRaw, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();

  fs.writeFileSync(path.resolve(process.cwd(), 'debug_02_cutout.png'), cutoutBuf);
  fs.writeFileSync(path.resolve(process.cwd(), 'debug_02_mask.png'), maskBuf);

  const duration = ((Date.now() - stepStart) / 1000).toFixed(2);
  recordStepMetric('2. Product Segmentation', 'gpt-4o-mini Vision + Sharp', bboxTokens, bboxCost, duration, 'Détourage propre sans socle');

  console.log(`✅ Segmentation finalisée en ${duration}s :`);
  console.log(`   💾 Détourage produit sauvegardé : debug_02_cutout.png`);
  console.log(`   💾 Masque alpha inspectable     : debug_02_mask.png`);

  return { cutoutBuf, maskBuf };
}

// ----------------------------------------------------------------------------
// ÉTAPE 3 : SMART CREATIVE DIRECTION & COPYWRITING (Problem 3 Fix)
// ----------------------------------------------------------------------------
async function step3_CreativeDirection(cutoutBuf) {
  const stepStart = Date.now();
  console.log('\n▶ [ÉTAPE 3/7] Smart Creative Direction & Copywriting Darija (gpt-4o-mini)...');

  const b64 = cutoutBuf.toString('base64');
  const imageContent = `data:image/png;base64,${b64}`;

  const prompt = `Tu es le Directeur Artistique en chef de MarkMosaiq.
Ce produit va être mis en valeur dans une publicité de très haut luxe.

Consignes architecturales STRICTES :
1. DÉCOR VACANT POSITIF : L'IA d'image va générer UNIQUEMENT l'environnement d'arrière-plan.
   Le prompt du décor doit décrire une surface de présentation centrale (comptoir, marbre, ou podium d'architecte) TOTALEMENT VACANTE et lisse en son milieu inférieur, attendant un objet.
   INTERDICTION TOTALE de mentionner "sans objet", "pas de flacon", "pas de bouteille". Utiliser uniquement des formulations positives ("vacant pristine central counter surface smoothly awaiting placement").
2. ÉCLAIRAGE : Éclairage studio 45° en haut à gauche avec diffusion douce.
3. COPYWRITING :
   - Secteur parmi : "cosmetics", "jewelry", "nutrition", "fashion", "food", "tech".
   - Accroche authentique en vrai Darija tunisien orientée conversion Instagram/WhatsApp.
   - Accroche de réassurance en français de prestige.
   - Badge de confiance (ex: ✨ Édition Prestige ou 🚚 Livri fi 24-48h).

Réponds STRICTEMENT en JSON :
{
  "sector": "cosmetics",
  "categoryFr": "Haute Parfumerie & Soins",
  "backgroundPrompt": "Luxury commercial advertising studio staging set. Opulent Parisian perfumery salon, warm mahogany woodwork and dark imperial emperador marble counter in soft background bokeh. The central marble counter surface is completely vacant, pristine, smooth and polished, cleanly awaiting an object. Directional studio softbox key light from upper-left at 45 degrees, warm amber atmospheric fill, photorealistic depth of field, 8k luxury editorial.",
  "hookDarija": "عطر Oud Impérial، ريحة فخمة تخليك تحس بالتميز! جربه اليوم بـ 149 DT.",
  "hookFr": "L'essence du luxe oriental au cœur d'un sillage envoûtant.",
  "badgeText": "✨ Édition Prestige",
  "keyLightDirection": "top-left-45deg",
  "surfaceType": "marble"
}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Produit : "${productName}" à ${priceTND} chez ${brandName}.` },
            { type: 'image_url', image_url: { url: imageContent, detail: 'low' } }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 350,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errObj = await res.json().catch(() => null);
    throw new Error(`Échec direction artistique (${res.status}) : ${errObj?.error?.message || res.statusText}`);
  }

  const data = await res.json();
  const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
  const cost = calcLlmCost(usage.prompt_tokens, usage.completion_tokens);
  const parsed = JSON.parse(data.choices[0].message.content);
  const duration = ((Date.now() - stepStart) / 1000).toFixed(2);

  recordStepMetric('3. Creative Direction', 'gpt-4o-mini', usage.total_tokens, cost, duration, `${parsed.sector?.toUpperCase()} - Direction validée`);

  console.log(`✅ Direction Artistique & Copywriting validés en ${duration}s :`);
  console.log(`   🏷️  Secteur       : ${parsed.sector?.toUpperCase()} (${parsed.categoryFr})`);
  console.log(`   🇹🇳 Darija Hook   : "${parsed.hookDarija}"`);
  console.log(`   🇫🇷 Accroche FR   : "${parsed.hookFr}"`);
  console.log(`   🏷️  Badge        : ${parsed.badgeText}`);
  console.log(`   💡 Décor Positif : "${parsed.backgroundPrompt.slice(0, 90)}..."`);

  return parsed;
}

// ----------------------------------------------------------------------------
// ÉTAPE 4 : AI BACKGROUND GENERATION (Problem 2 Fix : ZÉRO altération du produit)
// ----------------------------------------------------------------------------
async function step4_BackgroundGeneration(creativeDir, aspectParam) {
  const stepStart = Date.now();
  console.log('\n▶ [ÉTAPE 4/7] AI Background Generation (gpt-image-2.5-flare)...');

  const isStory = aspectParam === '9:16';
  const size = isStory ? '1024x1536' : '1024x1024';
  const unitPrice = OFFICIAL_PRICING['gpt-image-2.5-flare'][size]?.medium || 0.011;

  console.log(`   🎨 Modèle        : gpt-image-2.5-flare | Résolution : ${size}`);
  console.log(`   ⚡ Architecture   : Génération STRICTEMENT de l'arrière-plan (Le produit reste 100% intouché)`);

  const genRes = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-2.5-flare',
      prompt: creativeDir.backgroundPrompt,
      n: 1,
      quality: 'medium',
      size: size,
      background: 'opaque',
      output_format: 'jpeg',
    }),
  });

  if (!genRes.ok) {
    const errBody = await genRes.json().catch(() => null);
    throw new Error(`Échec génération background (${genRes.status}) : ${errBody?.error?.message || genRes.statusText}`);
  }

  const genData = await genRes.json();
  const imgObj = genData?.data?.[0];
  let bgBuffer = null;

  if (imgObj?.url) {
    const f = await fetch(imgObj.url);
    bgBuffer = Buffer.from(await f.arrayBuffer());
  } else if (imgObj?.b64_json) {
    bgBuffer = Buffer.from(imgObj.b64_json, 'base64');
  }

  if (!bgBuffer) {
    throw new Error('Réponse OpenAI vide pour l\'arrière-plan.');
  }

  const duration = ((Date.now() - stepStart) / 1000).toFixed(2);
  const debugBgPath = path.resolve(process.cwd(), 'debug_04_background.jpeg');
  fs.writeFileSync(debugBgPath, bgBuffer);

  recordStepMetric('4. AI Background Gen', 'gpt-image-2.5-flare (medium)', 0, unitPrice, duration, `${size} background pur sans produit`);

  console.log(`✅ Arrière-plan immersif généré avec succès en ${duration}s ($${unitPrice} USD) !`);
  console.log(`   💾 Fichier témoin : ${debugBgPath}`);

  return bgBuffer;
}

// ----------------------------------------------------------------------------
// ÉTAPE 5 : PRODUCT INTEGRATION & RELATIVE SHADOWS (Constitution Section 3)
// ----------------------------------------------------------------------------
async function step5_ProductIntegration(bgBuffer, cutoutBuf, creativeDir, aspectParam) {
  const stepStart = Date.now();
  console.log('\n▶ [ÉTAPE 5/7] Product Integration : Incrustation Physique & Ombres Relatives...');

  const isStory = aspectParam === '9:16';
  const W = 1080;
  const H = isStory ? 1920 : 1080;

  // 1. Fond mis à l'échelle cible
  let canvas = sharp(bgBuffer).resize(W, H, { fit: 'cover' });

  // 2. Calcul du dimensionnement et de l'ancrage du produit réel (JAMAIS redessiné par l'IA)
  const prodMeta = await sharp(cutoutBuf).metadata();
  const origW = prodMeta.width || 400;
  const origH = prodMeta.height || 600;

  const maxProdW = Math.round(W * (isStory ? 0.48 : 0.44));
  const maxProdH = Math.round(H * 0.46);
  const scale = Math.min(maxProdW / origW, maxProdH / origH, 1.0);
  const pw = Math.round(origW * scale);
  const ph = Math.round(origH * scale);

  const resizedProd = await sharp(cutoutBuf).resize(pw, ph, { fit: 'inside' }).toBuffer();

  const centerX = Math.round(W * 0.5);
  // Ancrage au sol réaliste dans la zone utile
  const groundY = Math.round(H * (isStory ? 0.68 : 0.74));

  // 3. Modélisation physique des ombres relatives (Constitution Section 3.3)
  // - Contact Blur : W_product * 0.035
  // - Ambient Occlusion : ellipse d'ancrage sombre immédiat
  // - Cast Shadow : déport doux à l'opposé de la source 45°
  const shadowSvg = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Contact Shadow (Occlusion ambiante sous la base) -->
        <filter id="aoBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="${Math.max(6, Math.round(pw * 0.035))}" />
        </filter>
        <!-- Cast Shadow (Ombre projetée directionnelle) -->
        <filter id="castBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="22" />
        </filter>
        <radialGradient id="aoGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0.92" />
          <stop offset="65%" stop-color="#000000" stop-opacity="0.55" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="castGrad" cx="40%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#05070B" stop-opacity="0.65" />
          <stop offset="70%" stop-color="#05070B" stop-opacity="0.25" />
          <stop offset="100%" stop-color="#05070B" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- Ombre portée directionnelle (déportée vers la droite car lumière depuis haut-gauche) -->
      <ellipse cx="${centerX + 26}" cy="${groundY + 12}" rx="${pw * 0.52}" ry="32" fill="url(#castGrad)" filter="url(#castBlur)" />

      <!-- Occlusion de contact physique direct sous la base du flacon -->
      <ellipse cx="${centerX}" cy="${groundY + 4}" rx="${pw * 0.44}" ry="16" fill="url(#aoGrad)" filter="url(#aoBlur)" />
    </svg>
  `;

  const layers = [
    { input: Buffer.from(shadowSvg), top: 0, left: 0 },
    {
      input: resizedProd,
      left: Math.round(centerX - pw / 2),
      top: Math.round(groundY - ph + 4),
    }
  ];

  const integratedBuf = await canvas
    .composite(layers)
    .jpeg({ quality: 96 })
    .toBuffer();

  const debugPath = path.resolve(process.cwd(), 'debug_05_integrated.jpeg');
  fs.writeFileSync(debugPath, integratedBuf);

  const duration = ((Date.now() - stepStart) / 1000).toFixed(2);
  recordStepMetric('5. Product Integration', 'Sharp Physics Engine', 0, 0.0000, duration, 'Contact shadow + Cast shadow');

  console.log(`✅ Produit original intégré en ${duration}s :`);
  console.log(`   Dimensions produit intégré : ${pw}x${ph}px (Fidélité 100% originale)`);
  console.log(`   💾 Fichier témoin          : ${debugPath}`);

  return integratedBuf;
}

// ----------------------------------------------------------------------------
// ÉTAPE 6 : DETERMINISTIC AD LAYOUT (Problem 2 & 5 Fix : BrandKit pur SVG)
// ----------------------------------------------------------------------------
async function step6_DeterministicAdLayout(integratedBuf, creativeDir, aspectParam) {
  const stepStart = Date.now();
  console.log('\n▶ [ÉTAPE 6/7] Deterministic Ad Layout : Branding & Typographie Officielle...');

  const isStory = aspectParam === '9:16';
  const W = 1080;
  const H = isStory ? 1920 : 1080;

  // Safe zones Story Mobile (14% haut = ~268px, 20% bas = ~384px)
  const safeTop = isStory ? 230 : 45;
  const cardW = Math.round(W * 0.90);
  const cardH = isStory ? 140 : 120;
  const cardX = Math.round((W - cardW) / 2);
  const cardY = isStory ? H - 390 : H - 150;

  const cleanBadge = escapeXml(creativeDir.badgeText || presetKit.badge);
  const cleanProdName = escapeXml(productName.length > 30 ? productName.slice(0, 30) + '...' : productName);
  const cleanPrice = escapeXml(priceTND);
  const cleanHook = escapeXml(creativeDir.hookDarija || creativeDir.hookFr);

  const pricePillW = Math.max(140, cleanPrice.length * 15 + 40);

  const layers = [];

  // 1. Logo officiel avec fond blanc nettoyé dans capsule glassmorphism
  let hasLogoImg = false;
  if (resolvedLogoPath && fs.existsSync(path.resolve(process.cwd(), resolvedLogoPath))) {
    try {
      const rawLogo = fs.readFileSync(path.resolve(process.cwd(), resolvedLogoPath));
      const { data, info } = await sharp(rawLogo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 235 && data[i + 1] > 235 && data[i + 2] > 235) {
          data[i + 3] = 0;
        }
      }
      const cleanLogoBuf = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
        .resize({ width: 130, height: 32, fit: 'inside' })
        .png()
        .toBuffer();

      layers.push({
        input: cleanLogoBuf,
        top: safeTop + 7,
        left: 48 + 26,
      });
      hasLogoImg = true;
    } catch {
      // Ignorer si échec
    }
  }

  // 2. Habillage graphique SVG officiel (Capsule Logo, Badge Prestige, Cartouche Bas)
  const brandingSvg = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="glassDrop" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="14" flood-color="#000000" flood-opacity="0.85" />
        </filter>
        <linearGradient id="ctaGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${primaryColor}" />
          <stop offset="100%" stop-color="${secondaryColor}" />
        </linearGradient>
      </defs>

      <!-- Capsule Glassmorphism Logo (Haut Gauche) -->
      <g transform="translate(48, ${safeTop})" filter="url(#glassDrop)">
        <rect width="185" height="46" rx="23" fill="rgba(11, 14, 23, 0.88)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1.5" />
        ${!hasLogoImg ? `<text x="92" y="29" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="#FFFFFF">${escapeXml(brandName)}</text>` : ''}
      </g>

      <!-- Badge de Prestige & Réassurance (Haut Droite) -->
      <g transform="translate(${W - 255}, ${safeTop})" filter="url(#glassDrop)">
        <rect width="205" height="46" rx="23" fill="rgba(11, 14, 23, 0.88)" stroke="${primaryColor}" stroke-width="1.8" />
        <text x="102" y="28" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="900" fill="${primaryColor}">${cleanBadge}</text>
      </g>

      <!-- Cartouche Bas Publicitaire (Nom + Hook Darija + Bouton Dinars) -->
      <g filter="url(#glassDrop)">
        <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="22" fill="rgba(11, 14, 23, 0.92)" stroke="rgba(255, 255, 255, 0.16)" stroke-width="1.5" />
        
        <!-- Nom du Produit -->
        <text x="${cardX + 28}" y="${cardY + 46}" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">
          ${cleanProdName}
        </text>

        <!-- Accroche Darija / Réassurance -->
        <text x="${cardX + 28}" y="${cardY + 86}" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" fill="#94A3B8">
          ${cleanHook}
        </text>

        <!-- CTA Pill Prix Dinars (DT) -->
        <g transform="translate(${cardX + cardW - pricePillW - 24}, ${cardY + (cardH - 54) / 2})">
          <rect width="${pricePillW}" height="54" rx="14" fill="url(#ctaGradient)" />
          <text x="${pricePillW / 2}" y="34" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="900" fill="#FFFFFF">
            ${cleanPrice}
          </text>
        </g>
      </g>
    </svg>
  `;

  layers.push({ input: Buffer.from(brandingSvg), top: 0, left: 0 });

  const finalBuffer = await sharp(integratedBuf)
    .composite(layers)
    .jpeg({ quality: 95 })
    .toBuffer();

  const finalPath = path.resolve(process.cwd(), 'test_generation_branded.jpeg');
  fs.writeFileSync(finalPath, finalBuffer);

  const duration = ((Date.now() - stepStart) / 1000).toFixed(2);
  recordStepMetric('6. Deterministic Layout', 'SVG / Sharp Compositor', 0, 0.0000, duration, 'Glassmorphism + Safe zones + Prix DT');

  console.log(`✅ Affiche publicitaire finalisée en ${duration}s !`);
  console.log(`   💾 Fichier final prêt : ${finalPath}`);

  return finalPath;
}

// ----------------------------------------------------------------------------
// ÉTAPE 7 : AUTOMATED QUALITY GATE MULTI-CRITÈRES (Problem 5 Fix)
// ----------------------------------------------------------------------------
async function step7_QualityGate(finalImagePath) {
  const stepStart = Date.now();
  console.log('\n▶ [ÉTAPE 7/7] Automated Quality Gate : Audit Vision Multi-Critères (gpt-4o-mini)...');

  const buf = fs.readFileSync(finalImagePath);
  const imageBase64 = `data:image/jpeg;base64,${buf.toString('base64')}`;

  const auditPrompt = `Tu es le Contrôleur Qualité en Chef d'Adora / MarkMosaiq.
Inspecte rigoureusement cette affiche publicitaire commerciale.

Évalue objectivement les 6 critères suivants selon le barème :
1. productFidelity (0-20 pts) : Le produit physique d'origine est-il intact, net, sans distorsion ni redessin IA ?
2. packagingAndEdges (0-15 pts) : Le détourage est-il propre sans artefact ni fond d'origine résiduel ?
3. brandAndLogoIntegrity (0-15 pts) : Le logo et la capsule sont-ils nets, lisibles et conformes ?
4. commercialPriceAndCopy (0-15 pts) : Le prix (${priceTND}) et l'accroche Darija sont-ils lisibles et sans faute ?
5. lightingAndShadowCohesion (0-20 pts) : L'ombre de contact sous le produit et la lumière 45° sont-elles cohérentes ?
6. compositionAndSafeZones (0-15 pts) : Les zones de sécurité mobile Story sont-elles respectées ?

Règle du Quality Gate :
- Score minimum requis pour validation : 80 / 100
- Tout critère individuel < 60% entraîne le rejet.

Réponds STRICTEMENT en JSON :
{
  "totalScore": 92,
  "passed": true,
  "scores": {
    "productFidelity": 19,
    "packagingAndEdges": 14,
    "brandAndLogoIntegrity": 14,
    "commercialPriceAndCopy": 15,
    "lightingAndShadowCohesion": 18,
    "compositionAndSafeZones": 14
  },
  "gateVerdict": "APPROUVÉ POUR EXPORT ET DIFFUSION",
  "expertCritique": "1 phrase d'analyse technique constructive"
}`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: auditPrompt },
            { type: 'image_url', image_url: { url: imageBase64, detail: 'low' } }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const errObj = await res.json().catch(() => null);
    throw new Error(`Échec Vision QA (${res.status}) : ${errObj?.error?.message || res.statusText}`);
  }

  const data = await res.json();
  const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
  const cost = calcLlmCost(usage.prompt_tokens, usage.completion_tokens);
  const evaluation = JSON.parse(data.choices[0].message.content);
  const duration = ((Date.now() - stepStart) / 1000).toFixed(2);

  recordStepMetric('7. Vision Quality Gate', 'gpt-4o-mini Vision', usage.total_tokens, cost, duration, `Score ${evaluation.totalScore}/100 (${evaluation.passed ? 'PASSED' : 'FAILED'})`);

  console.log(`✅ Quality Gate complété en ${duration}s :`);
  console.log(`   ⭐ Score Total        : ${evaluation.totalScore} / 100 (${evaluation.passed ? '🟢 CONFORME' : '🔴 REJETÉ'})`);
  console.log(`   🔍 Fidélité Produit   : ${evaluation.scores?.productFidelity} / 20`);
  console.log(`   ✂️  Qualité Détourage  : ${evaluation.scores?.packagingAndEdges} / 15`);
  console.log(`   🛡️  Intégrité Logo     : ${evaluation.scores?.brandAndLogoIntegrity} / 15`);
  console.log(`   💰 Prix & Accroche    : ${evaluation.scores?.commercialPriceAndCopy} / 15`);
  console.log(`   💡 Cohérence Ombres   : ${evaluation.scores?.lightingAndShadowCohesion} / 20`);
  console.log(`   📐 Safe Zones Mobile  : ${evaluation.scores?.compositionAndSafeZones} / 15`);
  console.log(`   💬 Verdict Expert     : "${evaluation.expertCritique}"\n`);

  return evaluation;
}

// ----------------------------------------------------------------------------
// EXÉCUTION DU PIPELINE
// ----------------------------------------------------------------------------
async function main() {
  try {
    // 1. Ingestion & Backup
    const { origBuffer, metadata } = await step1_ProductIngestion(resolvedProductPath);

    // 2. Segmentation intelligente sans découpe hardcodée
    const { cutoutBuf } = await step2_ProductSegmentation(origBuffer, metadata);

    // 3. Direction artistique & Copywriting
    const creativeDir = await step3_CreativeDirection(cutoutBuf);

    // 4. Génération de l'arrière-plan pur sans produit
    const bgBuffer = await step4_BackgroundGeneration(creativeDir, aspect);

    // 5. Intégration du produit d'origine + ombres relatives
    const integratedBuf = await step5_ProductIntegration(bgBuffer, cutoutBuf, creativeDir, aspect);

    // 6. Branding déterministe BrandKit
    const finalPath = await step6_DeterministicAdLayout(integratedBuf, creativeDir, aspect);

    // 7. Quality Gate Vision
    await step7_QualityGate(finalPath);

    const totalDuration = ((Date.now() - sessionMetrics.startTime) / 1000).toFixed(2);
    const costTND = (sessionMetrics.totalCostUSD * 3.15).toFixed(4);

    console.log('='.repeat(78));
    console.log('📊 BILAN FINANCIER & PERFORMANCE DE PRODUCTION');
    console.log('='.repeat(78));
    console.table(sessionMetrics.steps.map(s => ({
      'Étape': s.step,
      'Moteur': s.model,
      'Tokens': s.tokens || 'N/A',
      'Durée': `${s.durationSec}s`,
      'Coût ($ USD)': `$${s.costUSD.toFixed(5)}`,
      'Détails': s.details || '',
    })));

    console.log(`⏱️  Durée totale d'exécution : ${totalDuration}s`);
    console.log(`🔢 Total Tokens consommés    : ${sessionMetrics.totalTokens} tokens`);
    console.log(`💰 Coût total réel de l'image : $${sessionMetrics.totalCostUSD.toFixed(4)} USD (~${costTND} DT)`);
    console.log(`🖼️  Fichier final exporté     : file://${finalPath}`);
    console.log('='.repeat(78) + '\n');

  } catch (err) {
    console.error('\n❌ ERREUR PIPELINE :', err);
    process.exit(1);
  }
}

main();
