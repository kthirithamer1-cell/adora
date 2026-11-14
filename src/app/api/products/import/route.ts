import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { createProductAction } from '@/actions/products.actions';

export const dynamic = 'force-dynamic';

interface ExtractedProduct {
  name: string;
  brand?: string;
  category: string;
  priceTND: number;
  originalImageUrl: string;
  cutoutImageUrl?: string;
  descriptionFr?: string;
  descriptionDarija?: string;
  badgeId: string;
  sourceUrl?: string;
  platform: 'shopify' | 'woocommerce' | 'converty' | 'bigcommerce' | 'website';
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    let rawUrl = (body.url || '').trim();
    const saveDirectly = Boolean(body.saveDirectly);

    if (!rawUrl) {
      return NextResponse.json(
        { success: false, error: 'Veuillez renseigner une URL de boutique ou de produit (Shopify, WooCommerce, Converty, BigCommerce, ou site web).' },
        { status: 400 }
      );
    }

    if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
      rawUrl = 'https://' + rawUrl;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: "Format d'URL invalide. Exemples : https://maboutique.myshopify.com, https://maboutique.converty.shop, https://monsite-woo.com/shop" },
        { status: 400 }
      );
    }

    const domain = parsedUrl.origin;
    let extractedProducts: ExtractedProduct[] = [];
    let detectedPlatform: 'shopify' | 'woocommerce' | 'converty' | 'bigcommerce' | 'website' = 'website';

    // =========================================================================
    // 1. DÉTECTION & EXTRACTION SHOPIFY
    // =========================================================================
    try {
      const isSingleProduct = parsedUrl.pathname.includes('/products/');
      const shopifyEndpoint = isSingleProduct
        ? `${domain}${parsedUrl.pathname.replace(/\.json$/, '')}.json`
        : `${domain}/products.json?limit=50`;

      const shopifyRes = await fetch(shopifyEndpoint, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(7000),
      });

      if (shopifyRes.ok) {
        const json = await shopifyRes.json();
        const rawList = json.products && Array.isArray(json.products)
          ? json.products
          : json.product
          ? [json.product]
          : [];

        if (rawList.length > 0) {
          detectedPlatform = 'shopify';
          extractedProducts = rawList.map((p: any) => {
            const firstVariant = p.variants?.[0];
            const firstImg = p.images?.[0]?.src || p.image?.src || '/images/bottle_nutrex.png';
            const price = parseFloat(firstVariant?.price || '49') || 49;
            const cleanDesc = cleanHtml(p.body_html);
            const category = classifyCategory(p.title, p.product_type);
            const darijaHook = generateDarijaHook(p.title, category);

            return {
              name: p.title || 'Produit Shopify',
              brand: p.vendor || session?.workspace?.name || parsedUrl.hostname,
              category,
              priceTND: Math.round(price),
              originalImageUrl: firstImg,
              cutoutImageUrl: firstImg,
              descriptionFr: cleanDesc || `Produit officiel ${p.title}`,
              descriptionDarija: darijaHook,
              badgeId: 'livraison',
              sourceUrl: `${domain}/products/${p.handle || ''}`,
              platform: 'shopify',
            };
          });
        }
      }
    } catch {
      // Ignorer et passer à WooCommerce
    }

    // =========================================================================
    // 2. DÉTECTION & EXTRACTION WOOCOMMERCE
    // =========================================================================
    if (extractedProducts.length === 0) {
      try {
        // Tenter WooCommerce Store API v1 (Standard sur tous les sites WooCommerce modernes)
        const wooEndpoint = `${domain}/wp-json/wc/store/v1/products?per_page=50`;
        const wooRes = await fetch(wooEndpoint, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(7000),
        });

        if (wooRes.ok) {
          const wooJson = await wooRes.json();
          if (Array.isArray(wooJson) && wooJson.length > 0) {
            detectedPlatform = 'woocommerce';
            extractedProducts = wooJson.map((p: any) => {
              const img = p.images?.[0]?.src || '/images/bottle_nutrex.png';
              let price = 49;
              if (p.prices?.price) {
                const minorUnits = p.prices?.currency_minor_unit ?? 2;
                price = Number(p.prices.price) / Math.pow(10, minorUnits);
              } else if (p.price) {
                price = parseFloat(p.price) || 49;
              }

              const catName = p.categories?.[0]?.name || '';
              const category = classifyCategory(p.name, catName);
              const cleanDesc = cleanHtml(p.short_description || p.description);
              const darijaHook = generateDarijaHook(p.name, category);

              return {
                name: cleanHtml(p.name) || 'Produit WooCommerce',
                brand: session?.workspace?.name || parsedUrl.hostname,
                category,
                priceTND: Math.round(price) || 49,
                originalImageUrl: img,
                cutoutImageUrl: img,
                descriptionFr: cleanDesc || `Produit officiel ${p.name}`,
                descriptionDarija: darijaHook,
                badgeId: 'livraison',
                sourceUrl: p.permalink || rawUrl,
                platform: 'woocommerce',
              };
            });
          }
        }
      } catch {
        // Ignorer et passer à Converty / BigCommerce / HTML
      }
    }

    // =========================================================================
    // 3. DÉTECTION CONVERTY, BIGCOMMERCE & SITES WEB GÉNÉRAUX VIA HTML / SCHEMA.ORG
    // =========================================================================
    if (extractedProducts.length === 0) {
      try {
        const pageRes = await fetch(rawUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml',
          },
          signal: AbortSignal.timeout(9000),
        });

        if (pageRes.ok) {
          const html = await pageRes.text();

          // A. Détecter si la plateforme est Converty (converty.shop ou scripts internes Converty)
          const isConverty =
            parsedUrl.hostname.includes('converty.shop') ||
            html.includes('converty.shop') ||
            html.includes('converty') ||
            html.includes('window.__CONVERTY__');

          // B. Détecter si la plateforme est BigCommerce
          const isBigCommerce =
            html.includes('cdn11.bigcommerce.com') ||
            html.includes('bigcommerce') ||
            html.includes('bc-sf-');

          if (isConverty) detectedPlatform = 'converty';
          else if (isBigCommerce) detectedPlatform = 'bigcommerce';

          // C. Tenter l'extraction de données JSON intégrées (Converty / Next / Nuxt / Storefront State)
          let parsedStateProducts: any[] = [];

          // 1. Chercher __NEXT_DATA__ ou __NUXT__ souvent utilisé par Converty
          const nextDataMatch = html.match(/<script[^>]*id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i);
          if (nextDataMatch) {
            try {
              const nextJson = JSON.parse(nextDataMatch[1]);
              const pageProps = nextJson?.props?.pageProps;
              const found = pageProps?.products || pageProps?.product || pageProps?.initialState?.products;
              if (Array.isArray(found)) {
                parsedStateProducts = found;
              } else if (found && typeof found === 'object' && found.title) {
                parsedStateProducts = [found];
              }
            } catch {}
          }

          if (parsedStateProducts.length > 0) {
            extractedProducts = parsedStateProducts.map((p: any) => {
              const title = p.title || p.name || 'Produit Converty';
              const img = p.image || p.images?.[0] || p.thumbnail || '/images/bottle_nutrex.png';
              const price = parseFloat(p.price || p.regular_price || p.sale_price || '49') || 49;
              const category = classifyCategory(title, p.category);
              return {
                name: title,
                brand: p.brand || session?.workspace?.name || parsedUrl.hostname,
                category,
                priceTND: Math.round(price),
                originalImageUrl: resolveUrl(img, domain),
                cutoutImageUrl: resolveUrl(img, domain),
                descriptionFr: cleanHtml(p.description) || `Produit officiel ${title}`,
                descriptionDarija: generateDarijaHook(title, category),
                badgeId: 'livraison',
                sourceUrl: rawUrl,
                platform: isConverty ? 'converty' : detectedPlatform,
              };
            });
          }

          // D. Tenter l'extraction Schema.org JSON-LD (Universel : BigCommerce, WooCommerce, Converty, PrestaShop, etc.)
          if (extractedProducts.length === 0) {
            const jsonLdBlocks = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
            if (jsonLdBlocks) {
              for (const block of jsonLdBlocks) {
                try {
                  const content = block.replace(/<script[^>]*>|<\/script>/gi, '').trim();
                  const data = JSON.parse(content);
                  const items = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data];

                  for (const item of items) {
                    if (item['@type'] === 'Product') {
                      const title = item.name;
                      let img = item.image;
                      if (Array.isArray(img)) img = img[0];
                      if (typeof img === 'object' && img?.url) img = img.url;

                      let price = 49;
                      const offers = item.offers;
                      if (offers) {
                        const offerObj = Array.isArray(offers) ? offers[0] : offers;
                        price = parseFloat(String(offerObj.price || offerObj.lowPrice || '49').replace(',', '.')) || 49;
                      }

                      if (title && img) {
                        const category = classifyCategory(title, item.category);
                        extractedProducts.push({
                          name: cleanHtml(title),
                          brand: item.brand?.name || session?.workspace?.name || parsedUrl.hostname,
                          category,
                          priceTND: Math.round(price),
                          originalImageUrl: resolveUrl(img, domain),
                          cutoutImageUrl: resolveUrl(img, domain),
                          descriptionFr: cleanHtml(item.description) || `Produit ${title}`,
                          descriptionDarija: generateDarijaHook(title, category),
                          badgeId: 'livraison',
                          sourceUrl: item.url ? resolveUrl(item.url, domain) : rawUrl,
                          platform: detectedPlatform,
                        });
                      }
                    } else if (item['@type'] === 'ItemList' && Array.isArray(item.itemListElement)) {
                      // Multi-produits dans une liste Schema.org
                      for (const el of item.itemListElement) {
                        const pItem = el.item || el;
                        if (pItem.name) {
                          let pImg = pItem.image;
                          if (Array.isArray(pImg)) pImg = pImg[0];
                          if (typeof pImg === 'object' && pImg?.url) pImg = pImg.url;
                          const pPrice = parseFloat(String(pItem.offers?.price || '49').replace(',', '.')) || 49;
                          const cat = classifyCategory(pItem.name);
                          extractedProducts.push({
                            name: cleanHtml(pItem.name),
                            brand: session?.workspace?.name || parsedUrl.hostname,
                            category: cat,
                            priceTND: Math.round(pPrice),
                            originalImageUrl: resolveUrl(pImg || '/images/bottle_nutrex.png', domain),
                            cutoutImageUrl: resolveUrl(pImg || '/images/bottle_nutrex.png', domain),
                            descriptionFr: cleanHtml(pItem.description) || `Produit officiel ${pItem.name}`,
                            descriptionDarija: generateDarijaHook(pItem.name, cat),
                            badgeId: 'livraison',
                            sourceUrl: pItem.url ? resolveUrl(pItem.url, domain) : rawUrl,
                            platform: detectedPlatform,
                          });
                        }
                      }
                    }
                  }
                } catch {}
              }
            }
          }

          // E. Tenter l'extraction OpenGraph & Meta Tags E-commerce (100% Déterministe)
          if (extractedProducts.length === 0) {
            const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
              html.match(/<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
              html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

            const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
              html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)?.[1];

            const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
              html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1];

            const ogPrice = html.match(/<meta[^>]*property=["']product:price:amount["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
              html.match(/<meta[^>]*property=["']og:price:amount["'][^>]*content=["']([^"']+)["']/i)?.[1] ||
              html.match(/class=["'][^"']*price[^"']*["'][^>]*>[\s\S]*?(\d+[\.,]?\d*)[\s\S]*?(?:DT|TND|dt|tnd|Dinars|\$|€)/i)?.[1] ||
              html.match(/(\d+[\.,]?\d*)\s*(?:DT|TND|dt|tnd|Dinars)/i)?.[1];

            if (ogTitle && ogImg) {
              const cleanTitle = cleanHtml(ogTitle).replace(/[-|].*$/, '').trim();
              const price = ogPrice ? parseFloat(ogPrice.replace(',', '.')) : 49;
              const category = classifyCategory(cleanTitle);

              extractedProducts.push({
                name: cleanTitle || 'Produit E-commerce',
                brand: session?.workspace?.name || parsedUrl.hostname.replace('www.', ''),
                category,
                priceTND: Math.round(price) || 49,
                originalImageUrl: resolveUrl(ogImg, domain),
                cutoutImageUrl: resolveUrl(ogImg, domain),
                descriptionFr: cleanHtml(ogDesc) || `Produit officiel ${cleanTitle}`,
                descriptionDarija: generateDarijaHook(cleanTitle, category),
                badgeId: 'livraison',
                sourceUrl: rawUrl,
                platform: detectedPlatform,
              });
            }
          }
        }
      } catch {
        // Ignorer timeout
      }
    }

    // =========================================================================
    // 4. VÉRIFICATION DU RÉSULTAT
    // =========================================================================
    if (extractedProducts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Aucun produit n'a pu être extrait automatiquement. Vérifiez que l'URL est accessible publiquement ou ajoutez le produit manuellement.",
        },
        { status: 404 }
      );
    }

    // Dédupliquer les produits par nom
    const uniqueProducts: ExtractedProduct[] = [];
    const seenNames = new Set<string>();
    for (const p of extractedProducts) {
      const key = p.name.toLowerCase().trim();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        uniqueProducts.push(p);
      }
    }

    // Sauvegarder directement dans le catalogue si demandé
    const savedProducts: any[] = [];
    if (saveDirectly) {
      for (const prod of uniqueProducts) {
        try {
          const res = await createProductAction({
            name: prod.name,
            category: prod.category || 'general',
            priceTND: prod.priceTND,
            originalImageUrl: prod.originalImageUrl,
            cutoutImageUrl: prod.cutoutImageUrl || prod.originalImageUrl,
            descriptionFr: prod.descriptionFr,
            descriptionDarija: prod.descriptionDarija,
            badgeLabel: prod.badgeId || 'livraison',
          });
          if (res.success && res.data) {
            savedProducts.push(res.data);
          }
        } catch {}
      }
    }

    const platformLabels: Record<string, string> = {
      shopify: 'Shopify',
      woocommerce: 'WooCommerce',
      converty: 'Converty',
      bigcommerce: 'BigCommerce',
      website: 'Site Web E-commerce',
    };

    return NextResponse.json({
      success: true,
      platform: detectedPlatform,
      platformLabel: platformLabels[detectedPlatform] || 'E-commerce',
      count: uniqueProducts.length,
      products: uniqueProducts,
      savedProducts: saveDirectly ? savedProducts : undefined,
      message: `✓ ${uniqueProducts.length} produit(s) extrait(s) avec succès depuis ${platformLabels[detectedPlatform]} (100% déterministe, sans IA).`,
    });
  } catch (err: any) {
    console.error('Erreur import produits:', err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur interne lors de l'importation." },
      { status: 500 }
    );
  }
}

// Nettoyer les balises HTML et entités
function cleanHtml(input?: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 220);
}

// Résoudre une URL relative vers absolue
function resolveUrl(url: string, domain: string): string {
  if (!url) return '/images/bottle_nutrex.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return 'https:' + url;
  if (url.startsWith('/')) return `${domain}${url}`;
  return `${domain}/${url}`;
}

// Classification déterministe par mots-clés
function classifyCategory(title: string, subHint?: string): string {
  const text = `${title} ${subHint || ''}`.toLowerCase();
  if (
    text.includes('cosm') ||
    text.includes('beaut') ||
    text.includes('crème') ||
    text.includes('creme') ||
    text.includes('soin') ||
    text.includes('serum') ||
    text.includes('sérum') ||
    text.includes('parfum') ||
    text.includes('visage') ||
    text.includes('peau') ||
    text.includes('savon') ||
    text.includes('huile') ||
    text.includes('masque')
  ) {
    return 'cosmetics';
  }

  if (
    text.includes('prot') ||
    text.includes('nutri') ||
    text.includes('creatine') ||
    text.includes('créatine') ||
    text.includes('whey') ||
    text.includes('fitness') ||
    text.includes('sport') ||
    text.includes('shaker') ||
    text.includes('bcaa') ||
    text.includes('omega') ||
    text.includes('vitamine')
  ) {
    return 'nutrition';
  }

  if (
    text.includes('vetement') ||
    text.includes('vêtement') ||
    text.includes('mode') ||
    text.includes('tshirt') ||
    text.includes('t-shirt') ||
    text.includes('chemise') ||
    text.includes('robe') ||
    text.includes('pantalon') ||
    text.includes('jeans') ||
    text.includes('chaussure') ||
    text.includes('sneakers') ||
    text.includes('veste') ||
    text.includes('pull')
  ) {
    return 'fashion';
  }

  if (
    text.includes('bijou') ||
    text.includes('collier') ||
    text.includes('bague') ||
    text.includes('bracelet') ||
    text.includes('montre') ||
    text.includes('boucle') ||
    text.includes('argent') ||
    text.includes('or')
  ) {
    return 'jewelry';
  }

  return 'general';
}

// Générateur déterministe d'accroches commerciales tunisiennes en Darija
function generateDarijaHook(title: string, category: string): string {
  const cleanTitle = cleanHtml(title).slice(0, 35);
  switch (category) {
    case 'cosmetics':
      return `Aqwé soin naturel fi tounes : ${cleanTitle} ! Eclat w hydratation garantis, livraison 24-48h.`;
    case 'nutrition':
      return `Original 100% b a7sen soum fi tounes : ${cleanTitle} ! El khlass waqt el livri l beb eddar.`;
    case 'fashion':
      return `Nouvel arrivage tendance : ${cleanTitle} ! Stock très limité, abathna message WhatsApp.`;
    case 'jewelry':
      return `Design luxe w élégant pour vos occasions : ${cleanTitle} ! Commande en ligne fisaa.`;
    default:
      return `Weslet el commande fi boutique mteena : ${cleanTitle} ! Stock limité w livraison sur 24 gouvernorats.`;
  }
}
