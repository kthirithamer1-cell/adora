import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { addClientBrandToAgency, removeClientBrandFromAgency } from '@/lib/agency';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { name, niche, logoUrl, creditsAllocated } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Le nom de la marque client est obligatoire' },
        { status: 400 }
      );
    }

    const created = addClientBrandToAgency(session.workspace.id, {
      name: name.trim(),
      niche: niche?.trim() || 'Général',
      logoUrl: logoUrl?.trim() || '',
      creditsAllocated: Number(creditsAllocated) || 30,
      status: 'active',
    });

    return NextResponse.json({
      success: true,
      data: created,
      message: `Marque cliente "${created.name}" ajoutée avec succès.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get('id');

    if (!brandId) {
      return NextResponse.json(
        { success: false, error: 'Identifiant de marque manquant' },
        { status: 400 }
      );
    }

    const ok = removeClientBrandFromAgency(session.workspace.id, brandId);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Marque introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Marque cliente retirée avec succès.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
