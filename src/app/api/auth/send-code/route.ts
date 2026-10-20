import { NextRequest, NextResponse } from 'next/server';
import { generateEmailVerificationCode, findUserByEmail } from '@/lib/auth';
import { sendMarketingEmail } from '@/lib/email';
import { validateEmailFormat } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, shopName, storeUrl } = body;

    const emailCheck = validateEmailFormat(email || '');
    if (!emailCheck.valid) {
      return NextResponse.json(
        { success: false, error: emailCheck.error || 'A valid email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = findUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    const code = generateEmailVerificationCode(cleanEmail);

    try {
      await sendMarketingEmail({
        trigger: 'VERIFICATION_CODE',
        recipientEmail: email.trim().toLowerCase(),
        recipientName: name?.trim() || email.split('@')[0],
        storeName: shopName?.trim(),
        storeUrl: storeUrl?.trim(),
        verificationCode: code,
      });
    } catch (mailErr) {
      console.warn('Notice email dispatch OTP :', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Code de vérification envoyé avec succès.',
      // En mode développement / sandbox, devCode permet de tester instantanément
      devCode: code,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur lors de l\'envoi du code' },
      { status: 500 }
    );
  }
}
