import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  findUserByEmail,
  findUserById,
  getMemoryUsers,
  getWorkspacesForUser,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email } = body;

    let targetUser = userId ? findUserById(userId) : null;
    if (!targetUser && email) {
      targetUser = findUserByEmail(email);
    }

    if (!targetUser) {
      // Si l'utilisateur n'existe pas, prendre le premier par défaut
      targetUser = getMemoryUsers()[0];
    }

    const userWorkspaces = getWorkspacesForUser(targetUser.id);
    const primaryWorkspaceId = userWorkspaces[0]?.id || 'ws_nutristore';

    const sessionPayload = JSON.stringify({
      userId: targetUser.id,
      workspaceId: primaryWorkspaceId,
    });

    const res = NextResponse.json({
      success: true,
      data: {
        user: targetUser,
        activeWorkspaceId: primaryWorkspaceId,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, sessionPayload, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
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
