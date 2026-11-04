import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const PRESENTATION_IMAGE_NAME = 'Présentation e-commerce pastel haut de gamme.png';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const asset = searchParams.get('asset') || 'hero';
    const version = searchParams.get('v') || '5';

    const originalPresentationPath = path.join(process.cwd(), 'public', 'images', PRESENTATION_IMAGE_NAME);
    const safeHeroPath = path.join(process.cwd(), 'public', 'images', 'hero-presentation.png');

    // Ensure safe-named copy exists in public/images/
    if (fs.existsSync(originalPresentationPath) && !fs.existsSync(safeHeroPath)) {
      try {
        fs.copyFileSync(originalPresentationPath, safeHeroPath);
      } catch {
        // ignore
      }
    }

    // If requesting hero, serve the high-resolution presentation image directly!
    if (asset === 'hero') {
      const targetFile = fs.existsSync(originalPresentationPath)
        ? originalPresentationPath
        : fs.existsSync(safeHeroPath)
        ? safeHeroPath
        : null;

      if (targetFile) {
        const fileBuffer = fs.readFileSync(targetFile);
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=86400',
          },
        });
      }
    }

    // Direct serve for beauty cream shampoo carousel slides
    if (asset === 'beauty-1' || asset === 'beauty-slide-1') {
      const slidePath = path.join(process.cwd(), 'public', 'images', 'beauty', 'slide_1_hook.jpg');
      if (fs.existsSync(slidePath)) {
        return new NextResponse(fs.readFileSync(slidePath), {
          headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' },
        });
      }
    }

    if (asset === 'beauty-2' || asset === 'beauty-slide-2') {
      const slidePath = path.join(process.cwd(), 'public', 'images', 'beauty', 'slide_2_value.jpg');
      if (fs.existsSync(slidePath)) {
        return new NextResponse(fs.readFileSync(slidePath), {
          headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' },
        });
      }
    }

    if (asset === 'beauty-3' || asset === 'beauty-slide-3') {
      const slidePath = path.join(process.cwd(), 'public', 'images', 'beauty', 'slide_3_cta.jpg');
      if (fs.existsSync(slidePath)) {
        return new NextResponse(fs.readFileSync(slidePath), {
          headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400' },
        });
      }
    }

    // Fallback for other assets (mockup crops)
    const SOURCE_PATH = 'C:/Users/MEDIA INFOPLUS/.gemini/antigravity/brain/cce0adc3-62ae-4a69-88dd-07eaf4002ca5/.user_uploaded/media_1793653576817_0689e58c.jpg';

    if (!fs.existsSync(SOURCE_PATH)) {
      return NextResponse.json({ error: 'Source image not found' }, { status: 404 });
    }

    const publicMockupDir = path.join(process.cwd(), 'public', 'images', 'mockup');
    if (!fs.existsSync(publicMockupDir)) {
      fs.mkdirSync(publicMockupDir, { recursive: true });
    }

    const cachedFilePath = path.join(publicMockupDir, `${asset}_v${version}.jpg`);

    if (fs.existsSync(cachedFilePath)) {
      const fileBuffer = fs.readFileSync(cachedFilePath);
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    const image = sharp(SOURCE_PATH);
    const meta = await image.metadata();
    const W = meta.width || 682;
    const H = meta.height || 1024;

    let cropBox = { left: 0, top: 0, width: W, height: H };

    if (asset === 'beauty-1') {
      cropBox = {
        left: Math.round(W * 0.33),
        top: Math.round(H * 0.332),
        width: Math.round(W * 0.20),
        height: Math.round(H * 0.132),
      };
    } else if (asset === 'beauty-2') {
      cropBox = {
        left: Math.round(W * 0.535),
        top: Math.round(H * 0.332),
        width: Math.round(W * 0.21),
        height: Math.round(H * 0.132),
      };
    } else if (asset === 'beauty-3') {
      cropBox = {
        left: Math.round(W * 0.748),
        top: Math.round(H * 0.332),
        width: Math.round(W * 0.21),
        height: Math.round(H * 0.132),
      };
    } else if (asset === 'before-after-combo') {
      cropBox = {
        left: Math.round(W * 0.315),
        top: Math.round(H * 0.47),
        width: Math.round(W * 0.355),
        height: Math.round(H * 0.145),
      };
    } else if (asset === 'laptop') {
      cropBox = {
        left: Math.round(W * 0.012),
        top: Math.round(H * 0.603),
        width: Math.round(W * 0.445),
        height: Math.round(H * 0.132),
      };
    } else if (asset === 'sarah') {
      cropBox = {
        left: Math.round(W * 0.035),
        top: Math.round(H * 0.855),
        width: Math.round(W * 0.14),
        height: Math.round(H * 0.085),
      };
    }

    cropBox.left = Math.max(0, Math.min(cropBox.left, W - 10));
    cropBox.top = Math.max(0, Math.min(cropBox.top, H - 10));
    cropBox.width = Math.min(cropBox.width, W - cropBox.left);
    cropBox.height = Math.min(cropBox.height, H - cropBox.top);

    const croppedBuffer = await sharp(SOURCE_PATH)
      .extract(cropBox)
      .resize(cropBox.width * 2, cropBox.height * 2, { kernel: 'lanczos3' })
      .jpeg({ quality: 96 })
      .toBuffer();

    fs.writeFileSync(cachedFilePath, croppedBuffer);

    return new NextResponse(croppedBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
