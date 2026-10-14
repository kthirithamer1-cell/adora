import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getAgencyConfig, updateAgencyConfig } from '@/lib/agency';

export async function GET() {
  try {
    const session = await getCurrentSession();
    const config = getAgencyConfig(session.workspace.id);
    return NextResponse.json({
      success: true,
      data: config,
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
    if (session.role !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Seul le propriétaire peut modifier les paramètres Agence.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = updateAgencyConfig(session.workspace.id, body);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Configuration Agence mise à jour avec succès.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
