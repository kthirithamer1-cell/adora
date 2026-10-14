import { ProductAnalysis } from './types';

export async function analyzeProductWithGPT4o(imageBase64: string): Promise<ProductAnalysis> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY;

  if (!apiKey || apiKey.startsWith('sk-placeholder')) {
    const isPerfume = imageBase64.includes('perfume') || imageBase64.includes('rose') || imageBase64.includes('image.png') || !imageBase64.includes('whey');
    if (isPerfume) {
      return {
        productName: 'Eau de Rose — Parfumerie Tunisienne',
        brand: 'Eau de Rose',
        category: 'perfume',
        dominantColors: ['#BE123C', '#F59E0B', '#FFF1F2'],
        targetGoal: 'Élégance, sillage raffiné et séduction au quotidien',
        suggestedAngles: [
          'El parfum li y5allek tbrille : sillage envoûtant longue durée',
          'Haute parfumerie tunisienne : des essences pures et nobles',
          'Le parfum viral de la saison disponible sur toute la Tunisie',
        ],
        captions: {
          instagramFeedFr: `✨ Sublimez votre quotidien avec Eau de Rose.\n\nUne création olfactive raffinée, intense et durable. Conçue pour marquer les esprits à chaque instant.\n\n✅ 100% Originale certifiée\n🚚 Livraison express 24/48h sur les 24 gouvernorats\n💵 Paiement à la livraison disponible !\n\n👉 Commandez par message ou sur notre site !`,
          instagramFeedDarija: `🔥 El parfum li y5allek tbrille weslet fi boutique mteena !\n\nRiha tched nhar kemel w khedma luxueuse tayara al强烈 lekher.\n\n🚚 Livri fisaa fi tounes el kol (24-48h)\n💰 Khlas fel livraison\n\nAbathna message tawwa bech treservi flacon mteek !`,
          storyUrgency: `🚨 SOLDÉ -10% : Derniers flacons disponibles en Tunisie ! Cliquez vite pour commander ➔`,
          facebookAd: `Offre Flash : Eau de Rose Parfumerie Tunisienne. Profitez de -10% immédiat et livraison rapide partout en Tunisie !`,
        },
        hashtags: [
          '#parfumtunisie',
          '#eauderose',
          '#beautetunisie',
          '#ecommercetunisie',
          '#livraisontunisie',
          '#tunisianshop',
        ],
      };
    }

    // Mode Compléments alimentaires / Fitness
    return {
      productName: '100% Gold Standard Isolate Whey',
      brand: 'Optimum Nutrition',
      category: 'whey',
      dominantColors: ['#0B0E14', '#FFD700', '#FF5722'],
      targetGoal: 'Développement de masse musculaire sèche et récupération rapide',
      suggestedAngles: [
        'Pureté absolue : 25g de protéine par portion',
        'Zéro sucre ajouté, digestion ultra-légère',
        'Le complément le plus vendu au monde maintenant disponible en Tunisie',
      ],
      captions: {
        instagramFeedFr: `⚡ Prêt à passer au niveau supérieur ?\n\nDécouvrez la référence mondiale de l'Isolate Whey : 25g de protéines pures par dose, absorption ultra-rapide et saveur gourmande.\n\n✅ 100% Authentique importé\n📦 Livraison express 24/48h sur toute la Tunisie\n💵 Paiement à la livraison disponible !\n\n👉 Commandez par message ou sur notre site !`,
        instagramFeedDarija: `🔥 El Top mtaa el Isolate weslet lel boutique mteena !\n\n25g de protéine fi kol dose, zéro sucre w khfifa al meeda. Khdemna al qualité w el authenticité 100% originale.\n\n🚚 Livri fi 24h/48h fi tounes el kol\n💰 Khlass fel livraison\n\nAbathna message tawwa bech tcommondi !`,
        storyUrgency: `🚨 STOCK TRÈS LIMITÉ ! Ne ratez pas votre pot d'Isolate Whey avant la rupture. Cliquez pour commander ➔`,
        facebookAd: `Muscle sec, force et récupération maximale. Profitez de notre promo spéciale livraison offerte cette semaine !`,
      },
      hashtags: [
        '#fitness_tunisie',
        '#musculationtunisie',
        '#wheytunisie',
        '#complement_tunisie',
        '#crossfittunisie',
        '#livraisontunisie',
      ],
    };
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Tu es un expert marketing de premier plan pour le e-commerce et le retail en Tunisie. 
            Analyse la photo de produit envoyée et génère un JSON valide respectant scrupuleusement la structure demandée avec des accroches qui font vendre en Tunisie.`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyse ce produit e-commerce et renvoie un JSON contenant : productName, brand, category, dominantColors, targetGoal, suggestedAngles (array de 3 phrases), captions (avec instagramFeedFr, instagramFeedDarija, storyUrgency, facebookAd), et hashtags (array de hashtags populaires en Tunisie).',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content) as ProductAnalysis;
  } catch (error) {
    console.error('Erreur GPT-4o Vision:', error);
    throw error;
  }
}

/**
 * Génération intégrée du décor avec GPT Image (gpt-image-1 via /v1/images/edits).
 * Envoie directement le produit (et le logo) pour que l'IA intègre naturellement le produit dans la scène avec ses ombres, reflets et ambiance.
 */
export async function generateIntegratedSceneWithGPT1(params: {
  imageBuffer: Buffer;
  prompt: string;
  size?: '1024x1024' | '1024x1792';
}): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY;
  if (!apiKey || apiKey.startsWith('sk-placeholder')) return null;

  const { imageBuffer, prompt, size = '1024x1024' } = params;

  try {
    const formData = new FormData();
    formData.append('model', 'gpt-image-1');
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: 'image/png' });
    formData.append('image', blob, 'product_stage.png');
    formData.append('prompt', prompt);
    formData.append('size', size);
    formData.append('n', '1');

    const res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.[0]?.url) {
        return data.data[0].url;
      }
      if (data?.data?.[0]?.b64_json) {
        return `data:image/png;base64,${data.data[0].b64_json}`;
      }
    } else {
      const err = await res.json().catch(() => null);
      console.warn('gpt-image-1 /images/edits notice:', err?.error?.message || res.statusText);
    }
  } catch (err) {
    console.warn('Erreur /images/edits gpt-image-1:', err);
  }

  return null;
}

/**
 * Génération de décor via GPT Image / DALL-E (Text-to-Image) avec gpt-image-1 et fallback dall-e-3
 */
export async function generateBackgroundWithDALLE(prompt: string, size: '1024x1024' | '1024x1792' = '1024x1024'): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_AI_KEY;

  if (!apiKey || apiKey.startsWith('sk-placeholder')) {
    return size === '1024x1792' 
      ? '/images/creatine_story.jpg' 
      : '/images/whey_studio_podium.jpg';
  }

  const positiveVacancy = 'The central pedestal top surface is completely vacant, pristine, smooth and polished, cleanly awaiting an object. Clean contact surface with soft natural gradient falloff. Clean seamless background.';

  // 1. Tentative principale avec gpt-image-1 (recommandé pour rendu texte & intégration)
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: `Professional commercial studio staging set. ${prompt.trim()}. ${positiveVacancy}`,
        n: 1,
        size: size,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.data?.[0]?.url) {
        return data.data[0].url;
      }
    } else {
      const errData = await response.json().catch(() => null);
      console.warn('gpt-image-1 generations notice:', errData?.error?.message || response.statusText);
    }
  } catch (err) {
    console.warn('Erreur appel gpt-image-1:', err);
  }

  // 2. Fallback direct vers dall-e-3 si gpt-image-1 n'est pas activé sur le compte
  try {
    const responseDalle = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Professional commercial studio staging set. ${prompt.trim()}. ${positiveVacancy}`,
        n: 1,
        size: size,
        quality: 'standard',
      }),
    });

    if (responseDalle.ok) {
      const data = await responseDalle.json();
      if (data?.data?.[0]?.url) {
        return data.data[0].url;
      }
    }
  } catch (err) {
    console.warn('Erreur fallback DALL-E 3:', err);
  }

  // 3. Fallback décor studio neutre et vacant
  return '/images/whey_studio_podium.jpg';
}


