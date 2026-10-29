import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  TRIAL_COOKIE_NAME,
  getTrialByGuestId,
  saveTrialRecord,
  renderBrandedTrialVisuals,
  TrialPostRecord,
} from '@/lib/trialStore';
import { checkRateLimit, getClientIp } from '@/lib/security/rateLimit';

type CategoryType = 'Skincare' | 'Cosmetics' | 'Perfume';
type StyleType = 'Premium & minimal' | 'Natural & organic' | 'Bold & modern';
type GoalType = 'educate' | 'care' | 'promote';

const BASE_IMAGE_MAP: Record<CategoryType, Record<StyleType, string>> = {
  Skincare: {
    'Premium & minimal': '/images/beauty/hero_phone_post.jpg',
    'Natural & organic': '/images/beauty/skincare_natural.jpg',
    'Bold & modern': '/images/beauty/skincare_bold.jpg',
  },
  Cosmetics: {
    'Premium & minimal': '/images/beauty/cosmetics_minimal.jpg',
    'Natural & organic': '/images/beauty/cosmetics_natural.jpg',
    'Bold & modern': '/images/beauty/cosmetics_bold.jpg',
  },
  Perfume: {
    'Premium & minimal': '/images/beauty/perfume_minimal.jpg',
    'Natural & organic': '/images/beauty/perfume_natural.jpg',
    'Bold & modern': '/images/beauty/perfume_bold.jpg',
  },
};

function generateBespokeBeautyCopy(params: {
  brandName: string;
  category: CategoryType;
  style: StyleType;
  goal: GoalType;
  socialHandle: string;
}) {
  const brand = params.brandName.trim() || 'Bloom Skin';

  const copyMatrix: Record<
    CategoryType,
    Record<
      GoalType,
      {
        headline: string;
        subheadline: string;
        caption: string;
        hashtags: string[];
        storyCards: { title: string; subtitle: string; image: string }[];
      }
    >
  > = {
    Skincare: {
      educate: {
        headline: `3 daily rituals for a resilient, glowing skin barrier with ${brand}`,
        subheadline: `${params.style} • Skin Science`,
        caption: `Healthy skin isn’t about 10 complicated steps — it’s about consistency and barrier respect. ✨\n\nAt ${brand}, every drop is formulated to lock in hydration without heaviness:\n1️⃣ Cleanse gently without stripping natural lipids\n2️⃣ Drench damp skin with botanical humectants\n3️⃣ Seal & protect every morning\n\nSave this guide for your evening ritual. 🌿`,
        hashtags: ['#SkincareRoutine', '#SkinBarrier', '#CleanBeauty', '#GlowingSkin', `#${brand.replace(/[^a-zA-Z0-9]/g, '')}`],
        storyCards: [
          { title: `Step 1: Gentle Reset`, subtitle: `${brand} Ritual`, image: '/images/beauty/hero_story_glow.jpg' },
          { title: `Pure Botanical Actives`, subtitle: 'Zero Synthetics', image: '/images/beauty/hero_story_ingredients.jpg' },
          { title: `Morning & Night Glow`, subtitle: 'Dermatologist Tested', image: '/images/beauty/hero_story_bestdays.jpg' },
        ],
      },
      care: {
        headline: `Crafted with patience. Kind to sensitive skin & our planet.`,
        subheadline: `${params.style} • Conscious Values`,
        caption: `What touches your skin every day matters. 🌱\n\nWhen we started ${brand}, we made a promise: zero harsh fillers, ethically harvested botanicals, and recyclable glass apothecary bottles.\n\nThank you for trusting us with your daily self-care ritual. Send us a DM anytime for a personalized skin consultation! 🤍`,
        hashtags: ['#ConsciousBeauty', '#BotanicalSkincare', '#CrueltyFreeBeauty', '#SelfCareRitual', `#${brand.replace(/[^a-zA-Z0-9]/g, '')}`],
        storyCards: [
          { title: `100% Cruelty-Free`, subtitle: `Our Promise`, image: '/images/beauty/hero_story_ingredients.jpg' },
          { title: `Small-Batch Potency`, subtitle: `Freshly Formulated`, image: '/images/beauty/skincare_minimal.jpg' },
          { title: `Your Skin Comes First`, subtitle: `Free DM Consultation`, image: '/images/beauty/hero_story_glow.jpg' },
        ],
      },
      promote: {
        headline: `Meet ${brand}’s Signature Radiance Elixir — 72h Deep Moisture`,
        subheadline: `${params.style} • Hero Formula`,
        caption: `Wake up to visibly plumper, calmer, glass-like skin. ✨\n\nOur signature ${brand} Elixir combines cold-pressed botanical oils with bio-active peptides to restore dull, tired skin overnight.\n\n✨ Lightweight, non-comedogenic finish\n✨ Clinically proven 72-hour hydration\n\nTap the link in bio or DM us to reserve yours from this batch! 🛍️`,
        hashtags: ['#NewSkincare', '#FacialSerum', '#GlassSkin', '#BeautyLaunch', `#${brand.replace(/[^a-zA-Z0-9]/g, '')}`],
        storyCards: [
          { title: `72h Deep Hydration`, subtitle: `Clinically Proven`, image: '/images/beauty/hero_phone_post.jpg' },
          { title: `Featherlight Texture`, subtitle: `Zero Greasy Residue`, image: '/images/beauty/hero_story_glow.jpg' },
          { title: `Limited Batch Live`, subtitle: `Order via Link in Bio`, image: '/images/beauty/skincare_natural.jpg' },
        ],
      },
    },
    Cosmetics: {
      educate: {
        headline: `How to achieve the effortless 5-minute editorial glow with ${brand}`,
        subheadline: `${params.style} • Pro Makeup Tips`,
        caption: `The secret to makeup that looks like second skin? Preparation and weightless pigment. ✨\n\nHere is how our artists use ${brand} for an all-day luminous finish:\n• Warm a tiny dot on the back of your hand\n• Tap onto the high points of your cheekbones\n• Layer on lips for a monochromatic flush\n\nBookmark this for your next morning rush! 💄`,
        hashtags: ['#NoMakeupMakeup', '#EditorialGlow', '#CleanCosmetics', '#MakeupTips', `#${brand.replace(/[^a-zA-Z0-9]/g, '')}`],
        storyCards: [
          { title: `Second-Skin Finish`, subtitle: `${brand} Studio`, image: '/images/beauty/cosmetics_palette.jpg' },
          { title: `Buildable Pure Pigment`, subtitle: '12-Hour Wear', image: '/images/beauty/cosmetics_bold.jpg' },
          { title: `Monochromatic Flush`, subtitle: 'Lips & Cheeks', image: '/images/beauty/cosmetics_natural.jpg' },
        ],
      },
      care: {
        headline: `Color that nourishes your skin every hour you wear it.`,
        subheadline: `${params.style} • Skin-First Makeup`,
        caption: `You shouldn’t have to choose between high-impact color and healthy skin. 🌸\n\nEvery ${brand} formula is infused with botanical squalane and pure mineral pigments — so your skin feels softer when you take your makeup off at night.\n\n100% vegan, non-comedogenic, and made with love. 🤍`,
        hashtags: ['#SkinFirstMakeup', '#VeganCosmetics', '#CleanMakeup', '#BeautyWithValues', `#${brand.replace(/[^a-zA-Z0-9]/g, '')}`],
        storyCards: [
          { title: `Infused With Jojoba`, subtitle: `Nourishing Wear`, image: '/images/beauty/cosmetics_minimal.jpg' },
          { title: `Zero Pore-Clogging Wax`, subtitle: `Breathable Color`, image: '/images/beauty/cosmetics_natural.jpg' },
          { title: `Shade Match Support`, subtitle: `DM Us a Selfie`, image: '/images/beauty/cosmetics_palette.jpg' },
        ],
      },
      promote: {
        headline: `The ${brand} Velvet Lip & Cheek Tint: Weightless 12-Hour Stain`,
        subheadline: `${params.style} • Best Seller`,
        caption: `One swipe. Endless compliments. 💋\n\nThe ${brand} Velvet Tint delivers a plush, transfer-resistant stain that never dries out your lips.\n\n✨ Universally flattering warm undertones\n✨ Infused with hydrating berry extracts\n\nDM us or tap the link in bio to claim yours before shades sell out! ✨`,
        hashtags: ['#LipTint', '#VelvetLips', '#MakeupLaunch', '#CultBeauty', `#${brand.replace(/[^a-zA-Z0-9]/g, '')}`],
        storyCards: [
          { title: `12-Hour Velvet Wear`, subtitle: `Transfer Resistant`, image: '/images/beauty/cosmetics_bold.jpg' },
          { title: `6 Iconic Shades`, subtitle: `Universal Undertones`, image: '/images/beauty/cosmetics_palette.jpg' },
          { title: `Back In Stock Today`, subtitle: `Shop Link in Bio`, image: '/images/beauty/cosmetics_minimal.jpg' },
        ],
      },
    },
    Perfume: {
      educate: {
        headline: `The art of scent layering: Make your ${brand} fragrance last 14+ hours`,
        subheadline: `${params.style} • Haute Parfumerie`,
        caption: `Want your signature trail to linger from morning coffee to midnight? ✨\n\nMaster perfumers at ${brand} recommend three simple habits:\n1️⃣ Moisturize pulse points before spraying — fragrance binds to lipids\n2️⃣ Never rub your wrists together (it crushes the delicate top notes!)\n3️⃣ Mist lightly onto your scarf or collar\n\nSave this post for your next evening out. 🥂`,
        hashtags: ['#PerfumeTips', '#FragranceLayering', '#NichePerfume', '#ScentOfTheDay', `#${brand.replace(/[^a-zA-Z0-9]/g, '')}`],
        storyCards: [
          { title: `Top: Bergamot & Neroli`, subtitle: `First Impression`, image: '/images/beauty/perfume_natural.jpg' },
          { title: `Heart: Damask Rose`, subtitle: `The Signature Core`, image: '/images/beauty/perfume_bold.jpg' },
          { title: `Base: Warm Amber Woods`, subtitle: `14h Sillage Trail`, image: '/images/beauty/perfume_minimal.jpg' },
        ],
      },
      care: {
        headline: `Small-batch botanical extraction. Hand-poured with reverence.`,
        subheadline: `${params.style} • Artisanal Craft`,
        caption: `True luxury cannot be rushed. 🌿\n\nEach flacon of ${brand} is macerated for 6 weeks using ethically harvested botanicals, pure organic grain alcohol, and zero synthetic phthalates.\n\nCrafted for those who appreciate quiet, unforgettable elegance. 🤍`,
        hashtags: ['#ArtisanalPerfume', '#CleanFragrance', '#BotanicalParfum', '#SlowLuxury', `#${brand.replace(/[^a-zA-Z0-9]/g, '')}`],
        storyCards: [
          { title: `Ethical Botanical Harvest`, subtitle: `${brand} Atelier`, image: '/images/beauty/perfume_natural.jpg' },
          { title: `6-Week Maceration`, subtitle: `Deep Sillage`, image: '/images/beauty/perfume_minimal.jpg' },
          { title: `Refillable French Glass`, subtitle: `Sustainable Luxury`, image: '/images/beauty/perfume_bold.jpg' },
        ],
      },
      promote: {
        headline: `Introducing ${brand} L’Or Ambré — An Intoxicating Trail of Woods & Iris`,
        subheadline: `${params.style} • Extrait de Parfum`,
        caption: `A fragrance that enters the room before you speak and lingers after you leave. ✨\n\n${brand} L’Or Ambré blends smoky cardamom, velvet iris, and warm sandalwood in a 28% Extrait de Parfum concentration.\n\n✨ Over 14 hours of skin longevity\n✨ Complimentary 2ml discovery vial with every full bottle\n\nReserve your numbered flacon via the link in bio. 🖤`,
        hashtags: ['#ExtraitDeParfum', '#SignatureScent', '#LuxuryFragrance', '#PerfumeCollection', `#${brand.replace(/[^a-zA-Z0-9]/g, '')}`],
        storyCards: [
          { title: `28% Extrait Concentration`, subtitle: `All-Day Sillage`, image: '/images/beauty/perfume_minimal.jpg' },
          { title: `Notes of Iris & Santal`, subtitle: `Warm & Magnetic`, image: '/images/beauty/perfume_bold.jpg' },
          { title: `Numbered First Edition`, subtitle: `Reserve Yours Now`, image: '/images/beauty/perfume_natural.jpg' },
        ],
      },
    },
  };

  return copyMatrix[params.category]?.[params.goal] || copyMatrix.Skincare.educate;
}

function sanitizeRecordForClient(record: TrialPostRecord) {
  const isClaimed = Boolean(record.claimedByUserId || record.claimedByWorkspaceId);
  return {
    id: record.id,
    guestId: record.guestId,
    brandName: record.brandName,
    category: record.category,
    style: record.style,
    goal: record.goal,
    socialHandle: record.socialHandle,
    headline: record.headline,
    subheadline: record.subheadline,
    caption: record.caption,
    hashtags: record.hashtags,
    imageUrl: isClaimed ? record.unwatermarkedDataUrl : record.previewDataUrl,
    isWatermarked: !isClaimed,
    isClaimed,
    storyCards: record.storyCards,
    createdAt: record.createdAt,
  };
}

/**
 * GET /api/trial/generate
 * Restores an existing guest trial session across page refreshes or social auth redirects.
 */
export async function GET(req: NextRequest) {
  try {
    const cookieGuestId = req.cookies.get(TRIAL_COOKIE_NAME)?.value;
    const queryGuestId = req.nextUrl.searchParams.get('guestId');
    const guestId = cookieGuestId || queryGuestId || '';

    if (!guestId) {
      return NextResponse.json({
        success: true,
        hasTrial: false,
        data: null,
      });
    }

    const existing = getTrialByGuestId(guestId);
    if (!existing) {
      return NextResponse.json({
        success: true,
        hasTrial: false,
        guestId,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      hasTrial: true,
      guestId,
      data: sanitizeRecordForClient(existing),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to restore trial session' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/trial/generate
 * Generates 1 real custom-composited beauty post for an anonymous guest.
 * Enforces 1 free generation per guest ID + IP rate limit.
 */
export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const body = await req.json();

    const brandName = (typeof body.brandName === 'string' ? body.brandName.trim() : '') || 'Bloom Skin';
    const category: CategoryType = ['Skincare', 'Cosmetics', 'Perfume'].includes(body.category)
      ? body.category
      : 'Skincare';
    const style: StyleType = ['Premium & minimal', 'Natural & organic', 'Bold & modern'].includes(body.style)
      ? body.style
      : 'Premium & minimal';
    const goal: GoalType = ['educate', 'care', 'promote'].includes(body.goal)
      ? body.goal
      : 'educate';
    const socialHandle = typeof body.socialHandle === 'string' ? body.socialHandle.trim() : '';

    let guestId = req.cookies.get(TRIAL_COOKIE_NAME)?.value || body.guestId || '';
    if (!guestId) {
      guestId = `guest_${crypto.randomUUID()}`;
    }

    // Check if this guest already generated their 1 free post
    const existingRecord = getTrialByGuestId(guestId);
    if (existingRecord) {
      return NextResponse.json(
        {
          success: false,
          code: 'TRIAL_LIMIT_REACHED',
          error: 'You have already generated your 1 free guest post. Create your free account to claim 10 more credits and generate unlimited variations!',
          data: sanitizeRecordForClient(existingRecord),
        },
        { status: 429 }
      );
    }

    // Per-IP abuse protection (max 3 anonymous trials per IP per hour across incognito windows)
    const ipLimit = checkRateLimit(`beauty_trial_ip_${clientIp}`, {
      limit: 3,
      windowSeconds: 3600,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: 'IP_RATE_LIMIT',
          error: 'Free trial limit reached for your network. Create a free account to unlock 10 free credits immediately!',
          retryAfterSeconds: ipLimit.retryAfterSeconds,
        },
        { status: 429 }
      );
    }

    // 1. Build bespoke copy & art direction
    const copy = generateBespokeBeautyCopy({
      brandName,
      category,
      style,
      goal,
      socialHandle,
    });

    const baseImageRelPath = BASE_IMAGE_MAP[category][style];

    // 2. Render both watermarked trial visual & unwatermarked master visual via Sharp
    const rendered = await renderBrandedTrialVisuals({
      baseImageRelPath,
      brandName,
      socialHandle,
      category,
      style,
      headline: copy.headline,
      subheadline: copy.subheadline,
    });

    // 3. Persist only after successful generation (failed attempts never consume the free try)
    const newRecord: TrialPostRecord = {
      id: `trial_post_${Date.now()}`,
      guestId,
      clientIp,
      brandName,
      category,
      style,
      goal,
      socialHandle,
      headline: copy.headline,
      subheadline: copy.subheadline,
      caption: copy.caption,
      hashtags: copy.hashtags,
      previewDataUrl: rendered.previewDataUrl,
      unwatermarkedDataUrl: rendered.unwatermarkedDataUrl,
      storyCards: copy.storyCards,
      createdAt: new Date().toISOString(),
    };

    saveTrialRecord(newRecord);

    const res = NextResponse.json({
      success: true,
      guestId,
      data: sanitizeRecordForClient(newRecord),
    });

    res.cookies.set(TRIAL_COOKIE_NAME, guestId, {
      path: '/',
      httpOnly: false, // readable by client so it survives redirects cleanly
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err: any) {
    console.error('[TRIAL GENERATE ERROR]:', err);
    return NextResponse.json(
      {
        success: false,
        code: 'GENERATION_FAILED',
        error: 'We encountered a temporary studio hiccup while rendering your post. Your free try was not used — please click Retry.',
      },
      { status: 500 }
    );
  }
}

