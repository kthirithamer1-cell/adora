import { WHOP_PLANS } from '@/lib/whop';

export type EmailTrigger =
  | 'VERIFICATION_CODE'
  | 'ACCOUNT_EXISTS_LOGIN_LINK'
  | 'WELCOME_TRIAL_ACTIVATED'
  | 'FIRST_VISUAL_CREATED'
  | 'INACTIVITY_NUDGE'
  | 'TRIAL_EXHAUSTED_WHOP_UPGRADE'
  | 'WEEKLY_NEW_TEMPLATES';

export interface EmailLog {
  id: string;
  trigger: EmailTrigger;
  recipientEmail: string;
  recipientName: string;
  storeName?: string;
  niche?: string;
  subject: string;
  sentAt: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED';
  previewText: string;
}

// In-memory persistent email log for Founder Vision & CRM
export const memoryEmailLogs: EmailLog[] = [];

export interface SendEmailParams {
  trigger: EmailTrigger;
  recipientEmail: string;
  recipientName: string;
  storeName?: string;
  niche?: string;
  storeUrl?: string;
  creditsRemaining?: number;
  leadScore?: 'HOT' | 'WARM' | 'STANDARD';
  verificationCode?: string;
  loginUrl?: string;
}

/**
 * Génère le contenu d'email marketing hyper-personnalisé avec le branding officiel MarkMosaiq :
 * - Fond Blanc / Clair épuré (#FFFFFF & #F8FAFC)
 * - Couleurs officielles du Logo (Dégradé Indigo #6366F1 ➔ Magenta #EC4899 ➔ Coral #F97316)
 * - Typographie contrastée et lisible (#0F172A)
 */
export function generateEmailContent(params: SendEmailParams): { subject: string; html: string; previewText: string; text?: string } {
  const { trigger, recipientName, storeName, niche = 'general', leadScore } = params;
  const storeDisplay = storeName || 'Your Store';
  const starterCheckoutUrl = WHOP_PLANS.flash.checkoutUrl || 'https://whop.com/checkout/plan_C5UC5OslFfbUI';
  const proCheckoutUrl = WHOP_PLANS.pro.checkoutUrl || 'https://whop.com/checkout/plan_7I2SQLGuwRwkv';
  const agencyCheckoutUrl = WHOP_PLANS.agency_299.checkoutUrl || 'https://whop.com/checkout/plan_Wom3Bx78YTfoC';

  const recommendedCheckoutUrl = leadScore === 'HOT' ? agencyCheckoutUrl : leadScore === 'WARM' ? proCheckoutUrl : starterCheckoutUrl;
  const recommendedPlanName = leadScore === 'HOT' ? 'Agency Scale ($99/mo)' : leadScore === 'WARM' ? 'Pro Growth ($49/mo)' : 'Starter Launch ($19)';

  // Personnalisation des conseils selon la niche
  let nicheAdvice = 'Create high-converting studio backdrops that boost your CTR and lower customer acquisition costs.';
  if (niche === 'beauty') {
    nicheAdvice = 'For skincare and beauty products, marble podiums with soft water specular reflections convert 34% higher on Meta & TikTok Ads.';
  } else if (niche === 'fitness') {
    nicheAdvice = 'For supplements and activewear, athletic studio lighting creates the credibility and power buyers look for in high-performance items.';
  } else if (niche === 'fashion') {
    nicheAdvice = 'For apparel and streetwear, clean architectural concrete or minimal warm beige puts 100% of the focus on fabric texture and silhouette.';
  } else if (niche === 'jewelry') {
    nicheAdvice = 'For jewelry and luxury items, black velvet pedestals with directional spotlighting make gemstones and precious metals sparkle vividly.';
  }

  // Header et Footer HTML partagés utilisant les couleurs officielles de MarkMosaiq (0KB attachment, instant load)
  const emailHeader = `
    <div style="background: #F8FAFC; padding: 32px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.08);">
        <!-- Top Vibrant Logo Gradient Accent Bar -->
        <div style="height: 5px; background: linear-gradient(90deg, #2563EB 0%, #6366F1 35%, #EC4899 70%, #F97316 100%);"></div>
        
        <!-- Header with MarkMosaiq Brand (Zero-Attachment, Universal Email Client Compatible) -->
        <div style="padding: 26px 24px 18px; text-align: center; border-bottom: 1px solid #F1F5F9;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
            <tr>
              <td style="vertical-align: middle; padding-right: 10px;">
                <div style="width: 38px; height: 38px; line-height: 38px; border-radius: 10px; background: linear-gradient(135deg, #6366F1, #EC4899); color: #FFFFFF; font-weight: 900; font-size: 19px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);">
                  M
                </div>
              </td>
              <td style="vertical-align: middle;">
                <span style="font-size: 24px; font-weight: 900; color: #0F172A; letter-spacing: -0.02em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                  Mark<span style="color: #6366F1;">Mosaiq</span>
                </span>
              </td>
            </tr>
          </table>
          <p style="margin: 6px 0 0; color: #64748B; font-size: 13px; font-weight: 500;">AI Product Staging Studio for E-Commerce Brands</p>
        </div>
  `;

  const emailFooter = `
        <!-- Footer with Whop Verification -->
        <div style="background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 20px 24px; text-align: center;">
          <p style="margin: 0; color: #64748B; font-size: 12px; font-weight: 600;">
            🛡️ Secured by Whop (Merchant of Record) • Zero Credit Card Required • Instant 4K Rendering
          </p>
          <p style="margin: 6px 0 0; color: #94A3B8; font-size: 11px;">
            © ${new Date().getFullYear()} MarkMosaiq Studio. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;

  switch (trigger) {
    case 'VERIFICATION_CODE':
      return {
        subject: `🔐 Your MarkMosaiq verification code is ${params.verificationCode || '123456'}`,
        previewText: `Use code ${params.verificationCode || '123456'} to verify your account and unlock your 5 free credits.`,
        text: `Hi ${recipientName},\n\nYour MarkMosaiq verification code is: ${params.verificationCode || '123456'}\n\nEnter this 6-digit code to verify your account and unlock your 10 Free 4K Studio Credits.\n\nThis code will expire in 15 minutes. If you did not request this, you can safely ignore this email.\n\nMarkMosaiq Studio\nhttps://www.markmosaiq.com`,
        html: `
          ${emailHeader}
          <div style="padding: 32px 28px; text-align: center;">
            <div style="display: inline-block; background: #EEF2FF; border: 1px solid #C7D2FE; color: #6366F1; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px;">
              SECURITY VERIFICATION
            </div>
            <h1 style="color: #0F172A; font-size: 22px; font-weight: 900; margin: 0 0 12px;">
              Verify Your Email Address
            </h1>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
              Hi ${recipientName}, enter the 6-digit verification code below to confirm your account and unlock your <strong>5 Free 4K Studio Credits</strong>.
            </p>

            ${params.storeName ? `
            <div style="display: inline-flex; align-items: center; gap: 8px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 20px; padding: 6px 16px; margin: 0 auto 20px;">
              <span style="font-size: 13px; color: #64748B;">Configuring Store:</span>
              <strong style="font-size: 13px; color: #0F172A;">${params.storeName}</strong>
            </div>
            ` : ''}

            <div style="background: #F8FAFC; border: 2px dashed #6366F1; border-radius: 12px; padding: 18px; margin: 10px auto 20px; max-width: 260px;">
              <span style="font-family: monospace; font-size: 34px; font-weight: 900; letter-spacing: 6px; color: #4F46E5;">
                ${params.verificationCode || '123456'}
              </span>
            </div>
            <p style="color: #94A3B8; font-size: 13px; margin: 20px 0 0;">
              This code will expire in 15 minutes. If you did not request this, you can safely ignore this email.
            </p>
          </div>
          ${emailFooter}
        `,
      };

    case 'ACCOUNT_EXISTS_LOGIN_LINK':
      const targetLoginUrl = params.loginUrl || 'https://app.markmosaiq.com/login';
      return {
        subject: '🔗 Connexion rapide à votre compte MarkMosaiq',
        previewText: 'Un compte existe déjà avec cette adresse email. Cliquez pour vous connecter en 1 clic.',
        html: `
          ${emailHeader}
          <div style="padding: 32px 28px; text-align: center;">
            <div style="display: inline-block; background: #EEF2FF; border: 1px solid #C7D2FE; color: #6366F1; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px;">
              ACCÈS COMPTE EXISTANT
            </div>
            <h1 style="color: #0F172A; font-size: 22px; font-weight: 900; margin: 0 0 12px;">
              Bonjour ${recipientName},
            </h1>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
              Un compte MarkMosaiq est déjà associé à cette adresse email. Cliquez sur le bouton ci-dessous pour vous connecter et finaliser votre commande.
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${targetLoginUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); color: #FFFFFF; font-weight: 900; font-size: 15px; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);">
                Accéder à mon compte ➔
              </a>
            </div>
            <p style="color: #94A3B8; font-size: 13px; margin: 18px 0 0;">
              Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.
            </p>
          </div>
          ${emailFooter}
        `,
      };

    case 'WELCOME_TRIAL_ACTIVATED':
      return {
        subject: `🎁 Welcome to MarkMosaiq! Your 10 free AI credits for ${storeDisplay} are ready`,
        previewText: `Start staging 4K commercial ads for ${storeDisplay} without expensive photoshoot costs.`,
        html: `
          ${emailHeader}
          <div style="padding: 32px 28px;">
            <div style="display: inline-block; background: #EEF2FF; border: 1px solid #C7D2FE; color: #6366F1; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px;">
              FREE TRIAL UNLOCKED
            </div>
            <h1 style="font-size: 22px; font-weight: 900; color: #0F172A; margin: 0 0 12px; letter-spacing: -0.02em;">
              Welcome, ${recipientName}! 🎉
            </h1>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
              Your account has been activated and <strong>5 Free 4K Studio Visual Credits</strong> are now available for <strong>${storeDisplay}</strong>.
            </p>

            <!-- Niche Pro Tip Card -->
            <div style="background: #FAF5FF; border: 1px solid #E9D5FF; border-left: 4px solid #A855F7; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0; color: #7C3AED; font-weight: 800; font-size: 13px;">💡 Staging Tip for ${storeDisplay} (${niche.toUpperCase()}) :</p>
              <p style="margin: 6px 0 0; color: #334155; font-size: 14px; line-height: 1.5;">${nicheAdvice}</p>
            </div>

            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 20px 0;">
              You can create your first commercial product visual in less than 90 seconds. Simply drag & drop any product photo from your phone or catalog.
            </p>

            <!-- Primary Gradient Button using Logo Colors -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://app.markmosaiq.com/studio" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 40%, #EC4899 75%, #F97316 100%); color: #FFFFFF; font-weight: 900; font-size: 15px; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);">
                Launch Studio & Create First Ad ➔
              </a>
            </div>
          </div>
          ${emailFooter}
        `,
      };

    case 'FIRST_VISUAL_CREATED':
      return {
        subject: `🚀 Your first 4K commercial ad is ready! Scaling tips for ${storeDisplay}`,
        previewText: `Best aspect ratios and hook tactics to scale on Meta and TikTok Ads.`,
        html: `
          ${emailHeader}
          <div style="padding: 32px 28px;">
            <div style="display: inline-block; background: #ECFDF5; border: 1px solid #A7F3D0; color: #059669; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px;">
              FIRST AD GENERATED
            </div>
            <h1 style="color: #0F172A; font-size: 22px; font-weight: 900; margin: 0 0 12px;">
              Awesome work, ${recipientName}! 🚀
            </h1>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
              You just generated your first professional 4K visual on MarkMosaiq for <strong>${storeDisplay}</strong>!
            </p>

            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 18px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px; color: #0F172A; font-size: 14px; font-weight: 800;">3 Quick Tips to Maximize ROAS with this Visual :</h3>
              <ul style="color: #475569; font-size: 14px; line-height: 1.6; padding-left: 20px; margin: 0;">
                <li><strong>Safe Zones (9:16) :</strong> Leave top 14% and bottom 20% clear for TikTok/Reels captions.</li>
                <li><strong>Contrast First :</strong> Clean pedestal highlights make the product pop in fast-scrolling feeds.</li>
                <li><strong>A/B Testing :</strong> Test 2 different background ambiances to find your winning creative.</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://app.markmosaiq.com/studio" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%); color: #FFFFFF; font-weight: 900; font-size: 15px; text-decoration: none; padding: 13px 30px; border-radius: 10px; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);">
                Generate Visual #2 (Free Credit Ready) ➔
              </a>
            </div>
          </div>
          ${emailFooter}
        `,
      };

    case 'TRIAL_EXHAUSTED_WHOP_UPGRADE':
      return {
        subject: `⚡ You've used all 10 trial credits — Continue scaling ${storeDisplay}`,
        previewText: `Upgrade securely on Whop to keep generating unlimited 4K product visuals.`,
        html: `
          ${emailHeader}
          <div style="padding: 32px 28px;">
            <div style="display: inline-block; background: #FFF7ED; border: 1px solid #FED7AA; color: #EA580C; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 20px; margin-bottom: 16px;">
              FREE TRIAL COMPLETED
            </div>
            <h1 style="color: #0F172A; font-size: 22px; font-weight: 900; margin: 0 0 12px;">
              Keep Your Creative Momentum Going, ${recipientName}
            </h1>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
              You have completed your 10 free credits for <strong>${storeDisplay}</strong>. Brands testing multiple creatives weekly consistently achieve 2.4x higher ROAS on Meta and TikTok.
            </p>

            <div style="background: #F8FAFC; border: 2px solid #E0E7FF; border-radius: 12px; padding: 22px; margin: 24px 0; text-align: center;">
              <p style="color: #64748B; font-size: 13px; font-weight: 700; margin: 0 0 6px;">RECOMMENDED PLAN FOR YOUR VOLUME :</p>
              <h3 style="color: #4F46E5; font-size: 22px; font-weight: 900; margin: 0 0 16px;">${recommendedPlanName}</h3>
              <a href="${recommendedCheckoutUrl}" style="display: inline-block; background: linear-gradient(135deg, #EC4899 0%, #F97316 100%); color: #FFFFFF; font-weight: 900; font-size: 15px; text-decoration: none; padding: 14px 34px; border-radius: 10px; box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35);">
                Upgrade with 100% Whop Protection ➔
              </a>
              <p style="color: #94A3B8; font-size: 12px; margin: 12px 0 0;">
                Apple Pay, Visa, Mastercard, PayPal & Crypto accepted. Cancel anytime.
              </p>
            </div>
          </div>
          ${emailFooter}
        `,
      };

    case 'INACTIVITY_NUDGE':
      return {
        subject: `Need a hand staging your first product for ${storeDisplay}?`,
        previewText: `Your 5 free 4K visuals are waiting in your MarkMosaiq workspace.`,
        html: `
          ${emailHeader}
          <div style="padding: 32px 28px;">
            <h1 style="color: #0F172A; font-size: 22px; font-weight: 900; margin: 0 0 12px;">
              Still thinking about your first visual, ${recipientName}?
            </h1>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
              We noticed you haven't uploaded a product photo yet for <strong>${storeDisplay}</strong>. Don't worry about lighting or background clutter — our AI removes everything and places your item on high-end pedestals automatically.
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="https://app.markmosaiq.com/studio" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 40%, #EC4899 75%, #F97316 100%); color: #FFFFFF; font-weight: 900; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);">
                Upload Any Photo & Try It Now ➔
              </a>
            </div>
          </div>
          ${emailFooter}
        `,
      };

    case 'WEEKLY_NEW_TEMPLATES':
    default:
      return {
        subject: `📈 5 New Luxury Studio Environments Added for ${niche.toUpperCase()}`,
        previewText: `Fresh seasonal backdrops to keep your product ads converting.`,
        html: `
          ${emailHeader}
          <div style="padding: 32px 28px;">
            <h1 style="color: #0F172A; font-size: 22px; font-weight: 900; margin: 0 0 12px;">
              New Studio Releases This Week!
            </h1>
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
              We just deployed 5 new 4K commercial environments specifically tuned for <strong>${niche.toUpperCase()}</strong> products.
            </p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="https://app.markmosaiq.com/studio" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%); color: #FFFFFF; font-weight: 900; font-size: 15px; text-decoration: none; padding: 13px 30px; border-radius: 10px; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);">
                Explore New Templates ➔
              </a>
            </div>
          </div>
          ${emailFooter}
        `,
      };
  }
}

// Connection pool singleton pour Namecheap SMTP afin d'accélérer l'envoi et d'éviter les poignées de main TLS répétées
let cachedTransporter: any = null;
let cachedTransporterConfigKey = '';

async function getPooledTransporter(
  smtpHost: string,
  smtpPort: number,
  smtpSecure: boolean,
  smtpUser: string,
  smtpPassword: string
) {
  const configKey = `${smtpHost}:${smtpPort}:${smtpSecure}:${smtpUser}`;
  if (cachedTransporter && cachedTransporterConfigKey === configKey) {
    return cachedTransporter;
  }

  const nodemailer = await import('nodemailer');
  cachedTransporter = nodemailer.createTransport({
    pool: true, // Connexion persistante réutilisable
    maxConnections: 3,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5,
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
    },
  });

  cachedTransporterConfigKey = configKey;
  return cachedTransporter;
}

/**
 * Dispatcher universel d'Email Transactionnel & Marketing :
 * 1. Enregistre l'événement dans le CRM local / Supabase pour la Vision Fondateur
 * 2. Envoi instantané ultra-léger (0 Mo d'attachement, ~3 KB payload) via SMTP Namecheap Private Email
 */
export async function sendMarketingEmail(params: SendEmailParams): Promise<{ success: boolean; logId: string; subject: string }> {
  const content = generateEmailContent(params);
  const logId = `eml_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const logEntry: EmailLog = {
    id: logId,
    trigger: params.trigger,
    recipientEmail: params.recipientEmail,
    recipientName: params.recipientName,
    storeName: params.storeName,
    niche: params.niche,
    subject: content.subject,
    previewText: content.previewText,
    sentAt: new Date().toISOString(),
    status: 'SENT',
  };

  // 1. Sauvegarde dans le CRM mémoire de l'application
  memoryEmailLogs.unshift(logEntry);

  // 2. Dispatcher externe : Namecheap Private Email (SMTP via Nodemailer Pool)
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpHost = process.env.SMTP_HOST || 'mail.privateemail.com';
  const smtpPort = Number(process.env.SMTP_PORT) || 465;
  const smtpSecure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === 'true' : smtpPort === 465;
  const fromEmail = process.env.SMTP_FROM || process.env.EMAIL_FROM || (smtpUser ? `MarkMosaiq <${smtpUser}>` : 'MarkMosaiq <contact@markmosaiq.com>');

  if (smtpUser && smtpPassword) {
    try {
      const transporter = await getPooledTransporter(
        smtpHost,
        smtpPort,
        smtpSecure,
        smtpUser,
        smtpPassword
      );

      // Payload ultra-léger sans attachement binaire pour transmission instantanée et zéro blocage antispam
      const mailOptions: any = {
        from: fromEmail,
        to: params.recipientEmail,
        subject: content.subject,
        text: content.text || content.previewText,
        html: content.html,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'High',
          'Auto-Submitted': 'auto-generated',
        },
      };

      await transporter.sendMail(mailOptions);

      logEntry.status = 'DELIVERED';
      console.log(`[SMTP EMAIL SENT via ${smtpHost}] To: ${params.recipientEmail} | Subject: "${content.subject}" (Instant 0KB attachment)`);
    } catch (smtpErr) {
      console.warn(`[Namecheap SMTP Dispatch notice, logged in CRM] :`, smtpErr);
      // En cas de rupture du pool, réinitialiser le cache pour forcer une reconnexion propre
      cachedTransporter = null;
    }
  } else {
    // Mode Sandbox / Local Logging pour les fondateurs
    console.log(`[EMAIL MARKETING DISPATCHED (DEV SANDBOX)] To: ${params.recipientEmail} | Trigger: ${params.trigger} | Subject: "${content.subject}"`);
  }

  return {
    success: true,
    logId,
    subject: content.subject,
  };
}
