import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getSocialAccounts, toggleAccountConnection } from '@/lib/social';

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ success: true, data: [] });
    }
    const accounts = getSocialAccounts(session.workspace.id);
    return NextResponse.json({
      success: true,
      data: accounts,
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
    const { platform } = body;

    const accounts = toggleAccountConnection(session.workspace.id, platform);

    return NextResponse.json({
      success: true,
      data: accounts,
      message: `Compte ${platform} mis à jour.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
