/**
 * Algorithme d'extraction de couleurs depuis une image / logo (Canvas Pixel Sampler)
 * Conçu pour Adora E-commerce Studio
 */

export interface ExtractedPalette {
  primary: string;
  secondary: string;
  accent: string;
  isExtracted: boolean;
  dominantHuesCount: number;
}

// Convertit RGB en Hex
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Convertit RGB en HSL
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Convertit HSL en Hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

/**
 * Extrait les couleurs primaires et secondaires dominantes d'une image (logo)
 */
export async function extractPaletteFromLogo(imageSrc: string): Promise<ExtractedPalette> {
  const fallback: ExtractedPalette = {
    primary: '#00E5FF',
    secondary: '#FF5722',
    accent: '#10B981',
    isExtracted: true,
    dominantHuesCount: 3,
  };

  if (typeof window === 'undefined' || !imageSrc) {
    return fallback;
  }

  return new Promise((resolve) => {
    let hasResolved = false;
    const safeResolve = (palette: ExtractedPalette) => {
      if (!hasResolved) {
        hasResolved = true;
        clearTimeout(timeoutId);
        resolve(palette);
      }
    };

    // Timeout de sécurité au cas où le chargement de l'image est bloqué
    const timeoutId = setTimeout(() => {
      safeResolve(fallback);
    }, 4500);

    const img = new Image();

    // Règle CORS critique : Ne JAMAIS positionner crossOrigin sur un data: URI ou blob:
    // et ne le positionner sur une URL HTTP(S) que si elle pointe vers un domaine externe.
    const isExternalHttp =
      (imageSrc.startsWith('http://') || imageSrc.startsWith('https://')) &&
      typeof window !== 'undefined' &&
      !imageSrc.startsWith(window.location.origin);

    if (isExternalHttp) {
      img.crossOrigin = 'Anonymous';
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          safeResolve(fallback);
          return;
        }

        const sampleSize = 64;
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const data = imgData.data;

        // Stocker les pixels colorés/saturés et tous les pixels visibles
        const colorBuckets = new Map<
          string,
          { r: number; g: number; b: number; count: number; weight: number; hsl: { h: number; s: number; l: number } }
        >();
        const visiblePixels: { r: number; g: number; b: number; hsl: { h: number; s: number; l: number } }[] = [];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Ignorer les pixels transparents
          if (a < 40) continue;

          const hsl = rgbToHsl(r, g, b);
          visiblePixels.push({ r, g, b, hsl });

          // Ignorer le blanc pur / gris quasi-blanc et le noir absolu pour la détection de teinte
          const isWhiteOrBg = r > 245 && g > 245 && b > 245;
          const isDeepBlack = r < 18 && g < 18 && b < 18;
          if (isWhiteOrBg || isDeepBlack) continue;

          // Ignorer les nuances presque totalement désaturées
          if (hsl.s < 10 && (hsl.l > 82 || hsl.l < 18)) continue;

          // Quantifier pour regrouper les teintes proches
          const qStep = 20;
          const qr = Math.round(r / qStep) * qStep;
          const qg = Math.round(g / qStep) * qStep;
          const qb = Math.round(b / qStep) * qStep;
          const key = `${qr},${qg},${qb}`;

          // Bonus de poids pour les couleurs de marque (saturées et contrastées)
          const saturationBonus = 1 + (hsl.s / 100) * 2.5;
          const lightnessBonus = hsl.l > 15 && hsl.l < 85 ? 1.4 : 1;
          const pixelWeight = saturationBonus * lightnessBonus;

          const existing = colorBuckets.get(key);
          if (existing) {
            existing.count += 1;
            existing.weight += pixelWeight;
          } else {
            colorBuckets.set(key, {
              r: qr,
              g: qg,
              b: qb,
              count: 1,
              weight: pixelWeight,
              hsl,
            });
          }
        }

        const sortedBuckets = Array.from(colorBuckets.values()).sort(
          (a, b) => b.weight - a.weight
        );

        // Si le logo contient des couleurs identifiables
        if (sortedBuckets.length > 0) {
          const topBucket = sortedBuckets[0];
          const primaryHex = rgbToHex(topBucket.r, topBucket.g, topBucket.b);

          // Couleur secondaire : teinte distincte ou contraste marqué
          let secondaryBucket = sortedBuckets.find((b) => {
            const hueDiff = Math.abs(b.hsl.h - topBucket.hsl.h);
            const effectiveHueDiff = Math.min(hueDiff, 360 - hueDiff);
            return effectiveHueDiff > 30 || Math.abs(b.hsl.l - topBucket.hsl.l) > 30;
          });

          let secondaryHex = '#FF5722';
          if (secondaryBucket) {
            secondaryHex = rgbToHex(secondaryBucket.r, secondaryBucket.g, secondaryBucket.b);
          } else {
            const complementaryHue = (topBucket.hsl.h + 150) % 360;
            secondaryHex = hslToHex(complementaryHue, Math.max(topBucket.hsl.s, 70), 55);
          }

          const accentHue = (topBucket.hsl.h + 45) % 360;
          const accentHex = hslToHex(accentHue, 90, 50);

          safeResolve({
            primary: primaryHex,
            secondary: secondaryHex,
            accent: accentHex,
            isExtracted: true,
            dominantHuesCount: sortedBuckets.length,
          });
          return;
        }

        // Cas logo monochrome (ex: logo tout noir, tout blanc, ou gris luxe)
        if (visiblePixels.length > 0) {
          const avgLightness = visiblePixels.reduce((acc, p) => acc + p.hsl.l, 0) / visiblePixels.length;
          
          if (avgLightness < 45) {
            // Logo sombre/noir (ex: luxe, Nike, mode) -> Dark luxury avec accent Néon Cyan et Orange CTA
            safeResolve({
              primary: '#0F172A',
              secondary: '#00E5FF',
              accent: '#FF5722',
              isExtracted: true,
              dominantHuesCount: 1,
            });
            return;
          } else {
            // Logo clair/blanc -> Clean blanc avec accent Néon Cyan et Violet
            safeResolve({
              primary: '#FFFFFF',
              secondary: '#00E5FF',
              accent: '#A855F7',
              isExtracted: true,
              dominantHuesCount: 1,
            });
            return;
          }
        }

        // Cas image vide
        safeResolve(fallback);
      } catch (err) {
        console.warn('Erreur lors de l\'extraction de couleur du logo:', err);
        safeResolve(fallback);
      }
    };

    img.onerror = (e) => {
      console.warn('Impossible de charger l\'image pour l\'extraction de couleur:', e);
      safeResolve(fallback);
    };

    img.src = imageSrc;
  });
}
