import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  registerUserAndWorkspace,
  verifyEmailCodeDetailed,
  findUserByEmail,
  findWorkspaceById,
  getWorkspacesForUser,
  syncUserAndWorkspaceToSupabase,
  getMemoryUsers,
  getMemoryWorkspaces,
} from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { grantCredits } from '@/lib/services/billing';
import { verifyIntent, INTENT_COOKIE } from '@/lib/checkout/intent';
import { buildCheckoutUrl } from '@/lib/checkout/params';
import { getSafeInternalRedirect } from '@/lib/security/redirect';

const INTENT_SECRET =
  process.env.INTENT_COOKIE_SECRET ||
  'markmosaiq_intent_secret_super_secure_32_bytes_key';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, redirect, pack, cycle, currency } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email et code à 6 chiffres requis.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const result = verifyEmailCodeDetailed(cleanEmail, code);

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Code invalide ou expiré.',
          locked: result.locked || false,
        },
        { status: 400 }
      );
    }

    // 1. Initialiser ou récupérer l'utilisateur et son workspace
    let existingUser = findUserByEmail(cleanEmail);

    // Si non présent en mémoire locale, vérifier dans Supabase PostgreSQL (ex: créé en production ou sur un autre conteneur)
    if (!existingUser) {
      try {
        const sbUsers = await supabase
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .limit(1);
        const rows = Array.isArray(sbUsers) ? sbUsers : sbUsers?.data || [];
        if (rows.length > 0 && rows[0]?.id) {
          const u = rows[0];
          existingUser = {
            id: u.id,
            email: u.email,
            name: u.full_name || cleanEmail.split('@')[0],
            phone: u.phone || undefined,
            avatarUrl: u.avatar_url || undefined,
            createdAt: u.created_at || new Date().toISOString(),
          };
          getMemoryUsers().push(existingUser);
        }
      } catch {
        // Fallback standard
      }
    }

    let workspaceId: string;
    let userId: string;

    if (!existingUser) {
      const reg = registerUserAndWorkspace({
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        shopName: 'Ma boutique',
        plan: (pack as any) || 'trial',
      });
      existingUser = reg.user;
      workspaceId = reg.workspace.id;
      userId = reg.user.id;

      // Synchronisation immédiate vers Supabase PostgreSQL (public.users & public.workspaces)
      await syncUserAndWorkspaceToSupabase(reg.user, reg.workspace);
    } else {
      userId = existingUser.id;
      let userWorkspaces = getWorkspacesForUser(existingUser.id);

      // Si le workspace n'est pas encore en mémoire, tenter de le charger depuis Supabase
      if (userWorkspaces.length === 0) {
        try {
          const sbWs = await supabase
            .from('workspaces')
            .select('*')
            .eq('owner_id', existingUser.id)
            .limit(1);
          const wsRows = Array.isArray(sbWs) ? sbWs : sbWs?.data || [];
          if (wsRows.length > 0 && wsRows[0]?.id) {
            const w = wsRows[0];
            const restoredWs = {
              id: w.id,
              name: w.name,
              slug: w.slug,
              ownerId: w.owner_id,
              plan: w.plan || 'flash',
              creditsRemaining: w.credits_remaining ?? 10,
              whiteLabelEnabled: false,
              members: [
                {
                  userId: existingUser.id,
                  userEmail: existingUser.email,
                  userName: existingUser.name,
                  role: 'owner' as const,
                  joinedAt: w.created_at || new Date().toISOString(),
                },
              ],
              createdAt: w.created_at || new Date().toISOString(),
            };
            getMemoryWorkspaces().push(restoredWs as any);
            userWorkspaces = [restoredWs as any];
          }
        } catch {
          // Fallback
        }
      }

      const ws = userWorkspaces[0] || registerUserAndWorkspace({
        name: existingUser.name,
        email: existingUser.email,
        shopName: 'Ma boutique',
        plan: (pack as any) || 'trial',
      }).workspace;
      workspaceId = ws.id;

      // Garantir la synchronisation avec Supabase
      await syncUserAndWorkspaceToSupabase(existingUser, ws);
    }

    // 2. Déterminer l'intention d'achat Whop (cookie, param redirect, ou pack demandé)
    const intentToken = req.cookies.get(INTENT_COOKIE)?.value;
    const cookieIntent = verifyIntent(intentToken, INTENT_SECRET);

    let targetCheckoutUrl: string | null = null;
    if (redirect) {
      const safe = getSafeInternalRedirect(redirect, '');
      if (safe && safe.startsWith('/checkout')) {
        targetCheckoutUrl = safe;
      }
    }

    if (!targetCheckoutUrl && cookieIntent) {
      targetCheckoutUrl = buildCheckoutUrl(cookieIntent);
    } else if (!targetCheckoutUrl && pack && (pack === 'pro' || pack === 'agency_299' || pack === 'flash')) {
      targetCheckoutUrl = buildCheckoutUrl({
        pack: pack as any,
        cycle: cycle === 'annual' ? 'annual' : 'monthly',
        currency: currency === 'USD' ? 'USD' : 'USD',
      });
    }

    const isPaidPurchase = Boolean(targetCheckoutUrl);

    // 3. Octroyer 10 crédits d'essai UNIQUEMENT si inscription gratuite/trial sans intention d'achat
    if (!isPaidPurchase) {
      await grantCredits({
        workspaceId,
        delta: 10,
        reason: 'trial_grant',
      });
    }

    // 4. Déterminer la prochaine étape (Checkout prioritaire pour les acheteurs)
    let nextUrl = '/onboarding';
    if (targetCheckoutUrl) {
      nextUrl = targetCheckoutUrl;
      const ws = findWorkspaceById(workspaceId);
      if (ws) {
        (ws as any).pending_checkout = cookieIntent || { pack: pack || 'pro', cycle: cycle || 'monthly', currency: currency || 'USD' };
      }
    }

    const userWorkspaces = getWorkspacesForUser(userId);
    const activeWorkspace = findWorkspaceById(workspaceId) || userWorkspaces[0];
    const member = activeWorkspace?.members?.find((m) => m.userId === userId);
    const role = member?.role || 'owner';

    // 4. Poser le cookie de session officiel
    const response = NextResponse.json({
      success: true,
      status: 'VERIFIED',
      nextUrl,
      data: {
        user: existingUser,
        workspace: activeWorkspace,
        workspaces: userWorkspaces,
        role,
      },
      user: {
        id: userId,
        email: cleanEmail,
        name: existingUser.name,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: JSON.stringify({ userId, email: cleanEmail, workspaceId }),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 jours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
