/**
 * MarkMosaiq Low-Cost AI Carousel Generation Pipeline
 * Module 4: overlayAdCopy.ts
 *
 * Programmatically renders headlines, benefits, swipe pills, and CTA buttons
 * onto the split panels using Sharp SVG composition.
 * Ensures 100% typography precision and zero AI text hallucination.
 */

import sharp from 'sharp';
import { CroppedPanel } from './splitContactSheet';
import { PanelBrief } from './buildCampaignBrief';

export interface OverlayOptions {
  brandColor?: string;
  badgeBgColor?: string;
  enableOverlay?: boolean;
}

export interface FinishedSlide {
  index: number;
  role: 'HOOK' | 'SOLUTION' | 'RESULT';
  image: string; // base64
  buffer: Buffer;
  headline: string;
  subheadline?: string;
  badge?: string;
  ctaText?: string;
  bulletPoints?: string[];
}

export async function overlayAdCopy(
  panel: CroppedPanel,
  brief: PanelBrief,
  options: OverlayOptions = {}
): Promise<FinishedSlide> {
  const { width, height } = panel;
  const { copy, role, panelIndex } = brief;
  const brandColor = options.brandColor || '#7C3AED';

  // If overlays are explicitly disabled, return raw image with copy metadata
  if (options.enableOverlay === false) {
    return {
      index: panelIndex,
      role,
      image: panel.base64,
      buffer: panel.buffer,
      headline: copy.headline,
      subheadline: copy.subheadline,
      badge: copy.badgeText || `0${panelIndex}`,
      ctaText: copy.ctaText,
      bulletPoints: copy.bulletPoints,
    };
  }

  // Escape XML characters for SVG text safety
  const escapeXml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const safeHeadline = escapeXml(copy.headline);
  const safeSubheadline = copy.subheadline ? escapeXml(copy.subheadline) : '';
  const safeBadge = escapeXml(copy.badgeText || `0${panelIndex}`);
  const safeCta = copy.ctaText ? escapeXml(copy.ctaText) : 'Commander ➔';

  let svgElements = '';

  // 1. Subtle Vignette Gradient for optimal text legibility
  svgElements += `
    <defs>
      <linearGradient id="topVignette" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.45" />
        <stop offset="35%" stop-color="#000000" stop-opacity="0.10" />
        <stop offset="70%" stop-color="#000000" stop-opacity="0.0" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.45" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#topVignette)" />
  `;

  // 2. Number Badge (Top-Left)
  svgElements += `
    <g transform="translate(48, 48)">
      <circle cx="20" cy="20" r="20" fill="#FFFFFF" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.25))" />
      <text x="20" y="26" font-family="'Outfit', 'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="900" fill="#0F172A" text-anchor="middle">
        ${panelIndex}
      </text>
    </g>
  `;

  // 3. Slide-specific overlays
  if (role === 'HOOK') {
    // Hook: Elegant centered typography
    svgElements += `
      <g transform="translate(${width / 2}, 160)" text-anchor="middle">
        <text font-family="'Playfair Display', serif" font-style="italic" font-size="46" font-weight="700" fill="#FFFFFF" filter="drop-shadow(0 3px 12px rgba(0,0,0,0.6))">
          ${safeHeadline}
        </text>
        ${
          safeSubheadline
            ? `<text y="44" font-family="'Outfit', sans-serif" font-size="20" font-weight="500" fill="#F8FAFC" opacity="0.95" filter="drop-shadow(0 2px 8px rgba(0,0,0,0.6))">
                ${safeSubheadline}
              </text>`
            : ''
        }
      </g>

      <!-- Bottom Swipe Pill -->
      <g transform="translate(${width / 2 - 80}, ${height - 90})">
        <rect width="160" height="48" rx="24" fill="#FFFFFF" fill-opacity="0.94" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.2))" />
        <text x="70" y="30" font-family="'Outfit', sans-serif" font-size="16" font-weight="800" fill="#0F172A" text-anchor="middle">Swipe</text>
        <path d="M96 24 L104 24 M100 20 L104 24 L100 28" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    `;
  } else if (role === 'SOLUTION') {
    // Solution: Headline + verified benefits list
    const bullets = copy.bulletPoints || ['Parfum longue durée', 'Ingrédients purs', 'Élégance au quotidien'];
    let bulletsSvg = '';
    bullets.forEach((b, idx) => {
      const yOffset = 210 + idx * 44;
      bulletsSvg += `
        <g transform="translate(48, ${yOffset})">
          <rect width="${Math.min(width - 96, 320)}" height="36" rx="18" fill="#FFFFFF" fill-opacity="0.88" filter="drop-shadow(0 2px 6px rgba(0,0,0,0.12))" />
          <circle cx="20" cy="18" r="8" fill="${brandColor}" />
          <text x="36" y="24" font-family="'Outfit', sans-serif" font-size="14" font-weight="700" fill="#0F172A">
            ${escapeXml(b)}
          </text>
        </g>
      `;
    });

    svgElements += `
      <g transform="translate(48, 140)">
        <text font-family="'Outfit', sans-serif" font-size="34" font-weight="800" fill="#FFFFFF" filter="drop-shadow(0 2px 10px rgba(0,0,0,0.6))">
          ${safeHeadline}
        </text>
      </g>
      ${bulletsSvg}

      <!-- Bottom Swipe Pill -->
      <g transform="translate(${width / 2 - 80}, ${height - 90})">
        <rect width="160" height="48" rx="24" fill="#FFFFFF" fill-opacity="0.94" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.2))" />
        <text x="70" y="30" font-family="'Outfit', sans-serif" font-size="16" font-weight="800" fill="#0F172A" text-anchor="middle">Swipe</text>
        <path d="M96 24 L104 24 M100 20 L104 24 L100 28" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    `;
  } else {
    // Result: Aspirational Headline + High-converting CTA Button
    svgElements += `
      <g transform="translate(${width / 2}, 150)" text-anchor="middle">
        <text font-family="'Outfit', sans-serif" font-size="36" font-weight="800" fill="#0F172A" filter="drop-shadow(0 2px 6px rgba(255,255,255,0.8))">
          ${safeHeadline}
        </text>
      </g>

      <!-- Bottom CTA Button -->
      <g transform="translate(${width / 2 - 150}, ${height - 100})">
        <rect width="300" height="56" rx="28" fill="#0F172A" filter="drop-shadow(0 6px 18px rgba(15,23,42,0.45))" />
        <text x="150" y="35" font-family="'Outfit', sans-serif" font-size="17" font-weight="800" fill="#FFFFFF" text-anchor="middle">
          ${safeCta}
        </text>
      </g>
    `;
  }

  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      ${svgElements}
    </svg>
  `);

  // Composite SVG typography onto the cropped panel
  const compositeBuffer = await sharp(panel.buffer)
    .composite([{ input: svgOverlay, left: 0, top: 0 }])
    .png()
    .toBuffer();

  const finalBase64 = `data:image/png;base64,${compositeBuffer.toString('base64')}`;

  return {
    index: panelIndex,
    role,
    image: finalBase64,
    buffer: compositeBuffer,
    headline: copy.headline,
    subheadline: copy.subheadline,
    badge: copy.badgeText || `0${panelIndex}`,
    ctaText: copy.ctaText,
    bulletPoints: copy.bulletPoints,
  };
}
