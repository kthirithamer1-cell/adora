import fs from 'fs';
import path from 'path';

/**
 * 🧪 Test AI Background Removal in Node.js (rembg-equivalent via @imgly/background-removal-node)
 * 
 * Usage:
 *   node test-rembg-node.mjs [chemin/vers/image.jpg]
 */
async function main() {
  console.log('=================================================================');
  console.log('⏱️  Test AI Background Removal (Node.js / U2-Net / IS-Net Engine)');
  console.log('=================================================================');

  const customArg = process.argv[2];

  const candidateImages = [
    customArg,
    'C:/Users/MEDIA INFOPLUS/.gemini/antigravity-ide/brain/e351d51f-2281-4085-8e9a-8a1700001686/.user_uploaded/media_1792424701047.jpg',
    'C:/Users/MEDIA INFOPLUS/.gemini/antigravity-ide/brain/e351d51f-2281-4085-8e9a-8a1700001686/.user_uploaded/media_1792426965341.jpg',
    './public/images/test_watch.jpg',
    './public/images/bottle_nutrex.png',
  ].filter(Boolean);

  let targetImagePath = null;
  for (const imgPath of candidateImages) {
    if (fs.existsSync(imgPath)) {
      targetImagePath = imgPath;
      break;
    }
  }

  if (!targetImagePath) {
    console.error('❌ Aucune image valide trouvée.');
    process.exit(1);
  }

  console.log(`📸 Image source ciblée : ${targetImagePath}`);

  const publicDir = path.resolve(process.cwd(), 'public/images');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const baseName = path.basename(targetImagePath, path.extname(targetImagePath));
  const sourceInPublic = path.join(publicDir, `${baseName}_source.jpg`);
  fs.copyFileSync(targetImagePath, sourceInPublic);

  console.log('\n🤖 Chargement du modèle neuronal ONNX...');
  const startTime = Date.now();

  try {
    const { removeBackground } = await import('@imgly/background-removal-node');

    const imageBuffer = fs.readFileSync(targetImagePath);
    const ext = path.extname(targetImagePath).toLowerCase();
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    const inputBlob = new Blob([imageBuffer], { type: mimeType });

    console.log(`⚡ Traitement neuronal de "${path.basename(targetImagePath)}" en cours...`);
    const resultBlob = await removeBackground(inputBlob, {
      output: {
        format: 'image/png',
        quality: 1.0,
      },
    });

    const outputBuffer = Buffer.from(await resultBlob.arrayBuffer());
    const durationMs = Date.now() - startTime;

    const outputPath = path.join(publicDir, `${baseName}_rembg_cutout.png`);
    fs.writeFileSync(outputPath, outputBuffer);

    console.log(`\n✅ SUCCÈS ! Détourage IA terminé en ${(durationMs / 1000).toFixed(2)}s`);
    console.log(`🎯 Fichier PNG transparent généré :`);
    console.log(`   ➡️  ${outputPath}`);
    console.log(`   ➡️  Poids : ${(outputBuffer.length / 1024).toFixed(1)} KB`);
    console.log(`\nPrévisualisation accessible sous : /images/${baseName}_rembg_cutout.png`);
  } catch (err) {
    console.error('❌ Erreur lors du détourage :', err);
  }
}

main();
