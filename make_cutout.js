const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function createCutout() {
  const inputPath = path.join(__dirname, 'public', 'images', 'gnc_pro_whey_tub_1791150838901.jpg');
  const outputPath = path.join(__dirname, 'public', 'images', 'whey_gnc_transparent.png');

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // Process raw RGBA pixels to remove pure white background
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Check if pixel is white / light grey background
    if (r > 242 && g > 242 && b > 242) {
      data[i + 3] = 0; // full transparent
    } else if (r > 225 && g > 225 && b > 225) {
      // smooth antialiased edge
      const alphaFactor = (255 - ((r + g + b) / 3)) / 30;
      data[i + 3] = Math.min(255, Math.max(0, Math.round(alphaFactor * 255)));
    }
  }

  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4,
    }
  })
  .png()
  .toFile(outputPath);

  console.log('Created whey_gnc_transparent.png successfully:', width, 'x', height);
}

createCutout().catch(console.error);
