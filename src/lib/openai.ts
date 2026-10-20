
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY,
});

type ImageSize = "1024x1024" | "1024x1536" | "1536x1024";

export async function generateBackgroundWithGPTImageFlare25(
  prompt: string,
  productImageBase64: string,
  size: ImageSize = "1024x1536"
): Promise<string> {
  if (!productImageBase64) {
    throw new Error("Product image is required");
  }

  const match = productImageBase64.match(
    /^data:image\/(png|jpeg|jpg|webp);base64,([\s\S]+)$/i
  );

  const buffer = match
    ? Buffer.from(match[2], "base64")
    : Buffer.from(productImageBase64, "base64");

  const mimeType = match
    ? `image/${match[1].toLowerCase().replace("jpg", "jpeg")}`
    : "image/png";

  const image = new File([new Uint8Array(buffer)], "product.png", {
    type: mimeType,
  });

  const result = await openai.images.edit({
    model: "gpt-image-2.5-flare",
    image,
    prompt: `Create a premium photorealistic product advertisement.

CONCEPT:
${prompt}

FIDELITY: Preserve the reference product's exact design, shape,
proportions, packaging, logo, label, text, colors, and materials.
Do not redesign, replace, or duplicate it.

SCENE: Create a complete, immersive commercial photoshoot.
Ground the product naturally with consistent perspective, lighting,
contact shadows, and realistic reflections.

COMPOSITION: Product prominent and recognizable, refined cinematic
lighting, realistic materials, uncluttered composition.
No invented text or logos. No ad copy unless requested.`,
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
  if (!productImageBase64) {
    throw new Error("Product image is required");
  }

  const match = productImageBase64.match(
    /^data:image\/(png|jpeg|jpg|webp);base64,([\s\S]+)$/i
  );

  const buffer = match
    ? Buffer.from(match[2], "base64")
    : Buffer.from(productImageBase64, "base64");

  const mimeType = match
    ? `image/${match[1].toLowerCase().replace("jpg", "jpeg")}`
    : "image/png";

  const image = new File(
    [new Uint8Array(buffer)],
    "product.png",
    { type: mimeType }
  );

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
