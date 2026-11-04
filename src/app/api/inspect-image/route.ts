import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

export async function GET() {
  try {
    const originalPath = path.join(process.cwd(), 'public', 'images', 'Présentation e-commerce pastel haut de gamme.png');
    const safePath = path.join(process.cwd(), 'public', 'images', 'hero-staging-presentation.png');

    // Also copy to safe ascii name so there are never encoding issues
    if (fs.existsSync(originalPath) && !fs.existsSync(safePath)) {
      fs.copyFileSync(originalPath, safePath);
    }

    const meta = await sharp(originalPath).metadata();
    return NextResponse.json({
      width: meta.width,
      height: meta.height,
      format: meta.format,
      copied: fs.existsSync(safePath),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
