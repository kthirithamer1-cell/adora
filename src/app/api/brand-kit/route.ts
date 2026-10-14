import { NextRequest, NextResponse } from 'next/server';
import { getBrandKitAction, saveBrandKitAction } from '@/actions/brandkit.actions';

export async function GET() {
  try {
    const result = await getBrandKitAction();
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
    const result = await saveBrandKitAction(body);

    const status = result.success ? 200 : 400;
    return NextResponse.json(result, { status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
