/**
 * MOTEUR DE DÉTOURAGE CLASSIQUE SANS IA — MarkMosaiq (version corrigée v2)
 *
 * Pipeline :
 *  0. Chargement : rotation EXIF, aplatissement alpha, réduction à maxWorkingSize (2000px)
 *  1. Analyse du fond : palette multi-couleurs (k-means en CIELAB), score de confiance,
 *     détection des images "difficiles" (fond multicolore, produit proche du fond)
 *  2. Masque : croissance de région depuis les bords (flood fill) qui s'ARRÊTE aux contours forts
 *     -> plus de suppression globale par couleur (le cadran blanc / reflets de l'acier survivent)
 *  3. Cavités internes : conservées par défaut, option pour protéger les vrais trous
 *  4. Pinceau Garder/Supprimer = GRAINES (le rouge enseigne la palette et sème la croissance,
 *     le vert fait mur)
 *  5. Suppression des poussières (composantes connexes)
 *  6. Adoucissement des bords (flou boîte séparable + courbe smoothstep, bords restent nets)
 *  7. Anti-frange : la couleur des pixels de bord est copiée depuis le pixel opaque intérieur
 *     le plus proche (plus de division par alpha => plus de bruit)
 *  8. Presets places de marché (Amazon 85%, Shopify, Instagram, Etsy), ombre douce, reflet en dégradé
 *
 * Corrections par rapport à la v1 :
 *  - padding : 0.075 par côté = 85% de remplissage (Amazon)
 *  - removeSpeckles réellement implémenté
 *  - rotation EXIF
 *  - defringe stable (copie de couleur voisine au lieu de diviser par alpha)
 *  - reflet avec vrai dégradé (dest-in), ombre SVG compatible librsvg (fill-opacity)
 *  - performance : traitement plafonné à 2000px, LUT sRGB, tableaux typés, pas de Math.min(...spread)
 */

import sharp, { OverlayOptions } from 'sharp';

// =========================================================================
// TYPES
// =========================================================================

export interface ClassicalAnalysisResult {
  confidenceScore: number; // 0 à 100
  confidenceLevel: 'high' | 'medium' | 'low';
  isStudioIdeal: boolean;
  recommendation: string;
  detectedBgColor: { r: number; g: number; b: number; hex: string };
  isWhiteOrLight: boolean;
  variance: number;

  // Nouveaux champs
  isHardImage: boolean; // fond multicolore ou produit proche du fond
  needsManualAssist: boolean; // l'UI doit ouvrir le pinceau automatiquement
  paletteHex: string[]; // couleurs de fond détectées
  paletteSpread: number; // écart ΔE max entre couleurs de fond
  foregroundSimilarity: number; // 0..1 part du centre qui ressemble au fond
}

export interface ClassicalCutoutOptions {
  threshold?: number; // 150 - 255 : blanc pur accepté comme fond (uniquement atteint depuis les bords)
  tolerance?: number; // 5 - 80 : distance ΔE max à la palette de fond
  edgeLimit?: number; // 2 - 25 : contour fort qui arrête la croissance (ΔE entre pixels voisins)
  featherRadius?: number; // 0 - 10
  fillHoles?: boolean; // true = cavités internes restent opaques
  protectHoles?: boolean; // true = les grandes cavités qui ressemblent au fond restent transparentes
  minHoleRatio?: number; // taille mini d'un trou protégé (part de la surface produit), défaut 0.002
  defringe?: boolean;
  removeSpeckles?: boolean;
  speckleMinRatio?: number; // composantes < ratio * plus grande composante sont supprimées, défaut 0.02
  maxWorkingSize?: number; // défaut 2000

  // Préréglages E-commerce
  marketplacePreset?: 'transparent' | 'amazon' | 'shopify' | 'instagram' | 'etsy' | 'custom';
  customBgColor?: string;
  autoCenter?: boolean;
  paddingPercent?: number; // PAR CÔTÉ. 0.075 => 85% de remplissage
  targetSize?: { width: number; height: number };

  // Ombrage & Rendu
  shadowMode?: 'none' | 'soft-drop' | 'reflection';
  shadowIntensity?: number; // 0.1 à 1.0

  // Export
  format?: 'png' | 'webp' | 'jpeg';
  quality?: number;

  // Masque pinceau : 'data:image/png;base64,...'
  // Rouge = fond (graine), Vert = produit (mur + conservation)
  brushMaskBase64?: string;
}

export interface ClassicalCutoutResult {
  success: boolean;
  transparentBase64: string;
  processedBase64: string;
  analysis: ClassicalAnalysisResult;
  dimensions: { width: number; height: number };
  boundingBox: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
  processingTimeMs: number;
}

// =========================================================================
// UTILITAIRES COULEUR (CIELAB, LUT sRGB)
// =========================================================================

const LIN = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  LIN[i] = c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
}

const labF = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const rl = LIN[r | 0], gl = LIN[g | 0], bl = LIN[b | 0];
  const fx = labF((rl * 0.4124 + gl * 0.3576 + bl * 0.1805) / 0.95047);
  const fy = labF(rl * 0.2126 + gl * 0.7152 + bl * 0.0722);
  const fz = labF((rl * 0.0193 + gl * 0.1192 + bl * 0.9505) / 1.08883);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

function deltaE(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const dL = a[0] - b[0], da = a[1] - b[1], db = a[2] - b[2];
  return Math.sqrt(dL * dL + da * da + db * db);
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '');
  if (clean.length === 3) clean = clean.split('').map((c) => c + c).join('');
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 255, g: 255, b: 255 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/** Convertit un buffer RGBA en tableau Lab (3 floats par pixel). */
function rgbaToLabArray(data: Uint8Array, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h * 3);
  for (let i = 0, n = w * h; i < n; i++) {
    const rl = LIN[data[i * 4]], gl = LIN[data[i * 4 + 1]], bl = LIN[data[i * 4 + 2]];
    const fx = labF((rl * 0.4124 + gl * 0.3576 + bl * 0.1805) / 0.95047);
    const fy = labF(rl * 0.2126 + gl * 0.7152 + bl * 0.0722);
    const fz = labF((rl * 0.0193 + gl * 0.1192 + bl * 0.9505) / 1.08883);
    out[i * 3] = 116 * fy - 16;
    out[i * 3 + 1] = 500 * (fx - fy);
    out[i * 3 + 2] = 200 * (fy - fz);
  }
  return out;
}

// =========================================================================
// 0. CHARGEMENT
// =========================================================================

interface WorkingImage {
  data: Buffer; // RGBA original (net)
  dec: Buffer; // RGBA légèrement flouté (pour les décisions : réduit le bruit JPEG)
  w: number;
  h: number;
}

async function loadWorkingImage(input: Buffer, maxSize: number, blurSigma = 0.8): Promise<WorkingImage> {
  const { data, info } = await sharp(input, { failOn: 'none' })
    .rotate() // applique l'orientation EXIF (photos téléphone)
    .flatten({ background: '#ffffff' }) // PNG transparents -> blanc
    .resize({ width: maxSize, height: maxSize, fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const dec =
    blurSigma > 0
      ? await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
          .blur(blurSigma)
          .raw()
          .toBuffer()
      : data;

  return { data, dec, w: info.width, h: info.height };
}

// =========================================================================
// 1. ANALYSE : PALETTE DE FOND (k-means Lab) + SCORE DE CONFIANCE
// =========================================================================

interface KMeansResult {
  centroids: Float32Array;
  assign: Uint8Array;
  counts: number[];
}

function kmeansLab(pts: Float32Array, n: number, kWanted: number, iters = 8): KMeansResult {
  const k = Math.max(1, Math.min(kWanted, n));
  const c = new Float32Array(k * 3);
  c[0] = pts[0]; c[1] = pts[1]; c[2] = pts[2];

  // Initialisation par point le plus éloigné
  for (let j = 1; j < k; j++) {
    let bestI = 0, bestD = -1;
    for (let i = 0; i < n; i++) {
      let nearest = Infinity;
      for (let q = 0; q < j; q++) {
        const dL = pts[i * 3] - c[q * 3], da = pts[i * 3 + 1] - c[q * 3 + 1], db = pts[i * 3 + 2] - c[q * 3 + 2];
        const d = dL * dL + da * da + db * db;
        if (d < nearest) nearest = d;
      }
      if (nearest > bestD) { bestD = nearest; bestI = i; }
    }
    c[j * 3] = pts[bestI * 3]; c[j * 3 + 1] = pts[bestI * 3 + 1]; c[j * 3 + 2] = pts[bestI * 3 + 2];
  }

  const assign = new Uint8Array(n);
  let counts: number[] = new Array(k).fill(0);

  for (let it = 0; it < iters; it++) {
    const sum = new Float64Array(k * 3);
    counts = new Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      let best = 0, bd = Infinity;
      for (let j = 0; j < k; j++) {
        const dL = pts[i * 3] - c[j * 3], da = pts[i * 3 + 1] - c[j * 3 + 1], db = pts[i * 3 + 2] - c[j * 3 + 2];
        const d = dL * dL + da * da + db * db;
        if (d < bd) { bd = d; best = j; }
      }
      assign[i] = best;
      counts[best]++;
      sum[best * 3] += pts[i * 3]; sum[best * 3 + 1] += pts[i * 3 + 1]; sum[best * 3 + 2] += pts[i * 3 + 2];
    }
    for (let j = 0; j < k; j++) {
      if (counts[j] > 0) {
        c[j * 3] = sum[j * 3] / counts[j];
        c[j * 3 + 1] = sum[j * 3 + 1] / counts[j];
        c[j * 3 + 2] = sum[j * 3 + 2] / counts[j];
      }
    }
  }
  return { centroids: c, assign, counts };
}

interface BackgroundModel {
  analysis: ClassicalAnalysisResult;
  palette: Float32Array; // centroïdes Lab (3 par couleur)
}

function analyzeFromLab(rgba: Uint8Array, lab: Float32Array, w: number, h: number): BackgroundModel {
  // --- échantillonnage de la bordure (2%), sous-échantillonné à ~5000 points
  const m = Math.max(2, Math.floor(Math.min(w, h) * 0.02));
  const border: number[] = [];
  for (let y = 0; y < m; y++) for (let x = 0; x < w; x++) { border.push(y * w + x); border.push((h - 1 - y) * w + x); }
  for (let y = m; y < h - m; y++) for (let x = 0; x < m; x++) { border.push(y * w + x); border.push(y * w + (w - 1 - x)); }
  const stride = Math.max(1, Math.floor(border.length / 5000));
  const idxs: number[] = [];
  for (let i = 0; i < border.length; i += stride) idxs.push(border[i]);
  const n = idxs.length;

  if (n === 0) {
    return {
      analysis: {
        confidenceScore: 50, confidenceLevel: 'medium', isStudioIdeal: false,
        recommendation: 'Image trop petite ou non analysable.',
        detectedBgColor: { r: 255, g: 255, b: 255, hex: '#FFFFFF' },
        isWhiteOrLight: true, variance: 0, isHardImage: false, needsManualAssist: false,
        paletteHex: ['#FFFFFF'], paletteSpread: 0, foregroundSimilarity: 0,
      },
      palette: new Float32Array([100, 0, 0]),
    };
  }

  const pts = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const p = idxs[i];
    pts[i * 3] = lab[p * 3]; pts[i * 3 + 1] = lab[p * 3 + 1]; pts[i * 3 + 2] = lab[p * 3 + 2];
  }

  const km = kmeansLab(pts, n, 4);
  const k = km.counts.length;

  // clusters significatifs (>= 3% des points)
  const keep: number[] = [];
  for (let j = 0; j < k; j++) if (km.counts[j] / n >= 0.03) keep.push(j);
  if (keep.length === 0) keep.push(km.counts.indexOf(Math.max(...km.counts)));

  // moyennes RGB par cluster + écart quadratique moyen
  const rgbSum = keep.map(() => [0, 0, 0, 0]);
  let sq = 0;
  for (let i = 0; i < n; i++) {
    const j = km.assign[i];
    const d = deltaE([pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]], [km.centroids[j * 3], km.centroids[j * 3 + 1], km.centroids[j * 3 + 2]]);
    sq += d * d;
    const kk = keep.indexOf(j);
    if (kk >= 0) {
      const p = idxs[i];
      rgbSum[kk][0] += rgba[p * 4]; rgbSum[kk][1] += rgba[p * 4 + 1]; rgbSum[kk][2] += rgba[p * 4 + 2]; rgbSum[kk][3]++;
    }
  }
  const rms = Math.sqrt(sq / n);

  const palette = new Float32Array(keep.length * 3);
  const paletteHex: string[] = [];
  let domIdx = 0, domCount = -1;
  keep.forEach((j, kk) => {
    palette[kk * 3] = km.centroids[j * 3];
    palette[kk * 3 + 1] = km.centroids[j * 3 + 1];
    palette[kk * 3 + 2] = km.centroids[j * 3 + 2];
    const c = Math.max(1, rgbSum[kk][3]);
    paletteHex.push(rgbToHex(rgbSum[kk][0] / c, rgbSum[kk][1] / c, rgbSum[kk][2] / c));
    if (km.counts[j] > domCount) { domCount = km.counts[j]; domIdx = kk; }
  });

  const dc = Math.max(1, rgbSum[domIdx][3]);
  const dom = { r: Math.round(rgbSum[domIdx][0] / dc), g: Math.round(rgbSum[domIdx][1] / dc), b: Math.round(rgbSum[domIdx][2] / dc) };
  const domLab = [palette[domIdx * 3], palette[domIdx * 3 + 1], palette[domIdx * 3 + 2]];
  const domChroma = Math.sqrt(domLab[1] * domLab[1] + domLab[2] * domLab[2]);

  // écart max entre couleurs de fond
  let spread = 0;
  const kp = keep.length;
  for (let a = 0; a < kp; a++)
    for (let b = a + 1; b < kp; b++)
      spread = Math.max(spread, deltaE(
        [palette[a * 3], palette[a * 3 + 1], palette[a * 3 + 2]],
        [palette[b * 3], palette[b * 3 + 1], palette[b * 3 + 2]]
      ));

  // part du centre de l'image qui ressemble au fond (produit blanc sur blanc, etc.)
  let similar = 0, total = 0;
  const y0 = Math.floor(h * 0.3), y1 = Math.floor(h * 0.7), x0 = Math.floor(w * 0.3), x1 = Math.floor(w * 0.7);
  const sy = Math.max(1, Math.floor((y1 - y0) / 60)), sx = Math.max(1, Math.floor((x1 - x0) / 60));
  for (let y = y0; y < y1; y += sy) {
    for (let x = x0; x < x1; x += sx) {
      const p = (y * w + x) * 3;
      let best = Infinity;
      for (let j = 0; j < kp; j++) {
        const d = Math.sqrt(
          (lab[p] - palette[j * 3]) ** 2 + (lab[p + 1] - palette[j * 3 + 1]) ** 2 + (lab[p + 2] - palette[j * 3 + 2]) ** 2
        );
        if (d < best) best = d;
      }
      if (best <= 10) similar++;
      total++;
    }
  }
  const fgSim = total ? similar / total : 0;

  // --- score
  let score = 100 - rms * 2.2 - Math.max(0, spread - 18) * 0.9;
  if (domLab[0] >= 88) score += 8;
  else if (domLab[0] < 30) score -= 15;
  if (fgSim > 0.6) score -= Math.min(22, (fgSim - 0.6) * 55);
  score = Math.max(10, Math.min(99, Math.round(score)));

  const level: 'high' | 'medium' | 'low' = score >= 80 ? 'high' : score >= 55 ? 'medium' : 'low';
  const isHard = score < 55 || spread > 28 || fgSim > 0.75;

  let recommendation: string;
  if (isHard) {
    recommendation =
      'Image difficile (fond multicolore ou produit proche du fond). Marquez quelques zones avec le pinceau Garder/Supprimer pour guider la découpe.';
  } else if (level === 'high') {
    recommendation = 'Photo studio idéale (fond clair uniforme). Détourage net attendu sans IA.';
  } else if (level === 'medium') {
    recommendation = 'Fond acceptable avec dégradés ou ombres. Ajustez la tolérance si besoin.';
  } else {
    recommendation = 'Fond complexe. Utilisez le pinceau Garder/Supprimer pour affiner les contours.';
  }

  return {
    analysis: {
      confidenceScore: score,
      confidenceLevel: level,
      isStudioIdeal: score >= 75 && domLab[0] >= 70 && !isHard,
      recommendation,
      detectedBgColor: { ...dom, hex: rgbToHex(dom.r, dom.g, dom.b) },
      isWhiteOrLight: domLab[0] >= 80 && domChroma < 12,
      variance: Math.round(rms),
      isHardImage: isHard,
      needsManualAssist: score < 55 || fgSim > 0.75,
      paletteHex,
      paletteSpread: Math.round(spread),
      foregroundSimilarity: Math.round(fgSim * 100) / 100,
    },
    palette,
  };
}

/** Analyse publique (rapide : image réduite à 300px). */
export async function analyzeImageBackground(inputBuffer: Buffer): Promise<ClassicalAnalysisResult> {
  const img = await loadWorkingImage(inputBuffer, 300, 0);
  const lab = rgbaToLabArray(img.data, img.w, img.h);
  return analyzeFromLab(img.data, lab, img.w, img.h).analysis;
}

// =========================================================================
// 2. COMPOSANTES CONNEXES & MORPHOLOGIE
// =========================================================================

function labelComponents(region: Uint8Array, w: number, h: number) {
  const n = w * h;
  const labels = new Int32Array(n);
  const sizes: number[] = [0];
  const stack = new Int32Array(n);
  let count = 0;

  for (let s = 0; s < n; s++) {
    if (!region[s] || labels[s]) continue;
    count++;
    let sp = 0, size = 0;
    stack[sp++] = s;
    labels[s] = count;
    while (sp > 0) {
      const p = stack[--sp];
      size++;
      const x = p % w;
      if (p >= w && region[p - w] && !labels[p - w]) { labels[p - w] = count; stack[sp++] = p - w; }
      if (p < n - w && region[p + w] && !labels[p + w]) { labels[p + w] = count; stack[sp++] = p + w; }
      if (x > 0 && region[p - 1] && !labels[p - 1]) { labels[p - 1] = count; stack[sp++] = p - 1; }
      if (x < w - 1 && region[p + 1] && !labels[p + 1]) { labels[p + 1] = count; stack[sp++] = p + 1; }
    }
    sizes[count] = size;
  }
  return { labels, sizes, count };
}

/** Supprime les petites composantes (poussières) ; garde les objets multiples de taille comparable. */
function removeSpecklesFromAlpha(alpha: Uint8Array, w: number, h: number, minRatio: number, protect?: Uint8Array) {
  const region = new Uint8Array(w * h);
  for (let i = 0; i < region.length; i++) region[i] = alpha[i] >= 128 ? 1 : 0;
  const { labels, sizes, count } = labelComponents(region, w, h);
  if (count === 0) return;
  let maxSize = 0;
  for (let c = 1; c <= count; c++) if (sizes[c] > maxSize) maxSize = sizes[c];
  const minSize = maxSize * minRatio;
  for (let i = 0; i < alpha.length; i++) {
    if (alpha[i] > 0 && (labels[i] === 0 || sizes[labels[i]] < minSize)) {
      if (protect && protect[i]) continue;
      alpha[i] = 0;
    }
  }
}

/** Flou boîte séparable O(n) (fenêtre glissante, bords répliqués). */
function boxBlur(src: Uint8Array, w: number, h: number, r: number): Float32Array {
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  const size = 2 * r + 1;
  const cl = (v: number, max: number) => (v < 0 ? 0 : v > max ? max : v);

  for (let y = 0; y < h; y++) {
    const row = y * w;
    let sum = 0;
    for (let k = -r; k <= r; k++) sum += src[row + cl(k, w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = sum / size;
      sum += src[row + cl(x + r + 1, w - 1)] - src[row + cl(x - r, w - 1)];
    }
  }
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let k = -r; k <= r; k++) sum += tmp[cl(k, h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = sum / size;
      sum += tmp[cl(y + r + 1, h - 1) * w + x] - tmp[cl(y - r, h - 1) * w + x];
    }
  }
  return out;
}

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

// =========================================================================
// 3. MASQUE : CROISSANCE DE RÉGION DEPUIS LES BORDS (S'ARRÊTE AUX CONTOURS)
// =========================================================================

interface MaskParams {
  lab: Float32Array;
  dec: Uint8Array; // RGBA flouté (pour la règle du blanc)
  w: number;
  h: number;
  palette: Float32Array;
  tol: number;
  edgeLimit: number;
  threshold: number;
  allowWhiteRule: boolean;
  forceBg?: Uint8Array;
  forceFg?: Uint8Array;
}

function computePaletteDistance(lab: Float32Array, n: number, palette: Float32Array): Float32Array {
  const k = palette.length / 3;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const L = lab[i * 3], a = lab[i * 3 + 1], b = lab[i * 3 + 2];
    let best = Infinity;
    for (let j = 0; j < k; j++) {
      const dL = L - palette[j * 3], da = a - palette[j * 3 + 1], db = b - palette[j * 3 + 2];
      const d = dL * dL + da * da + db * db;
      if (d < best) best = d;
    }
    out[i] = Math.sqrt(best);
  }
  return out;
}

function growBackground(p: MaskParams): { bg: Uint8Array; dPal: Float32Array } {
  const { lab, dec, w, h, tol, edgeLimit, threshold, allowWhiteRule, forceBg, forceFg } = p;
  const n = w * h;
  const dPal = computePaletteDistance(lab, n, p.palette);
  const bg = new Uint8Array(n);
  const stack = new Int32Array(n);
  let sp = 0;

  const isBgLike = (i: number): boolean => {
    if (dPal[i] <= tol) return true;
    if (allowWhiteRule) {
      const o = i * 4;
      if (dec[o] >= threshold && dec[o + 1] >= threshold && dec[o + 2] >= threshold) return true;
    }
    return false;
  };

  const labDist = (i: number, j: number) => {
    const dL = lab[i * 3] - lab[j * 3], da = lab[i * 3 + 1] - lab[j * 3 + 1], db = lab[i * 3 + 2] - lab[j * 3 + 2];
    return Math.sqrt(dL * dL + da * da + db * db);
  };

  const seed = (i: number, forced: boolean) => {
    if (bg[i]) return;
    if (forceFg && forceFg[i]) return;
    if (forced || isBgLike(i)) { bg[i] = 1; stack[sp++] = i; }
  };

  // graines : bords de l'image
  for (let x = 0; x < w; x++) { seed(x, false); seed((h - 1) * w + x, false); }
  for (let y = 0; y < h; y++) { seed(y * w, false); seed(y * w + w - 1, false); }
  // graines : traits rouges de l'utilisateur
  if (forceBg) for (let i = 0; i < n; i++) if (forceBg[i]) seed(i, true);

  while (sp > 0) {
    const cur = stack[--sp];
    const x = cur % w;
    const nbrs = [cur >= w ? cur - w : -1, cur < n - w ? cur + w : -1, x > 0 ? cur - 1 : -1, x < w - 1 ? cur + 1 : -1];
    for (let q = 0; q < 4; q++) {
      const nb = nbrs[q];
      if (nb < 0 || bg[nb]) continue;
      if (forceFg && forceFg[nb]) continue; // trait vert = mur
      const forced = !!(forceBg && forceBg[nb]);
      if (!forced) {
        if (labDist(cur, nb) > edgeLimit) continue; // contour fort : on s'arrête
        if (!isBgLike(nb)) continue;
      }
      bg[nb] = 1;
      stack[sp++] = nb;
    }
  }
  return { bg, dPal };
}

/** Cavités internes qui ressemblent au fond : on décide si elles restent opaques ou deviennent transparentes. */
function applyEnclosedRegions(
  alpha: Uint8Array, bg: Uint8Array, dPal: Float32Array, w: number, h: number,
  tol: number, fillHoles: boolean, protectHoles: boolean, minHoleRatio: number, forceFg?: Uint8Array
) {
  if (fillHoles && !protectHoles) return; // tout reste opaque

  const n = w * h;
  const cand = new Uint8Array(n);
  let fgArea = 0;
  for (let i = 0; i < n; i++) {
    if (!bg[i]) {
      fgArea++;
      if (dPal[i] <= tol && !(forceFg && forceFg[i])) cand[i] = 1;
    }
  }
  const { labels, sizes, count } = labelComponents(cand, w, h);
  const minSize = fillHoles ? fgArea * minHoleRatio : 0;
  for (let i = 0; i < n; i++) {
    const l = labels[i];
    if (l > 0 && sizes[l] >= minSize) alpha[i] = 0;
  }
  void count;
}

// =========================================================================
// 4. ANTI-FRANGE : COPIE DE COULEUR DEPUIS LE PIXEL INTÉRIEUR LE PLUS PROCHE
// =========================================================================

function defringeColors(rgba: Uint8Array, alpha: Uint8Array, w: number, h: number, maxDist: number) {
  const n = w * h;
  const src = new Int32Array(n).fill(-1);
  const dist = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0, tail = 0;

  // sources : pixels opaques dont les 8 voisins sont aussi opaques
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      if (alpha[i] < 250) continue;
      if (
        alpha[i - 1] >= 250 && alpha[i + 1] >= 250 && alpha[i - w] >= 250 && alpha[i + w] >= 250 &&
        alpha[i - w - 1] >= 250 && alpha[i - w + 1] >= 250 && alpha[i + w - 1] >= 250 && alpha[i + w + 1] >= 250
      ) {
        src[i] = i;
        queue[tail++] = i;
      }
    }
  }

  while (head < tail) {
    const cur = queue[head++];
    if (dist[cur] >= maxDist) continue;
    const x = cur % w, y = (cur - x) / w;
    for (let dy = -1; dy <= 1; dy++) {
      const ny = y + dy;
      if (ny < 0 || ny >= h) continue;
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx;
        if (nx < 0 || nx >= w) continue;
        const nb = ny * w + nx;
        if (src[nb] !== -1) continue;
        src[nb] = src[cur];
        dist[nb] = dist[cur] + 1;
        queue[tail++] = nb;
      }
    }
  }

  for (let i = 0; i < n; i++) {
    const s = src[i];
    if (s >= 0 && s !== i) {
      rgba[i * 4] = rgba[s * 4];
      rgba[i * 4 + 1] = rgba[s * 4 + 1];
      rgba[i * 4 + 2] = rgba[s * 4 + 2];
    }
  }
}

// =========================================================================
// 5. PINCEAU MANUEL
// =========================================================================

async function parseBrushMask(base64: string, w: number, h: number) {
  const buf = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const raw = await sharp(buf).resize(w, h, { fit: 'fill' }).ensureAlpha().raw().toBuffer();
  const forceFg = new Uint8Array(w * h);
  const forceBg = new Uint8Array(w * h);
  let hasFg = false, hasBg = false;
  for (let i = 0; i < w * h; i++) {
    if (raw[i * 4 + 3] <= 50) continue;
    const r = raw[i * 4], g = raw[i * 4 + 1];
    if (g > r + 40) { forceFg[i] = 1; hasFg = true; }
    else if (r > g + 40) { forceBg[i] = 1; hasBg = true; }
  }
  return { forceFg: hasFg ? forceFg : undefined, forceBg: hasBg ? forceBg : undefined };
}

/** Les traits rouges enseignent leurs couleurs à la palette de fond (jusqu'à 2 clusters). */
function extendPaletteFromStrokes(palette: Float32Array, lab: Float32Array, forceBg: Uint8Array, n: number): Float32Array {
  const picks: number[] = [];
  for (let i = 0; i < n; i++) if (forceBg[i]) picks.push(i);
  if (picks.length < 30) return palette;
  const stride = Math.max(1, Math.floor(picks.length / 3000));
  const sample: number[] = [];
  for (let i = 0; i < picks.length; i += stride) sample.push(picks[i]);
  const pts = new Float32Array(sample.length * 3);
  sample.forEach((p, i) => { pts[i * 3] = lab[p * 3]; pts[i * 3 + 1] = lab[p * 3 + 1]; pts[i * 3 + 2] = lab[p * 3 + 2]; });
  const km = kmeansLab(pts, sample.length, 2);
  const extra: number[] = [];
  km.counts.forEach((cnt, j) => {
    if (cnt / sample.length >= 0.1) extra.push(km.centroids[j * 3], km.centroids[j * 3 + 1], km.centroids[j * 3 + 2]);
  });
  const merged = new Float32Array(palette.length + extra.length);
  merged.set(palette);
  merged.set(extra, palette.length);
  return merged;
}

// =========================================================================
// 6. PIPELINE PRINCIPAL
// =========================================================================

export async function processClassicalCutout(
  inputBuffer: Buffer,
  options: ClassicalCutoutOptions = {}
): Promise<ClassicalCutoutResult> {
  const startTime = Date.now();

  const threshold = options.threshold ?? 238;
  const tolerance = options.tolerance ?? 24;
  const edgeLimit = options.edgeLimit ?? 7;
  const featherRadius = Math.max(0, Math.min(options.featherRadius ?? 2, 10));
  const fillHoles = options.fillHoles ?? true;
  const protectHoles = options.protectHoles ?? false;
  const minHoleRatio = options.minHoleRatio ?? 0.002;
  const defringe = options.defringe ?? true;
  const removeSpeckles = options.removeSpeckles ?? true;
  const speckleMinRatio = options.speckleMinRatio ?? 0.02;
  const maxWorkingSize = options.maxWorkingSize ?? 2000;
  const preset = options.marketplacePreset ?? 'transparent';
  const autoCenter = options.autoCenter ?? true;
  // Padding PAR CÔTÉ : 0.075 => produit sur 85% du canevas (norme Amazon)
  const paddingPercent = options.paddingPercent ?? (preset === 'amazon' ? 0.075 : 0.1);
  const shadowMode = options.shadowMode ?? 'none';
  const format = options.format ?? 'png';
  const quality = options.quality ?? 90;

  // 1. Chargement (EXIF, flatten, réduction)
  const img = await loadWorkingImage(inputBuffer, maxWorkingSize, 0.8);
  const { w: width, h: height } = img;
  const totalPixels = width * height;
  const lab = rgbaToLabArray(img.dec, width, height);

  // 2. Analyse + palette de fond
  const model = analyzeFromLab(img.data, lab, width, height);
  const analysis = model.analysis;
  let palette = model.palette;

  // 3. Pinceau (graines)
  let forceFg: Uint8Array | undefined;
  let forceBg: Uint8Array | undefined;
  if (options.brushMaskBase64) {
    try {
      const brush = await parseBrushMask(options.brushMaskBase64, width, height);
      forceFg = brush.forceFg;
      forceBg = brush.forceBg;
      if (forceBg) palette = extendPaletteFromStrokes(palette, lab, forceBg, totalPixels);
    } catch (e) {
      console.warn('Erreur lecture masque pinceau:', e);
    }
  }

  // 4. Croissance de région depuis les bords
  // La règle "blanc pur" n'est autorisée que si le fond détecté est clair.
  const allowWhiteRule = palette[0] >= 80 && analysis.isWhiteOrLight;
  const { bg, dPal } = growBackground({
    lab, dec: img.dec, w: width, h: height, palette,
    tol: tolerance, edgeLimit, threshold, allowWhiteRule, forceBg, forceFg,
  });

  const alphaMask = new Uint8Array(totalPixels);
  for (let i = 0; i < totalPixels; i++) alphaMask[i] = bg[i] ? 0 : 255;

  // 5. Cavités internes
  applyEnclosedRegions(alphaMask, bg, dPal, width, height, tolerance, fillHoles, protectHoles, minHoleRatio, forceFg);

  // 6. Pinceau : le vert garde toujours, le rouge supprime toujours
  const applyBrushOverrides = () => {
    if (forceFg) for (let i = 0; i < totalPixels; i++) if (forceFg[i]) alphaMask[i] = 255;
    if (forceBg) for (let i = 0; i < totalPixels; i++) if (forceBg[i]) alphaMask[i] = 0;
  };
  applyBrushOverrides();

  // 7. Poussières
  if (removeSpeckles) removeSpecklesFromAlpha(alphaMask, width, height, speckleMinRatio, forceFg);

  // 8. Adoucissement des bords (flou + courbe qui garde les bords nets)
  let finalAlpha: Uint8Array = alphaMask;
  if (featherRadius > 0) {
    const blurred = boxBlur(alphaMask, width, height, featherRadius);
    finalAlpha = new Uint8Array(totalPixels);
    for (let i = 0; i < totalPixels; i++) {
      finalAlpha[i] = Math.round(smoothstep(0.2, 0.8, blurred[i] / 255) * 255);
    }
    if (forceFg) for (let i = 0; i < totalPixels; i++) if (forceFg[i]) finalAlpha[i] = 255;
    if (forceBg) for (let i = 0; i < totalPixels; i++) if (forceBg[i]) finalAlpha[i] = 0;
  }

  // 9. Couleurs + alpha
  const out = new Uint8Array(img.data.length);
  out.set(img.data);
  if (defringe) defringeColors(out, finalAlpha, width, height, Math.min(8, featherRadius + 2));
  for (let i = 0; i < totalPixels; i++) out[i * 4 + 3] = finalAlpha[i];

  // 10. Boîte englobante
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (finalAlpha[y * width + x] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (minX >= maxX || minY >= maxY) { minX = 0; minY = 0; maxX = width - 1; maxY = height - 1; }
  const bbox = { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };

  // 11. PNG transparent
  const rawCutoutBuffer = await sharp(Buffer.from(out.buffer, out.byteOffset, out.byteLength), {
    raw: { width, height, channels: 4 },
  })
    .png({ compressionLevel: 8 })
    .toBuffer();
  const transparentBase64 = `data:image/png;base64,${rawCutoutBuffer.toString('base64')}`;

  // 12. Rendu e-commerce
  let finalProcessedBuffer: Buffer = rawCutoutBuffer;
  const needsRender = preset !== 'transparent' || autoCenter || shadowMode !== 'none' || format !== 'png' || !!options.targetSize;
  if (needsRender) {
    finalProcessedBuffer = await renderEcommercePreset(rawCutoutBuffer, {
      bbox,
      originalWidth: width,
      originalHeight: height,
      preset,
      customBgColor: options.customBgColor,
      autoCenter,
      paddingPercent,
      targetSize: options.targetSize,
      shadowMode,
      shadowIntensity: options.shadowIntensity ?? 0.45,
      format,
      quality,
    });
  }

  const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
  const processedBase64 = `data:${mime};base64,${finalProcessedBuffer.toString('base64')}`;

  return {
    success: true,
    transparentBase64,
    processedBase64,
    analysis,
    dimensions: { width, height },
    boundingBox: bbox,
    processingTimeMs: Date.now() - startTime,
  };
}

// =========================================================================
// 7. COMPOSITEUR E-COMMERCE
// =========================================================================

interface RenderPresetOptions {
  bbox: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
  originalWidth: number;
  originalHeight: number;
  preset: 'transparent' | 'amazon' | 'shopify' | 'instagram' | 'etsy' | 'custom';
  customBgColor?: string;
  autoCenter: boolean;
  paddingPercent: number;
  targetSize?: { width: number; height: number };
  shadowMode: 'none' | 'soft-drop' | 'reflection';
  shadowIntensity: number;
  format: 'png' | 'webp' | 'jpeg';
  quality: number;
}

async function renderEcommercePreset(cutoutBuffer: Buffer, opts: RenderPresetOptions): Promise<Buffer> {
  const defaultSide = opts.preset === 'instagram' ? 1080 : opts.preset === 'amazon' ? 2000 : 1600;
  const canvasW = opts.targetSize?.width || defaultSide;
  const canvasH = opts.targetSize?.height || defaultSide;

  // Couleur de fond
  let bgRgba = { r: 255, g: 255, b: 255, alpha: 1 };
  switch (opts.preset) {
    case 'transparent': bgRgba = opts.format === 'jpeg' ? { r: 255, g: 255, b: 255, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 }; break;
    case 'amazon': bgRgba = { r: 255, g: 255, b: 255, alpha: 1 }; break; // blanc pur 255,255,255
    case 'shopify': bgRgba = { r: 248, g: 250, b: 252, alpha: 1 }; break;
    case 'instagram': bgRgba = { r: 255, g: 255, b: 255, alpha: 1 }; break;
    case 'etsy': bgRgba = { r: 250, g: 248, b: 245, alpha: 1 }; break;
    case 'custom': {
      const c = hexToRgb(opts.customBgColor || '#FFFFFF');
      bgRgba = { r: c.r, g: c.g, b: c.b, alpha: 1 };
      break;
    }
  }

  // Zone source : boîte englobante (autoCenter) ou image entière
  const crop = opts.autoCenter
    ? opts.bbox
    : { minX: 0, minY: 0, width: opts.originalWidth, height: opts.originalHeight };

  const cropped = await sharp(cutoutBuffer)
    .extract({ left: crop.minX, top: crop.minY, width: crop.width, height: crop.height })
    .toBuffer();

  // Échelle : padding par côté. Le reflet (28%) est compté dans la hauteur.
  const reflectionRatio = opts.shadowMode === 'reflection' ? 0.28 : 0;
  const pad = Math.max(0, Math.min(0.45, opts.paddingPercent));
  const maxW = Math.round(canvasW * (1 - pad * 2));
  const maxH = Math.round(canvasH * (1 - pad * 2));
  const scale = Math.min(maxW / crop.width, maxH / (crop.height * (1 + reflectionRatio)));
  const targetW = Math.max(10, Math.round(crop.width * scale));
  const targetH = Math.max(10, Math.round(crop.height * scale));
  const reflectionH = Math.round(targetH * reflectionRatio);

  const resized = await sharp(cropped).resize(targetW, targetH, { fit: 'fill' }).png().toBuffer();

  const posX = Math.max(0, Math.round((canvasW - targetW) / 2));
  const posY = Math.max(0, Math.round((canvasH - (targetH + reflectionH)) / 2));

  const layers: OverlayOptions[] = [];

  // --- Ombre douce au sol
  if (opts.shadowMode === 'soft-drop') {
    const opacity = Math.max(0.1, Math.min(0.8, opts.shadowIntensity));
    const shW = Math.round(targetW * 0.75);
    const shH = Math.max(8, Math.round(targetH * 0.06));
    const sigma = Math.max(2, shH * 0.35);
    const margin = Math.ceil(sigma * 3);
    const svgW = shW + margin * 2;
    const svgH = shH + margin * 2;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}">
      <ellipse cx="${svgW / 2}" cy="${svgH / 2}" rx="${shW / 2}" ry="${shH / 2}" fill="black" fill-opacity="${opacity}"/>
    </svg>`;
    const shadowBuf = await sharp(Buffer.from(svg)).blur(sigma).png().toBuffer();

    const left = Math.min(Math.max(0, Math.round(posX + (targetW - svgW) / 2)), Math.max(0, canvasW - svgW));
    const top = Math.min(Math.max(0, Math.round(posY + targetH - svgH / 2)), Math.max(0, canvasH - svgH));
    if (svgW <= canvasW && svgH <= canvasH) layers.push({ input: shadowBuf, left, top });
  }

  // --- Reflet miroir avec vrai dégradé (dest-in)
  if (opts.shadowMode === 'reflection' && reflectionH > 2) {
    const op = Math.max(0.1, Math.min(0.8, opts.shadowIntensity * 0.6));
    const flipped = await sharp(resized).flip().toBuffer();
    const strip = await sharp(flipped)
      .extract({ left: 0, top: 0, width: targetW, height: Math.min(reflectionH, targetH) })
      .blur(0.8)
      .png()
      .toBuffer();
    const stripH = Math.min(reflectionH, targetH);
    const gradient = `<svg xmlns="http://www.w3.org/2000/svg" width="${targetW}" height="${stripH}">
      <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="white" stop-opacity="${op}"/>
        <stop offset="1" stop-color="white" stop-opacity="0"/>
      </linearGradient></defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
    </svg>`;
    const faded = await sharp(strip)
      .composite([{ input: Buffer.from(gradient), blend: 'dest-in' }])
      .png()
      .toBuffer();
    layers.push({ input: faded, left: posX, top: Math.min(posY + targetH, canvasH - stripH) });
  }

  // --- Produit au-dessus
  layers.push({ input: resized, left: posX, top: posY });

  const builder = sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: bgRgba },
  }).composite(layers);

  if (opts.format === 'jpeg') {
    return builder.flatten({ background: { r: bgRgba.r, g: bgRgba.g, b: bgRgba.b } }).jpeg({ quality: opts.quality }).toBuffer();
  }
  if (opts.format === 'webp') return builder.webp({ quality: opts.quality }).toBuffer();
  return builder.png({ compressionLevel: 8 }).toBuffer();
}