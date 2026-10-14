import { cookies } from 'next/headers';

export type UserRole = 'owner' | 'manager' | 'designer';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
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
    id: 'ws_nutristore',
    name: 'NutriStore Tunisie',
    slug: 'nutristore-tn',
    ownerId: 'user_mohamed',
    plan: 'pro',
    creditsRemaining: 20, // Pack Pro standard : 20 crédits pour 59 DT (marge brute 78.8%)
    whiteLabelEnabled: false,
    members: [
      {
        userId: 'user_mohamed',
        userEmail: 'mohamed@nutristore.tn',
        userName: 'Mohamed Ben Salah',
        role: 'owner',
        joinedAt: '2026-01-15T10:00:00Z',
      },
      {
        userId: 'user_syrine',
        userEmail: 'syrine@nutristore.tn',
        userName: 'Syrine Trabelsi',
        role: 'manager',
        joinedAt: '2026-02-01T12:00:00Z',
      },
      {
        userId: 'user_yassine',
        userEmail: 'yassine@crea.tn',
        userName: 'Yassine Jaziri',
        role: 'designer',
        joinedAt: '2026-02-10T14:30:00Z',
      },
    ],
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'ws_hypergrowth',
    name: 'HyperGrowth Agence Digitale',
    slug: 'hypergrowth-agency',
    ownerId: 'user_agence',
    plan: 'agency',
    creditsRemaining: 100, // Abonnement Agence : 100 crédits/mois pour 299 DT (marge brute 79.1%)
    whiteLabelEnabled: true,
    members: [
      {
        userId: 'user_agence',
        userEmail: 'contact@hypergrowth.tn',
        userName: 'Karim Gharbi (HyperGrowth Agency)',
        role: 'owner',
        joinedAt: '2026-01-05T09:00:00Z',
      },
      {
        userId: 'user_yassine',
        userEmail: 'yassine@crea.tn',
        userName: 'Yassine Jaziri',
        role: 'designer',
        joinedAt: '2026-01-10T11:00:00Z',
      },
    ],
    createdAt: '2026-01-05T09:00:00Z',
  },
  {
    id: 'ws_vestiaire',
    name: 'Vestiaire Tunis (Client Agence)',
    slug: 'vestiaire-tunis',
    ownerId: 'user_agence',
    plan: 'agency',
    creditsRemaining: 50,
    whiteLabelEnabled: true,
    members: [
      {
        userId: 'user_agence',
        userEmail: 'contact@hypergrowth.tn',
        userName: 'Karim Gharbi (HyperGrowth Agency)',
        role: 'owner',
        joinedAt: '2026-01-20T10:00:00Z',
      },
    ],
    createdAt: '2026-01-20T10:00:00Z',
  },
];

// Stockage mémoire persistant en cours d'exécution
let memoryUsers: User[] = [...INITIAL_USERS];
let memoryWorkspaces: Workspace[] = [...INITIAL_WORKSPACES];

export const SESSION_COOKIE_NAME = 'adora_session';

export function getMemoryUsers(): User[] {
  return memoryUsers;
}

export function getMemoryWorkspaces(): Workspace[] {
  return memoryWorkspaces;
}

export function findUserById(id: string): User | undefined {
  return memoryUsers.find((u) => u.id === id);
}

export function findUserByEmail(email: string): User | undefined {
  return memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findWorkspaceById(id: string): Workspace | undefined {
  return memoryWorkspaces.find((w) => w.id === id);
}

export function getWorkspacesForUser(userId: string): Workspace[] {
  return memoryWorkspaces.filter((w) =>
    w.members.some((m) => m.userId === userId)
  );
}

export async function getCurrentSession(): Promise<SessionData> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  let userId = 'user_mohamed';
  let activeWorkspaceId = 'ws_nutristore';

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed.userId) userId = parsed.userId;
      if (parsed.workspaceId) activeWorkspaceId = parsed.workspaceId;
    } catch {
      // Cookie corrompu, fallback sur le compte par défaut
    }
  }

  let user = findUserById(userId);
  if (!user) {
    user = memoryUsers[0];
    userId = user.id;
  }

  const userWorkspaces = getWorkspacesForUser(userId);
  let activeWorkspace = userWorkspaces.find((w) => w.id === activeWorkspaceId);

  if (!activeWorkspace) {
    activeWorkspace = userWorkspaces[0] || memoryWorkspaces[0];
  }

  const member = activeWorkspace.members.find((m) => m.userId === userId);
  const role: UserRole = member?.role || 'owner';

  return {
    user,
    workspace: activeWorkspace,
    workspaces: userWorkspaces,
    role,
  };
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
  const credits = plan === 'agency' ? 200 : plan === 'pro' ? 20 : 10;

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

export function registerUserAndWorkspace(params: {
  name: string;
  email: string;
  phone?: string;
  shopName?: string;
  plan?: 'flash' | 'pro' | 'agency' | 'trial';
}): { user: User; workspace: Workspace } {
  const { name, email, phone, shopName, plan = 'trial' } = params;
  const cleanEmail = email.trim().toLowerCase();
  
  let user = findUserByEmail(cleanEmail);
  if (!user) {
    user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      name: name.trim() || cleanEmail.split('@')[0],
      phone: phone?.trim(),
      createdAt: new Date().toISOString(),
    };
    memoryUsers.push(user);
  }

  const wsName = shopName?.trim() || `${user.name}'s Boutique`;
  const slug = wsName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  // Free trial gets 3 free visuals / credits
  const credits = plan === 'trial' ? 3 : plan === 'agency' ? 200 : plan === 'pro' ? 20 : 10;

  const newWs: Workspace = {
    id: `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: wsName,
    slug,
    ownerId: user.id,
    plan: plan === 'trial' ? 'flash' : plan,
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

  memoryWorkspaces.unshift(newWs);
  return { user, workspace: newWs };
}

