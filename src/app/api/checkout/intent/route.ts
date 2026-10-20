import { NextRequest, NextResponse } from 'next/server';
import { normalizeCheckoutParams } from '@/lib/checkout/params';
import {
  signIntent,
  verifyIntent,
  INTENT_COOKIE,
  INTENT_COOKIE_OPTIONS,
} from '@/lib/checkout/intent';

const INTENT_SECRET =
  process.env.INTENT_COOKIE_SECRET ||
  'markmosaiq_intent_secret_super_secure_32_bytes_key';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = normalizeCheckoutParams(body, {
      country: req.headers.get('x-vercel-ip-country') || 'TN',
      annualEnabled: process.env.FF_ANNUAL_BILLING === 'true',
    });

    if (!result.ok) {
      return NextResponse.json({ error: 'Invalid pack parameters' }, { status: 400 });
    }

    const token = signIntent(result.value, INTENT_SECRET);
    const response = NextResponse.json({ success: true, intent: result.value });

    response.cookies.set({
      ...INTENT_COOKIE_OPTIONS,
      value: token,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(INTENT_COOKIE)?.value;
  const intent = verifyIntent(token, INTENT_SECRET);
  return NextResponse.json({ intent });
}
