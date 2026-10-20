import { NextRequest, NextResponse } from 'next/server';
import { validateEmailFormat } from '@/lib/validation';

/**
 * Endpoint de validation d'email (Anti-Énumération MM-106).
 * Renvoie une réponse neutre pour ne pas divulguer l'existence d'un compte utilisateur.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    const formatCheck = validateEmailFormat(email || '');
    if (!formatCheck.valid) {
      return NextResponse.json(
        {
          valid: false,
          available: false,
          error: formatCheck.error,
        },
        { status: 400 }
      );
    }

    // Réponse neutre constante anti-énumération
    return NextResponse.json({
      valid: true,
      available: true,
      message: 'Email vérifié.',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        valid: false,
        available: false,
        error: err.message || 'Erreur lors de la vérification.',
      },
      { status: 500 }
    );
  }
}
