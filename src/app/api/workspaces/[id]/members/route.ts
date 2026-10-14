import { NextRequest, NextResponse } from 'next/server';
import {
  findWorkspaceById,
  getCurrentSession,
  inviteWorkspaceMember,
  removeWorkspaceMember,
  UserRole,
} from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getCurrentSession();
    const ws = findWorkspaceById(id);

    if (!ws) {
      return NextResponse.json(
        { success: false, error: 'Espace introuvable' },
        { status: 404 }
      );
    }

    const isMember = ws.members.some((m) => m.userId === session.user.id);
    if (!isMember) {
      return NextResponse.json(
        { success: false, error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ws.members,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getCurrentSession();
    const body = await req.json();
    const { email, name, role } = body as {
      email: string;
      name: string;
      role: UserRole;
    };

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Adresse e-mail invalide' },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ['owner', 'manager', 'designer'];
    const chosenRole: UserRole = validRoles.includes(role) ? role : 'designer';

    const result = inviteWorkspaceMember(
      id,
      session.user.id,
      email,
      name || '',
      chosenRole
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.member,
      message: `Invitation envoyée avec succès à ${email} avec le rôle ${chosenRole}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getCurrentSession();
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Identifiant du membre manquant' },
        { status: 400 }
      );
    }

    const result = removeWorkspaceMember(id, session.user.id, targetUserId);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Membre retiré de l\'équipe avec succès.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
