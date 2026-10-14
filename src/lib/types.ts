export interface ProductAnalysis {
  productName: string;
  brand: string;
  category: 'whey' | 'creatine' | 'preworkout' | 'bcaa' | 'vitamins' | 'gainer' | 'perfume' | string;
  dominantColors: string[];
  targetGoal: string;
  suggestedAngles: string[];
  captions: {
    instagramFeedFr: string;
    instagramFeedDarija: string;
    storyUrgency: string;
    facebookAd: string;
  };
  hashtags: string[];
}

export interface SceneLighting {
  keyLightDirection: 'top-left' | 'top-right' | 'overhead';
  keyLightAngleDeg: number;
  ambientLightIntensity: number;
  colorTemperatureK: number;
}

export interface PedestalAnchor {
  centerX: number;
  surfaceY: number;
  maxProductWidthRatio: number;
  isGlossy?: boolean;
}

export interface SafeZones {
  topPercent: number;
  bottomPercent: number;
}

export interface StagingScene {
  id: string;
  name: string;
  niche: 'nutrition' | 'cosmetics' | 'fashion' | 'watches' | 'tech' | 'general';
  category: 'studio' | 'lifestyle' | 'ads' | 'story' | 'ecommerce' | 'promo';
  aspectRatio: '1:1' | '9:16' | '3:2';
  imageUrl: string;
  lighting: SceneLighting;
  pedestalAnchor: PedestalAnchor;
  safeZones: SafeZones;
  description: string;
  tags: string[];
}

export interface VisualTemplate {
  id: string;
  name: string;
  category: 'studio' | 'lifestyle' | 'ads' | 'story';
  aspectRatio: '1:1' | '9:16';
  prompt: string;
  thumbnail: string;
  description: string;
  badgeEligible: boolean;
  lighting?: SceneLighting;
  pedestalAnchor?: PedestalAnchor;
  safeZones?: SafeZones;
}

export interface GeneratedVisual {
  id: string;
  templateId: string;
  title: string;
  category: 'studio' | 'lifestyle' | 'ads' | 'story';
  format: '1:1' | '9:16';
  imageUrl: string;
  badge?: string;
  isReady: boolean;
}

export interface PackConfig {
  id: 'flash' | 'pro' | 'omnipresence';
  name: string;
  priceTND: number;
  visualsCount: number;
  breakdown: {
    studio: number;
    lifestyle: number;
    ads: number;
    story: number;
  };
  features: string[];
}

export interface LocalBadge {
  id: string;
  label: string;
  subtitle: string;
  svgUrl: string;
  color: string;
}

