import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  registerUserAndWorkspace,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, shopName, plan = 'trial' } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Une adresse e-mail valide est requise.' },
        { status: 400 }
      );
    }

    const { user, workspace } = registerUserAndWorkspace({
      name: name || email.split('@')[0],
      email,
      phone,
      shopName: shopName || `${name || 'Ma'} Boutique`,
      plan: plan === 'starter' ? 'flash' : plan === 'pro' ? 'pro' : plan === 'advanced' ? 'agency' : 'trial',
    });

    const sessionPayload = JSON.stringify({
      userId: user.id,
      workspaceId: workspace.id,
    });

    const res = NextResponse.json({
      success: true,
      data: {
        user,
        workspace,
        activeWorkspaceId: workspace.id,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, sessionPayload, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur lors de la création du compte' },
      { status: 500 }
    );
  }
}
