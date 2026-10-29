import fs from "fs";
import path from "path";
import OpenAI, { toFile } from "openai";
import sharp from "sharp";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY,
});

export type ImageSize = "1024x1024" | "1024x1536" | "1536x1024" | "3232x1440";

async function resolveImageFile(input: string): Promise<File> {
  if (!input) {
    throw new Error("Product image is required");
  }

  let buffer: Buffer;

  if (input.startsWith("/") || input.startsWith("images/") || input.startsWith("./")) {
    const cleanPath = input.replace(/^\.?\//, "");
    const localPath = path.join(process.cwd(), "public", cleanPath);
    if (fs.existsSync(localPath)) {
      buffer = fs.readFileSync(localPath);
    } else {
      throw new Error(`File not found: ${localPath}`);
    }
  } else if (input.startsWith("http://") || input.startsWith("https://")) {
    const res = await fetch(input);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
    buffer = Buffer.from(await res.arrayBuffer());
  } else {
    const match = input.match(/^data:image\/[a-zA-Z0-9+.-]+;base64,([\s\S]+)$/i);
    buffer = Buffer.from(match ? match[1] : input, "base64");
  }

  const pngBuffer = await sharp(buffer)
    .resize(1024, 1536, { fit: "inside", withoutEnlargement: true })
    .png()
    .toBuffer();

  return await toFile(pngBuffer, "product.png", { type: "image/png" });
}

export async function generateBackgroundWithGPTImageFlare25(
  prompt: string,
  productImageBase64: string,
  size: ImageSize = "1024x1536"
): Promise<string> {
  if (!productImageBase64) {
    throw new Error("Product image is required");
  }

  let buffer: Buffer;
  let mimeType = "image/png";

  if (
    productImageBase64.startsWith("/") ||
    productImageBase64.startsWith("images/") ||
    productImageBase64.startsWith("./")
  ) {
    const cleanPath = productImageBase64.replace(/^\.?\//, "");
    const localPath = path.join(process.cwd(), "public", cleanPath);
    if (fs.existsSync(localPath)) {
      buffer = fs.readFileSync(localPath);
      if (localPath.toLowerCase().endsWith(".jpg") || localPath.toLowerCase().endsWith(".jpeg")) {
        mimeType = "image/jpeg";
      } else if (localPath.toLowerCase().endsWith(".webp")) {
        mimeType = "image/webp";
      }
    } else {
      throw new Error(`File not found: ${localPath}`);
    }
  } else {
    const match = productImageBase64.match(
      /^data:image\/(png|jpeg|jpg|webp);base64,([\s\S]+)$/i
    );

    buffer = match
      ? Buffer.from(match[2], "base64")
      : Buffer.from(productImageBase64, "base64");

    mimeType = match
      ? `image/${match[1].toLowerCase().replace("jpg", "jpeg")}`
      : "image/png";
  }

  const image = new File([new Uint8Array(buffer)], "product.png", {
    type: mimeType,
  });

  const result = await openai.images.edit({
  model: "gpt-image-2.5-flare",
  image,
  prompt: `
You are a world-class creative director, advertising photographer,
and visual marketing strategist.

YOUR TASK:
Transform the supplied product photograph into a COMPLETE,
READY-TO-PUBLISH COMMERCIAL ADVERTISEMENT.

CAMPAIGN CONCEPT:
${prompt}

1. PRODUCT PRESERVATION:
- Preserve the exact original product.
- Maintain its packaging, shape, proportions, logo,
  label, colors and readable existing text.
- Never invent or replace brand identity.
- The product must remain the main visual focus.

2. CREATE A COMPLETE ENVIRONMENT:
- Build an immersive scene specifically designed
  around this product and its category.
- Generate appropriate props, ingredients,
  surfaces and environmental details.
- Use professional art direction.
- Create realistic shadows, reflections,
  depth, perspective and cinematic lighting.
- Do not simply replace the background.
- Make the product feel naturally integrated
  into the environment.

3. ADVERTISING COPY:
Generate original marketing copy adapted to the product.

Include:
- ONE powerful, attention-grabbing headline.
- ONE engaging supporting sentence.
- ONE short CTA.

The headline must:
- Capture attention immediately.
- Connect with the target customer's desire,
  problem or aspiration.
- Be specific to the supplied product.
- Feel natural, persuasive and memorable.

Supporting text:
- Explain the value of the product.
- Use emotionally engaging language.
- Never invent scientific or medical claims.

CTA:
- Short, clear and relevant.

4. VISUAL TYPOGRAPHY:
- Integrate the headline directly into the composition.
- Use professional advertising typography.
- Establish strong visual hierarchy.
- Keep text readable and correctly spelled.
- Place text where it does not cover the product.
- Use intentional spacing and premium layouts.

5. FINAL ART DIRECTION:
Create an advertisement that looks like it was
produced by a professional creative agency.

The result must contain:
A complete product scene,
a recognizable original product,
a compelling headline,
supporting marketing copy,
and a CTA.

IMPORTANT:
This is NOT a background replacement.
This is NOT a simple product photograph.
This is a COMPLETE PRODUCT ADVERTISEMENT.

No generic templates, random decorations,
fake logos, gibberish or unsupported claims.
  `,
  size,
  quality: "medium",
  output_format: "png",
});
  console.log("🖼️ Image generation completed");
  console.log("Model:", "gpt-image-2.5-flare");
  console.log("Size:", size);
  console.log("Quality:", "medium");

  console.log("Usage:", JSON.stringify(result.usage ?? null, null, 2));
  console.log("Request ID:", result._request_id);

  const generatedImage = result.data?.[0]?.b64_json;

  if (!generatedImage) {
    throw new Error("OpenAI returned no generated image");
  }

  return `data:image/png;base64,${generatedImage}`;
}



export async function removeBackgroundWithOpenAI(
  productImageBase64: string
): Promise<string> {
  const image = await resolveImageFile(productImageBase64);

  const startTime = Date.now();

  const result = await openai.images.edit({
    model: "gpt-image-2.5-flare",
    image,
    prompt: `Remove the background from this image.

TASK:
Isolate the original product and remove the entire background.
Return the product alone on a fully transparent background.

PRODUCT FIDELITY:
Preserve the original product exactly, including its shape,
proportions, packaging, logo, label, text, colors, material,
reflections, and fine details.

EDGES:
Create clean, accurate edges without halos, leftover background,
artificial outlines, or missing product details.

STRICT:
Do not redesign, regenerate, duplicate, or modify the product.
Do not add a new background, shadows, text, or objects.
The background must be transparent, not white or checkered.`,
    quality: "low",
    output_format: "png",
    background: "transparent",
  });

  const output = result.data?.[0]?.b64_json;

  if (!output) {
    throw new Error("OpenAI returned no background-removed image");
  }

  console.log("🪄 Background removal completed");
  console.log("Model:", "gpt-image-2.5-flare");
  console.log("Quality:", "low");
  console.log("Processing time:", Date.now() - startTime, "ms");
  console.log("Usage:", JSON.stringify(result.usage ?? null, null, 2));
  console.log("Request ID:", result._request_id);

  return `data:image/png;base64,${output}`;
}

export async function analyzeProductWithGPT4o(imageBase64: string): Promise<Record<string, any>> {
  return {
    category: 'E-commerce',
    productName: 'Produit E-commerce',
    dominantColors: ['#00E5FF', '#1E293B'],
  };
}

export type CarouselSlide = {
  index: number;
  role: string;
  image: string;
  headline?: string;
  subheadline?: string;
  badge?: string;
  ctaText?: string;
  copyPurpose?: string;
  concept?: string;
  requestId?: string;
  usage?: unknown;
};

export type CarouselOptions = {
  prompt?: string;
  slideCount?: 3 | 5;
  size?: ImageSize;
  quality?: "low" | "medium" | "high";
  productName?: string;
  // Optional legacy parameters for compatibility
  style?: string;
  language?: string;
  benefits?: string[];
  cta?: string;
  brandName?: string;
  niche?: string;
};

export async function generateCarouselWithGPTImageFlare25(
  productImageBase64: string,
  options: CarouselOptions = {}
): Promise<CarouselSlide[]> {
  if (!productImageBase64) {
    throw new Error("Product image is required");
  }

  const {
    prompt = "Create a premium ecommerce campaign.",
    slideCount = 3,
    size = "3232x1440",
    quality = "medium",
    productName = "the supplied product",
    style = "premium editorial advertising",
    language = "French",
    benefits = [],
    cta = "Discover it now",
    brandName = "",
    niche = "ecommerce",
  } = options;

  if (slideCount !== 3) {
    throw new Error(
      "The contact-sheet workflow currently supports exactly 3 slides."
    );
  }

  const image = await resolveImageFile(productImageBase64);

  const startedAt = Date.now();

  const sheetPrompt = `
Create ONE premium ecommerce advertising contact sheet.

CAMPAIGN:
${prompt}

PRODUCT:
${productName}
Brand: ${brandName || "Use the supplied brand reference if visible"}
Niche: ${niche}
Verified benefits: ${benefits.length
      ? benefits.join(", ")
      : "Do not invent product claims"}



CANVAS:
- One wide canvas containing exactly three equal vertical panels.
- Each panel is a standalone portrait advertisement.
- No borders, gutters, or mockup frames.
- Include the advertising text directly inside each panel.
- Render text clearly, with correct spelling and readable typography.
- Keep all text safely inside its own panel.
- Never allow text to cross panel boundaries.
- Use strong headline hierarchy, clean spacing, and premium typography.

PANEL 1 — HOOK:
- Show the customer's problem, desire, or aspiration.
- Do not show the product.
- Include a short, powerful headline in ${language}.
- Include a supporting line that creates curiosity.
- Leave sufficient negative space around the text.

PANEL 2 — SOLUTION:
- Feature the supplied product prominently.
- Preserve the original packaging, logo, proportions, and colors.
- Include a concise benefit-led headline in ${language}.
- Add a short supporting line using only verified benefits.
- Keep the text separate from the product label.

PANEL 3 — RESULT:
- Show an aspirational lifestyle featuring the product.
- Include a compelling result-oriented headline in ${language}.
- Add a short supporting line and the CTA "${cta}".
- Keep the CTA readable and visually prominent.

TYPOGRAPHY:
- Use premium editorial advertising typography.
- Strong contrast between text and background.
- Correct language-specific characters and spelling.
- No gibberish, fake logos, or invented claims.
- Keep all text within the individual panel.
`;

  console.log("Generating one 3-panel campaign sheet...");
  console.log("Model: gpt-image-2.5-flare");
  console.log("Size:", size, "| Quality:", quality);

  const result = await openai.images.edit({
    model: "gpt-image-2.5-flare",
    image,
    prompt: sheetPrompt,
    size,
    quality,
    output_format: "png",
    background: "opaque",
  });

  const base64 = result.data?.[0]?.b64_json;

  if (!base64) {
    throw new Error("OpenAI returned no contact sheet");
  }

  const sheet = Buffer.from(base64, "base64");

  
 ;

  const metadata = await sharp(sheet).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to read contact-sheet dimensions");
  }

  const panelWidth = Math.floor(metadata.width / 3);

  const roles = [
    {
      role: "HOOK",
      copyPurpose: "Create desire or curiosity",
    },
    {
      role: "SOLUTION",
      copyPurpose: "Reveal the product and its verified benefit",
    },
    {
      role: "RESULT",
      copyPurpose: "Show the aspiration and encourage action",
    },
  ];

  const slides: CarouselSlide[] = [];

  for (let i = 0; i < 3; i++) {
    const left = i * panelWidth;
    const width = i === 2
      ? metadata.width - left
      : panelWidth;

    const crop = await sharp(sheet)
      .extract({
        left,
        top: 0,
        width,
        height: metadata.height,
      })
      .resize(1024, 1536, {
        fit: "contain",
        background: "#ffffff",
      })
      .png()
      .toBuffer();

    // Sauvegarder chaque slide individuelle dans public/ai

    slides.push({
      index: i + 1,
      role: roles[i].role,
      image: `data:image/png;base64,${crop.toString("base64")}`,
      copyPurpose: roles[i].copyPurpose,
      requestId: result._request_id,
      usage: result.usage ?? null,
    });
  }

  console.log("Contact sheet dimensions:", metadata.width, "x", metadata.height);
  console.log("Generated slides:", slides.length);
  console.log("Request ID:", result._request_id);
  console.log("Usage:", JSON.stringify(result.usage ?? null));
  console.log("Elapsed:", Date.now() - startedAt, "ms");

  return slides;
}
