import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailCode } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email et code requis.' },
        { status: 400 }
      );
    }

    const isValid = verifyEmailCode(email, code);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Code invalide ou expiré. Veuillez réessayer.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email vérifié avec succès.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
