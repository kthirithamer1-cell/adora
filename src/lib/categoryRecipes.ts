/**
 * MOTEUR DE RECETTES DE SCÈNES PAR CATÉGORIE MÉTIER (MarkMosaiq-46)
 * 
 * Remplace les templates figés par des recettes génératives expertes adaptées
 * aux 6 secteurs phares de l'e-commerce en Tunisie :
 * 1. Beauté, Cosmétiques & Parfums
 * 2. Mode, Sneakers & Maroquinerie
 * 3. Alimentation & Produits du Terroir (Food)
 * 4. Bijouterie & Horlogerie de Luxe
 * 5. High-Tech & Gadgets Électroniques
 * 6. Maison, Déco & Artisanat
 */

import { BrandKit, compileBrandPrompt } from './brandkit';

export type EcommerceCategory =
  | 'cosmetics'
  | 'fashion'
  | 'food'
  | 'jewelry'
  | 'tech'
  | 'home'
  | 'nutrition';

export interface SceneRecipe {
  id: string;
  category: EcommerceCategory;
  name: string;
  frenchDescription: string;
  surfaceMaterial: string;
  lightingScheme: string;
  propsAndAtmosphere: string;
  basePositivePrompt: string;
  aspect: '1:1' | '9:16' | '1.91:1';
}

export const CATEGORY_SCENE_RECIPES: Record<EcommerceCategory, SceneRecipe[]> = {
  cosmetics: [
    {
      id: 'cosm_travertine_sunrise',
      category: 'cosmetics',
      name: 'Travertin & Brise Matinale',
      frenchDescription: 'Pierre calcaire naturelle, lumière dorée d\'aurore et rosée subtile.',
      surfaceMaterial: 'smooth natural ivory travertine stone pedestal',
      lightingScheme: 'warm golden hour morning sunlight with soft organic diffusion',
      propsAndAtmosphere: 'soft blurred botanical eucalyptus stem in deep background, crystal clear tiny water dew micro droplets on edges',
      basePositivePrompt: 'Commercial beauty product staging. Empty natural ivory travertine stone pedestal, warm golden morning sunlight, crystal clear subtle water droplets on perimeter, soft blurred botanical leaves in background. Pristine clean vacant top.',
      aspect: '1:1',
    },
    {
      id: 'cosm_marble_luxury',
      category: 'cosmetics',
      name: 'Marbre Blanc & Verre d\'Eau',
      frenchDescription: 'Élégance pure pour sérums, crèmes et parfums prestige.',
      surfaceMaterial: 'flawless polished Carrara white marble slab',
      lightingScheme: 'soft high-key beauty dish overhead lighting with gentle pastel reflections',
      propsAndAtmosphere: 'clean seamless minimalist cosmetic studio gradient',
      basePositivePrompt: 'Commercial luxury skincare packshot. Empty polished Carrara white marble pedestal, high-key diffuse studio lighting, subtle soft ripples of clear water reflection on table surface. Completely vacant top surface.',
      aspect: '1:1',
    },
  ],
  fashion: [
    {
      id: 'fash_velvet_pedestal',
      category: 'fashion',
      name: 'Velours Noble & Studio Moderne',
      frenchDescription: 'Présentation haute couture pour maroquinerie et souliers.',
      surfaceMaterial: 'matte dark charcoal architectural pedestal with brushed brass trim',
      lightingScheme: 'dual directional fashion rim lights with rich deep falloff',
      propsAndAtmosphere: 'soft silk drapery folds blurred in background, editorial mood',
      basePositivePrompt: 'Commercial luxury fashion staging. Empty dark architectural pedestal with subtle brushed brass trim, editorial studio lighting, soft blurred draped raw silk background. Clean vacant top surface.',
      aspect: '1:1',
    },
    {
      id: 'fash_street_lifestyle',
      category: 'fashion',
      name: 'Urbain Chic & Pavés Lumineux',
      frenchDescription: 'Idéal pour sneakers, lunettes de soleil et streetwear.',
      surfaceMaterial: 'polished light concrete display block',
      lightingScheme: 'bright natural daylight with architectural shadow cutouts',
      propsAndAtmosphere: 'blurred modern Mediterranean avenue backdrop with warm ambiance',
      basePositivePrompt: 'Commercial streetwear lifestyle staging. Empty polished light concrete block, crisp natural afternoon sunlight, softly blurred modern urban avenue backdrop. Spotless vacant top.',
      aspect: '9:16',
    },
  ],
  food: [
    {
      id: 'food_olive_wood',
      category: 'food',
      name: 'Bois d\'Olivier & Terroir Tunisien',
      frenchDescription: 'Parfait pour l\'huile d\'olive, miel pur, épices et pâtisseries.',
      surfaceMaterial: 'rustic authentic Tunisian olive wood cutting slab with natural grain',
      lightingScheme: 'warm cozy bistro lighting with directional window glow',
      propsAndAtmosphere: 'subtle fresh rosemary sprig and coarse sea salt grains on far corner, terracotta texture',
      basePositivePrompt: 'Commercial gourmet food staging. Empty authentic olive wood presentation board with natural live grain, warm natural kitchen window light, subtle culinary herbs softly blurred in distant background. Clean vacant center.',
      aspect: '1:1',
    },
  ],
  jewelry: [
    {
      id: 'jewel_obsidian_black',
      category: 'jewelry',
      name: 'Obsidienne Noire & Prisme Prismatique',
      frenchDescription: 'Mise en valeur maximale des métaux précieux, diamants et montres.',
      surfaceMaterial: 'mirror-finish black obsidian plate with chamfered edges',
      lightingScheme: 'precise micro-spotlight with dispersion sparkle and sharp specular highlights',
      propsAndAtmosphere: 'deep velvet black void with delicate crystal refractive flare',
      basePositivePrompt: 'Commercial high jewelry staging. Empty mirror-finish black obsidian display plinth, focused micro spotlight, delicate optical prism light flare, deep black velvet atmosphere. Pristine vacant surface.',
      aspect: '1:1',
    },
  ],
  tech: [
    {
      id: 'tech_cyber_minimal',
      category: 'tech',
      name: 'Grométrie Cyber & Liseré Néon',
      frenchDescription: 'Design épuré pour écouteurs, smartphones, smartwatches et accessoires.',
      surfaceMaterial: 'matte dark aerospace aluminum slab with beveled edges',
      lightingScheme: 'clean cool-white LED key light with subtle cyan accent glow',
      propsAndAtmosphere: 'minimalist dark gradient studio with subtle geometric lines',
      basePositivePrompt: 'Commercial consumer tech staging. Empty matte aerospace dark aluminum pedestal, subtle cyan and indigo edge rim lights, clean high-tech minimalist backdrop. Completely vacant top surface.',
      aspect: '1:1',
    },
  ],
  home: [
    {
      id: 'home_scandinavian_oak',
      category: 'home',
      name: 'Chêne Naturel & Salon Solaire',
      frenchDescription: 'Pour bougies parfumées, céramiques, luminaires et linge de maison.',
      surfaceMaterial: 'solid blond oak wood surface with gentle matte finish',
      lightingScheme: 'gentle natural sunbeam streaming from a side window with soft sheer curtain shadow',
      propsAndAtmosphere: 'tastefully blurred modern living room interior, off-white linen sofa in distant background',
      basePositivePrompt: 'Commercial home decor staging. Empty natural blond oak coffee table surface, gentle warm morning window sunlight with sheer curtain cast shadow, softly blurred cozy modern living room background. Clean vacant surface.',
      aspect: '1:1',
    },
  ],
  nutrition: [
    {
      id: 'nutri_titanium_athletic',
      category: 'nutrition',
      name: 'Titane Sombre & Club Athlétique',
      frenchDescription: 'Podium puissant pour protéines, compléments et pré-workouts.',
      surfaceMaterial: 'textured dark carbon fiber and titanium pedestal',
      lightingScheme: 'dramatic 45-degree overhead rim light with high contrast',
      propsAndAtmosphere: 'modern gym atmosphere softly blurred in deep background',
      basePositivePrompt: 'Commercial sports nutrition staging. Empty dark titanium and carbon fiber pedestal, dark athletic club backdrop with dramatic rim lights. Completely vacant clean surface.',
      aspect: '1:1',
    },
  ],
};

/**
 * Compile une recette sectorielle avec la charte graphique d'une marque (Brand Kit)
 */
export function compileCategoryRecipePrompt(
  recipe: SceneRecipe,
  brandKit: BrandKit
): string {
  return compileBrandPrompt(brandKit, recipe.basePositivePrompt, {
    isStory: recipe.aspect === '9:16',
    angleName: recipe.name,
  });
}
