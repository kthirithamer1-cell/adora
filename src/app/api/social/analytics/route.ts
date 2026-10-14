import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { getWorkspaceAdRecords, analyzeWinningAngles } from '@/lib/adsFeedback';

export async function GET() {
  try {
    const session = await getCurrentSession();
    const records = getWorkspaceAdRecords(session.workspace.id);
    const winningAngles = analyzeWinningAngles(session.workspace.id);

    return NextResponse.json({
      success: true,
      data: {
        records,
        winningAngles,
        recommendedStrategy: winningAngles[0] || null,
        totalSpendTND: records.reduce((sum, r) => sum + r.spendTND, 0),
        totalRevenueTND: records.reduce((sum, r) => sum + r.revenueTND, 0),
        totalOrders: records.reduce((sum, r) => sum + r.ordersCount, 0),
      },
    });
  } catch (error: any) {
    console.error('API /api/social/analytics error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors du calcul des analytics publicitaires.' },
      { status: 500 }
    );
  }
}
