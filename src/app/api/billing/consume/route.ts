import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { deductCredit } from '@/lib/billing';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const { productName, category, aspect, amount = 1 } = body;

    const result = deductCredit(session.workspace.id, amount, {
      productName: productName || 'Produit',
      category: category || 'studio',
      aspect: aspect || '1:1',
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, remaining: result.remaining },
        { status: 402 } // Payment Required
      );
    }

    return NextResponse.json({
      success: true,
      data: { remaining: result.remaining },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
