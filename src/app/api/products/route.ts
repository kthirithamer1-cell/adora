import { NextRequest, NextResponse } from 'next/server';
import { getProductsAction, createProductAction } from '@/actions/products.actions';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const result = await getProductsAction();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await createProductAction({
      name: body.name,
      category: body.category,
      priceTND: body.priceTND,
      originalImageUrl: body.originalImageUrl,
      cutoutImageUrl: body.cutoutImageUrl,
      descriptionFr: body.descriptionFr,
      descriptionDarija: body.descriptionDarija,
      badgeLabel: body.badgeId || body.badgeLabel,
    });

    const status = result.success ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
