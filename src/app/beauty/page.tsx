'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import s from './beauty.module.css';
import {
  Sparkles,
  ArrowRight,
  Check,
  Layers,
  Info,
  ChevronDown,
  Mail,
  ShieldCheck,
  Download,
  Bookmark,
  PlusCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import TrialAuthModal, { TrialClientPost } from '@/components/beauty/TrialAuthModal';

type CategoryType = 'Skincare' | 'Cosmetics' | 'Perfume';
type StyleType = 'Premium & minimal' | 'Natural & organic' | 'Bold & modern';
type GoalType = 'educate' | 'care' | 'promote';

// Feature flag: defaults to true unless explicitly set to 'false'
const IS_TRY_FIRST_ENABLED = process.env.NEXT_PUBLIC_TRY_FIRST !== 'false';

interface ContentPreset {
  headline: string;
  badge: string;
  image: string;
  subCards: {
    title: string;
    image: string;
  }[];
}

const PRESETS: Record<CategoryType, Record<StyleType, Record<GoalType, ContentPreset>>> = {
  Skincare: {
    'Premium & minimal': {
      educate: {
        headline: 'Simple steps for healthy, radiant skin',
        badge: 'Clean Science',
        image: '/images/beauty/hero_phone_post.jpg',
        subCards: [
          { title: 'Your skin matters', image: '/images/beauty/hero_story_glow.jpg' },
          { title: 'Natural care. Real results.', image: '/images/beauty/hero_story_ingredients.jpg' },
          { title: 'Skincare is a form of self care.', image: '/images/beauty/hero_story_bestdays.jpg' },
        ],
      },
      care: {
        headline: 'Gentle on your skin. Kind to the planet.',
        badge: 'Conscious Luxury',
        image: '/images/beauty/skincare_minimal.jpg',
        subCards: [
          { title: 'Cruelty-free formulas', image: '/images/beauty/hero_story_ingredients.jpg' },
          { title: 'Responsibly sourced botanicals', image: '/images/beauty/hero_phone_post.jpg' },
          { title: 'Sustainable glass packaging', image: '/images/beauty/skincare_cleanse.jpg' },
        ],
      },
      promote: {
        headline: 'The Barrier Recovery Elixir: Wake up with renewed glow',
        badge: 'Hero Launch',
        image: '/images/beauty/skincare_natural.jpg',
        subCards: [
          { title: 'Immediate 72h moisture', image: '/images/beauty/hero_story_glow.jpg' },
          { title: 'Dermatologist tested', image: '/images/beauty/skincare_minimal.jpg' },
          { title: 'Exclusive first batch order', image: '/images/beauty/hero_phone_post.jpg' },
        ],
      },
    },
    'Natural & organic': {
      educate: {
        headline: 'The power of raw botanicals & cold-pressed oils',
        badge: '100% Organic',
        image: '/images/beauty/skincare_natural.jpg',
        subCards: [
          { title: 'Why cold-pressed matters', image: '/images/beauty/hero_story_ingredients.jpg' },
          { title: 'Plant-derived squalane', image: '/images/beauty/hero_phone_post.jpg' },
          { title: 'Rooted in botanical wisdom', image: '/images/beauty/hero_story_glow.jpg' },
        ],
      },
      care: {
        headline: 'Zero synthetics. Pure earth-grown nourishment.',
        badge: 'Holistic Skin',
        image: '/images/beauty/hero_story_ingredients.jpg',
        subCards: [
          { title: 'Small batch production', image: '/images/beauty/skincare_minimal.jpg' },
          { title: 'Earth-honoring ethics', image: '/images/beauty/skincare_natural.jpg' },
          { title: 'Compostable refills', image: '/images/beauty/skincare_cleanse.jpg' },
        ],
      },
      promote: {
        headline: 'Dew Drops Serum: Nature’s most potent antidote to dullness',
        badge: 'Best Seller',
        image: '/images/beauty/hero_phone_post.jpg',
        subCards: [
          { title: 'Fresh harvest edition', image: '/images/beauty/hero_story_ingredients.jpg' },
          { title: '14-day visible glow', image: '/images/beauty/hero_story_glow.jpg' },
          { title: 'Limited seasonal bottles', image: '/images/beauty/skincare_minimal.jpg' },
        ],
      },
    },
    'Bold & modern': {
      educate: {
        headline: 'Active ingredients explained: Peptides, Zinc & Hyaluronic',
        badge: 'Active Efficacy',
        image: '/images/beauty/skincare_bold.jpg',
        subCards: [
          { title: 'Layering active serums', image: '/images/beauty/hero_phone_post.jpg' },
          { title: 'pH balanced perfection', image: '/images/beauty/hero_story_glow.jpg' },
          { title: 'Proven clinical results', image: '/images/beauty/skincare_cleanse.jpg' },
        ],
      },
      care: {
        headline: 'Transparent formulations. Zero secrets on our labels.',
        badge: 'Clean Truth',
        image: '/images/beauty/skincare_cleanse.jpg',
        subCards: [
          { title: 'Zero parabens or sulfates', image: '/images/beauty/hero_story_ingredients.jpg' },
          { title: 'Sensitive skin approved', image: '/images/beauty/hero_story_glow.jpg' },
          { title: 'Formulated in France', image: '/images/beauty/skincare_minimal.jpg' },
        ],
      },
      promote: {
        headline: 'The Hyper-Hydration Barrier Creme is officially here',
        badge: 'Trending Now',
        image: '/images/beauty/skincare_minimal.jpg',
        subCards: [
          { title: 'Cloud-light texture', image: '/images/beauty/hero_story_glow.jpg' },
          { title: 'Fast-absorbing finish', image: '/images/beauty/hero_phone_post.jpg' },
          { title: 'Free shipping on orders', image: '/images/beauty/skincare_cleanse.jpg' },
        ],
      },
    },
  },
  Cosmetics: {
    'Premium & minimal': {
      educate: {
        headline: 'How to master the weightless no-makeup glow',
        badge: 'Editorial Beauty',
        image: '/images/beauty/cosmetics_minimal.jpg',
        subCards: [
          { title: 'Skin-first finish', image: '/images/beauty/cosmetics_palette.jpg' },
          { title: 'Invisible blending', image: '/images/beauty/cosmetics_bold.jpg' },
          { title: 'Natural radiance', image: '/images/beauty/cosmetics_natural.jpg' },
        ],
      },
      care: {
        headline: 'Cosmetics that nourish your skin while you wear them',
        badge: 'Hybrid Care',
        image: '/images/beauty/cosmetics_palette.jpg',
        subCards: [
          { title: 'Infused with jojoba', image: '/images/beauty/cosmetics_minimal.jpg' },
          { title: 'Zero pore-clogging waxes', image: '/images/beauty/cosmetics_bold.jpg' },
          { title: 'Clean mineral pigments', image: '/images/beauty/cosmetics_natural.jpg' },
        ],
      },
      promote: {
        headline: 'The Velvet Lip Tint: Weightless stain that lasts 12 hours',
        badge: 'Iconic Shades',
        image: '/images/beauty/cosmetics_bold.jpg',
        subCards: [
          { title: '6 universally flattering tones', image: '/images/beauty/cosmetics_palette.jpg' },
          { title: 'Transfer-resistant formula', image: '/images/beauty/cosmetics_minimal.jpg' },
          { title: 'Limited gold packaging', image: '/images/beauty/cosmetics_natural.jpg' },
        ],
      },
    },
    'Natural & organic': {
      educate: {
        headline: 'Plant pigments that blend seamlessly with natural skin',
        badge: 'Botanical Color',
        image: '/images/beauty/cosmetics_natural.jpg',
        subCards: [
          { title: 'Berry extract stains', image: '/images/beauty/cosmetics_bold.jpg' },
          { title: 'Non-comedogenic glow', image: '/images/beauty/cosmetics_palette.jpg' },
          { title: 'Safe for ultra-sensitive skin', image: '/images/beauty/cosmetics_minimal.jpg' },
        ],
      },
      care: {
        headline: 'Beauty in harmony with nature: Refillable & recyclable',
        badge: 'Circular Design',
        image: '/images/beauty/cosmetics_palette.jpg',
        subCards: [
          { title: 'Aluminium pods', image: '/images/beauty/cosmetics_natural.jpg' },
          { title: '100% vegan certified', image: '/images/beauty/cosmetics_bold.jpg' },
          { title: 'No microplastics', image: '/images/beauty/cosmetics_minimal.jpg' },
        ],
      },
      promote: {
        headline: 'The Golden Hour Cheek & Lip Balm is back in stock',
        badge: 'Cult Favorite',
        image: '/images/beauty/cosmetics_bold.jpg',
        subCards: [
          { title: 'Buildable sheer pigment', image: '/images/beauty/cosmetics_palette.jpg' },
          { title: 'Pocket-sized applicator', image: '/images/beauty/cosmetics_natural.jpg' },
          { title: 'Order today with 10% off', image: '/images/beauty/cosmetics_minimal.jpg' },
        ],
      },
    },
    'Bold & modern': {
      educate: {
        headline: 'Precision pigments: High-impact color for fearless looks',
        badge: 'High Performance',
        image: '/images/beauty/cosmetics_bold.jpg',
        subCards: [
          { title: 'High-density color payoff', image: '/images/beauty/cosmetics_minimal.jpg' },
          { title: '24-hour crease-free wear', image: '/images/beauty/cosmetics_palette.jpg' },
          { title: 'Studio-grade definition', image: '/images/beauty/cosmetics_natural.jpg' },
        ],
      },
      care: {
        headline: 'Clean performance makeup without compromise',
        badge: 'Bold & Clean',
        image: '/images/beauty/cosmetics_minimal.jpg',
        subCards: [
          { title: 'Cruelty-free certified', image: '/images/beauty/cosmetics_bold.jpg' },
          { title: 'Ophthalmologist tested', image: '/images/beauty/cosmetics_palette.jpg' },
          { title: 'Sweat & humidity proof', image: '/images/beauty/cosmetics_natural.jpg' },
        ],
      },
      promote: {
        headline: 'Unleash your shade: The Matte Suede Collection drops now',
        badge: 'New Release',
        image: '/images/beauty/cosmetics_bold.jpg',
        subCards: [
          { title: '12 saturated shades', image: '/images/beauty/cosmetics_minimal.jpg' },
          { title: 'Featherlight feel', image: '/images/beauty/cosmetics_palette.jpg' },
          { title: 'Complimentary mini brush', image: '/images/beauty/cosmetics_natural.jpg' },
        ],
      },
    },
  },
  Perfume: {
    'Premium & minimal': {
      educate: {
        headline: 'The anatomy of a fragrance: Top, heart and base accords',
        badge: 'Haute Parfumerie',
        image: '/images/beauty/perfume_minimal.jpg',
        subCards: [
          { title: 'Top: Italian bergamot', image: '/images/beauty/perfume_natural.jpg' },
          { title: 'Heart: Damask rose', image: '/images/beauty/perfume_bold.jpg' },
          { title: 'Base: Warm amber woods', image: '/images/beauty/perfume_minimal.jpg' },
        ],
      },
      care: {
        headline: 'Artisanal extraction with respect for rare flora',
        badge: 'Handcrafted',
        image: '/images/beauty/perfume_natural.jpg',
        subCards: [
          { title: 'Ethical Grasse harvests', image: '/images/beauty/perfume_minimal.jpg' },
          { title: '100% organic grain alcohol', image: '/images/beauty/perfume_bold.jpg' },
          { title: 'Aged in French glass', image: '/images/beauty/perfume_natural.jpg' },
        ],
      },
      promote: {
        headline: 'L’Heure Dorée: An intoxicating amber trail you can’t forget',
        badge: 'Signature Scent',
        image: '/images/beauty/perfume_minimal.jpg',
        subCards: [
          { title: 'Over 14h sillage longevity', image: '/images/beauty/perfume_natural.jpg' },
          { title: 'Numbered glass flacons', image: '/images/beauty/perfume_bold.jpg' },
          { title: 'Complimentary 2ml discovery', image: '/images/beauty/perfume_minimal.jpg' },
        ],
      },
    },
    'Natural & organic': {
      educate: {
        headline: 'Pure botanical essences: Distilled directly from wild petals',
        badge: 'Pure Extract',
        image: '/images/beauty/perfume_natural.jpg',
        subCards: [
          { title: 'Cold-pressed neroli', image: '/images/beauty/perfume_minimal.jpg' },
          { title: 'Wild cedar infusion', image: '/images/beauty/perfume_bold.jpg' },
          { title: 'Zero synthetic fixatives', image: '/images/beauty/perfume_natural.jpg' },
        ],
      },
      care: {
        headline: 'Natural wellness perfumes that calm the nervous system',
        badge: 'Aromatherapy',
        image: '/images/beauty/perfume_natural.jpg',
        subCards: [
          { title: 'Therapeutic grade oils', image: '/images/beauty/perfume_minimal.jpg' },
          { title: 'Hand-blended in small vats', image: '/images/beauty/perfume_bold.jpg' },
          { title: 'Zero allergen dyes', image: '/images/beauty/perfume_natural.jpg' },
        ],
      },
      promote: {
        headline: 'Forest Rain: Crisp pine needles, vetiver and ozone',
        badge: 'New Olfactory',
        image: '/images/beauty/perfume_bold.jpg',
        subCards: [
          { title: 'Unisex grounding scent', image: '/images/beauty/perfume_natural.jpg' },
          { title: 'Refill pouches available', image: '/images/beauty/perfume_minimal.jpg' },
          { title: 'Free sample with trial', image: '/images/beauty/perfume_bold.jpg' },
        ],
      },
    },
    'Bold & modern': {
      educate: {
        headline: 'Molecular perfumery: Scents that react to your body chemistry',
        badge: 'Avant-Garde',
        image: '/images/beauty/perfume_bold.jpg',
        subCards: [
          { title: 'Unique on every skin', image: '/images/beauty/perfume_minimal.jpg' },
          { title: 'Iso E Super boost', image: '/images/beauty/perfume_natural.jpg' },
          { title: 'Magnetic presence', image: '/images/beauty/perfume_bold.jpg' },
        ],
      },
      care: {
        headline: 'Cruelty-free synthetic musks preserving wild habitats',
        badge: 'Future Fragrance',
        image: '/images/beauty/perfume_minimal.jpg',
        subCards: [
          { title: '100% cruelty-free', image: '/images/beauty/perfume_bold.jpg' },
          { title: 'Zero endangered woods', image: '/images/beauty/perfume_natural.jpg' },
          { title: 'Carbon neutral lab', image: '/images/beauty/perfume_minimal.jpg' },
        ],
      },
      promote: {
        headline: 'Noir Santal: Smoky cardamom, leather and creamy iris',
        badge: 'Limited Drop',
        image: '/images/beauty/perfume_bold.jpg',
        subCards: [
          { title: 'Extrait de parfum 28%', image: '/images/beauty/perfume_minimal.jpg' },
          { title: 'Custom engraved cap', image: '/images/beauty/perfume_natural.jpg' },
          { title: 'Only 300 bottles cast', image: '/images/beauty/perfume_bold.jpg' },
        ],
      },
    },
  },
};

const STYLE_THUMBNAILS: Record<CategoryType, Record<StyleType, string>> = {
  Skincare: {
    'Premium & minimal': '/images/beauty/skincare_minimal.jpg',
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

const FAQS = [
  {
    q: 'Do I need professional studio photography to get started?',
    a: 'Not at all. You can upload a simple photo of your skincare bottle, cosmetic jar, or perfume taken with your smartphone against a plain background. MarkMosaiq automatically isolates your product with sub-pixel precision and composites it onto photorealistic travertine pedestals, natural botanical greenery, or minimal luxury podiums with physically accurate contact shadows.',
  },
  {
    q: 'How does the free Studio test work without an account?',
    a: 'You can pick your beauty category, visual style, and brand details in steps 1 and 2 above, then open the interactive Studio directly to test the interface and generate your first design with zero sign up required. After your first design is generated, a popup lets you create your account and claim 5 free credits.',
  },
  {
    q: 'What happens after the 5 free credits?',
    a: 'Your 5 credits are 100% free with no credit card on file. After your trial, if you want to keep creating, you can choose simple on-demand packs starting at just 29 DT (~$19) for 20 high-res visuals, or flexible studio passes. We never automatically renew or charge you without explicit confirmation.',
  },
  {
    q: 'Will the AI alter or distort my product label or typography?',
    a: 'Never. Unlike generic diffusion models that hallucinate distorted bottles and scrambled text, MarkMosaiq uses a strict zero-hallucination preservation pipeline: the AI generates the vacant luxury background scene, and your actual physical product and logo are composited on top with zero distortion and 100% label clarity.',
  },
  {
    q: 'What visual formats can I generate for Instagram?',
    a: 'You can generate Feed Posts (1:1 square), Instagram Stories (9:16 vertical with safe zones calculated to avoid profile headers and reply bars), and multi-slide Carousel posts designed specifically to educate customers and maximize saves and shares.',
  },
];

export default function BeautyLandingPage() {
  const router = useRouter();
  const studioSectionRef = useRef<HTMLElement>(null);
  const previewCanvasRef = useRef<HTMLDivElement>(null);

  // User interactive state
  const [category, setCategory] = useState<CategoryType>('Skincare');
  const [style, setStyle] = useState<StyleType>('Premium & minimal');
  const [brandName, setBrandName] = useState<string>('Bloom Skin');
  const [socialHandle, setSocialHandle] = useState<string>('');
  const [goal, setGoal] = useState<GoalType>('educate');
  const [previewFlash, setPreviewFlash] = useState<boolean>(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Try-First Real Generation & Modal State
  const [generatedPost, setGeneratedPost] = useState<TrialClientPost | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [creditsAvailable, setCreditsAvailable] = useState<number | null>(null);
  const [savedToast, setSavedToast] = useState<string | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [modalTriggerAction, setModalTriggerAction] = useState<'save' | 'download' | 'create_more'>('save');

  // Active static preset data (fallback or pre-generation preview)
  const currentPreset = PRESETS[category]?.[style]?.[goal] || PRESETS.Skincare['Premium & minimal'].educate;

  // Restore existing guest trial on page load/refresh when Try-First is enabled
  useEffect(() => {
    if (!IS_TRY_FIRST_ENABLED) return;

    let mounted = true;
    fetch('/api/trial/generate')
      .then((res) => res.json())
      .then((resData) => {
        if (!mounted) return;
        if (resData?.success && resData?.hasTrial && resData?.data) {
          const restored: TrialClientPost = resData.data;
          setGeneratedPost(restored);
          setBrandName(restored.brandName || 'Bloom Skin');
          setCategory(restored.category || 'Skincare');
          setStyle(restored.style || 'Premium & minimal');
          setGoal(restored.goal || 'educate');
          if (restored.socialHandle) setSocialHandle(restored.socialHandle);
          if (restored.isClaimed) setCreditsAvailable(5);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // Redirect directly to /studio in Guest Mode so the visitor can test the full Studio interface without login
  const handleNavigateToStudio = () => {
    const cleanBrandName = brandName.trim() || 'Bloom Skin';
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'markmosaiq_beauty_outreach',
          JSON.stringify({
            brandName: cleanBrandName,
            category,
            style,
            goal,
            socialHandle,
          })
        );
      }
    } catch {
      // ignore
    }
    const cleanBrand = encodeURIComponent(cleanBrandName);
    router.push(
      `/studio?guest=1&ref=beauty&brand=${cleanBrand}&category=${encodeURIComponent(category)}&style=${encodeURIComponent(style)}&goal=${encodeURIComponent(goal)}`
    );
  };

  // Top nav "Get started" button also goes straight to Studio without login
  const handleDirectSignup = () => {
    handleNavigateToStudio();
  };

  // Hero & Bottom CTA handler: goes to Studio or scrolls to Steps 1 & 2
  const handleSectionCtaClick = () => {
    handleNavigateToStudio();
  };

  // Step 2 Button: Redirects straight to Studio in Guest Mode with their brand settings preloaded
  const handleGeneratePreview = async () => {
    if (IS_TRY_FIRST_ENABLED) {
      handleNavigateToStudio();
      return;
    }

    setPreviewFlash(true);
    setTimeout(() => setPreviewFlash(false), 500);
    previewCanvasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Trigger download of the image data URL
  const triggerImageDownload = (post: TrialClientPost) => {
    const link = document.createElement('a');
    link.href = post.imageUrl;
    const slug = (post.brandName || 'beauty-brand').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `${slug}-instagram-post.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle clicking "Save", "Download", or "Create more" next to the generated result
  const handleResultAction = (action: 'save' | 'download' | 'create_more') => {
    if (!generatedPost) return;

    // If not yet claimed by an account, open the signup/login popup modal
    if (!generatedPost.isClaimed) {
      setModalTriggerAction(action);
      setAuthModalOpen(true);
      return;
    }

    // Already claimed & authenticated!
    if (action === 'download') {
      triggerImageDownload(generatedPost);
      setSavedToast('✓ High-resolution unwatermarked image downloaded!');
      setTimeout(() => setSavedToast(null), 4000);
    } else if (action === 'save') {
      setSavedToast('✓ Saved to your Brand Kit & Workspace library!');
      setTimeout(() => setSavedToast(null), 4000);
    } else if (action === 'create_more') {
      router.push('/generate?ref=beauty');
    }
  };

  // Callback when user finishes signup or login inside the popup modal
  const handleClaimSuccess = (
    claimedPost: TrialClientPost | null,
    creditsRemaining: number,
    action: string
  ) => {
    if (claimedPost) {
      setGeneratedPost(claimedPost);
    }
    setCreditsAvailable(creditsRemaining);
    setAuthModalOpen(false);
    setLimitNotice(null);

    if (action === 'download' && claimedPost) {
      triggerImageDownload(claimedPost);
      setSavedToast(
        `✓ Post unlocked & downloaded! You now have ${creditsRemaining} free credits in your account.`
      );
    } else if (action === 'save') {
      setSavedToast(
        `✓ Post saved to your new account! You have ${creditsRemaining} free credits ready.`
      );
    } else if (action === 'create_more' || action === 'first_design') {
      setSavedToast(
        `✓ Account ready with ${creditsRemaining} free credits! Opening studio...`
      );
      setTimeout(() => {
        router.push('/studio?ref=beauty');
      }, 1200);
    }
  };

  return (
    <div className={s.pageWrapper}>
      {/* 1. TOP NAVBAR (Get started & Login unchanged as baseline) */}
      <header className={s.nav}>
        <div className={s.navInner}>
          <Link href="/" className={s.logoArea}>
            <div className={s.logoMark}>
              <Sparkles size={22} strokeWidth={2.2} />
            </div>
            <span className={s.brandText}>MarkMosaiq</span>
          </Link>

          <nav className={s.navLinks}>
            <Link href="/beauty" className={`${s.navLink} ${s.navLinkActive}`}>
              For Beauty Brands
            </Link>
            <a href="#interactive-studio" className={s.navLink}>
              Interactive Studio
            </a>
            <a href="#how-it-works" className={s.navLink}>
              How it works
            </a>
            <a href="#faq" className={s.navLink}>
              FAQ
            </a>
            <Link href="/pricing" className={s.navLink}>
              Pricing
            </Link>
            <Link href="/login" className={s.navLink}>
              Login
            </Link>
          </nav>

          <button onClick={handleDirectSignup} className={s.navCta}>
            Get started
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className={s.heroSection}>
        <div className={s.heroContent}>
          <div className={s.eyebrow}>Branded Content for Beauty Brands</div>
          <h1 className={s.heroTitle}>
            Your beauty brand deserves to be remembered.
          </h1>
          <p className={s.heroSubtitle}>
            Turn your brand’s story, values and customer care into beautiful Instagram posts and Stories — and stay present in your customers’ feeds.
          </p>

          <div className={s.heroCtaGroup}>
            <button onClick={handleSectionCtaClick} className={s.primaryPillButton}>
              <span>Create your first branded post</span>
              <ArrowRight size={17} />
            </button>
            <p className={s.ctaSubtext}>
              <strong>No sign up required — test the Studio directly.</strong> After your first design is generated, sign up or log in to claim your 5 free credits.
            </p>
          </div>

          <div className={s.featureBadgesRow}>
            <div className={s.featureBadge}>
              <span className={s.featureBadgeIcon}>✦</span>
              <span>On-brand content</span>
            </div>
            <div className={s.featureBadge}>
              <span className={s.featureBadgeIcon}>◫</span>
              <span>Made for Instagram</span>
            </div>
            <div className={s.featureBadge}>
              <span className={s.featureBadgeIcon}>✎</span>
              <span>No design skills needed</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Showcase */}
        <div className={s.heroVisualArea}>
          <div className={s.heroLeavesOverlay} />

          {/* Floating Left Story Card */}
          <div className={s.floatingStoryLeft}>
            <img
              src="/images/beauty/hero_story_glow.jpg"
              alt="Glow with care story"
              className={s.floatingCardImage}
            />
            <div className={s.floatingCardContent}>
              <span className={s.floatingCardTitle}>Glow with care</span>
            </div>
          </div>

          {/* iPhone Mockup Frame */}
          <div className={s.phoneFrame}>
            <div className={s.phoneNotch} />
            <div className={s.igHeader}>
              <div className={s.igStoriesBar}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={s.igStoryCircle}>
                    <img
                      src={`/images/beauty/avatar_${i}.jpg`}
                      alt={`Beauty creator avatar ${i}`}
                      className={s.igStoryInner}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className={s.igPostUserBar}>
                <div className={s.igUserLeft}>
                  <img
                    src="/images/beauty/avatar_1.jpg"
                    alt="Brand avatar"
                    className={s.igUserAvatar}
                  />
                  <span className={s.igUsername}>
                    {brandName.toLowerCase().replace(/\s+/g, '') || 'bloomskin'}
                  </span>
                </div>
                <span style={{ fontSize: 13, color: '#9CA3AF' }}>•••</span>
              </div>
            </div>

            <div className={s.igImageWrapper}>
              <img
                src="/images/beauty/hero_phone_post.jpg"
                alt="Instagram beauty post"
                className={s.igPostImage}
              />
              <div className={s.igPostOverlayTitle}>
                Healthy skin is self care
              </div>
            </div>

            <div className={s.igPostActions}>
              <div className={s.igActionGroup}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#E11D48" stroke="#E11D48" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </div>

            <div className={s.igCaptionArea}>
              <p className={s.igCaption}>
                <span className={s.igCaptionBrand}>
                  {brandName.toLowerCase().replace(/\s+/g, '') || 'bloomskin'}
                </span>
                Because your skin deserves the best, every day. 🌿
              </p>
            </div>
          </div>

          {/* Floating Right Top Story Card */}
          <div className={s.floatingStoryRightTop}>
            <img
              src="/images/beauty/hero_story_ingredients.jpg"
              alt="Natural ingredients"
              className={s.floatingCardImage}
            />
            <div className={s.floatingCardContent}>
              <span className={s.floatingCardTitle}>Natural ingredients. Real results.</span>
            </div>
          </div>

          {/* Floating Right Bottom Story Card */}
          <div className={s.floatingStoryRightBottom}>
            <img
              src="/images/beauty/hero_story_bestdays.jpg"
              alt="Best days ahead"
              className={s.floatingCardImage}
            />
            <div className={s.floatingCardContent}>
              <span className={s.floatingCardTitle}>Your skin’s best days ahead.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STEP 1: CHOOSE YOUR BRAND STYLE */}
      <section ref={studioSectionRef} className={s.interactiveSection} id="interactive-studio">
        <div className={s.stepHeader}>
          <span className={s.stepNumber}>1. Choose your brand style</span>
          <h2 className={s.stepTitle}>What kind of beauty brand are you?</h2>
          <p className={s.stepSubtitle}>
            Select your category and style to see a preview of your branded content.
          </p>
        </div>

        <div className={s.styleSelectionRow}>
          {/* Category Tabs */}
          <div className={s.categoryPills}>
            {(['Skincare', 'Cosmetics', 'Perfume'] as CategoryType[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`${s.categoryPill} ${category === cat ? s.categoryPillActive : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Visual Style Cards */}
          <div className={s.visualStyleArea}>
            <span className={s.visualStyleLabel}>Visual style</span>
            <div className={s.styleCardsGrid}>
              {(['Premium & minimal', 'Natural & organic', 'Bold & modern'] as StyleType[]).map((st) => (
                <div
                  key={st}
                  onClick={() => setStyle(st)}
                  className={`${s.styleCard} ${style === st ? s.styleCardActive : ''}`}
                >
                  <div className={s.styleCardImgWrapper}>
                    <img
                      src={STYLE_THUMBNAILS[category][st]}
                      alt={st}
                      className={s.styleCardImg}
                    />
                  </div>
                  <div className={s.styleCardTitle}>{st}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. STEP 2: TELL US ABOUT YOUR BRAND & LIVE PREVIEW / REAL GENERATION */}
      <section className={s.detailsSection} id="features">
        <div className={s.formArea}>
          <div className={s.stepHeader}>
            <span className={s.stepNumber}>2. Tell us about your brand</span>
            <h2 className={s.stepTitle}>A few details help us create the perfect content.</h2>
            <p className={s.stepSubtitle}>
              Share your brand name, website or Instagram, and what you’d like to communicate.
            </p>
          </div>

          <div className={s.inputGroup}>
            <label className={s.inputLabel}>Brand name</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Bloom Skin, Lumière Botanics..."
              className={s.textInput}
            />
          </div>

          <div className={s.inputGroup}>
            <label className={s.inputLabel}>Website or Instagram (optional)</label>
            <input
              type="text"
              value={socialHandle}
              onChange={(e) => setSocialHandle(e.target.value)}
              placeholder="e.g. www.bloomskin.com or @bloomskin"
              className={s.textInput}
            />
          </div>

          <div className={s.optionsGroup}>
            <label className={s.inputLabel}>What do you want to share?</label>

            <div
              onClick={() => setGoal('educate')}
              className={`${s.optionCard} ${goal === 'educate' ? s.optionCardActive : ''}`}
            >
              <div className={`${s.optionRadioCircle} ${goal === 'educate' ? s.optionRadioCircleActive : ''}`}>
                {goal === 'educate' && <div className={s.optionRadioInner} />}
              </div>
              <div className={s.optionText}>
                <div className={s.optionTitle}>Educate my customers</div>
                <div className={s.optionSubtitle}>Share tips, routines or how to use your products.</div>
              </div>
            </div>

            <div
              onClick={() => setGoal('care')}
              className={`${s.optionCard} ${goal === 'care' ? s.optionCardActive : ''}`}
            >
              <div className={`${s.optionRadioCircle} ${goal === 'care' ? s.optionRadioCircleActive : ''}`}>
                {goal === 'care' && <div className={s.optionRadioInner} />}
              </div>
              <div className={s.optionText}>
                <div className={s.optionTitle}>Show how we care</div>
                <div className={s.optionSubtitle}>Communicate your values and customer care.</div>
              </div>
            </div>

            <div
              onClick={() => setGoal('promote')}
              className={`${s.optionCard} ${goal === 'promote' ? s.optionCardActive : ''}`}
            >
              <div className={`${s.optionRadioCircle} ${goal === 'promote' ? s.optionRadioCircleActive : ''}`}>
                {goal === 'promote' && <div className={s.optionRadioInner} />}
              </div>
              <div className={s.optionText}>
                <div className={s.optionTitle}>Promote a product</div>
                <div className={s.optionSubtitle}>Highlight a product benefit or special offer.</div>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGeneratePreview}
            className={s.previewCtaButton}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Generating your branded post...</span>
              </>
            ) : (
              <>
                <span>Preview my brand content</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Dynamic Live Preview / Generated Result Canvas */}
        <div
          ref={previewCanvasRef}
          className={`${s.previewCanvasBox} ${previewFlash ? 'ring-2 ring-emerald-500' : ''}`}
        >
          <div className={s.previewCanvasHeader}>
            <div className={s.previewBadge}>
              <span className={s.previewBadgeDot} />
              <span>
                {generatedPost
                  ? generatedPost.isClaimed
                    ? 'Unlocked HD Master'
                    : 'Generated Brand Post (1/1 Free Trial)'
                  : 'Live Style Preview'}
              </span>
            </div>
            <span style={{ fontSize: 12, color: '#8A857D', fontWeight: 500 }}>
              {generatedPost ? `${generatedPost.category} • ${generatedPost.style}` : `${category} • ${style}`}
            </span>
          </div>

          {/* Claimed Account Banner */}
          {(generatedPost?.isClaimed || creditsAvailable !== null) && (
            <div className={s.claimedBanner}>
              <span>✓ Attached to your account</span>
              <span>✦ {creditsAvailable ?? 5} Free Credits Active</span>
            </div>
          )}

          {/* Toast Feedback */}
          {savedToast && (
            <div className={s.claimedBanner} style={{ background: '#18181B', color: '#FFFFFF', borderColor: '#18181B' }}>
              <span>{savedToast}</span>
            </div>
          )}

          {/* Error & Retry State (Does NOT consume the 1 free try) */}
          {generationError && (
            <div className={s.errorStateBox}>
              <span>{generationError}</span>
              <button type="button" onClick={handleGeneratePreview} className={s.retryBtn}>
                <RefreshCw size={12} style={{ display: 'inline', marginRight: 5 }} />
                Retry
              </button>
            </div>
          )}

          {/* Limit Reached Notice */}
          {limitNotice && (
            <div className={s.claimedBanner} style={{ background: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A' }}>
              <span>{limitNotice}</span>
            </div>
          )}

          {/* Loading State */}
          {isGenerating ? (
            <div className={s.loadingOverlayCard}>
              <Loader2 size={32} className="animate-spin" style={{ color: '#18181B', marginBottom: 14 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1816', marginBottom: 6 }}>
                Crafting your {brandName || 'Bloom Skin'} post...
              </div>
              <p style={{ fontSize: 13, color: '#6E6A64', maxWidth: 300 }}>
                Compositing {style.toLowerCase()} typography, brand plaque, and Instagram caption.
              </p>
            </div>
          ) : generatedPost && IS_TRY_FIRST_ENABLED ? (
            /* REAL GENERATED POST RESULT */
            <>
              <div className={s.mainPreviewCard} style={{ height: 360 }}>
                <img
                  src={generatedPost.imageUrl}
                  alt={generatedPost.headline}
                  className={s.mainPreviewImg}
                />
              </div>

              {/* 3 Conversion Action Buttons: Save, Download, Create more */}
              <div className={s.generatedActionRow}>
                <button
                  type="button"
                  onClick={() => handleResultAction('save')}
                  className={s.actionBtnPrimary}
                >
                  <Bookmark size={14} />
                  <span>Save</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleResultAction('download')}
                  className={s.actionBtnSecondary}
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleResultAction('create_more')}
                  className={s.actionBtnSecondary}
                >
                  <PlusCircle size={14} />
                  <span>Create more</span>
                </button>
              </div>

              {/* Generated Instagram Caption & Hashtags */}
              <div className={s.generatedCaptionBox}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7A756D', marginBottom: 6 }}>
                  Generated Instagram Caption
                </div>
                {generatedPost.caption}
                <div className={s.hashtagList}>
                  {generatedPost.hashtags.map((tag, i) => (
                    <span key={i} className={s.hashtagPill}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Matching Story Sequence Cards */}
              <div className={s.subPreviewGrid}>
                {generatedPost.storyCards.map((sub, idx) => (
                  <div key={idx} className={s.subPreviewCard}>
                    <img src={sub.image} alt={sub.title} className={s.subPreviewImg} />
                    <div className={s.subPreviewOverlay}>
                      <span className={s.subPreviewText}>{sub.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* INITIAL STATIC STYLE PREVIEW */
            <>
              <div className={s.mainPreviewCard}>
                <img
                  src={currentPreset.image}
                  alt="Main preview post"
                  className={s.mainPreviewImg}
                />
                <div className={s.mainPreviewOverlay}>
                  <div className={s.mainPreviewHeadline}>
                    {currentPreset.headline}
                  </div>

                  <div className={s.mainPreviewBrandBadge}>
                    ✦ {brandName.trim().toUpperCase() || 'BLOOM SKIN'} ✦
                  </div>
                </div>
              </div>

              <div className={s.subPreviewGrid}>
                {currentPreset.subCards.map((sub, idx) => (
                  <div key={idx} className={s.subPreviewCard}>
                    <img
                      src={sub.image}
                      alt={sub.title}
                      className={s.subPreviewImg}
                    />
                    <div className={s.subPreviewOverlay}>
                      <span className={s.subPreviewText}>{sub.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className={s.previewDisclaimer}>
            <Info size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              {generatedPost
                ? generatedPost.isClaimed
                  ? 'Your generated post is unlocked in full HD and saved to your account.'
                  : 'Click "Save", "Download" or "Create more" above to attach this generated post to your free account and claim 5 free credits.'
                : 'Click "Preview my brand content" to open the interactive Studio without login, generate your first design, and claim 5 free credits.'}
            </span>
          </div>
        </div>
      </section>

      {/* 5. SECTION 3: EXAMPLE CONTENT */}
      <section className={s.showcaseSection}>
        <div className={s.showcaseInner}>
          <div className={s.showcaseHeader}>
            <div className={s.eyebrow}>Real Studio Outputs</div>
            <h2 className={s.showcaseTitle}>Real content. Your brand.</h2>
            <p className={s.showcaseSubtitle}>
              Every piece is staged with pixel-accurate bottle preservation, physically balanced contact shadows, and luxury editorial lighting.
            </p>

            <div className={s.showcaseChecklist}>
              <div className={s.checkItem}>
                <div className={s.checkCircle}>
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Feed posts (1:1 high-res)</span>
              </div>
              <div className={s.checkItem}>
                <div className={s.checkCircle}>
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Instagram Stories (9:16 safe-zones)</span>
              </div>
              <div className={s.checkItem}>
                <div className={s.checkCircle}>
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Multi-slide educational Carousels</span>
              </div>
            </div>
          </div>

          <div className={s.showcaseCardsRow}>
            <div className={s.showcaseStoryCard}>
              <img
                src="/images/beauty/skincare_cleanse.jpg"
                alt="The power of natural ingredients"
                className={s.showcaseCardImg}
              />
              <div className={s.showcaseCardOverlay}>
                <div className={s.showcaseCardHeadline}>
                  The power of natural ingredients
                </div>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.85 }}>
                  {brandName.toUpperCase() || 'BLOOM SKIN'}
                </div>
              </div>
            </div>

            <div className={s.showcaseStoryCard}>
              <img
                src="/images/beauty/skincare_model.jpg"
                alt="Skincare tips for glowing skin"
                className={s.showcaseCardImg}
              />
              <div className={s.showcaseCardOverlay}>
                <div className={s.showcaseCardHeadline}>
                  Skincare tips for glowing skin.
                </div>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.85 }}>
                  Daily Ritual
                </div>
              </div>
            </div>

            <div className={s.showcaseStoryCard}>
              <img
                src="/images/beauty/skincare_minimal.jpg"
                alt="3 steps for a healthier skin barrier"
                className={s.showcaseCardImg}
              />
              <div className={s.showcaseCardOverlay}>
                <div className={s.showcaseCardHeadline}>
                  3 steps for a healthier skin barrier
                </div>
                <div className={s.showcaseStepsList}>
                  <div className={s.showcaseStepBullet}>
                    <div className={s.showcaseStepDot} />
                    <span>Cleanse gently</span>
                  </div>
                  <div className={s.showcaseStepBullet}>
                    <div className={s.showcaseStepDot} />
                    <span>Hydrate deeply</span>
                  </div>
                  <div className={s.showcaseStepBullet}>
                    <div className={s.showcaseStepDot} />
                    <span>Protect daily</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SOCIAL PROOF (BETA FOUNDER REVIEWS) */}
      <section className={s.socialProofSection}>
        <div className={s.socialProofHeader}>
          <div className={s.eyebrow}>Trusted by Independent Beauty Brands</div>
          <h2 className={s.stepTitle}>Loved by cosmetic & skincare founders</h2>
          <p className={s.stepSubtitle}>
            See how boutique beauty brands stand out on Instagram without renting photo studios or hiring expensive production agencies.
          </p>
        </div>

        <div className={s.testimonialsGrid}>
          <div className={s.testimonialCard}>
            <p className={s.quoteText}>
              We used to spend 4 full days every month staging bottles and editing shadows for our Instagram feed. With MarkMosaiq, our dropper bottles keep their exact label clarity and the marble studio lighting looks like a high-end Vogue editorial.
            </p>
            <div className={s.authorArea}>
              <img
                src="/images/beauty/avatar_1.jpg"
                alt="Yasmine Ben Salem"
                className={s.authorAvatar}
              />
              <div className={s.authorMeta}>
                <span className={s.authorName}>Yasmine Ben Salem</span>
                <span className={s.authorRole}>Founder, Oasis Botanical Skincare</span>
                <span className={s.authorBadge}>✓ Verified Founder • Skincare</span>
              </div>
            </div>
          </div>

          <div className={s.testimonialCard}>
            <p className={s.quoteText}>
              Generic AI image tools always scramble our perfume typography and hallucinate fake spray caps. MarkMosaiq is the only studio that preserves our real physical flacon with 100% pixel accuracy. Our DM pre-orders grew 48% on our latest launch.
            </p>
            <div className={s.authorArea}>
              <img
                src="/images/beauty/avatar_2.jpg"
                alt="Camille Laurent"
                className={s.authorAvatar}
              />
              <div className={s.authorMeta}>
                <span className={s.authorName}>Camille Laurent</span>
                <span className={s.authorRole}>Creative Director, L’Aura Parfums</span>
                <span className={s.authorBadge}>✓ Verified Brand • Fragrance</span>
              </div>
            </div>
          </div>

          <div className={s.testimonialCard}>
            <p className={s.quoteText}>
              Our Instagram Stories look like we hired an agency in Milan. 10 minutes to generate an entire week of cohesive content, with zero design skills needed. Testing the Studio before signing up and getting 5 free credits made it completely risk-free.
            </p>
            <div className={s.authorArea}>
              <img
                src="/images/beauty/avatar_3.jpg"
                alt="Inès Mansour"
                className={s.authorAvatar}
              />
              <div className={s.authorMeta}>
                <span className={s.authorName}>Inès Mansour</span>
                <span className={s.authorRole}>Co-founder, Pure Glow Cosmetics</span>
                <span className={s.authorBadge}>✓ Verified Brand • Clean Makeup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 4: HOW IT WORKS */}
      <section className={s.howItWorksSection} id="how-it-works">
        <h2 className={s.howItWorksTitle}>How it works</h2>
        <p className={s.howItWorksSubtitle}>
          From your idea to beautiful branded content — in just a few steps.
        </p>

        <div className={s.stepsGrid}>
          <div className={s.stepCard}>
            <div className={s.stepTopRow}>
              <span className={s.stepBadgeNumber}>01</span>
              <div className={s.stepIconWrap}>
                <Layers size={17} />
              </div>
            </div>
            <div className={s.stepName}>Choose your brand style</div>
            <p className={s.stepDesc}>
              Pick your category (Skincare, Cosmetics, Perfume) and choose your preferred visual aesthetic.
            </p>
          </div>

          <div className={s.stepCard}>
            <div className={s.stepTopRow}>
              <span className={s.stepBadgeNumber}>02</span>
              <div className={s.stepIconWrap}>
                <Sparkles size={17} />
              </div>
            </div>
            <div className={s.stepName}>Test the Studio live</div>
            <p className={s.stepDesc}>
              Open the interactive Studio immediately with zero login required and generate your first branded design.
            </p>
          </div>

          <div className={s.stepCard}>
            <div className={s.stepTopRow}>
              <span className={s.stepBadgeNumber}>03</span>
              <div className={s.stepIconWrap}>
                <Check size={17} />
              </div>
            </div>
            <div className={s.stepName}>Unlock 5 free credits</div>
            <p className={s.stepDesc}>
              After your first design is generated, sign up or log in from the popup to save your design and claim 5 free credits.
            </p>
          </div>

          <div className={s.stepCard}>
            <div className={s.stepTopRow}>
              <span className={s.stepBadgeNumber}>04</span>
              <div className={s.stepIconWrap}>
                <ArrowRight size={17} />
              </div>
            </div>
            <div className={s.stepName}>Keep creating on demand</div>
            <p className={s.stepDesc}>
              Generate more feed posts, story sequences, and carousels whenever you launch a product or seasonal campaign.
            </p>
          </div>
        </div>
      </section>

      {/* 8. SECTION 5: OUTREACH OFFER BANNER & PRICING TRANSPARENCY */}
      <section className={s.offerSection}>
        <div className={s.offerCard}>
          <div className={s.offerImgSide}>
            <img
              src="/images/beauty/offer_banner.jpg"
              alt="Skincare bottle with soft light"
              className={s.offerImg}
            />
          </div>

          <div className={s.offerContentSide}>
            <div className={s.eyebrow}>Get Started Free</div>
            <h2 className={s.offerTitle}>
              Your first 5 content credits are on us.
            </h2>
            <p className={s.offerSubtitle}>
              Explore the MarkMosaiq Studio without logging in, generate your first design, and claim 5 free credits to keep creating.
            </p>

            <div className={s.offerChecklist}>
              <div className={s.offerCheckItem}>
                <div className={s.offerCheckCircle}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>5 free studio credits</span>
              </div>
              <div className={s.offerCheckItem}>
                <div className={s.offerCheckCircle}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>No credit card required</span>
              </div>
              <div className={s.offerCheckItem}>
                <div className={s.offerCheckCircle}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>No sales call or commitment</span>
              </div>
              <div className={s.offerCheckItem}>
                <div className={s.offerCheckCircle}>
                  <Check size={12} strokeWidth={3} />
                </div>
                <span>Create with your own brand identity</span>
              </div>
            </div>

            <button onClick={handleSectionCtaClick} className={s.primaryPillButton}>
              <span>Create my first branded post</span>
              <ArrowRight size={17} />
            </button>

            <div className={s.pricingTransparencyBox}>
              <div className={s.pricingNoticeTitle}>
                <ShieldCheck size={16} color="#2F6F53" />
                <span>What happens after your 5 free credits?</span>
              </div>
              <p className={s.pricingNoticeDesc}>
                There are zero unexpected renewals or surprise charges. If you wish to continue, simple on-demand packs start at just <strong>29 DT (~$19)</strong> for 20 high-resolution visuals. You only pay when you need more content.{' '}
                <Link href="/pricing" className={s.pricingLink}>
                  View all pricing plans & packs →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section className={s.faqSection} id="faq">
        <div className={s.faqHeader}>
          <div className={s.eyebrow}>Common Questions</div>
          <h2 className={s.faqTitle}>Frequently asked questions</h2>
          <p className={s.faqSubtitle}>
            Everything you need to know about creating branded beauty content with MarkMosaiq.
          </p>
        </div>

        <div className={s.faqList}>
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className={`${s.faqItem} ${openFaq === idx ? s.faqItemOpen : ''}`}
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className={s.faqQuestionButton}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`${s.faqChevron} ${openFaq === idx ? s.faqChevronOpen : ''}`}
                />
              </button>
              {openFaq === idx && (
                <div className={s.faqAnswer}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className={s.footer}>
        <div className={s.footerInner}>
          <div className={s.footerLeft}>
            <div className={s.logoArea}>
              <div className={s.logoMark}>
                <Sparkles size={20} />
              </div>
              <span className={s.brandText} style={{ fontSize: 18 }}>MarkMosaiq</span>
            </div>
            <span className={s.footerTagline}>
              Branded content for beauty, skincare and cosmetic businesses.
            </span>
          </div>

          <div className={s.footerLinks}>
            <Link href="/contact" className={s.footerLink}>
              Contact
            </Link>
            <Link href="/pricing" className={s.footerLink}>
              Pricing
            </Link>
            <Link href="/privacy" className={s.footerLink}>
              Privacy Policy
            </Link>
            <Link href="/terms" className={s.footerLink}>
              Terms of Service
            </Link>
          </div>

          <a href="mailto:contact@markmosaiq.com" className={s.contactBadge}>
            <Mail size={14} />
            <span>contact@markmosaiq.com</span>
          </a>
        </div>
      </footer>

      {/* 11. ISOLATED TRY-FIRST SIGNUP / LOGIN POPUP MODAL */}
      <TrialAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        triggerAction={modalTriggerAction}
        trialPost={generatedPost}
        brandName={brandName}
        onClaimSuccess={handleClaimSuccess}
      />
    </div>
  );
}
