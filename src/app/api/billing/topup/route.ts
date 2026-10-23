import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { addCredits } from '@/lib/billing';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { packId, packName, amountTND, creditsCount, gateway } = body;

    const tx = await addCredits(
      session.workspace.id,
      packId || 'flash',
      packName || 'Recharge Crédits',
      Number(amountTND) || 29,
      Number(creditsCount) || 10,
      gateway || 'flouci'
    );

    return NextResponse.json({
      success: true,
      data: tx,
      message: `Recharge réussie ! ${tx.creditsAdded} crédits ajoutés à votre boutique.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
