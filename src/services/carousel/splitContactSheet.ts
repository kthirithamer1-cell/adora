/**
 * MarkMosaiq Low-Cost AI Carousel Generation Pipeline
 * Module 3: splitContactSheet.ts
 *
 * Crops the 3-panel contact sheet into three individual portrait/square images using Sharp.
 * Handles boundary alignment, resizing, and format optimization.
 */

import sharp from 'sharp';

export interface CroppedPanel {
  panelIndex: 1 | 2 | 3;
  role: 'HOOK' | 'SOLUTION' | 'RESULT';
  buffer: Buffer;
  base64: string;
  width: number;
  height: number;
  cropBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

export interface SplitOptions {
  targetWidth?: number;
  targetHeight?: number;
  format?: 'png' | 'jpeg';
}

export async function splitContactSheet(
  sheetBuffer: Buffer,
  options: SplitOptions = {}
): Promise<[CroppedPanel, CroppedPanel, CroppedPanel]> {
  const meta = await sharp(sheetBuffer).metadata();
  const sheetWidth = meta.width || 3072;
  const sheetHeight = meta.height || 1536;

  const panelWidth = Math.floor(sheetWidth / 3);
  const panelHeight = sheetHeight;

  const targetWidth = options.targetWidth || 1024;
  const targetHeight = options.targetHeight || (options.targetWidth ? Math.floor(options.targetWidth * 1.5) : 1536);
  const format = options.format || 'png';

  const roles: ('HOOK' | 'SOLUTION' | 'RESULT')[] = ['HOOK', 'SOLUTION', 'RESULT'];
  const croppedPanels: CroppedPanel[] = [];

  for (let i = 0; i < 3; i++) {
    const left = i * panelWidth;
    // For the last panel, ensure we take up to the exact sheet boundary to avoid 1px rounding gaps
    const actualWidth = i === 2 ? sheetWidth - left : panelWidth;

    const cropBox = {
      left,
      top: 0,
      width: actualWidth,
      height: panelHeight,
    };

    let pipeline = sharp(sheetBuffer).extract(cropBox);

    if (actualWidth !== targetWidth || panelHeight !== targetHeight) {
      pipeline = pipeline.resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'center',
      });
    }

    let panelBuffer: Buffer;
    if (format === 'jpeg') {
      panelBuffer = await pipeline.jpeg({ quality: 90 }).toBuffer();
    } else {
      panelBuffer = await pipeline.png().toBuffer();
    }

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const base64 = `data:${mime};base64,${panelBuffer.toString('base64')}`;

    croppedPanels.push({
      panelIndex: (i + 1) as 1 | 2 | 3,
      role: roles[i],
      buffer: panelBuffer,
      base64,
      width: targetWidth,
      height: targetHeight,
      cropBox,
    });
  }

  return croppedPanels as [CroppedPanel, CroppedPanel, CroppedPanel];
}
