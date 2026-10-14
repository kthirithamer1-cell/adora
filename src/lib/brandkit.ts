export interface BrandKitPalette {
  primary: string;
  secondary: string;
  accent: string;
  background?: string;
}

export interface BrandKitTypography {
  headline: string;
  body: string;
}

export interface BrandKitVoice {
  tone: 'expert' | 'complice' | 'urgent' | 'prestige' | 'playful';
  languages: ('fr' | 'darija')[];
  forbiddenWords: string[];
}

export interface BrandKitAudience {
  age: string;
  gender: 'all' | 'women' | 'men';
  governorates: string[];
  painPoints: string[];
}

export interface BrandKitVisualStyle {
  mood: string;
  lighting: string;
  referenceImages?: string[];
}

export interface BrandKitOffers {
  delivery: string;
  payment: string;
  guarantee: string;
}

export interface BrandKit {
  workspaceId: string;
  shopName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  sloganDarija: string;
  sloganFr: string;
  instagramHandle: string;
  whatsappNumber: string;
  deliveryMention: string;
  watermarkEnabled: boolean;
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  // AI Engine v2 Specifications (ADORA-41)
  industry?: 'cosmetics' | 'fashion' | 'nutrition' | 'jewelry' | 'tech' | 'food' | 'home' | 'general';
  positioning?: 'luxury' | 'premium' | 'affordable' | 'playful' | 'athletic' | 'artisan';
  palette?: BrandKitPalette;
  fonts?: BrandKitTypography;
  voice?: BrandKitVoice;
  audience?: BrandKitAudience;
  visualStyle?: BrandKitVisualStyle;
  competitors?: string[];
  offers?: BrandKitOffers;
}

export interface CatalogProduct {
  id: string;
  workspaceId: string;
  name: string;
  brand: string;
  category: string;
  originalImageUrl: string;
  cutoutImageUrl?: string;
  priceTND: number;
  descriptionFr: string;
  descriptionDarija: string;
  badgeId: string;
  createdAt: string;
}

// Données initiales Brand Kit
const initialBrandKits: Record<string, BrandKit> = {
  ws_nutristore: {
    workspaceId: 'ws_nutristore',
    shopName: 'NutriStore Tunisie',
    logoUrl: '/images/Adora_logo.png',
    primaryColor: '#00E5FF',
    secondaryColor: '#FF5722',
    accentColor: '#10B981',
    fontFamily: 'Outfit, sans-serif',
    sloganDarija: 'Aqwé les compléments fi tounes b a7sen aswem !',
    sloganFr: 'Le n°1 des compléments alimentaires certifiés en Tunisie.',
    instagramHandle: '@nutristore.tn',
    whatsappNumber: '+216 98 123 456',
    deliveryMention: 'Livraison 24-48h sur les 24 gouvernorats',
    watermarkEnabled: true,
    watermarkPosition: 'top-right',
    industry: 'nutrition',
    positioning: 'athletic',
    palette: { primary: '#00E5FF', secondary: '#FF5722', accent: '#10B981', background: '#0B0E14' },
    fonts: { headline: 'Outfit', body: 'Plus Jakarta Sans' },
    voice: {
      tone: 'expert',
      languages: ['fr', 'darija'],
      forbiddenWords: ['contrefait', 'douteux', 'faible'],
    },
    audience: {
      age: '18-35',
      gender: 'all',
      governorates: ['Tunis', 'Sousse', 'Sfax', 'Ariana', 'Bizerte'],
      painPoints: ['Peur des contrefaçons', 'Délais de livraison longs', 'Produits trop chers'],
    },
    visualStyle: {
      mood: 'Athletic dark club, titanium accents, high contrast',
      lighting: 'Directional 45-degree cyan & crimson rim lights',
      referenceImages: ['/images/whey_studio_podium.jpg'],
    },
    competitors: ['PowerFit TN', 'NutriZone'],
    offers: {
      delivery: 'Livraison 24-48h sur 24 gouvernorats',
      payment: 'Paiement à la livraison (El khlass waqt el livri) ou Flouci',
      guarantee: '100% Importé Certifié d\'Origine',
    },
  },
  ws_vestiaire: {
    workspaceId: 'ws_vestiaire',
    shopName: 'Vestiaire Tunis',
    logoUrl: '/images/Adora_logo.png',
    primaryColor: '#E11D48',
    secondaryColor: '#F59E0B',
    accentColor: '#4F46E5',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    sloganDarija: 'Mode exclusive w chic, el livraison l beb eddar.',
    sloganFr: 'Haute couture & prêt-à-porter élégant à Tunis.',
    instagramHandle: '@vestiaire_tunis',
    whatsappNumber: '+216 22 789 012',
    deliveryMention: 'Livraison express Grand Tunis & toute la Tunisie',
    watermarkEnabled: false,
    watermarkPosition: 'bottom-right',
    industry: 'fashion',
    positioning: 'luxury',
    palette: { primary: '#E11D48', secondary: '#F59E0B', accent: '#4F46E5', background: '#FFFFFF' },
    fonts: { headline: 'Plus Jakarta Sans', body: 'Inter' },
    voice: {
      tone: 'prestige',
      languages: ['fr', 'darija'],
      forbiddenWords: ['pas cher', 'braderie', 'fripe'],
    },
    audience: {
      age: '24-45',
      gender: 'women',
      governorates: ['Tunis', 'La Marsa', 'Sousse', 'Sfax'],
      painPoints: ['Manque d\'exclusivité', 'Tissus de mauvaise qualité', 'Tailles imprécises'],
    },
    visualStyle: {
      mood: 'Haute couture elegance, travertine stone, warm sunlight, silk textures',
      lighting: 'Warm diffuse ambient sunlight, golden hour rim reflections',
      referenceImages: ['/images/hero_lifestyle.jpg'],
    },
    competitors: ['Maison Tunis', 'Chic Medina'],
    offers: {
      delivery: 'Livraison express 24h Grand Tunis & 48h régions',
      payment: 'Paiement à la livraison ou Flouci sécurisé',
      guarantee: 'Échange gratuit de taille sous 7 jours',
    },
  },
};

// Données initiales du catalogue produits marchand
const initialCatalog: CatalogProduct[] = [
  {
    id: 'prod_nutrex_whey',
    workspaceId: 'ws_nutristore',
    name: 'Nutrex IsoFit 100% Whey Isolate',
    brand: 'Nutrex Research',
    category: 'nutrition',
    originalImageUrl: '/images/bottle_nutrex.png',
    cutoutImageUrl: '/images/bottle_nutrex.png',
    priceTND: 189,
    descriptionFr: 'Isolate pure de première qualité avec 25g de protéines par dose, absorption immédiate.',
    descriptionDarija: '25g de protéine pure par dose, zéro sokor w absorption fi d9i9a.',
    badgeId: 'livraison',
    createdAt: '2026-02-15T10:00:00Z',
  },
  {
    id: 'prod_creatine_creapure',
    workspaceId: 'ws_nutristore',
    name: 'Creapure Micronized Creatine 300g',
    brand: 'Optimum Nutrition',
    category: 'nutrition',
    originalImageUrl: '/images/creatine_story.jpg',
    cutoutImageUrl: '/images/creatine_story.jpg',
    priceTND: 89,
    descriptionFr: 'Créatine monohydrate allemande Creapure pure à 99.9%, explosivité et force accrue.',
    descriptionDarija: 'A9wa creatine fil 3alem creapure el allemande, tfajer el force mteek.',
    badgeId: 'paiement_livraison',
    createdAt: '2026-02-18T14:00:00Z',
  },
  {
    id: 'prod_gnc_pro_whey',
    workspaceId: 'ws_nutristore',
    name: 'GNC Pro Performance 100% Whey',
    brand: 'GNC',
    category: 'nutrition',
    originalImageUrl: '/images/gnc_pro_whey_tub_1791150838901.jpg',
    cutoutImageUrl: '/images/gnc_pro_whey_tub_1791150838901.jpg',
    priceTND: 155,
    descriptionFr: 'Formule avancée enrichie en BCAA et glutamine pour une récupération optimale.',
    descriptionDarija: 'Protéine complète m3aha BCAA bech tibni el muscle sec fisaa.',
    badgeId: 'stock_limite',
    createdAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'prod_robe_soie',
    workspaceId: 'ws_vestiaire',
    name: 'Robe Soie & Lin Médina Édition 2026',
    brand: 'Vestiaire Tunis',
    category: 'mode',
    originalImageUrl: '/images/hero_lifestyle.jpg',
    cutoutImageUrl: '/images/hero_lifestyle.jpg',
    priceTND: 129,
    descriptionFr: 'Confection artisanale tunisienne en soie naturelle et lin d’été.',
    descriptionDarija: '9meche 7rir naturel khedma tounseya 7orra, toufa fisaa el quantite.',
    badgeId: 'authentique',
    createdAt: '2026-03-05T16:00:00Z',
  },
];

let memoryBrandKits = { ...initialBrandKits };
let memoryCatalog = [...initialCatalog];

export function getBrandKitByWorkspace(workspaceId: string): BrandKit {
  if (memoryBrandKits[workspaceId]) {
    return memoryBrandKits[workspaceId];
  }

  // Brand Kit par défaut pour les nouveaux espaces
  return {
    workspaceId,
    shopName: 'Ma Boutique E-commerce',
    logoUrl: '/images/Adora_logo.png',
    primaryColor: '#00E5FF',
    secondaryColor: '#FF5722',
    accentColor: '#10B981',
    fontFamily: 'Outfit, sans-serif',
    sloganDarija: 'El qualité el behya b a7sen aswem fi tounes !',
    sloganFr: 'Votre boutique officielle en Tunisie.',
    instagramHandle: '@maboutique.tn',
    whatsappNumber: '+216 20 000 000',
    deliveryMention: 'Livraison 24-48h sur 24 gouvernorats',
    watermarkEnabled: false,
    watermarkPosition: 'top-right',
  };
}

export function updateBrandKitByWorkspace(
  workspaceId: string,
  updatedData: Partial<BrandKit>
): BrandKit {
  const current = getBrandKitByWorkspace(workspaceId);
  const updated: BrandKit = {
    ...current,
    ...updatedData,
    workspaceId,
  };
  memoryBrandKits[workspaceId] = updated;
  return updated;
}

export const saveBrandKit = updateBrandKitByWorkspace;

export function getCatalogByWorkspace(workspaceId: string): CatalogProduct[] {
  return memoryCatalog.filter((p) => p.workspaceId === workspaceId);
}

export function addProductToCatalog(
  workspaceId: string,
  product: Omit<CatalogProduct, 'id' | 'workspaceId' | 'createdAt'>
): CatalogProduct {
  const newProduct: CatalogProduct = {
    ...product,
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    workspaceId,
    createdAt: new Date().toISOString(),
  };
  memoryCatalog.push(newProduct);
  return newProduct;
}

export function deleteProductFromCatalog(workspaceId: string, productId: string): boolean {
  const initialLength = memoryCatalog.length;
  memoryCatalog = memoryCatalog.filter(
    (p) => !(p.workspaceId === workspaceId && p.id === productId)
  );
  return memoryCatalog.length < initialLength;
}

/**
 * Compilateur de Prompts avec Brand Kit (ADORA-41)
 * Compile les attributs visuels d'une marque (mood, éclairage, palette, positionnement)
 * dans le prompt de diffusion, tout en respectant scrupuleusement la règle 100% positive
 * (centre vacant, surface polie propre sans aucun objet pré-généré).
 */
export function compileBrandPrompt(
  brandKit: BrandKit,
  basePrompt: string,
  options?: {
    isStory?: boolean;
    angleName?: string;
  }
): string {
  const mood = brandKit.visualStyle?.mood || `${brandKit.positioning || 'premium'} commercial e-commerce aesthetic`;
  const lighting = brandKit.visualStyle?.lighting || 'soft directional studio rim light with ambient fill';
  const primaryColor = brandKit.palette?.primary || brandKit.primaryColor;
  const accentColor = brandKit.palette?.accent || brandKit.accentColor;

  const colorAccentText = `subtle accent tone reflections in ${primaryColor} and ${accentColor}`;
  const formatNote = options?.isStory
    ? 'Vertical 9:16 layout, extended top and bottom composition with generous clean safe-zone headroom, center pedestal perfectly centered.'
    : 'Centered 1:1 balanced composition, 15 degree camera elevation.';

  const vacancyMandate = 'The central pedestal top surface is completely vacant, pristine, smooth and polished, cleanly awaiting an object. Clean seamless background.';

  return `${basePrompt.trim()}. Brand aesthetic: ${mood}. Lighting: ${lighting}, ${colorAccentText}. ${formatNote} ${vacancyMandate}`.trim();
}
