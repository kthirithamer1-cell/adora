import { BrandKit } from './brandkit';

/**
 * MOTEUR DE LAYOUT DÉTERMINISTE EN CODE (MarkMosaiq AI ENGINE v2 - MarkMosaiq-42)
 * 
 * Ce module assure le rendu déterministe au pixel près de tous les éléments
 * de marque (logos réels, typographies, badges configurables, prix en Dinars,
 * call-to-action et safe zones) directement en code (Canvas / SVG / Sharp).
 * 
 * RÈGLE D'OR : Le modèle de diffusion génère UNIQUEMENT le visuel (produit + décor).
 * Tout le texte et les éléments de marque sont superposés par ce moteur.
 */

export type AspectRatioType = '1:1' | '2:3' | '3:2';

export interface LayoutBadgeConfig {
  id?: string;
  text: string;
  iconType?: 'truck' | 'cod' | 'shield' | 'fire' | 'gift' | 'star';
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  customBg?: string;
  customText?: string;
}

export interface LayoutPriceConfig {
  amountTND: string | number;
  originalAmountTND?: string | number;
  position?: 'bottom-left' | 'bottom-right';
}

export interface LayoutHeadlineConfig {
  headline: string;
  subheadline?: string;
  position?: 'top-center' | 'bottom-left' | 'bottom-center';
}

export interface LayoutCTAConfig {
  text: string;
  icon?: 'arrow' | 'whatsapp' | 'cart';
  position?: 'bottom-center' | 'bottom-right' | 'bottom-left';
}

export interface DeterministicLayoutOptions {
  width: number;
  height: number;
  aspectRatio: AspectRatioType;
  brandKit: BrandKit;
  showLogo?: boolean;
  logoPosition?: 'top-left' | 'top-right' | 'top-center';
  badge?: LayoutBadgeConfig | null;
  price?: LayoutPriceConfig | null;
  headline?: LayoutHeadlineConfig | null;
  cta?: LayoutCTAConfig | null;
  watermarkEnabled?: boolean;
}

export interface SafeZones {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Calcule les zones de sécurité strictes selon le ratio d'affichage (ex: Story 9:16)
 */
export function calculateSafeZones(width: number, height: number, aspect: AspectRatioType): SafeZones {
  const isVerticalStory = aspect === '2:3';
  const isLandscape = aspect === '3:2';

  if (isVerticalStory) {
    // 14% réservé en haut (profil Instagram, close button, progress bar)
    // 20% réservé en bas (barre de réponse DM, bouton partager)
    return {
      top: height * 0.14,
      bottom: height * 0.20,
      left: width * 0.06,
      right: width * 0.06,
    };
  }

  if (isLandscape) {
    return {
      top: height * 0.06,
      bottom: height * 0.06,
      left: width * 0.05,
      right: width * 0.05,
    };
  }

  // Carré 1:1 Feed
  return {
    top: height * 0.05,
    bottom: height * 0.05,
    left: width * 0.05,
    right: width * 0.05,
  };
}

/**
 * Dessine un rectangle avec coins arrondis (fallback cross-browser)
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Trace une icône vectorielle simple dans le canvas
 */
function drawVectorIcon(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  size: number,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(size * 0.12, 1.5);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'truck') {
    // Camion livraison
    ctx.strokeRect(x, y + size * 0.2, size * 0.55, size * 0.5);
    ctx.strokeRect(x + size * 0.55, y + size * 0.35, size * 0.35, size * 0.35);
    ctx.beginPath();
    ctx.arc(x + size * 0.2, y + size * 0.75, size * 0.12, 0, Math.PI * 2);
    ctx.arc(x + size * 0.72, y + size * 0.75, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'cod') {
    // Billet / Espèces
    ctx.strokeRect(x, y + size * 0.2, size * 0.85, size * 0.55);
    ctx.beginPath();
    ctx.arc(x + size * 0.425, y + size * 0.475, size * 0.14, 0, Math.PI * 2);
    ctx.stroke();
  } else if (type === 'shield') {
    // Bouclier d'authenticité
    ctx.beginPath();
    ctx.moveTo(x + size * 0.45, y + size * 0.1);
    ctx.lineTo(x + size * 0.8, y + size * 0.25);
    ctx.lineTo(x + size * 0.8, y + size * 0.55);
    ctx.quadraticCurveTo(x + size * 0.45, y + size * 0.9, x + size * 0.45, y + size * 0.9);
    ctx.quadraticCurveTo(x + size * 0.1, y + size * 0.55, x + size * 0.1, y + size * 0.25);
    ctx.closePath();
    ctx.stroke();
  } else if (type === 'fire') {
    // Flamme promo
    ctx.beginPath();
    ctx.moveTo(x + size * 0.45, y + size * 0.1);
    ctx.bezierCurveTo(x + size * 0.65, y + size * 0.35, x + size * 0.8, y + size * 0.55, x + size * 0.75, y + size * 0.75);
    ctx.bezierCurveTo(x + size * 0.7, y + size * 0.95, x + size * 0.25, y + size * 0.95, x + size * 0.2, y + size * 0.75);
    ctx.bezierCurveTo(x + size * 0.15, y + size * 0.55, x + size * 0.35, y + size * 0.35, x + size * 0.45, y + size * 0.1);
    ctx.fill();
  } else {
    // Étoile par défaut
    ctx.beginPath();
    const cx = x + size * 0.5;
    const cy = y + size * 0.5;
    const spikes = 5;
    const outerRadius = size * 0.45;
    const innerRadius = size * 0.2;
    let rot = (Math.PI / 2) * 3;
    let step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      let sx = cx + Math.cos(rot) * outerRadius;
      let sy = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(sx, sy);
      rot += step;
      sx = cx + Math.cos(rot) * innerRadius;
      sy = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(sx, sy);
      rot += step;
    }
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Exécute le rendu complet du layout déterministe sur un contexte HTML5 Canvas
 */
export async function renderDeterministicLayout(
  ctx: CanvasRenderingContext2D,
  options: DeterministicLayoutOptions
): Promise<void> {
  const { width: W, height: H, aspectRatio, brandKit } = options;
  const safe = calculateSafeZones(W, H, aspectRatio);

  const primaryColor = brandKit.primaryColor || '#4F46E5';
  const secondaryColor = brandKit.secondaryColor || '#E11D48';
  const fontFamily = brandKit.fontFamily || 'Outfit, sans-serif';

  // 1. DESSIN DU LOGO DE LA MARQUE (si activé)
  if (options.showLogo !== false && brandKit.logoUrl) {
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.src = brandKit.logoUrl;
      await logoImg.decode();

      const logoH = Math.max(H * 0.055, 36);
      const aspect = logoImg.naturalWidth / (logoImg.naturalHeight || 1);
      const logoW = logoH * aspect;

      const pos = options.logoPosition || 'top-left';
      let lx = safe.left;
      let ly = safe.top;

      if (pos === 'top-right') {
        lx = W - safe.right - logoW;
      } else if (pos === 'top-center') {
        lx = (W - logoW) / 2;
      }

      // Pastille de contraste vitrée derrière le logo
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 12;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      drawRoundedRect(ctx, lx - 8, ly - 6, logoW + 16, logoH + 12, 12);
      ctx.fill();
      ctx.restore();

      ctx.drawImage(logoImg, lx, ly, logoW, logoH);
    } catch (e) {
      // Fallback textuel élégant si l'image du logo échoue
      ctx.save();
      ctx.font = `900 ${Math.max(W * 0.035, 18)}px ${fontFamily}`;
      ctx.fillStyle = primaryColor;
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 8;
      ctx.fillText(brandKit.shopName || 'MarkMosaiq', safe.left, safe.top + 20);
      ctx.restore();
    }
  }

  // 2. DESSIN DU BADGE CONFIGURABLE DE LA MARQUE
  if (options.badge && options.badge.text) {
    const badgeText = options.badge.text;
    const badgeSize = Math.max(W * 0.028, 14);
    const weight = 800;

    ctx.save();
    ctx.font = `${weight} ${badgeSize}px ${fontFamily}`;
    const tw = ctx.measureText(badgeText).width;

    const iconSize = badgeSize * 1.1;
    const hasIcon = Boolean(options.badge.iconType);
    const iconPadding = hasIcon ? iconSize + 8 : 0;

    const padX = badgeSize * 0.9;
    const padY = badgeSize * 0.5;
    const totalW = tw + padX * 2 + iconPadding;
    const totalH = badgeSize + padY * 2;

    const bPos = options.badge.position || 'top-right';
    let bx = W - safe.right - totalW;
    let by = safe.top;

    if (bPos === 'top-left') {
      bx = safe.left;
    } else if (bPos === 'bottom-left') {
      bx = safe.left;
      by = H - safe.bottom - totalH;
    } else if (bPos === 'bottom-right') {
      bx = W - safe.right - totalW;
      by = H - safe.bottom - totalH;
    }

    // Dégradé aux couleurs officielles de la marque
    const bgGrad = ctx.createLinearGradient(bx, by, bx + totalW, by + totalH);
    bgGrad.addColorStop(0, options.badge.customBg || primaryColor);
    bgGrad.addColorStop(1, secondaryColor);

    // Ombre portée diffuse
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = badgeSize * 0.8;
    ctx.shadowOffsetY = badgeSize * 0.2;

    ctx.fillStyle = bgGrad;
    drawRoundedRect(ctx, bx, by, totalW, totalH, totalH / 2);
    ctx.fill();

    // Bordure subtile semi-transparente
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, bx, by, totalW, totalH, totalH / 2);
    ctx.stroke();

    // Dessin de l'icône vectorielle
    if (hasIcon) {
      drawVectorIcon(
        ctx,
        options.badge.iconType!,
        bx + padX,
        by + (totalH - iconSize) / 2,
        iconSize,
        '#FFFFFF'
      );
    }

    // Texte du badge
    ctx.fillStyle = options.badge.customText || '#FFFFFF';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, bx + padX + iconPadding, by + totalH / 2);
    ctx.restore();
  }

  // 3. DESSIN DU PRIX EN DINARS TUNISIENS (DT)
  if (options.price && options.price.amountTND) {
    const rawPrice = String(options.price.amountTND).trim();
    const formattedPrice = rawPrice.toLowerCase().includes('dt') ? rawPrice : `${rawPrice} DT`;

    const priceSize = Math.max(W * 0.046, 20);
    const weight = 900;

    ctx.save();
    ctx.font = `${weight} ${priceSize}px ${fontFamily}`;
    const ptw = ctx.measureText(formattedPrice).width;

    const padX = priceSize * 0.8;
    const padY = priceSize * 0.45;
    const totalW = ptw + padX * 2;
    const totalH = priceSize + padY * 2;

    const px = safe.left;
    const py = H - safe.bottom - totalH;

    // Carte blanche avec ombre premium
    ctx.shadowColor = 'rgba(15, 23, 42, 0.28)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#FFFFFF';
    drawRoundedRect(ctx, px, py, totalW, totalH, 14);
    ctx.fill();

    // Liseré discret couleur primaire
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, px, py, totalW, totalH, 14);
    ctx.stroke();

    // Texte du prix en noir pur avec lueur
    ctx.fillStyle = '#0F172A';
    ctx.textBaseline = 'middle';
    ctx.fillText(formattedPrice, px + padX, py + totalH / 2);

    // Ancien prix barré (si promo active)
    if (options.price.originalAmountTND) {
      const origText = `${options.price.originalAmountTND} DT`;
      ctx.font = `600 ${priceSize * 0.55}px ${fontFamily}`;
      ctx.fillStyle = '#94A3B8';
      const origW = ctx.measureText(origText).width;
      const ox = px + totalW + 10;
      const oy = py + totalH / 2;
      ctx.fillText(origText, ox, oy);

      // Barre de réduction
      ctx.strokeStyle = '#E11D48';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(ox - 2, oy);
      ctx.lineTo(ox + origW + 2, oy);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 4. DESSIN DU BOUTON CTA DÉTERMINISTE (ex: "Acheter maintenant ➔")
  if (options.cta && options.cta.text) {
    const ctaText = options.cta.text;
    const ctaSize = Math.max(W * 0.03, 15);

    ctx.save();
    ctx.font = `800 ${ctaSize}px ${fontFamily}`;
    const tw = ctx.measureText(ctaText).width;

    const padX = ctaSize * 1.1;
    const padY = ctaSize * 0.6;
    const totalW = tw + padX * 2;
    const totalH = ctaSize + padY * 2;

    const cx = W - safe.right - totalW;
    const cy = H - safe.bottom - totalH;

    // Dégradé bouton CTA
    const btnGrad = ctx.createLinearGradient(cx, cy, cx + totalW, cy + totalH);
    btnGrad.addColorStop(0, primaryColor);
    btnGrad.addColorStop(1, secondaryColor);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = btnGrad;
    drawRoundedRect(ctx, cx, cy, totalW, totalH, totalH / 2);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#FFFFFF';
    ctx.textBaseline = 'middle';
    ctx.fillText(ctaText, cx + padX, cy + totalH / 2);
    ctx.restore();
  }

  // 5. SIGNATURE DISCRÈTE / WATERMARK
  if (options.watermarkEnabled || brandKit.watermarkEnabled) {
    const watermarkText = brandKit.instagramHandle || `@${brandKit.shopName.toLowerCase().replace(/\s+/g, '')}`;
    ctx.save();
    ctx.font = `600 ${Math.max(W * 0.022, 11)}px ${fontFamily}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 6;
    const wx = safe.left;
    const wy = H - 14;
    ctx.fillText(watermarkText, wx, wy);
    ctx.restore();
  }
}

/**
 * Génère le calque vectoriel SVG superposable pour les exports haute définition
 */
export function generateDeterministicLayoutSVG(options: DeterministicLayoutOptions): string {
  const { width: W, height: H, aspectRatio, brandKit } = options;
  const safe = calculateSafeZones(W, H, aspectRatio);

  const primary = brandKit.primaryColor || '#4F46E5';
  const secondary = brandKit.secondaryColor || '#E11D48';
  const fontFamily = brandKit.fontFamily || 'Outfit, sans-serif';

  let svgElements = '';

  // Badge SVG
  if (options.badge && options.badge.text) {
    const badgeText = options.badge.text;
    const bw = Math.max(badgeText.length * 9 + 40, 160);
    const bh = 38;
    const bx = W - safe.right - bw;
    const by = safe.top;

    svgElements += `
      <g id="MarkMosaiq-Badge" transform="translate(${bx}, ${by})">
        <defs>
          <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${primary}" />
            <stop offset="100%" stop-color="${secondary}" />
          </linearGradient>
        </defs>
        <rect width="${bw}" height="${bh}" rx="${bh / 2}" fill="url(#badgeGrad)" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.3))" />
        <text x="${bw / 2}" y="${bh / 2 + 5}" font-family="${fontFamily}" font-size="14" font-weight="800" fill="#FFFFFF" text-anchor="middle">
          ${badgeText}
        </text>
      </g>
    `;
  }

  // Prix en Dinars SVG
  if (options.price && options.price.amountTND) {
    const priceText = String(options.price.amountTND);
    const pw = 140;
    const ph = 46;
    const px = safe.left;
    const py = H - safe.bottom - ph;

    svgElements += `
      <g id="MarkMosaiq-PriceTag" transform="translate(${px}, ${py})">
        <rect width="${pw}" height="${ph}" rx="12" fill="#FFFFFF" stroke="${primary}" stroke-width="2" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.25))" />
        <text x="${pw / 2}" y="${ph / 2 + 6}" font-family="${fontFamily}" font-size="20" font-weight="900" fill="#0F172A" text-anchor="middle">
          ${priceText.includes('DT') ? priceText : `${priceText} DT`}
        </text>
      </g>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;800;900&amp;display=swap');
      </style>
      ${svgElements}
    </svg>
  `.trim();
}
