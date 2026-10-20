import { NextRequest, NextResponse } from 'next/server';
import {
  createNewWorkspace,
  getCurrentSession,
  getWorkspacesForUser,
} from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }
    const workspaces = getWorkspacesForUser(session.user.id);
    return NextResponse.json({
      success: true,
      data: workspaces,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }
    const body = await req.json();
    const { name, plan } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Le nom de la boutique ou de l\'espace est obligatoire.' },
        { status: 400 }
      );
    }

    const newWs = createNewWorkspace(session.user.id, name, plan || 'flash');

    return NextResponse.json({
      success: true,
      data: newWs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
