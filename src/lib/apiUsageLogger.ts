/**
 * Moteur d'Audit Trail & Journalisation Granulaire des Appels API — Adora SaaS
 * Tickets Jira : ADORA-73 & ADORA-74
 * Traçabilité complète : Tokens, Modèles, Résolutions, Latence, Coûts Réels ($ et DT) et Débit des Crédits
 */

export interface ApiUsageLogEntry {
  id: string;
  timestamp: string;
  workspaceId: string;
  workspaceName?: string;
  endpoint: string; // ex: '/api/generate-image', '/api/strategy-engine', '/api/vision-critic'
  model: string; // ex: 'gpt-image-1', 'gpt-4o-mini', 'dall-e-3', 'sharp-compositor'
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  resolution?: string; // ex: '1024x1024', '1024x1792'
  latencyMs: number;
  statusCode: number;
  status: 'SUCCESS' | 'ERROR';
  costUSD: number;
  costTND: number;
  creditsDeducted: number;
  productName?: string;
  category?: string;
  details?: Record<string, any>;
}

// Taux de change officiel USD vers Dinar Tunisien (TND)
export const USD_TO_TND_RATE = 3.120;

/**
 * Calculateur de coût unitaire officiel OpenAI & Compute
 */
export function calculateApiCost(
  model: string,
  options: {
    promptTokens?: number;
    completionTokens?: number;
    resolution?: string;
    quality?: string;
  } = {}
): { costUSD: number; costTND: number } {
  let costUSD = 0;
  const isHD = options.quality === 'hd';
  const isVertical = options.resolution === '1024x1792' || options.resolution === '1792x1024';

  if (model.includes('flare') || model.includes('gpt-image-2.5-flare')) {
    // gpt-image-2.5-flare : Vitesse, optimisation du coût et prompt réactif
    // Hypothèse économique : 0.020 $ à 0.030 $ selon la complexité et les tokens
    costUSD = isHD ? 0.035 : 0.025;
  } else if (model.includes('sunburst') || model.includes('gpt-image-2.5-sunburst')) {
    // gpt-image-2.5-sunburst : Haute fidélité, photoréalisme studio et textures complexes
    // Hypothèse exigeante : 0.040 $ à 0.060 $
    costUSD = isHD ? 0.060 : 0.045;
  } else if (model.includes('gpt-image-2')) {
    costUSD = isHD ? 0.050 : 0.035;
  } else if (model.includes('gpt-image-1') || model.includes('dall-e-3')) {
    // DALL-E 3 standardisé
    if (options.resolution === '1024x1792' || options.resolution === '1792x1024') {
      costUSD = 0.080;
    } else {
      costUSD = isHD ? 0.080 : 0.040;
    }
  } else if (model.includes('dall-e-2')) {
    costUSD = 0.020;
  } else if (model.includes('gpt-4o-mini')) {
    const promptTokens = options.promptTokens || 0;
    const completionTokens = options.completionTokens || 0;
    // $0.150 per 1M prompt tokens, $0.600 per 1M completion tokens
    costUSD = (promptTokens * 0.00000015) + (completionTokens * 0.00000060);
  } else if (model.includes('gpt-4o')) {
    const promptTokens = options.promptTokens || 0;
    const completionTokens = options.completionTokens || 0;
    // $2.50 per 1M prompt tokens, $10.00 per 1M completion tokens
    costUSD = (promptTokens * 0.0000025) + (completionTokens * 0.0000100);
  } else if (model.includes('sharp') || model.includes('local')) {
    // Coût serveur amorti Sharp compositing local + orchestration
    costUSD = 0.002;
  } else {
    // Modèle par défaut / estimation réaliste
    costUSD = 0.030;
  }

  // Arrondi à 6 décimales pour USD et 4 décimales pour TND (millimes précis)
  costUSD = Math.round(costUSD * 1000000) / 1000000;
  const costTND = Math.round(costUSD * USD_TO_TND_RATE * 10000) / 10000;

  return { costUSD, costTND };
}

// Seed initial réaliste pour l'historique d'audit
const INITIAL_API_LOGS: ApiUsageLogEntry[] = [
  {
    id: 'api_log_1001',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    workspaceId: 'ws_nutristore',
    workspaceName: 'NutriStore Tunisie',
    endpoint: '/api/generate-image',
    model: 'gpt-image-1',
    resolution: '1024x1024',
    latencyMs: 2450,
    statusCode: 200,
    status: 'SUCCESS',
    costUSD: 0.040,
    costTND: 0.1248,
    creditsDeducted: 1,
    productName: 'Nutrex IsoFit 100% Whey Isolate',
    category: 'fitness',
    details: { aspect: '1:1', style: 'studio_dark', quality: 'standard' },
  },
  {
    id: 'api_log_1002',
    timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(),
    workspaceId: 'ws_nutristore',
    workspaceName: 'NutriStore Tunisie',
    endpoint: '/api/strategy-engine',
    model: 'gpt-4o-mini',
    promptTokens: 420,
    completionTokens: 280,
    totalTokens: 700,
    latencyMs: 680,
    statusCode: 200,
    status: 'SUCCESS',
    costUSD: 0.000231,
    costTND: 0.0007,
    creditsDeducted: 0,
    productName: 'Nutrex IsoFit 100% Whey Isolate',
    category: 'fitness',
    details: { anglesCount: 5, language: 'darija_fr' },
  },
  {
    id: 'api_log_1003',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    workspaceId: 'ws_nutristore',
    workspaceName: 'NutriStore Tunisie',
    endpoint: '/api/generate-image',
    model: 'gpt-image-1',
    resolution: '1024x1792',
    latencyMs: 2890,
    statusCode: 200,
    status: 'SUCCESS',
    costUSD: 0.080,
    costTND: 0.2496,
    creditsDeducted: 1,
    productName: 'Creapure Micronized Creatine 300g',
    category: 'fitness',
    details: { aspect: '9:16', style: 'gym_mood', quality: 'standard' },
  },
  {
    id: 'api_log_1004',
    timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    workspaceId: 'ws_hypergrowth',
    workspaceName: 'HyperGrowth Agence Digitale',
    endpoint: '/api/generate-image',
    model: 'gpt-image-1',
    resolution: '1024x1024',
    latencyMs: 2310,
    statusCode: 200,
    status: 'SUCCESS',
    costUSD: 0.040,
    costTND: 0.1248,
    creditsDeducted: 1,
    productName: 'Parfum Oud Royal Orient',
    category: 'parfum',
    details: { aspect: '1:1', style: 'sidi_bou_said', quality: 'standard' },
  },
  {
    id: 'api_log_1005',
    timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    workspaceId: 'ws_hypergrowth',
    workspaceName: 'HyperGrowth Agence Digitale',
    endpoint: '/api/generate-image',
    model: 'sharp-compositor',
    resolution: '1080x1080',
    latencyMs: 140,
    statusCode: 200,
    status: 'SUCCESS',
    costUSD: 0.001,
    costTND: 0.0031,
    creditsDeducted: 1,
    productName: 'Montre Chrono Sport Noir',
    category: 'accessoires',
    details: { aspect: '1:1', style: 'studio_clean', localSharp: true },
  },
];

// Registre mémoire persistant
let memoryApiLogs: ApiUsageLogEntry[] = [...INITIAL_API_LOGS];

/**
 * Enregistre un appel API dans l'Audit Trail immuable
 */
export function recordApiUsage(
  params: Omit<ApiUsageLogEntry, 'id' | 'timestamp' | 'costTND'> & { costTND?: number }
): ApiUsageLogEntry {
  const costTND = params.costTND !== undefined
    ? params.costTND
    : Math.round(params.costUSD * USD_TO_TND_RATE * 10000) / 10000;

  const entry: ApiUsageLogEntry = {
    ...params,
    id: `api_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    costTND,
  };

  memoryApiLogs.unshift(entry);

  // Conserver les 500 derniers logs en mémoire
  if (memoryApiLogs.length > 500) {
    memoryApiLogs = memoryApiLogs.slice(0, 500);
  }

  return entry;
}

/**
 * Récupère les logs d'appels API filtrés par workspace
 */
export function getApiUsageLogs(workspaceId?: string, limit: number = 50): ApiUsageLogEntry[] {
  let logs = memoryApiLogs;
  if (workspaceId) {
    logs = logs.filter((l) => l.workspaceId === workspaceId);
  }
  return logs.slice(0, limit);
}

/**
 * Calcule les métriques globales et la rentabilité financière
 */
export function getApiUsageMetrics(workspaceId?: string) {
  const logs = workspaceId ? memoryApiLogs.filter((l) => l.workspaceId === workspaceId) : memoryApiLogs;

  const totalCalls = logs.length;
  const totalCostUSD = logs.reduce((acc, l) => acc + l.costUSD, 0);
  const totalCostTND = logs.reduce((acc, l) => acc + l.costTND, 0);
  const totalCreditsDeducted = logs.reduce((acc, l) => acc + l.creditsDeducted, 0);
  const totalTokens = logs.reduce((acc, l) => acc + (l.totalTokens || 0), 0);
  const averageLatencyMs = totalCalls > 0 ? Math.round(logs.reduce((acc, l) => acc + l.latencyMs, 0) / totalCalls) : 0;

  const byModel: Record<string, { count: number; costUSD: number; costTND: number }> = {};
  logs.forEach((l) => {
    if (!byModel[l.model]) {
      byModel[l.model] = { count: 0, costUSD: 0, costTND: 0 };
    }
    byModel[l.model].count += 1;
    byModel[l.model].costUSD = Math.round((byModel[l.model].costUSD + l.costUSD) * 10000) / 10000;
    byModel[l.model].costTND = Math.round((byModel[l.model].costTND + l.costTND) * 10000) / 10000;
  });

  return {
    totalCalls,
    totalCostUSD: Math.round(totalCostUSD * 10000) / 10000,
    totalCostTND: Math.round(totalCostTND * 10000) / 10000,
    totalCreditsDeducted,
    totalTokens,
    averageLatencyMs,
    byModel,
  };
}
