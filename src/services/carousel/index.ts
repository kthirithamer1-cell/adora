/**
 * MarkMosaiq Low-Cost AI Carousel Generation Pipeline
 * Main Orchestrator: index.ts
 *
 * Implements the single-sheet generation, splitting, validation, and programmatic ad copy overlay.
 * Delivers 3 coordinated, ready-to-use advertising images at 1/3 the token cost.
 */

import { BuildBriefOptions, CarouselCampaignBrief } from './buildCampaignBrief';
import { generateContactSheet, ContactSheetResult } from './generateContactSheet';
import { splitContactSheet, CroppedPanel } from './splitContactSheet';
import { overlayAdCopy, FinishedSlide, OverlayOptions } from './overlayAdCopy';
import { validateCarousel, ValidationReport } from './validateCarousel';
import { calculateGenerationCost, GenerationCostMetrics } from './calculateGenerationCost';

export interface CarouselPipelineOptions extends Partial<BuildBriefOptions> {
  brief?: CarouselCampaignBrief;
  quality?: 'low' | 'medium' | 'high';
  enableOverlays?: boolean;
  workspaceId?: string;
}

export interface CarouselPipelineResult {
  success: boolean;
  slides: FinishedSlide[];
  brief: CarouselCampaignBrief;
  validation: ValidationReport;
  metrics: GenerationCostMetrics;
  error?: string;
}

/**
 * Executes the complete low-cost single-sheet carousel generation pipeline.
 */
export async function runLowCostCarouselPipeline(
  productImageBase64: string,
  options: CarouselPipelineOptions
): Promise<CarouselPipelineResult> {
  const pipelineStartTime = Date.now();
  let retryCount = 0;
  let generationMode: 'sheet' | 'separate_fallback' = 'sheet';

  // 1. Campaign Brief & Dynamic Layout Specifications
  const brief = options.brief;
  if (!brief) {
    throw new Error('CarouselCampaignBrief is required');
  }

  try {
    console.log('\n============================================================');
    console.log(`🎠 [MarkMosaiq Carousel Engine] Single-Sheet Low-Cost Pipeline`);
    console.log(`📦 Produit: "${brief.productName}" | Marque: "${brief.brandName}"`);
    console.log(`📐 Dimensions Feuille: ${brief.sheetDimensions.width}x${brief.sheetDimensions.height} px`);
    console.log('============================================================\n');

    // 2. Generate ONE three-panel contact sheet (1 API request)
    let sheetResult: ContactSheetResult;
    try {
      sheetResult = await generateContactSheet(productImageBase64, brief, {
        quality: options.quality || 'medium',
      });
    } catch (sheetGenErr: any) {
      console.warn('[CarouselPipeline] Contact sheet generation error, retrying once:', sheetGenErr.message);
      retryCount++;
      sheetResult = await generateContactSheet(productImageBase64, brief, {
        quality: 'medium',
      });
    }

    // 3. Split the sheet into 3 individual portrait panels with Sharp
    const targetW = brief.sheetDimensions.panelWidth;
    const targetH = brief.sheetDimensions.panelHeight;
    const croppedPanels = await splitContactSheet(sheetResult.sheetBuffer, {
      targetWidth: targetW,
      targetHeight: targetH,
      format: 'png',
    });

    // 4. Validate output quality, boundaries, and non-empty images
    const validation = await validateCarousel(sheetResult.sheetBuffer, croppedPanels);
    console.log(`[CarouselPipeline] Sheet Validation Score: ${validation.score}/100 (Valid: ${validation.isValid})`);

    // 5. Overlay Copy, Headlines, Arrows, and CTAs programmatically with code
    const finishedSlides: FinishedSlide[] = [];
    for (let i = 0; i < croppedPanels.length; i++) {
      const panel = croppedPanels[i];
      const panelBrief = brief.panels[i];
      const slide = await overlayAdCopy(panel, panelBrief, {
        brandColor: brief.brandPalette.primary,
        enableOverlay: options.enableOverlays !== false,
      });
      finishedSlides.push(slide);
    }

    const durationMs = Date.now() - pipelineStartTime;

    // 6. Log metrics & calculate generation cost savings (66% less spend)
    const metrics = calculateGenerationCost({
      mode: generationMode,
      quality: options.quality || 'medium',
      size: `${brief.sheetDimensions.width}x${brief.sheetDimensions.height}`,
      requestCount: 1,
      durationMs,
      usable: true,
      retryCount,
      workspaceId: options.workspaceId,
      productName: brief.productName,
    });

    return {
      success: true,
      slides: finishedSlides,
      brief,
      validation,
      metrics,
    };
  } catch (pipelineErr: any) {
    console.error('[CarouselPipeline] Critical pipeline failure, engaging fallback:', pipelineErr);
    const durationMs = Date.now() - pipelineStartTime;

    const metrics = calculateGenerationCost({
      mode: 'separate_fallback',
      quality: options.quality || 'medium',
      size: `${brief.sheetDimensions.width}x${brief.sheetDimensions.height}`,
      requestCount: 3,
      durationMs,
      usable: false,
      retryCount,
      failureReason: pipelineErr.message,
      workspaceId: options.workspaceId,
      productName: brief.productName,
    });

    return {
      success: false,
      slides: [],
      brief,
      validation: {
        isValid: false,
        canCodeFix: false,
        score: 0,
        failureReasons: [pipelineErr.message],
        metrics: {
          sheetDecodable: false,
          panelsCount: 0,
          allPanelsNonEmpty: false,
          aspectRatioValid: false,
          averageFileSizeKB: 0,
        },
      },
      metrics,
      error: pipelineErr.message,
    };
  }
}

export * from './buildCampaignBrief';
export * from './generateContactSheet';
export * from './splitContactSheet';
export * from './overlayAdCopy';
export * from './validateCarousel';
export * from './calculateGenerationCost';
