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
import { supabase, resolveWorkspaceUuid } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email } = body;

    console.log('[AUTH LOGIN ATTEMPT]:', { email, userId, timestamp: new Date().toISOString() });

    let targetUser = userId ? findUserById(userId) : null;
    if (!targetUser && email) {
      const cleanEmail = email.trim().toLowerCase();
      targetUser = findUserByEmail(cleanEmail);

      // Si l'utilisateur n'est pas encore dans la mémoire du serveur (ex: redémarrage ou instance Vercel différente), vérifier Supabase
      if (!targetUser) {
        try {
          const sbUsers = await supabase
            .from('users')
            .select('*')
            .eq('email', cleanEmail)
            .limit(1);
          const rows = Array.isArray(sbUsers) ? sbUsers : sbUsers?.data || [];
          if (rows.length > 0 && rows[0]?.id) {
            const u = rows[0];
            targetUser = {
              id: u.id,
              email: u.email,
              name: u.full_name || cleanEmail.split('@')[0],
              phone: u.phone || undefined,
              avatarUrl: u.avatar_url || undefined,
              createdAt: u.created_at || new Date().toISOString(),

            };
            getMemoryUsers().push(targetUser);
            console.log('[AUTH LOGIN SUCCESS - Hydrated from Supabase]:', targetUser.email);
          }
        } catch (sbErr) {
          console.warn('[AUTH LOGIN SUPABASE ERROR]:', sbErr);
        }
      }

      // Si l'utilisateur n'existe ni en local ni dans Supabase : REJET FORMEL (Erreur 404)
      if (!targetUser) {
        console.warn(`[AUTH LOGIN REJECTED]: Aucun compte trouvé pour l'email "${cleanEmail}"`);
        return NextResponse.json(
          {
            success: false,
            error: `Aucun compte associé à l'adresse "${cleanEmail}". Veuillez vérifier votre saisie ou créer un compte.`,
            code: 'USER_NOT_FOUND',
          },
          { status: 404 }
        );
      }
    }

    if (!targetUser) {
      console.warn('[AUTH LOGIN REJECTED]: Aucun identifiant ou email fourni.');
      return NextResponse.json(
        {
          success: false,
          error: 'Adresse email ou identifiant utilisateur requis pour se connecter.',
          code: 'MISSING_CREDENTIALS',
        },
        { status: 400 }
      );
    }

    console.log(`[AUTH LOGIN SUCCESS]: Session ouverte pour "${targetUser.email}" (${targetUser.id})`);

    let userWorkspaces = getWorkspacesForUser(targetUser.id);
    if (userWorkspaces.length === 0) {
      try {
        const sbWs = await supabase
          .from('workspaces')
          .select('*')
          .eq('owner_id', targetUser.id)
          .limit(1);
        const wsRows = Array.isArray(sbWs) ? sbWs : sbWs?.data || [];
        if (wsRows.length > 0 && wsRows[0]?.id) {
          const w = wsRows[0];
          const restoredWs = {
            id: w.id,
            name: w.name,
            slug: w.slug,
            ownerId: w.owner_id,
            plan: w.plan || 'flash',
            creditsRemaining: w.credits_remaining ?? 10,
            whiteLabelEnabled: false,
            members: [
              {
                userId: targetUser.id,
                userEmail: targetUser.email,
                userName: targetUser.name,
                role: 'owner' as const,
                joinedAt: w.created_at || new Date().toISOString(),
              },
            ],
            createdAt: w.created_at || new Date().toISOString(),
          };
          getMemoryWorkspaces().push(restoredWs as any);
          userWorkspaces = [restoredWs as any];
        }
      } catch {
        // Fallback
      }
    }

    const activeWorkspace = userWorkspaces[0] || getMemoryWorkspaces()[0];
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
        // Fallback sur le solde mémoire si Supabase est temporairement indisponible
      }
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
