import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { deleteProductFromCatalog } from '@/lib/brandkit';

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getCurrentSession();

    const ok = deleteProductFromCatalog(session.workspace.id, id);
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'Produit introuvable dans ce catalogue' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé du catalogue',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
