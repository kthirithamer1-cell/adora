import { AutoModel, AutoProcessor, RawImage } from '@huggingface/transformers';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * 🚀 BiRefNet Lite ONNX background removal script in TypeScript
 */
export async function runBiRefNet(imagePathArg?: string) {
  console.log('=================================================================');
  console.log('🚀 Running BiRefNet_lite-ONNX with @huggingface/transformers');
  console.log('=================================================================');

  const customArg = imagePathArg || process.argv[2];
  const candidateImages = [
    customArg,
    'C:/Users/MEDIA INFOPLUS/.gemini/antigravity-ide/brain/e351d51f-2281-4085-8e9a-8a1700001686/.user_uploaded/media_1792424701047.jpg',
    'C:/Users/MEDIA INFOPLUS/.gemini/antigravity-ide/brain/e351d51f-2281-4085-8e9a-8a1700001686/.user_uploaded/media_1792426965341.jpg',
    './public/images/test_watch_source.jpg',
    './public/images/test_watch.jpg',
  ].filter(Boolean) as string[];

  let inputPath: string | null = null;
  for (const p of candidateImages) {
    if (fs.existsSync(p)) {
      inputPath = p;
      break;
    }
  }

  if (!inputPath) {
    console.error('❌ Aucun fichier image trouvé.');
    process.exit(1);
  }

  console.log(`📸 Image source : ${inputPath}`);

  const id = 'onnx-community/BiRefNet_lite-ONNX';
  console.log(`\n⏳ Chargement du modèle "${id}" depuis Hugging Face...`);
  const t0 = Date.now();

  const model = await AutoModel.from_pretrained(id);
  const processor = await AutoProcessor.from_pretrained(id);

  console.log(`✅ Modèle et processeur chargés en ${((Date.now() - t0) / 1000).toFixed(2)}s`);

  console.log('🖼️  Lecture de l\'image et prétraitement...');
  const image = await RawImage.read(inputPath);
  const { pixel_values } = await processor(image);

  console.log('⚡ Inférence BiRefNet...');
  console.log('   Envoi du tenseur pixel_values via { input_image }...');
  const out = await (model as any)({ input_image: pixel_values });
  const outKeys = Object.keys(out);

  const outputTensor = out[outKeys[0]];
  const mask = await RawImage.fromTensor(
    outputTensor[0].sigmoid().mul(255).to('uint8')
  ).resize(image.width, image.height);

  console.log(`📐 Masque redimensionné à [${image.width}x${image.height}]`);

  console.log('🎨 Application du canal alpha avec Sharp...');
  const { data: rgbData } = await sharp(inputPath)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const totalPixels = image.width * image.height;
  const rgbaData = Buffer.alloc(totalPixels * 4);

  for (let i = 0; i < totalPixels; i++) {
    rgbaData[i * 4] = rgbData[i * 3];
    rgbaData[i * 4 + 1] = rgbData[i * 3 + 1];
    rgbaData[i * 4 + 2] = rgbData[i * 3 + 2];
    rgbaData[i * 4 + 3] = mask.data[i];
  }

  const outputBuffer = await sharp(rgbaData, {
    raw: {
      width: image.width,
      height: image.height,
      channels: 4,
    },
  })
    .png({ compressionLevel: 8 })
    .toBuffer();

  const publicDir = path.resolve(process.cwd(), 'public/images');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const baseName = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(publicDir, `${baseName}_birefnet_cutout.png`);
  fs.writeFileSync(outputPath, outputBuffer);

  const totalDuration = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(`\n🎉 SUCCÈS COMPLET BiRefNet !`);
  console.log(`⏱️  Durée totale : ${totalDuration}s`);
  console.log(`📁 Fichier de sortie : ${outputPath}`);
  console.log(`⚖️  Poids : ${(outputBuffer.length / 1024).toFixed(1)} KB`);
  console.log(`🔗 Prévisualisation : /images/${baseName}_birefnet_cutout.png`);
}

if (process.argv[1]?.includes('test-birefnet.ts')) {
  runBiRefNet();
}
