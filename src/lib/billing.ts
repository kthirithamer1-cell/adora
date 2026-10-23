import { findWorkspaceById, savePersistedStore } from './auth';
import { supabase, resolveWorkspaceUuid } from './supabase';
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

export async function checkCreditBalance(
  workspaceId: string,
  amount: number = 1
): Promise<{ sufficient: boolean; remaining: number }> {
  const cleanWsId = resolveWorkspaceUuid(workspaceId);
  const ws = findWorkspaceById(workspaceId) || findWorkspaceById(cleanWsId);
  let remaining = ws ? ws.creditsRemaining : 0;

  try {
    const sbWs = await supabase
      .from('workspaces')
      .select('credits_remaining')
      .eq('id', cleanWsId)
      .limit(1);
    const rows = Array.isArray(sbWs) ? sbWs : sbWs?.data || [];
    if (rows.length > 0 && typeof rows[0]?.credits_remaining === 'number') {
      remaining = rows[0].credits_remaining;
      if (ws) ws.creditsRemaining = remaining;
    }
  } catch (err) {
    console.warn('[checkCreditBalance Supabase fallback]:', err);
  }

  return {
    sufficient: remaining >= amount,
    remaining,
  };
}

export async function getWorkspaceUsage(workspaceId: string): Promise<WorkspaceUsage> {
  const cleanWsId = resolveWorkspaceUuid(workspaceId);
  const ws = findWorkspaceById(workspaceId) || findWorkspaceById(cleanWsId);
  let creditsRemaining = ws ? ws.creditsRemaining : 10;

  try {
    const sbWs = await supabase
      .from('workspaces')
      .select('credits_remaining')
      .eq('id', cleanWsId)
      .limit(1);
    const rows = Array.isArray(sbWs) ? sbWs : sbWs?.data || [];
    if (rows.length > 0 && typeof rows[0]?.credits_remaining === 'number') {
      creditsRemaining = rows[0].credits_remaining;
      if (ws) ws.creditsRemaining = creditsRemaining;
    }
  } catch (err) {
    console.warn('[getWorkspaceUsage Supabase fallback]:', err);
  }

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

export async function deductCredit(
  workspaceId: string,
  amount: number = 1,
  meta: { productName: string; category: string; aspect: string }
): Promise<{ success: boolean; remaining: number; error?: string }> {
  const cleanWsId = resolveWorkspaceUuid(workspaceId);
  const ws = findWorkspaceById(workspaceId) || findWorkspaceById(cleanWsId);

  // 1. Lire le solde réel (en priorité depuis Supabase Cloud pour la cohérence en déploiement)
  let currentBalance = ws ? ws.creditsRemaining : 0;
  try {
    const sbWs = await supabase
      .from('workspaces')
      .select('credits_remaining')
      .eq('id', cleanWsId)
      .limit(1);
    const rows = Array.isArray(sbWs) ? sbWs : sbWs?.data || [];
    if (rows.length > 0 && typeof rows[0]?.credits_remaining === 'number') {
      currentBalance = rows[0].credits_remaining;
      if (ws) ws.creditsRemaining = currentBalance;
    }
  } catch (err) {
    console.warn('[deductCredit Supabase read notice]:', err);
  }

  if (currentBalance < amount) {
    return {
      success: false,
      remaining: currentBalance,
      error: `Solde insuffisant (${currentBalance} crédits restants). Veuillez recharger votre pack en Dinars (DT).`,
    };
  }

  const newBalance = Math.max(0, currentBalance - amount);
  if (ws) {
    ws.creditsRemaining = newBalance;
    savePersistedStore();
  }

  // 2. Synchronisation immédiate vers Supabase Cloud (ESSENTIEL POUR LE DÉPLOIEMENT VERCEL)
  try {
    await supabase.from('workspaces').update({ id: cleanWsId }, {
      credits_remaining: newBalance,
    });

    await supabase.from('credit_transactions').insert({
      workspace_id: cleanWsId,
      type: 'CONSUME',
      amount: -amount,
      balance_after: newBalance,
      reason: `Consommation studio : ${meta.productName || 'génération IA'}`,
    });
  } catch (sbErr) {
    console.warn('[deductCredit Supabase update notice]:', sbErr);
  }

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

  return { success: true, remaining: newBalance };
}

export async function addCredits(
  workspaceId: string,
  packId: string,
  packName: string,
  amountTND: number,
  creditsCount: number,
  gateway: 'whop' | 'flouci' | 'konnect' | 'b2b_invoice'
): Promise<BillingTransaction> {
  const cleanWsId = resolveWorkspaceUuid(workspaceId);
  const ws = findWorkspaceById(workspaceId) || findWorkspaceById(cleanWsId);

  let currentBalance = ws ? ws.creditsRemaining : 0;
  try {
    const sbWs = await supabase
      .from('workspaces')
      .select('credits_remaining')
      .eq('id', cleanWsId)
      .limit(1);
    const rows = Array.isArray(sbWs) ? sbWs : sbWs?.data || [];
    if (rows.length > 0 && typeof rows[0]?.credits_remaining === 'number') {
      currentBalance = rows[0].credits_remaining;
    }
  } catch {}

  const newBalance = currentBalance + creditsCount;

  if (ws) {
    ws.creditsRemaining = newBalance;
    savePersistedStore();
  }

  try {
    await supabase.from('workspaces').update({ id: cleanWsId }, {
      credits_remaining: newBalance,
    });

    await supabase.from('credit_transactions').insert({
      workspace_id: cleanWsId,
      type: 'TOPUP',
      amount: creditsCount,
      balance_after: newBalance,
      reason: `Recharge pack ${packName} (${gateway})`,
    });
  } catch (sbErr) {
    console.warn('[addCredits Supabase update notice]:', sbErr);
  }

  if (!memoryTransactions[workspaceId]) {
    memoryTransactions[workspaceId] = [];
  }

  const tx: BillingTransaction = {
    id: `tx_${Date.now()}`,
    workspaceId: cleanWsId,
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
