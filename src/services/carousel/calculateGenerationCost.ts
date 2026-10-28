/**
 * MarkMosaiq Low-Cost AI Carousel Generation Pipeline
 * Module 6: calculateGenerationCost.ts
 *
 * Tracks, logs, and calculates generation costs, comparing single-sheet vs. separate calls.
 * Records audit logs into the MarkMosaiq usage ledger.
 */

import { recordApiUsage } from '@/lib/apiUsageLogger';

export interface GenerationCostMetrics {
  generation_mode: 'sheet' | 'separate_fallback';
  model: string;
  quality: 'low' | 'medium' | 'high';
  size: string;
  generation_request_count: number;
  estimated_generation_cost: number; // in USD
  cost_savings_usd: number;
  cost_savings_percent: number;
  retry_count: number;
  usable_carousel: boolean;
  failure_reason?: string;
  total_generation_time_ms: number;
}

export function calculateGenerationCost(params: {
  mode: 'sheet' | 'separate_fallback';
  model?: string;
  quality?: 'low' | 'medium' | 'high';
  size?: string;
  requestCount?: number;
  durationMs: number;
  usable: boolean;
  retryCount?: number;
  failureReason?: string;
  workspaceId?: string;
  productName?: string;
}): GenerationCostMetrics {
  const {
    mode,
    model = 'gpt-image-2.5-flare',
    quality = 'medium',
    size = '3232x1440',
    requestCount = mode === 'sheet' ? 1 : 3,
    durationMs,
    usable,
    retryCount = 0,
    failureReason,
    workspaceId = 'ws_default',
    productName = 'Produit E-commerce',
  } = params;

  // Single sheet call is ~$0.04 USD vs 3 separate calls ~$0.12 USD
  const baseCostPerImage = quality === 'high' ? 0.08 : quality === 'low' ? 0.02 : 0.04;
  const separateCallsCost = baseCostPerImage * 3;
  const actualCost = mode === 'sheet' ? baseCostPerImage : separateCallsCost;

  const costSavingsUsd = Math.max(0, separateCallsCost - actualCost);
  const costSavingsPercent = mode === 'sheet' ? 66.7 : 0;

  const metrics: GenerationCostMetrics = {
    generation_mode: mode,
    model,
    quality,
    size,
    generation_request_count: requestCount,
    estimated_generation_cost: actualCost,
    cost_savings_usd: Number(costSavingsUsd.toFixed(3)),
    cost_savings_percent: Number(costSavingsPercent.toFixed(1)),
    retry_count: retryCount,
    usable_carousel: usable,
    failure_reason: failureReason,
    total_generation_time_ms: durationMs,
  };

  // Record into audit ledger
  try {
    recordApiUsage({
      workspaceId,
      endpoint: '/api/generate-carousel',
      model,
      latencyMs: durationMs,
      statusCode: usable ? 200 : 500,
      status: usable ? 'SUCCESS' : 'ERROR',
      costUSD: actualCost,
      creditsDeducted: 3,
      productName,
      category: 'carousel_low_cost_sheet',
      details: {
        mode,
        quality,
        size,
        requestCount,
        costSavingsPercent,
        retryCount,
      },
    });
  } catch (err) {
    console.warn('[CostTracker] Notice recording API usage:', err);
  }

  return metrics;
}
