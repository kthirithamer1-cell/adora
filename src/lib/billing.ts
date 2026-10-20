import { findWorkspaceById, savePersistedStore } from './auth';
import { getApiUsageLogs, getApiUsageMetrics, ApiUsageLogEntry } from './apiUsageLogger';

export interface BillingTransaction {
  id: string;
  workspaceId: string;
  amountTND: number;
  packId: string;
  packName: string;
  creditsAdded: number;
  gateway: 'whop' | 'flouci' | 'konnect' | 'b2b_invoice';
  status: 'completed' | 'pending';
  invoiceNumber: string;
  createdAt: string;
}

export interface GenerationLog {
  id: string;
  productName: string;
  category: string;
  aspect: string;
  creditsCost: number;
  createdAt: string;
}

export interface WorkspaceUsage {
  workspaceId: string;
  totalCreditsPurchased: number;
  creditsUsed: number;
  creditsRemaining: number;
  totalPacksExported: number;
  generationHistory: GenerationLog[];
  transactions: BillingTransaction[];
  apiLogs?: ApiUsageLogEntry[];
  apiMetrics?: any;
}

const initialTransactions: Record<string, BillingTransaction[]> = {
  ws_nutristore: [
    {
      id: 'tx_101',
      workspaceId: 'ws_nutristore',
      amountTND: 59,
      packId: 'pro',
      packName: 'Pack Lancement Pro ⚡',
      creditsAdded: 50, // 50 crédits
      gateway: 'konnect',
      status: 'completed',
      invoiceNumber: 'FAC-2026-0042',
      createdAt: '2026-02-15T11:20:00Z',
    },
    {
      id: 'tx_102',
      workspaceId: 'ws_nutristore',
      amountTND: 29,
      packId: 'flash',
      packName: 'Pack Flash Découverte',
      creditsAdded: 20, // 20 crédits
      gateway: 'flouci',
      status: 'completed',
      invoiceNumber: 'FAC-2026-0089',
      createdAt: '2026-03-01T15:45:00Z',
    },
  ],
  ws_hypergrowth: [
    {
      id: 'tx_201',
      workspaceId: 'ws_hypergrowth',
      amountTND: 299,
      packId: 'agency_299',
      packName: 'Abonnement Agence B2B High-Ticket',
      creditsAdded: 120, // 120 crédits mensuels
      gateway: 'b2b_invoice',
      status: 'completed',
      invoiceNumber: 'FAC-2026-0112',
      createdAt: '2026-01-05T09:00:00Z',
    },
  ],
};

const initialLogs: Record<string, GenerationLog[]> = {
  ws_nutristore: [
    {
      id: 'log_1',
      productName: 'Nutrex IsoFit 100% Whey Isolate',
      category: 'studio',
      aspect: '1:1',
      creditsCost: 1,
      createdAt: '2026-03-02T10:14:00Z',
    },
    {
      id: 'log_2',
      productName: 'Creapure Micronized Creatine 300g',
      category: 'story',
      aspect: '2:3',
      creditsCost: 1,
      createdAt: '2026-03-04T16:30:00Z',
    },
    {
      id: 'log_3',
      productName: 'GNC Pro Performance 100% Whey',
      category: 'lifestyle',
      aspect: '1:1',
      creditsCost: 1,
      createdAt: '2026-03-06T14:22:00Z',
    },
  ],
};

let memoryTransactions = { ...initialTransactions };
let memoryLogs = { ...initialLogs };

export function checkCreditBalance(
  workspaceId: string,
  amount: number = 1
): { sufficient: boolean; remaining: number } {
  const ws = findWorkspaceById(workspaceId);
  const remaining = ws ? ws.creditsRemaining : 0;
  return {
    sufficient: remaining >= amount,
    remaining,
  };
}

export function getWorkspaceUsage(workspaceId: string): WorkspaceUsage {
  const ws = findWorkspaceById(workspaceId);
  const creditsRemaining = ws ? ws.creditsRemaining : 10;
  const logs = memoryLogs[workspaceId] || [];
  const txs = memoryTransactions[workspaceId] || [];
  const apiLogs = getApiUsageLogs(workspaceId, 100);
  const apiMetrics = getApiUsageMetrics(workspaceId);

  const creditsUsed = logs.reduce((acc, l) => acc + l.creditsCost, 0);
  const totalCreditsPurchased = creditsRemaining + creditsUsed;

  return {
    workspaceId,
    totalCreditsPurchased,
    creditsUsed,
    creditsRemaining,
    totalPacksExported: Math.floor(creditsUsed / 5) + 1,
    generationHistory: logs,
    transactions: txs,
    apiLogs,
    apiMetrics,
  };
}

export function deductCredit(
  workspaceId: string,
  amount: number = 1,
  meta: { productName: string; category: string; aspect: string }
): { success: boolean; remaining: number; error?: string } {
  const ws = findWorkspaceById(workspaceId);
  if (!ws) return { success: false, remaining: 0, error: 'Espace introuvable' };

  if (ws.creditsRemaining < amount) {
    return {
      success: false,
      remaining: ws.creditsRemaining,
      error: `Solde insuffisant (${ws.creditsRemaining} crédits restants). Veuillez recharger votre pack en Dinars (DT).`,
    };
  }

  ws.creditsRemaining -= amount;
  savePersistedStore();

  if (!memoryLogs[workspaceId]) {
    memoryLogs[workspaceId] = [];
  }

  memoryLogs[workspaceId].unshift({
    id: `log_${Date.now()}`,
    productName: meta.productName,
    category: meta.category,
    aspect: meta.aspect,
    creditsCost: amount,
    createdAt: new Date().toISOString(),
  });

  return { success: true, remaining: ws.creditsRemaining };
}

export function addCredits(
  workspaceId: string,
  packId: string,
  packName: string,
  amountTND: number,
  creditsCount: number,
  gateway: 'whop' | 'flouci' | 'konnect' | 'b2b_invoice'
): BillingTransaction {
  const ws = findWorkspaceById(workspaceId);
  if (ws) {
    ws.creditsRemaining += creditsCount;
    savePersistedStore();
  }

  if (!memoryTransactions[workspaceId]) {
    memoryTransactions[workspaceId] = [];
  }

  const tx: BillingTransaction = {
    id: `tx_${Date.now()}`,
    workspaceId,
    amountTND,
    packId,
    packName,
    creditsAdded: creditsCount,
    gateway,
    status: 'completed',
    invoiceNumber: `FAC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
  };

  memoryTransactions[workspaceId].unshift(tx);
  return tx;
}
