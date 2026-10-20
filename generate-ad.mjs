
import "dotenv/config";
import OpenAI from "openai";
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const apiKey = process.env.OPEN_AI_KEY || process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("Missing OPEN_AI_KEY or OPENAI_API_KEY in .env");
}

const openai = new OpenAI({ apiKey });

let productImage = process.argv[2] || "./product.jpg";
const productName = process.argv[3] || "Parfum Oud Impérial";
const price = process.argv[4] || "149 DT";

const outputPath = "./ad-final.jpg";
const WIDTH = 1024;
const HEIGHT = 1536;

// Automatic fallback image.
if (!fs.existsSync(productImage)) {
  const fallbackPath = "./public/images/adora_hero_perfume.jpg";

  if (fs.existsSync(fallbackPath)) {
    productImage = fallbackPath;
  } else {
    throw new Error(`Product image not found: ${productImage}`);
  }
}

const prompt = `
Create a premium, photorealistic 9:16 luxury e-commerce
advertising photograph using the supplied image as the
reference for the exact physical product.

PRODUCT FIDELITY IS THE HIGHEST PRIORITY:
- Preserve the original product identity and packaging.
- Preserve the bottle silhouette, cap, label, proportions,
  colors, materials, logo and visible printed details.
- Never invent, replace, rewrite or redesign the label.
- Do not melt, distort, duplicate or unnecessarily crop it.
- Keep the product large, sharp and visually dominant.
- Show one product only.

ART DIRECTION:
Create an immersive luxury fragrance campaign.
Use a sophisticated, photorealistic environment with
dark mahogany, warm amber highlights, subtle gold reflections,
beautiful natural materials and cinematic depth of field.
Use realistic contact shadows and believable reflections.
Make the product look physically present in the scene.

COMPOSITION:
- Portrait 1024x1536.
- Product should occupy approximately 55-65% of image height.
- Use a visually balanced editorial composition.
- Keep the lower 25% relatively uncluttered, with a naturally
  darker or calmer background suitable for elegant typography.
- Blend the scene continuously from top to bottom.
- No separate footer, black rectangle, card or text panel.

STRICTLY DO NOT GENERATE:
Text, letters, prices, logos added to the scene, watermarks,
badges, borders, graphic overlays or additional products.

The result must look like an expensive real perfume campaign,
not a generic template, collage or obvious 3D render.
`;

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[char]);
}

function wrapText(value, maxChars = 28, maxLines = 2) {
  const words = String(value).trim().split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }

    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  if (lines.length === 0) {
    lines.push(String(value).slice(0, maxChars));
  }

  // Prevent oversized titles from overflowing.
  const consumed = lines.join(" ").length;
  const original = String(value).trim();

  if (consumed < original.length && lines.length === maxLines) {
    const last = lines.length - 1;
    lines[last] = lines[last].slice(0, maxChars - 1).trimEnd() + "…";
  }

  return lines;
}

async function toImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };

  const mimeType = mimeTypes[ext];

  if (!mimeType) {
    throw new Error("Use a JPG, PNG or WebP product image.");
  }

  const buffer = await fs.promises.readFile(filePath);

  return new File([buffer], path.basename(filePath), {
    type: mimeType,
  });
}

async function main() {
  console.log(`Generating ad for: ${productName}`);

  // One image API call.
  const result = await openai.images.edit({
    model: "gpt-image-2",
    image: await toImageFile(productImage),
    prompt,
    size: "1024x1536",
    quality: "low",
  });

  const imageData = result.data?.[0]?.b64_json;

  if (!imageData) {
    throw new Error("The image API returned no image data.");
  }

  const generatedImage = Buffer.from(imageData, "base64");

  // Read actual output dimensions instead of assuming them.
  const metadata = await sharp(generatedImage).metadata();
  const width = metadata.width || WIDTH;
  const height = metadata.height || HEIGHT;

  const titleLines = wrapText(productName, 28, 2)
    .map((line, index) => `
      <text x="512" y="${height - 215 + index * 45}"
        text-anchor="middle"
        fill="#fff7e8"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="36"
        font-weight="normal"
        letter-spacing="0.5">${escapeXml(line)}</text>
    `)
    .join("");

  const priceText = escapeXml(price);

  // Transparent gradient, elegant typography, no black box.
  const overlay = Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg"
      width="${width}" height="${height}"
      viewBox="0 0 ${width} ${height}">

      <defs>
        <linearGradient id="atmosphere"
          x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"
            stop-color="#100b08" stop-opacity="0"/>
          <stop offset="45%"
            stop-color="#100b08" stop-opacity="0.12"/>
          <stop offset="100%"
            stop-color="#100b08" stop-opacity="0.64"/>
        </linearGradient>
      </defs>

      <rect x="0" y="${height * 0.68}"
        width="${width}" height="${height * 0.32}"
        fill="url(#atmosphere)"/>

      ${titleLines}

      <line x1="${width / 2 - 45}" y1="${height - 112}"
        x2="${width / 2 + 45}" y2="${height - 112}"
        stroke="#d7b77a" stroke-width="1.5"
        stroke-opacity="0.9"/>

      <text x="${width / 2}" y="${height - 65}"
        text-anchor="middle"
        fill="#e8cf9c"
        font-family="Arial, sans-serif"
        font-size="27"
        letter-spacing="2">${priceText}</text>

    </svg>
  `);

  await sharp(generatedImage)
    .composite([{ input: overlay, left: 0, top: 0 }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(outputPath);

  console.log(`Saved advertisement: ${outputPath}`);
}

main().catch((error) => {
  console.error(
    "Ad generation failed:",
    error?.status ? `HTTP ${error.status}:` : "",
    error.message
  );

  process.exitCode = 1;
});
