export interface ClientBrand {
  id: string;
  name: string;
  niche: string;
  logoUrl?: string;
  creditsAllocated: number;
  creditsUsed: number;
  status: 'active' | 'paused';
  createdAt: string;
}

export interface AgencyConfig {
  workspaceId: string;
  agencyName: string;
  agencyLogoUrl: string;
  whiteLabelActive: boolean;
  customDomain?: string;
  planTier: 'agency_299' | 'agency_590';
  monthlyPriceTND: number;
  monthlyPriceUSD?: number;
  totalMonthlyCredits: number;
  clientBrands: ClientBrand[];
  agencyFooterText: string;
}

const initialAgencies: Record<string, AgencyConfig> = {
  ws_hypergrowth: {
    workspaceId: 'ws_hypergrowth',
    agencyName: 'HyperGrowth Agence Digitale',
    agencyLogoUrl: '/images/logo.png',
    whiteLabelActive: true,
    customDomain: 'studio.hypergrowth.tn',
    planTier: 'agency_299',
    monthlyPriceTND: 299,
    monthlyPriceUSD: 99,
    totalMonthlyCredits: 120,
    agencyFooterText: 'Pack de Contenu Haute Définition préparé par HyperGrowth Agency Tunis.',
    clientBrands: [
      {
        id: 'brand_nutristore',
        name: 'NutriStore Tunisie',
        niche: 'Compléments Alimentaires',
        logoUrl: '/images/logo.png',
        creditsAllocated: 40,
        creditsUsed: 18,
        status: 'active',
        createdAt: '2026-01-10T10:00:00Z',
      },
      {
        id: 'brand_vestiaire',
        name: 'Vestiaire Tunis',
        niche: 'Mode & Prêt-à-porter',
        logoUrl: '/images/hero_lifestyle.jpg',
        creditsAllocated: 50,
        creditsUsed: 25,
        status: 'active',
        createdAt: '2026-01-20T14:00:00Z',
      },
      {
        id: 'brand_carthage_deco',
        name: 'Carthage Décoration',
        niche: 'Maison & Décoration',
        logoUrl: '/images/logo.png',
        creditsAllocated: 20,
        creditsUsed: 12,
        status: 'active',
        createdAt: '2026-02-05T09:00:00Z',
      },
    ],
  },
};

let memoryAgencies = { ...initialAgencies };

export function getAgencyConfig(workspaceId: string): AgencyConfig {
  if (memoryAgencies[workspaceId]) {
    return memoryAgencies[workspaceId];
  }

  // Fallback création
  const newConfig: AgencyConfig = {
    workspaceId,
    agencyName: 'Mon Agence Marketing',
    agencyLogoUrl: '/images/logo.png',
    whiteLabelActive: true,
    planTier: 'agency_299',
    monthlyPriceTND: 299,
    monthlyPriceUSD: 99,
    totalMonthlyCredits: 120,
    agencyFooterText: 'Contenu produit en marque blanche par notre studio créatif.',
    clientBrands: [],
  };
  memoryAgencies[workspaceId] = newConfig;
  return newConfig;
}

export function updateAgencyConfig(
  workspaceId: string,
  updatedData: Partial<AgencyConfig>
): AgencyConfig {
  const current = getAgencyConfig(workspaceId);
  const updated = {
    ...current,
    ...updatedData,
    workspaceId,
  };
  memoryAgencies[workspaceId] = updated;
  return updated;
}

export function addClientBrandToAgency(
  workspaceId: string,
  brand: Omit<ClientBrand, 'id' | 'creditsUsed' | 'createdAt'>
): ClientBrand {
  const config = getAgencyConfig(workspaceId);
  const newBrand: ClientBrand = {
    ...brand,
    id: `brand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    creditsUsed: 0,
    createdAt: new Date().toISOString(),
  };

  config.clientBrands.push(newBrand);
  memoryAgencies[workspaceId] = config;
  return newBrand;
}

export function removeClientBrandFromAgency(
  workspaceId: string,
  brandId: string
): boolean {
  const config = getAgencyConfig(workspaceId);
  const initialLength = config.clientBrands.length;
  config.clientBrands = config.clientBrands.filter((b) => b.id !== brandId);
  memoryAgencies[workspaceId] = config;
  return config.clientBrands.length < initialLength;
}
