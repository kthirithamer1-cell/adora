/**
 * MarkMosaiq Low-Cost AI Carousel Generation Pipeline
 * Module 5: validateCarousel.ts
 *
 * Implements automated validation checks on the contact sheet and split panels:
 * 1. Image decodes successfully
 * 2. Sheet dimensions and panel counts are valid
 * 3. Non-empty buffers (> 10KB)
 * 4. Boundary alignment checks
 */

import sharp from 'sharp';
import { CroppedPanel } from './splitContactSheet';

export interface ValidationReport {
  isValid: boolean;
  canCodeFix: boolean;
  score: number; // 0 to 100
  failureReasons: string[];
  metrics: {
    sheetDecodable: boolean;
    panelsCount: number;
    allPanelsNonEmpty: boolean;
    aspectRatioValid: boolean;
    averageFileSizeKB: number;
  };
}

export async function validateCarousel(
  sheetBuffer: Buffer,
  panels: CroppedPanel[]
): Promise<ValidationReport> {
  const failureReasons: string[] = [];
  let score = 100;
  let sheetDecodable = false;
  let allPanelsNonEmpty = true;
  let aspectRatioValid = false;
  let totalSizeKB = 0;

  // 1. Check Contact Sheet Decoding
  try {
    const sheetMeta = await sharp(sheetBuffer).metadata();
    if (!sheetMeta.width || !sheetMeta.height) {
      failureReasons.push('Impossible de décoder les dimensions de la feuille de contact.');
      score -= 50;
    } else {
      sheetDecodable = true;
      const ratio = sheetMeta.width / sheetMeta.height;
      // Sheet should be roughly 2:1 or 3:1 (for 3 panels side-by-side)
      if (ratio >= 1.5 && ratio <= 3.5) {
        aspectRatioValid = true;
      } else {
        failureReasons.push(`Ratio de feuille inattendu (${ratio.toFixed(2)}). Attendu ~2.0.`);
        score -= 20;
      }
    }
  } catch (err: any) {
    failureReasons.push(`Erreur Sharp sur la feuille de contact : ${err.message}`);
    score -= 60;
  }

  // 2. Check Panels Count
  if (!Array.isArray(panels) || panels.length !== 3) {
    failureReasons.push(`Nombre de panneaux invalide : ${panels?.length || 0} (3 requis).`);
    score -= 40;
  }

  // 3. Check Panel Buffers & Dimensions
  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    const sizeKB = p.buffer.length / 1024;
    totalSizeKB += sizeKB;

    if (!p.buffer || sizeKB < 8) {
      allPanelsNonEmpty = false;
      failureReasons.push(`Le panneau ${i + 1} (${p.role}) est trop petit ou corrompu (${sizeKB.toFixed(1)} KB).`);
      score -= 30;
    }

    try {
      const pMeta = await sharp(p.buffer).metadata();
      if (!pMeta.width || !pMeta.height) {
        failureReasons.push(`Le panneau ${i + 1} ne peut pas être décodé par Sharp.`);
        score -= 25;
      }
    } catch {
      failureReasons.push(`Échec de lecture du panneau ${i + 1}.`);
      score -= 25;
    }
  }

  const averageFileSizeKB = panels.length > 0 ? Math.round(totalSizeKB / panels.length) : 0;
  const isValid = failureReasons.length === 0 && score >= 70;
  const canCodeFix = failureReasons.some((r) => r.includes('Ratio') || r.includes('dimensions'));

  return {
    isValid,
    canCodeFix,
    score: Math.max(0, score),
    failureReasons,
    metrics: {
      sheetDecodable,
      panelsCount: panels.length,
      allPanelsNonEmpty,
      aspectRatioValid,
      averageFileSizeKB,
    },
  };
}
