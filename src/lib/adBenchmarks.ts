export interface AdBenchmarkStyle {
  id: string;
  name: string;
  hotRate: string;
  referenceCampaign: string;
  description: string;
  thumbnail: string;
  promptModifier: string;
  bgGradient: string;
  intentId: 'prestige_elevation' | 'conversion_flash' | 'lifestyle_authentic';
}

const BENCHMARKS_BY_CATEGORY: Record<string, AdBenchmarkStyle[]> = {
  // 1. HORLOGERIE & MONTRES DE LUXE (Watches)
  watches: [
    {
      id: 'luxury_watch',
      name: 'Écrin Horloger & Titane Brossé',
      hotRate: '🔥 5.4% CTR (Top Conversion)',
      referenceCampaign: 'Campagne Prestige Horlogère • Vente Directe',
      description: 'Éclairage macro haute précision sur socle titane sombre, reflets spéculaires champagne mettant en valeur le cadran.',
      thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'luxury high-end commercial watch photography staging set on a dark titanium brushed pedestal with dramatic macro rim lighting, completely vacant pristine central surface cleanly awaiting an object',
      bgGradient: 'linear-gradient(135deg, #0B0E14, #1E293B)',
      intentId: 'prestige_elevation',
    },
    {
      id: 'minimal_watch',
      name: 'Pureté & Studio Blanc Horloger',
      hotRate: '⭐ Best-Seller Catalog',
      referenceCampaign: 'Catalogue Horlogerie Suisse',
      description: 'Lumière zénithale ultra-douce sur marbre blanc texturé, composition épurée pour faire ressortir l\'acier et le verre.',
      thumbnail: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'pure clean minimalist watch studio pedestal with soft diffused lighting, white textured architectural stone, pristine vacant surface cleanly awaiting an object',
      bgGradient: 'linear-gradient(135deg, #F8FAFC, #E2E8F0)',
      intentId: 'prestige_elevation',
    },
    {
      id: 'dramatic_watch',
      name: 'Contraste Sombre & Rayons Néon',
      hotRate: '🚀 ROAS 4.8x (Meta Ads)',
      referenceCampaign: 'Publicité Story & Reels Virale',
      description: 'Fond sombre profond et liseré de lumière cyan/violet électrique pour stopper le scroll sur Instagram.',
      thumbnail: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'high-contrast dramatic commercial studio staging with deep violet and electric blue rim lights, dark reflective plinth, vacant podium awaiting an object',
      bgGradient: 'linear-gradient(135deg, #0F172A, #6366F1)',
      intentId: 'conversion_flash',
    },
    {
      id: 'lifestyle_watch',
      name: 'Bureau Exécutif & Verre Fumé',
      hotRate: '💼 High-Ticket Buyer',
      referenceCampaign: 'Campagne Cadres & Dirigeants',
      description: 'Ambiance bureau moderne de direction avec cuir, bois noble et lumière du jour tamisée en arrière-plan.',
      thumbnail: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'authentic executive office setting with warm natural light, textured dark oak desk in foreground, blurred modern luxury interior, clean empty surface awaiting an object',
      bgGradient: 'linear-gradient(135deg, #FED7AA, #FDBA74)',
      intentId: 'lifestyle_authentic',
    },
    {
      id: 'terroir_watch',
      name: 'Sidi Bou Saïd & Solaire Méditerranéen',
      hotRate: '🇹🇳 100% Spécial Tunisie',
      referenceCampaign: 'Ambiance Terrasses Célèbres & Mer',
      description: 'Terrasse ensoleillée de Sidi Bou Saïd, balustrade en pierre calcaire dorée et mer turquoise en flou artistique.',
      thumbnail: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'Sidi Bou Said Mediterranean terrace, sunlit warm limestone balustrade, soft morning coastal light, clean empty surface awaiting an object',
      bgGradient: 'linear-gradient(135deg, #0284C7, #F43F5E)',
      intentId: 'lifestyle_authentic',
    },
    {
      id: 'promo_watch',
      name: 'Offre Flash & Vente Immédiate',
      hotRate: '⚡ Promo Flash 24h',
      referenceCampaign: 'Campagne Soldes & DM Express',
      description: 'Podium moderne dynamique à fort contraste pour accélérer la commande par message WhatsApp ou Instagram.',
      thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'vibrant high-energy commercial advertising podium with sharp glossy accents and dynamic lighting, clean surface awaiting an object',
      bgGradient: 'linear-gradient(135deg, #E11D48, #FF5722)',
      intentId: 'conversion_flash',
    },
  ],

  // 2. PARFUMERIE & COSMÉTIQUE (Perfume & Cosmetics)
  perfume: [
    {
      id: 'luxury_perfume',
      name: 'Haute Parfumerie & Marbre Noir',
      hotRate: '🔥 5.1% CTR (Top Luxe)',
      referenceCampaign: 'Campagne Parfumerie Prestige',
      description: 'Socle en marbre noir précieux, brume délicate et éclairage champagne doré mettant en valeur le verre du flacon.',
      thumbnail: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'luxury high-end commercial perfume staging on polished black marble with subtle gold ambient light, clean vacant pedestal awaiting an object',
      bgGradient: 'linear-gradient(135deg, #1E1B4B, #0F172A)',
      intentId: 'prestige_elevation',
    },
    {
      id: 'minimal_perfume',
      name: 'Épure Botanique & Marbre Blanc',
      hotRate: '⭐ Best-Seller Beauté',
      referenceCampaign: 'Cosmétique Bio & Soin Naturel',
      description: 'Ambiance immaculée avec ombre végétale délicate et pierre blanche naturelle au soleil matinal.',
      thumbnail: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'pure clean botanical cosmetic studio staging, white Carrara marble plinth, soft natural daylight with subtle plant shadow, clean empty surface',
      bgGradient: 'linear-gradient(135deg, #F8FAFC, #E2E8F0)',
      intentId: 'prestige_elevation',
    },
    {
      id: 'dramatic_perfume',
      name: 'Nuit Intense & Sillage Mystérieux',
      hotRate: '🚀 Top Ventes Soir',
      referenceCampaign: 'Sillage Envoûtant & Séduction',
      description: 'Lumière rasante dramatique et reflets ambrés créant un désir puissant et immédiat.',
      thumbnail: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'dramatic low-key commercial studio lighting with warm amber specular glow and deep charcoal background, vacant pedestal awaiting an object',
      bgGradient: 'linear-gradient(135deg, #451A03, #18181B)',
      intentId: 'conversion_flash',
    },
    {
      id: 'lifestyle_perfume',
      name: 'Lumière Douce & Vanity Chic',
      hotRate: '✨ Viral TikTok & Reels',
      referenceCampaign: 'Routine Beauté & Quotidien',
      description: 'Mise en scène chaleureuse sur coiffeuse lumineuse avec miroir flou et lumière dorée.',
      thumbnail: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'warm authentic vanity table setting with soft morning sunlight, blurred elegant bedroom interior in background, clean empty surface',
      bgGradient: 'linear-gradient(135deg, #FDF2F8, #FCE7F3)',
      intentId: 'lifestyle_authentic',
    },
    {
      id: 'terroir_perfume',
      name: 'Sidi Bou Saïd & Jasmin Tunisien',
      hotRate: '🇹🇳 N°1 Ventes Tunisie',
      referenceCampaign: 'Essence Locale & Fleur d\'Oranger',
      description: 'Terrasse tunisienne au soleil avec pierre de taille et fleurs de bougainvillier.',
      thumbnail: 'https://images.unsplash.com/photo-1608248597359-561352119c36?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'Sidi Bou Said Mediterranean coastal terrace with pink bougainvillea, warm limestone balustrade, clean empty surface awaiting an object',
      bgGradient: 'linear-gradient(135deg, #0284C7, #F43F5E)',
      intentId: 'lifestyle_authentic',
    },
    {
      id: 'promo_perfume',
      name: 'Offre Flash & Coffret Découverte',
      hotRate: '⚡ Déstockage Rapide',
      referenceCampaign: 'Promo Flash -10% & Livraison Gratuite',
      description: 'Podium vibrant attractif conçu pour susciter la décision d\'achat immédiate à la livraison.',
      thumbnail: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'vibrant commercial advertising podium with polished acrylic surface and dynamic contrast lighting, clean surface awaiting an object',
      bgGradient: 'linear-gradient(135deg, #E11D48, #FF5722)',
      intentId: 'conversion_flash',
    },
  ],

  // 3. NUTRITION SPORTIVE & FITNESS (Fitness & Nutrition)
  nutrition: [
    {
      id: 'power_nutrition',
      name: 'Arène CrossFit & Puissance Brute',
      hotRate: '🔥 4.9% CTR (Gym Target)',
      referenceCampaign: 'Campagne Force & Muscle Sec',
      description: 'Sol de salle de musculation texturé, éclairage néon cyan puissant et contraste percutant.',
      thumbnail: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'commercial athletic sports nutrition staging on textured dark steel floor with electric cyan rim lights, empty vacant pedestal awaiting an object',
      bgGradient: 'linear-gradient(135deg, #00E5FF, #0F172A)',
      intentId: 'conversion_flash',
    },
    {
      id: 'minimal_nutrition',
      name: 'Pureté Isolate & Qualité Laboratoire',
      hotRate: '⭐ 100% Qualité Certifiée',
      referenceCampaign: 'Nutrition Propre & Zéro Sucre',
      description: 'Podium épuré blanc et acier avec éclairage studio clinique mettant en valeur la pureté du produit.',
      thumbnail: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'clean minimalist laboratory-grade supplement staging with pristine white surface and soft natural daylight, empty surface',
      bgGradient: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)',
      intentId: 'prestige_elevation',
    },
    {
      id: 'dramatic_nutrition',
      name: 'Studio Athlétique & Contraste Sombre',
      hotRate: '🚀 ROAS 4.3x (Meta Ads)',
      referenceCampaign: 'Campagne Stock Limité & Import',
      description: 'Fond anthracite profond et halo lumineux d\'impact pour booster les commandes en message.',
      thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'high contrast dramatic gym studio background with dark titanium podium and sharp directional rim lighting, empty vacant surface',
      bgGradient: 'linear-gradient(135deg, #1E1B4B, #0F172A)',
      intentId: 'conversion_flash',
    },
    {
      id: 'lifestyle_nutrition',
      name: 'Cuisine Athlète & Shaker Matinal',
      hotRate: '💪 Routine Musculation',
      referenceCampaign: 'Préparation & Récupération',
      description: 'Plan de travail moderne en bois clair baigné de soleil matinal pour ancrer le produit dans le rituel quotidien.',
      thumbnail: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'authentic modern kitchen breakfast bar setting with warm morning sunlight, blurred fitness lifestyle background, clean empty surface',
      bgGradient: 'linear-gradient(135deg, #FED7AA, #FDBA74)',
      intentId: 'lifestyle_authentic',
    },
    {
      id: 'terroir_nutrition',
      name: 'Outdoor Fitness & Solaire Tunisien',
      hotRate: '🇹🇳 Workout Tunisie',
      referenceCampaign: 'Outdoor Training Sidi Bou Saïd / La Marsa',
      description: 'Ambiance entraînement en plein air avec ciel bleu et lumière naturelle tonique.',
      thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'sunny outdoor Mediterranean training terrace with coastal morning light, natural stone surface awaiting an object',
      bgGradient: 'linear-gradient(135deg, #0284C7, #10B981)',
      intentId: 'lifestyle_authentic',
    },
    {
      id: 'promo_nutrition',
      name: 'Pack Promo & Derniers Pots Disponibles',
      hotRate: '⚡ Urgence Stock Flash',
      referenceCampaign: 'Offre Spéciale Semaine',
      description: 'Podium vibrant avec accents rouge et or orienté passage à l\'action immédiat.',
      thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'energetic commercial product podium with dynamic lighting and vibrant advertising backdrop, clean surface awaiting an object',
      bgGradient: 'linear-gradient(135deg, #E11D48, #FF5722)',
      intentId: 'conversion_flash',
    },
  ],

  // 4. SNEAKERS & STREETWEAR (Fashion & Shoes)
  sneakers: [
    {
      id: 'luxury_sneakers',
      name: 'Édition Collector & Studio Haute-Couture',
      hotRate: '🔥 5.3% CTR (Sneakers Drop)',
      referenceCampaign: 'Lancement Exclusif & Édition Limitée',
      description: 'Mise en scène stylée sur cube architectural avec éclairage sophistiqué mettant en valeur la silhouette.',
      thumbnail: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'high-end commercial sneaker photography staging on architectural concrete block with sophisticated studio lighting, vacant surface',
      bgGradient: 'linear-gradient(135deg, #18181B, #27272A)',
      intentId: 'prestige_elevation',
    },
    {
      id: 'minimal_sneakers',
      name: 'Pureté & Minimalisme Catalogue',
      hotRate: '⭐ N°1 Clarté Produit',
      referenceCampaign: 'Packshot Lookbook E-commerce',
      description: 'Fond gris perle doux et lumière naturelle sans ombres dures pour apprécier les couleurs exactes.',
      thumbnail: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'pure clean minimalist footwear studio pedestal with soft daylight illumination, clean light grey background, empty surface',
      bgGradient: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)',
      intentId: 'prestige_elevation',
    },
    {
      id: 'dramatic_sneakers',
      name: 'Streetwear & Contraste Électrique',
      hotRate: '🚀 Viral Instagram Stories',
      referenceCampaign: 'Culture Urbaine & Hype',
      description: 'Ambiance rue nocturne avec reflets néon contrastés pour faire vibrer la marque.',
      thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'high contrast dramatic urban streetwear studio staging with bold neon rim lighting, dark reflective platform, empty vacant surface',
      bgGradient: 'linear-gradient(135deg, #EF4444, #18181B)',
      intentId: 'conversion_flash',
    },
    {
      id: 'lifestyle_sneakers',
      name: 'Asphalte Urbain & Street Culture',
      hotRate: '👟 Tendance TikTok',
      referenceCampaign: 'Porté au Quotidien & Style',
      description: 'Texture de rue ensoleillée avec ombre douce pour un rendu authentique et désirable.',
      thumbnail: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'authentic urban street pavement setting with warm golden hour sunlight, clean empty surface awaiting an object',
      bgGradient: 'linear-gradient(135deg, #FED7AA, #FDBA74)',
      intentId: 'lifestyle_authentic',
    },
    {
      id: 'terroir_sneakers',
      name: 'Style Tunis & Méditerranée',
      hotRate: '🇹🇳 Streetwear Local',
      referenceCampaign: 'Look Tunis / Marsa / Sousse',
      description: 'Architecture côtière tunisienne blanche et bleue baignée de soleil.',
      thumbnail: 'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'sunlit Mediterranean coastal architectural terrace, white limestone textured steps, clean surface awaiting an object',
      bgGradient: 'linear-gradient(135deg, #0284C7, #F43F5E)',
      intentId: 'lifestyle_authentic',
    },
    {
      id: 'promo_sneakers',
      name: 'Soldes Express & Drop Limité',
      hotRate: '⚡ Soldes Choc',
      referenceCampaign: 'Campagne Stock Restreint',
      description: 'Podium rouge et noir à fort impact pour inciter à l\'achat rapide avant rupture de pointure.',
      thumbnail: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'vibrant high-energy retail launch podium with dynamic lighting accents, clean surface awaiting an object',
      bgGradient: 'linear-gradient(135deg, #E11D48, #FF5722)',
      intentId: 'conversion_flash',
    },
  ],

  // 5. GÉNÉRAL & AUTRES PRODUITS E-COMMERCE
  general: [
    {
      id: 'luxury_general',
      name: 'Écrin Studio Prestige & Marbre',
      hotRate: '🔥 4.8% CTR (Prestige)',
      referenceCampaign: 'Campagne Haut de Gamme',
      description: 'Socle en marbre blanc poli, lumière zénithale douce et ambiance architecturale valorisante.',
      thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'luxury high-end commercial product staging on polished Carrara marble with soft golden hour lighting, clean vacant pedestal awaiting an object',
      bgGradient: 'linear-gradient(135deg, #0B0E14, #1E293B)',
      intentId: 'prestige_elevation',
    },
    {
      id: 'minimal_general',
      name: 'Minimaliste & Packshot Épuré',
      hotRate: '⭐ Best-Seller Catalogue',
      referenceCampaign: 'Catalogue Pro Sans Artifice',
      description: 'Podium neutre clair et lumière douce de studio pour une lisibilité commerciale absolue.',
      thumbnail: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'pure clean minimalist studio pedestal with soft diffused lighting, pristine vacant surface cleanly awaiting an object',
      bgGradient: 'linear-gradient(135deg, #F8FAFC, #E2E8F0)',
      intentId: 'prestige_elevation',
    },
    {
      id: 'dramatic_general',
      name: 'Impact Sombre & Contraste Fort',
      hotRate: '🚀 ROAS Élevé (Meta Ads)',
      referenceCampaign: 'Stop le Scroll sur Instagram',
      description: 'Lumière rasante contrastée et fond sombre pour faire ressortir les contours du produit.',
      thumbnail: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'high-contrast dramatic commercial studio staging with deep atmospheric tones and rim lighting, vacant podium awaiting an object',
      bgGradient: 'linear-gradient(135deg, #0F172A, #6366F1)',
      intentId: 'conversion_flash',
    },
    {
      id: 'lifestyle_general',
      name: 'Mise en Situation Réelle & Chaleur',
      hotRate: '💼 Confiance & Usage Réel',
      referenceCampaign: 'Adoption Naturelle au Quotidien',
      description: 'Environnement de vie authentique baigné de soleil matinal pour rassurer le client.',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'authentic lifestyle setting with warm natural light and textured surface in foreground, clean empty surface awaiting an object',
      bgGradient: 'linear-gradient(135deg, #FED7AA, #FDBA74)',
      intentId: 'lifestyle_authentic',
    },
    {
      id: 'terroir_general',
      name: 'Sidi Bou Saïd & Méditerranée',
      hotRate: '🇹🇳 Ambiance Authentique',
      referenceCampaign: 'Réassurance Locale & Confiance',
      description: 'Lumière côtière dorée, balustrade en pierre naturelle et vue sur la mer.',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'Sidi Bou Said Mediterranean terrace, sunlit warm limestone balustrade, soft morning coastal light, clean empty surface awaiting an object',
      bgGradient: 'linear-gradient(135deg, #0284C7, #F43F5E)',
      intentId: 'lifestyle_authentic',
    },
    {
      id: 'promo_general',
      name: 'Offre Flash & Vente Rapide',
      hotRate: '⚡ Promo Flash 24h',
      referenceCampaign: 'Paiement à la Livraison Garanti',
      description: 'Podium dynamique rouge et noir conçu pour déclencher la commande immédiate.',
      thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      promptModifier: 'vibrant high-energy commercial advertising podium with sharp glossy accents and dynamic lighting, clean surface awaiting an object',
      bgGradient: 'linear-gradient(135deg, #E11D48, #FF5722)',
      intentId: 'conversion_flash',
    },
  ],
};

/**
 * Retourne les 6 affiches de référence à fort taux de conversion adaptées à la catégorie détectée du produit.
 */
export function getAdBenchmarksForProduct(category: string = '', productName: string = ''): AdBenchmarkStyle[] {
  const combined = `${category} ${productName}`.toLowerCase();

  if (combined.includes('montre') || combined.includes('watch') || combined.includes('rolex') || combined.includes('horlog') || combined.includes('bijou') || combined.includes('bracelet')) {
    return BENCHMARKS_BY_CATEGORY.watches;
  }

  if (combined.includes('parfum') || combined.includes('perfume') || combined.includes('cosmet') || combined.includes('soin') || combined.includes('serum') || combined.includes('rose') || combined.includes('creme') || combined.includes('beaute')) {
    return BENCHMARKS_BY_CATEGORY.perfume;
  }

  if (combined.includes('whey') || combined.includes('proteine') || combined.includes('protein') || combined.includes('creatine') || combined.includes('fitness') || combined.includes('muscu') || combined.includes('bcaa') || combined.includes('nutrition') || combined.includes('gainer') || combined.includes('sport')) {
    return BENCHMARKS_BY_CATEGORY.nutrition;
  }

  if (combined.includes('sneaker') || combined.includes('chaussure') || combined.includes('shoe') || combined.includes('mode') || combined.includes('vetement') || combined.includes('hoodie') || combined.includes('tshirt') || combined.includes('streetwear')) {
    return BENCHMARKS_BY_CATEGORY.sneakers;
  }

  return BENCHMARKS_BY_CATEGORY.general;
}
