/**
 * MarkMosaiq Low-Cost AI Carousel Generation Pipeline
 * Module 1: buildCampaignBrief.ts
 *
 * Defines brief structures, prompt generation, and copy templates for 3-panel carousels.
 */

export interface PanelCopy {
  headline: string;
  subheadline?: string;
  badgeText?: string;
  ctaText?: string;
  bulletPoints?: string[];
}

export interface PanelBrief {
  panelIndex: number;
  role: 'HOOK' | 'SOLUTION' | 'RESULT';
  copy: PanelCopy;
}

export interface SheetDimensions {
  width: number;
  height: number;
  panelWidth: number;
  panelHeight: number;
}

export interface CarouselCampaignBrief {
  productName: string;
  brandName: string;
  brandPalette: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
  sheetDimensions: SheetDimensions;
  masterPrompt: string;
  panels: PanelBrief[];
}

export interface BuildBriefOptions {
  productName: string;
  brandName?: string;
  goal?: string;
  language?: 'fr' | 'darija' | 'en';
  brandColor?: string;
  customPrompt?: string;
}

export function buildCampaignBrief(options: BuildBriefOptions): CarouselCampaignBrief {
  const productName = options.productName || 'Produit E-commerce';
  const brandName = options.brandName || 'MarkMosaiq';
  const primaryColor = options.brandColor || '#7C3AED';

  return {
    productName,
    brandName,
    brandPalette: {
      primary: primaryColor,
    },
    sheetDimensions: {
      width: 3072,
      height: 1280,
      panelWidth: 1024,
      panelHeight: 1280,
    },
    masterPrompt:
      options.customPrompt ||
      `Luxury commercial e-commerce advertising 3-panel contact sheet for ${productName}. Seamless coordinated aesthetic across three panels. Left panel creates desire, center reveals the product, right shows the result with call to action. Clean vacant pedestal, studio lighting, ultra-high resolution photography.`,
    panels: [
      {
        panelIndex: 1,
        role: 'HOOK',
        copy: {
          headline: `Une envie de fraîcheur ?`,
          subheadline: `Laissez-vous séduire par l'excellence.`,
          badgeText: '01',
        },
      },
      {
        panelIndex: 2,
        role: 'SOLUTION',
        copy: {
          headline: productName,
          bulletPoints: ['Formule concentrée', 'Résultats prouvés', 'Qualité supérieure'],
          badgeText: '02',
        },
      },
      {
        panelIndex: 3,
        role: 'RESULT',
        copy: {
          headline: `Commandez le vôtre`,
          ctaText: 'Commander maintenant →',
          badgeText: '03',
        },
      },
    ],
  };
}

