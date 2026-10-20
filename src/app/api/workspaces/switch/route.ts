import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  findWorkspaceById,
  getCurrentSession,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }
    const body = await req.json();
    const { workspaceId } = body;

    const targetWs = findWorkspaceById(workspaceId);
    if (!targetWs) {
      return NextResponse.json(
        { success: false, error: 'Espace de travail introuvable' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur est membre
    const isMember = targetWs.members.some((m) => m.userId === session.user.id);
    if (!isMember) {
      return NextResponse.json(
        { success: false, error: 'Vous n\'êtes pas membre de cet espace de travail' },
        { status: 403 }
      );
    }

    const newSessionPayload = JSON.stringify({
      userId: session.user.id,
      workspaceId: targetWs.id,
    });

    const res = NextResponse.json({
      success: true,
      data: {
        activeWorkspace: targetWs,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, newSessionPayload, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
