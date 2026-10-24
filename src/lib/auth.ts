import { cookies } from 'next/headers';
import { supabase, resolveWorkspaceUuid } from '@/lib/supabase';

export function generateUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export type UserRole = 'owner' | 'manager' | 'designer';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  storeUrl?: string;
  niche?: string;
  adChannels?: string[];
  monthlyVolumeTier?: string;
  monthlyAdSpendTier?: string;
  leadScore?: 'HOT' | 'WARM' | 'STANDARD';
  emailVerified?: boolean;
  brandKit?: {
    logoUrl?: string;
    primaryColor?: string;
    slogan?: string;
    instagramHandle?: string;
    brandPositioning?: string;
  };
  createdAt: string;
}

export interface WorkspaceMember {
  userId: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: 'flash' | 'pro' | 'agency';
  creditsRemaining: number;
  whiteLabelEnabled: boolean;
  niche?: string;
  storeUrl?: string;
  brandKit?: {
    logoUrl?: string;
    primaryColor?: string;
    slogan?: string;
    instagramHandle?: string;
    brandPositioning?: string;
  };
  members: WorkspaceMember[];
  createdAt: string;
}

export interface SessionData {
  user: User;
  workspace: Workspace;
  workspaces: Workspace[];
  role: UserRole;
}

// Données initiales multi-tenant pour les boutiques e-commerce tunisiennes
export const INITIAL_USERS: User[] = [
  {
    id: 'user_mohamed',
    email: 'mohamed@nutristore.tn',
    name: 'Mohamed Ben Salah',
    phone: '+216 98 123 456',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'user_syrine',
    email: 'syrine@nutristore.tn',
    name: 'Syrine Trabelsi',
    phone: '+216 22 789 012',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
    createdAt: '2026-02-01T12:00:00Z',
  },
  {
    id: 'user_yassine',
    email: 'yassine@crea.tn',
    name: 'Yassine Jaziri',
    phone: '+216 55 456 789',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    createdAt: '2026-02-10T14:30:00Z',
  },
  {
    id: 'user_agence',
    email: 'contact@hypergrowth.tn',
    name: 'Karim Gharbi (HyperGrowth Agency)',
    phone: '+216 71 888 999',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    createdAt: '2026-01-05T09:00:00Z',
  },
];

export const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    name: 'NutriStore Tunisie',
    slug: 'nutristore-tn',
    ownerId: 'user_mohamed',
    plan: 'pro',
    creditsRemaining: 20,
    whiteLabelEnabled: false,
    members: [
      {
        userId: 'user_mohamed',
        userEmail: 'mohamed@nutristore.tn',
        userName: 'Mohamed Ben Salah',
        role: 'owner',
        joinedAt: '2026-01-15T10:00:00Z',
      },
    ],
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'f8c0d4b2-3e5f-4a6b-9c7d-0e1f2a3b4c5d',
    name: "kthirithamer1's Store",
    slug: 'kthirithamer1-s-store',
    ownerId: 'e7b9c3a1-2d4e-4f5a-8b6c-9d0e1f2a3b4c',
    plan: 'flash',
    creditsRemaining: 19,
    whiteLabelEnabled: false,
    members: [
      {
        userId: 'e7b9c3a1-2d4e-4f5a-8b6c-9d0e1f2a3b4c',
        userEmail: 'kthirithamer1@gmail.com',
        userName: 'kthirithamer1',
        role: 'owner',
        joinedAt: '2026-10-23T10:14:03Z',
      },
    ],
    createdAt: '2026-10-23T10:14:03Z',
  },
  {
    id: 'a71a24d6-cf47-4f34-acd9-65c6b07504bb',
    name: 'Ma boutique',
    slug: 'ma-boutique-zsnw',
    ownerId: '706a92f7-a9a9-41ad-8be2-3687b0756c62',
    plan: 'flash',
    creditsRemaining: 5,
    whiteLabelEnabled: false,
    members: [
      {
        userId: '706a92f7-a9a9-41ad-8be2-3687b0756c62',
        userEmail: 'kthirithamer2@gmail.com',
        userName: 'kthirithamer2',
        role: 'owner',
        joinedAt: '2026-10-23T10:14:08Z',
      },
    ],
    createdAt: '2026-10-23T10:14:08Z',
  },
  {
    id: 'd48096a0-a964-46cd-bb0e-2e6c3527ae66',
    name: 'Ma boutique',
    slug: 'ma-boutique-7ups',
    ownerId: 'ede12ede-d51e-46c5-b2f2-2dea33d35674',
    plan: 'flash',
    creditsRemaining: 5,
    whiteLabelEnabled: false,
    members: [
      {
        userId: 'ede12ede-d51e-46c5-b2f2-2dea33d35674',
        userEmail: 'thamer.kthiri2@gmail.com',
        userName: 'thamer.kthiri2',
        role: 'owner',
        joinedAt: '2026-10-24T22:12:25Z',
      },
    ],
    createdAt: '2026-10-24T22:12:25Z',
  },
];



// Stockage mémoire persistant en cours d'exécution (préservé sur globalThis et synchronisé sur disque)
const globalForAuth = globalThis as unknown as {
  __markmosaiq_memoryUsers?: User[];
  __markmosaiq_memoryWorkspaces?: Workspace[];
};

const STORE_FILE = 'markmosaiq_auth_store.json';

function getStoreFilePath(): string | null {
  if (typeof window !== 'undefined') return null;
  try {
    const p = require('path');
    return p.join(process.cwd(), '.next', STORE_FILE);
  } catch {
    return null;
  }
}

function loadPersistedStore(): { users: User[]; workspaces: Workspace[] } | null {
  const filePath = getStoreFilePath();
  if (!filePath) return null;
  try {
    const fs = require('fs');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (Array.isArray(data.users) && Array.isArray(data.workspaces)) {
        return data;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export function savePersistedStore(): void {
  const filePath = getStoreFilePath();
  if (!filePath) return;
  try {
    const fs = require('fs');
    const p = require('path');
    const dir = p.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(
      filePath,
      JSON.stringify(
        {
          users: globalForAuth.__markmosaiq_memoryUsers || [],
          workspaces: globalForAuth.__markmosaiq_memoryWorkspaces || [],
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch {
    // ignore
  }
}

const persisted = loadPersistedStore();

if (persisted?.users && persisted.users.length > 0) {
  globalForAuth.__markmosaiq_memoryUsers = persisted.users;
} else if (!globalForAuth.__markmosaiq_memoryUsers) {
  globalForAuth.__markmosaiq_memoryUsers = [...INITIAL_USERS];
}

if (persisted?.workspaces && persisted.workspaces.length > 0) {
  globalForAuth.__markmosaiq_memoryWorkspaces = persisted.workspaces;
} else if (!globalForAuth.__markmosaiq_memoryWorkspaces) {
  globalForAuth.__markmosaiq_memoryWorkspaces = [...INITIAL_WORKSPACES];
}

// Synchronisation en arrière-plan des comptes utilisateurs vers Supabase
if (typeof window === 'undefined') {
  Promise.resolve().then(async () => {
    try {
      const usersToSync = (globalForAuth.__markmosaiq_memoryUsers || []).filter(
        (u) => u.email === 'kthirithamer1@gmail.com' || (u.id && u.id.includes('-'))
      );
      for (const u of usersToSync) {
        const wsList = (globalForAuth.__markmosaiq_memoryWorkspaces || []).filter((w) =>
          w.members.some((m) => m.userId === u.id || m.userEmail === u.email)
        );
        for (const ws of wsList) {
          await syncUserAndWorkspaceToSupabase(u, ws);
        }
      }
    } catch {
      // Background sync catch
    }
  });
}

const memoryUsers: User[] = globalForAuth.__markmosaiq_memoryUsers;
const memoryWorkspaces: Workspace[] = globalForAuth.__markmosaiq_memoryWorkspaces;

export const SESSION_COOKIE_NAME = 'MarkMosaiq_session';

export function getMemoryUsers(): User[] {
  return memoryUsers;
}

export function getMemoryWorkspaces(): Workspace[] {
  return memoryWorkspaces;
}

export function findUserById(id: string): User | undefined {
  return memoryUsers.find(
    (u) =>
      u.id === id ||
      (id === 'e7b9c3a1-2d4e-4f5a-8b6c-9d0e1f2a3b4c' && u.id === 'user_1792499208798_9wn0') ||
      (id === 'user_1792499208798_9wn0' && u.id === 'e7b9c3a1-2d4e-4f5a-8b6c-9d0e1f2a3b4c')
  );
}

export function findUserByEmail(email: string): User | undefined {
  return memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findWorkspaceById(id: string): Workspace | undefined {
  if (id === 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22') {
    return memoryWorkspaces.find((w) => w.id === 'ws_nutristore' || w.id === id);
  }
  if (id === 'f8c0d4b2-3e5f-4a6b-9c7d-0e1f2a3b4c5d' || id === 'ws_1792499208803_hvs5') {
    return memoryWorkspaces.find((w) => w.id === 'ws_1792499208803_hvs5' || w.id === 'f8c0d4b2-3e5f-4a6b-9c7d-0e1f2a3b4c5d');
  }
  return memoryWorkspaces.find((w) => w.id === id);
}

export function getWorkspacesForUser(userId: string): Workspace[] {
  return memoryWorkspaces.filter((w) =>
    w.members.some(
      (m) =>
        m.userId === userId ||
        (userId === 'e7b9c3a1-2d4e-4f5a-8b6c-9d0e1f2a3b4c' && m.userId === 'user_1792499208798_9wn0') ||
        (userId === 'user_1792499208798_9wn0' && m.userId === 'e7b9c3a1-2d4e-4f5a-8b6c-9d0e1f2a3b4c')
    )
  );
}

function pickRows(res: any): any[] {
  return Array.isArray(res) ? res : res?.data || [];
}

/**
 * Charge les workspaces d'un utilisateur depuis Supabase (source de vérité en déploiement)
 * et les injecte dans la mémoire de l'instance serverless courante.
 */
export async function hydrateWorkspacesFromSupabase(user: User): Promise<Workspace[]> {
  try {
    const rows = pickRows(
      await supabase.from('workspaces').select('*').eq('owner_id', user.id).limit(20)
    );
    for (const w of rows) {
      if (!w?.id || findWorkspaceById(w.id)) continue;
      memoryWorkspaces.push({
        id: w.id,
        name: w.name || `${user.name}'s Store`,
        slug: w.slug || w.id,
        ownerId: w.owner_id,
        plan: w.plan === 'agency' ? 'agency' : w.plan === 'pro' ? 'pro' : 'flash',
        creditsRemaining: typeof w.credits_remaining === 'number' ? w.credits_remaining : 0,
        whiteLabelEnabled: w.plan === 'agency',
        members: [
          {
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            role: 'owner',
            joinedAt: w.created_at || new Date().toISOString(),
          },
        ],
        createdAt: w.created_at || new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('[hydrateWorkspacesFromSupabase]:', err);
  }
  return getWorkspacesForUser(user.id);
}

/**
 * Retrouve un utilisateur existant dans Supabase (par id puis par email).
 * Ne crée JAMAIS de nouveau compte : évite les doublons à 10 crédits sur Vercel.
 */
export async function hydrateUserFromSupabase(
  userId: string | null,
  userEmail: string | null
): Promise<User | undefined> {
  try {
    let rows: any[] = [];
    if (userId) {
      rows = pickRows(await supabase.from('users').select('*').eq('id', userId).limit(1));
    }
    if (rows.length === 0 && userEmail) {
      rows = pickRows(
        await supabase.from('users').select('*').eq('email', userEmail.trim().toLowerCase()).limit(1)
      );
    }
    const u = rows[0];
    if (!u?.id) return undefined;

    const existing = findUserById(u.id) || findUserByEmail(u.email);
    if (existing) return existing;

    const user: User = {
      id: u.id,
      email: u.email,
      name: u.full_name || String(u.email).split('@')[0],
      phone: u.phone || undefined,
      avatarUrl: u.avatar_url || undefined,
      createdAt: u.created_at || new Date().toISOString(),
    };
    memoryUsers.push(user);
    await hydrateWorkspacesFromSupabase(user);
    return user;
  } catch (err) {
    console.warn('[hydrateUserFromSupabase]:', err);
    return undefined;
  }
}

export async function getCurrentSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie || !sessionCookie.trim()) {
      return null;
    }

    let userId: string | null = null;
    let userEmail: string | null = null;
    let activeWorkspaceId: string | null = null;

    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed.userId) userId = parsed.userId;
      if (parsed.email) userEmail = parsed.email;
      if (parsed.workspaceId) activeWorkspaceId = parsed.workspaceId;
    } catch {
      return null;
    }

    if (!userId && !userEmail) {
      return null;
    }

    let user = userId ? findUserById(userId) : null;
    if (!user && userEmail) {
      user = findUserByEmail(userEmail);
    }
    // Instance serverless « froide » (Vercel) : réhydrater depuis Supabase au lieu de créer un doublon
    if (!user) {
      user = (await hydrateUserFromSupabase(userId, userEmail)) || null;
    }

    if (!user) {
      return null;
    }

    let userWorkspaces = getWorkspacesForUser(user.id);
    if (userWorkspaces.length === 0) {
      userWorkspaces = await hydrateWorkspacesFromSupabase(user);
    }
    let activeWorkspace = userWorkspaces.find((w) => w.id === activeWorkspaceId);

    if (!activeWorkspace) {
      activeWorkspace = userWorkspaces[0];
    }
    if (!activeWorkspace) {
      return null;
    }

    // Synchronisation en direct depuis Supabase Cloud pour la persistance en déploiement
    if (activeWorkspace) {
      try {
        const cleanWsId = resolveWorkspaceUuid(activeWorkspace.id);
        const sbWs = await supabase
          .from('workspaces')
          .select('credits_remaining, plan')
          .eq('id', cleanWsId)
          .limit(1);
        const wsRows = Array.isArray(sbWs) ? sbWs : sbWs?.data || [];
        if (wsRows.length > 0 && typeof wsRows[0]?.credits_remaining === 'number') {
          activeWorkspace.creditsRemaining = wsRows[0].credits_remaining;
          if (wsRows[0].plan) activeWorkspace.plan = wsRows[0].plan;
        }
      } catch {
        // Fallback sur le solde mémoire si Supabase est temporairement inaccessible
      }
    }

    const member = activeWorkspace?.members?.find((m) => m.userId === user.id);
    const role: UserRole = member?.role || 'owner';

    return {
      user,
      workspace: activeWorkspace,
      workspaces: userWorkspaces,
      role,
    };
  } catch (err) {
    console.warn('getCurrentSession fallback:', err);
    return null;
  }
}


export function inviteWorkspaceMember(
  workspaceId: string,
  actorUserId: string,
  email: string,
  name: string,
  role: UserRole
): { success: boolean; member?: WorkspaceMember; error?: string } {
  const ws = findWorkspaceById(workspaceId);
  if (!ws) return { success: false, error: 'Espace de travail introuvable' };

  // Vérification des droits (seul Owner ou Manager peut inviter)
  const actorMember = ws.members.find((m) => m.userId === actorUserId);
  if (!actorMember || (actorMember.role !== 'owner' && actorMember.role !== 'manager')) {
    return { success: false, error: 'Permission refusée. Seul le propriétaire ou le manager peut inviter des membres.' };
  }

  let targetUser = findUserByEmail(email);
  if (!targetUser) {
    targetUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: email.trim().toLowerCase(),
      name: name.trim() || email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    memoryUsers.push(targetUser);
  }

  const existingMemberIndex = ws.members.findIndex((m) => m.userId === targetUser?.id);
  const newMember: WorkspaceMember = {
    userId: targetUser.id,
    userEmail: targetUser.email,
    userName: targetUser.name,
    role,
    joinedAt: new Date().toISOString(),
  };

  if (existingMemberIndex >= 0) {
    ws.members[existingMemberIndex] = newMember;
  } else {
    ws.members.push(newMember);
  }

  return { success: true, member: newMember };
}

export function removeWorkspaceMember(
  workspaceId: string,
  actorUserId: string,
  targetUserId: string
): { success: boolean; error?: string } {
  const ws = findWorkspaceById(workspaceId);
  if (!ws) return { success: false, error: 'Espace de travail introuvable' };

  const actorMember = ws.members.find((m) => m.userId === actorUserId);
  if (!actorMember || actorMember.role !== 'owner') {
    return { success: false, error: 'Seul le propriétaire peut retirer un membre de l\'équipe.' };
  }

  if (targetUserId === ws.ownerId) {
    return { success: false, error: 'Impossible de retirer le propriétaire principal de l\'espace.' };
  }

  ws.members = ws.members.filter((m) => m.userId !== targetUserId);
  return { success: true };
}

export function createNewWorkspace(
  userId: string,
  name: string,
  plan: 'flash' | 'pro' | 'agency' = 'flash'
): Workspace {
  const user = findUserById(userId) || memoryUsers[0];
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const credits = plan === 'agency' ? 120 : plan === 'pro' ? 50 : 20;

  const newWs: Workspace = {
    id: `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: name.trim(),
    slug,
    ownerId: user.id,
    plan,
    creditsRemaining: credits,
    whiteLabelEnabled: plan === 'agency',
    members: [
      {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        role: 'owner',
        joinedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  };

  memoryWorkspaces.push(newWs);
  return newWs;
}

// Gestion des codes de vérification OTP par email avec limitation des tentatives
interface EmailVerificationEntry {
  email: string;
  code: string;
  attempts: number;
  locked: boolean;
  expiresAt: number;
}
const memoryVerificationCodes: Map<string, EmailVerificationEntry> = new Map();

export function generateEmailVerificationCode(email: string): string {
  const cleanEmail = email.trim().toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  memoryVerificationCodes.set(cleanEmail, {
    email: cleanEmail,
    code,
    attempts: 0,
    locked: false,
    expiresAt: Date.now() + 10 * 60 * 1000, // Valide 10 minutes (MM-106)
  });
  return code;
}

export interface VerifyOtpResult {
  valid: boolean;
  locked?: boolean;
  expired?: boolean;
  error?: string;
}

export function verifyEmailCodeDetailed(email: string, code: string): VerifyOtpResult {
  const cleanEmail = email.trim().toLowerCase();
  const entry = memoryVerificationCodes.get(cleanEmail);
  const inputCode = code.trim();

  // Mode Dev / Sandbox : accepté UNIQUEMENT hors production si OTP_DEV_BYPASS est activé (AC4)
  const isDevBypassAllowed =
    process.env.NODE_ENV !== 'production' &&
    (process.env.OTP_DEV_BYPASS === 'true' || process.env.NEXT_PUBLIC_OTP_DEV_BYPASS === 'true');

  if (isDevBypassAllowed && inputCode === '123456') {
    return { valid: true };
  }

  if (!entry) {
    return { valid: false, error: 'Code introuvable. Veuillez demander un nouveau code.' };
  }

  if (entry.locked || entry.attempts >= 5) {
    return { valid: false, locked: true, error: 'Code verrouillé après 5 tentatives infructueuses.' };
  }

  if (Date.now() > entry.expiresAt) {
    memoryVerificationCodes.delete(cleanEmail);
    return { valid: false, expired: true, error: 'Ce code a expiré. Veuillez en générer un nouveau.' };
  }

  if (entry.code === inputCode) {
    memoryVerificationCodes.delete(cleanEmail);
    return { valid: true };
  }

  // Incrémenter les tentatives ratées
  entry.attempts += 1;
  if (entry.attempts >= 5) {
    entry.locked = true;
    return { valid: false, locked: true, error: 'Code verrouillé après 5 tentatives infructueuses.' };
  }

  return { valid: false, error: `Code incorrect (${5 - entry.attempts} essai(s) restant(s)).` };
}

export function verifyEmailCode(email: string, code: string): boolean {
  return verifyEmailCodeDetailed(email, code).valid;
}

export function registerUserAndWorkspace(params: {
  name: string;
  email: string;
  phone?: string;
  shopName?: string;
  storeUrl?: string;
  niche?: string;
  logoUrl?: string;
  primaryColor?: string;
  slogan?: string;
  instagramHandle?: string;
  brandPositioning?: string;
  adChannels?: string[];
  monthlyVolumeTier?: string;
  monthlyAdSpendTier?: string;
  plan?: 'flash' | 'pro' | 'agency' | 'trial';
}): { user: User; workspace: Workspace } {
  const {
    name,
    email,
    phone,
    shopName,
    storeUrl,
    niche = 'general',
    logoUrl,
    primaryColor = '#6366F1',
    slogan,
    instagramHandle,
    brandPositioning = 'modern',
    adChannels = ['meta'],
    monthlyVolumeTier = '6-25',
    monthlyAdSpendTier = '1k-5k',
    plan = 'trial',
  } = params;
  const cleanEmail = email.trim().toLowerCase();

  // Automatic Lead Scoring
  let leadScore: 'HOT' | 'WARM' | 'STANDARD' = 'STANDARD';
  if (
    monthlyAdSpendTier === '5k-20k' ||
    monthlyAdSpendTier === '20k+' ||
    monthlyVolumeTier === '50+'
  ) {
    leadScore = 'HOT';
  } else if (
    monthlyAdSpendTier === '1k-5k' ||
    monthlyVolumeTier === '26-50' ||
    monthlyVolumeTier === '6-25'
  ) {
    leadScore = 'WARM';
  }

  const brandKitData = {
    logoUrl: logoUrl || '/images/logo.png',
    primaryColor: primaryColor || '#6366F1',
    slogan: slogan || '',
    instagramHandle: instagramHandle || '',
    brandPositioning,
  };

  let user = findUserByEmail(cleanEmail);
  if (!user) {
    user = {
      id: generateUuid(),
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0],
      phone: phone?.trim(),
      storeUrl: storeUrl?.trim(),
      niche,
      adChannels,
      monthlyVolumeTier,
      monthlyAdSpendTier,
      leadScore,
      emailVerified: true,
      brandKit: brandKitData,
      createdAt: new Date().toISOString(),
    };
    memoryUsers.push(user);
  } else {
    user.storeUrl = storeUrl?.trim() || user.storeUrl;
    user.niche = niche || user.niche;
    user.adChannels = adChannels || user.adChannels;
    user.monthlyVolumeTier = monthlyVolumeTier || user.monthlyVolumeTier;
    user.monthlyAdSpendTier = monthlyAdSpendTier || user.monthlyAdSpendTier;
    user.leadScore = leadScore;
    user.emailVerified = true;
    user.brandKit = brandKitData;

    // Vérifier si l'utilisateur possède déjà un workspace existant
    const existingWorkspaces = getWorkspacesForUser(user.id);
    if (existingWorkspaces.length > 0) {
      const activeWs = existingWorkspaces[0];
      return { user, workspace: activeWs };
    }
  }

  const wsName = shopName?.trim() || `${user.name}'s Store`;
  const baseSlug = wsName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'store';
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
  // Les nouveaux espaces démarrent à 0 crédit avant l'octroi officiel de l'essai ou du pack
  const initialCredits = 0;
  const dbPlan: 'flash' | 'pro' | 'agency' = plan === 'agency' ? 'agency' : plan === 'pro' ? 'pro' : 'flash';

  const newWs: Workspace = {
    id: generateUuid(),
    name: wsName,
    slug,
    ownerId: user.id,
    plan: dbPlan,
    creditsRemaining: initialCredits,
    whiteLabelEnabled: dbPlan === 'agency',
    niche,
    storeUrl: storeUrl?.trim(),
    brandKit: brandKitData,
    members: [
      {
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        role: 'owner',
        joinedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  };

  memoryWorkspaces.unshift(newWs);
  savePersistedStore();
  return { user, workspace: newWs };
}

/**
 * Synchronise un utilisateur et son workspace dans Supabase (PostgreSQL public.users et public.workspaces)
 */
export async function syncUserAndWorkspaceToSupabase(
  user: User,
  workspace: Workspace
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Sync User into public.users
    const userRes = await supabase.from('users').upsert(
      {
        id: user.id,
        email: user.email.toLowerCase(),
        full_name: user.name,
        phone: user.phone || null,
        avatar_url: user.avatarUrl || null,
      },
      'id'
    );

    if (userRes?.error) {
      console.warn('[Supabase Sync User Notice]:', userRes.error);
    }

    // 2. Sync Workspace into public.workspaces
    const dbPlan =
      workspace.plan === 'agency' ? 'agency' : workspace.plan === 'pro' ? 'pro' : 'flash';
    const wsRes = await supabase.from('workspaces').upsert(
      {
        id: workspace.id,
        owner_id: user.id,
        name: workspace.name,
        slug: workspace.slug,
        plan: dbPlan,
        credits_remaining: workspace.creditsRemaining,
      },
      'id'
    );

    if (wsRes?.error) {
      console.warn('[Supabase Sync Workspace Notice]:', wsRes.error);
    }

    // 3. Sync BrandKit if present
    const bk = workspace.brandKit || user.brandKit;
    if (bk) {
      await supabase
        .from('brand_kits')
        .upsert(
          {
            workspace_id: workspace.id,
            shop_name: workspace.name,
            logo_url: bk.logoUrl || '/images/logo.png',
            primary_color: bk.primaryColor || '#00E5FF',
            slogan_fr: bk.slogan || '',
            instagram_handle: bk.instagramHandle || '',
          },
          'workspace_id'
        )
        .catch(() => null);
    }

    return { success: true };
  } catch (err: any) {
    console.warn('[syncUserAndWorkspaceToSupabase error]:', err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Récupère l'utilisateur actuellement authentifié et son workspace actif.
 * Lève une exception si l'utilisateur n'est pas connecté.
 */
export async function requireUser(): Promise<User & {
  workspaceId: string;
  workspaceName: string;
  creditsRemaining: number;
  plan: 'flash' | 'pro' | 'agency';
  subscriptionStatus: 'active' | 'inactive';
}> {
  const session = await getCurrentSession();
  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const workspaceUuid =
    session.workspace.id === 'ws_nutristore'
      ? 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'
      : session.workspace.id === 'ws_1792499208803_hvs5'
      ? 'f8c0d4b2-3e5f-4a6b-9c7d-0e1f2a3b4c5d'
      : session.workspace.id;

  const userUuid =
    session.user.id === 'user_mohamed'
      ? 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
      : session.user.id === 'user_1792499208798_9wn0'
      ? 'e7b9c3a1-2d4e-4f5a-8b6c-9d0e1f2a3b4c'
      : session.user.id;

  return {
    ...session.user,
    id: userUuid,
    workspaceId: workspaceUuid,
    workspaceName: session.workspace.name,
    creditsRemaining: session.workspace.creditsRemaining,
    plan: session.workspace.plan,
    subscriptionStatus: session.workspace.creditsRemaining > 0 ? 'active' : 'inactive',
  };
}

