import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  generateEmailVerificationCode,
  findUserByEmail,
  registerUserAndWorkspace,
  getWorkspacesForUser,
  SESSION_COOKIE_NAME,
} from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { sendMarketingEmail } from '@/lib/email';
import { validateEmailFormat, analyzePassword } from '@/lib/validation';
import { buildLoginUrl } from '@/lib/security/redirect';
import { verifyIntent, INTENT_COOKIE } from '@/lib/checkout/intent';
import { buildCheckoutUrl } from '@/lib/checkout/params';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit';

const INTENT_SECRET =
  process.env.INTENT_COOKIE_SECRET ||
  'markmosaiq_intent_secret_super_secure_32_bytes_key';

const SignupBodySchema = z.object({
  email: z.string().min(1),
  password: z.string().min(8),
  name: z.string().optional(),
  phone: z.string().optional(),
  shopName: z.string().optional(),
  storeUrl: z.string().optional(),
  niche: z.string().optional(),
  plan: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 0. Rate limiting check: Max 5 attempts per IP per 10 minutes (MM-113)
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`signup_${clientIp}`, {
      limit: 5,
      windowSeconds: 600,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Trop de tentatives d’inscription. Veuillez réessayer dans quelques minutes.',
          retryAfter: rateCheck.retryAfterSeconds,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) },
        }
      );
    }
    const rawBody = await req.json();
    const parseResult = SignupBodySchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: 'Format de requête invalide.' },
        { status: 400 }
      );
    }

    const { email, password, name, phone, shopName, storeUrl, niche, plan } = parseResult.data;

    // 1. Validation du format d'email
    const emailCheck = validateEmailFormat(email);
    if (!emailCheck.valid) {
      return NextResponse.json(
        { success: false, error: emailCheck.error || 'Adresse email invalide.' },
        { status: 400 }
      );
    }

    // 2. Audit de sécurité du mot de passe (5 critères obligatoires)
    const passAnalysis = analyzePassword(password);
    if (!passAnalysis.isSecure) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le mot de passe doit comporter au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Vérification stricte d'existence dans le stockage local
    let existing = findUserByEmail(cleanEmail);

    // 2. Vérification stricte d'existence dans Supabase PostgreSQL
    if (!existing) {
      try {
        const sbUsers = await supabase
          .from('users')
          .select('id, email, full_name')
          .eq('email', cleanEmail)
          .limit(1);

        if (Array.isArray(sbUsers) && sbUsers.length > 0 && sbUsers[0]?.id) {
          const u = sbUsers[0];
          existing = {
            id: u.id,
            email: u.email,
            name: u.full_name || cleanEmail.split('@')[0],
            createdAt: new Date().toISOString(),
          };
        }
      } catch (sbErr) {
        // En cas d'indisponibilité réseau temporaire Supabase, poursuivre
      }
    }

    // 3. Si le compte existe déjà : interdiction formelle de recréation (Erreur 409 Conflict)
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          code: 'EMAIL_ALREADY_EXISTS',
          error: 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.',
        },
        { status: 409 }
      );
    }

    // 4. Générer le code OTP à 6 chiffres pour validation de l'adresse email (envoyé uniquement par email)
    const code = generateEmailVerificationCode(cleanEmail);

    await sendMarketingEmail({
      trigger: 'VERIFICATION_CODE',
      recipientEmail: cleanEmail,
      recipientName: name || cleanEmail.split('@')[0],
      verificationCode: code,
    }).catch((e) => console.warn('Notice email OTP :', e));

    return NextResponse.json({
      success: true,
      status: 'OTP_SENT',
      message: 'Un code de vérification à 6 chiffres a été transmis à votre adresse email.',
      email: cleanEmail,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Erreur serveur lors de l’inscription.' },
      { status: 500 }
    );
  }
}
