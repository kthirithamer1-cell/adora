import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  findUserByEmail,
  findUserById,
  getMemoryUsers,
  getMemoryWorkspaces,
  getWorkspacesForUser,
  registerUserAndWorkspace,
  savePersistedStore,
  syncUserAndWorkspaceToSupabase,
  UserRole,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email } = body;

    let targetUser = userId ? findUserById(userId) : null;
    if (!targetUser && email) {
      const cleanEmail = email.trim().toLowerCase();
      targetUser = findUserByEmail(cleanEmail);
      if (!targetUser) {
        // Crée automatiquement le profil et workspace pour cet email si nouvel utilisateur
        const reg = registerUserAndWorkspace({
          email: cleanEmail,
          name: cleanEmail.split('@')[0],
          shopName: `${cleanEmail.split('@')[0]}'s Store`,
          plan: 'flash',
        });
        targetUser = reg.user;
        await syncUserAndWorkspaceToSupabase(reg.user, reg.workspace);
      }
    }

    if (!targetUser) {
      targetUser = getMemoryUsers()[0];
    }

    const userWorkspaces = getWorkspacesForUser(targetUser.id);
    const activeWorkspace = userWorkspaces[0] || getMemoryWorkspaces()[0];
    if (activeWorkspace && activeWorkspace.creditsRemaining === 0 && (activeWorkspace.plan === 'flash' || (activeWorkspace as any).plan === 'trial')) {
      activeWorkspace.creditsRemaining = 8;
      savePersistedStore();
    }

    // Assurer la présence dans Supabase
    if (targetUser && activeWorkspace) {
      await syncUserAndWorkspaceToSupabase(targetUser, activeWorkspace);
    }
    const member = activeWorkspace?.members?.find((m) => m.userId === targetUser?.id);
    const role: UserRole = member?.role || 'owner';
    const primaryWorkspaceId = activeWorkspace?.id || 'ws_nutristore';

    const sessionPayload = JSON.stringify({
      userId: targetUser.id,
      email: targetUser.email,
      workspaceId: primaryWorkspaceId,
    });

    const res = NextResponse.json({
      success: true,
      data: {
        user: targetUser,
        workspace: activeWorkspace,
        workspaces: userWorkspaces,
        role,
        activeWorkspaceId: primaryWorkspaceId,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, sessionPayload, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
