'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import s from './landing.module.css';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { buildCheckoutUrl } from '@/lib/checkout/params';
import {
  Sparkles,
  Play,
  ArrowRight,
  Check,
  Zap,
  ShoppingBag,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Menu,
  X,
  UploadCloud,
  Download,
  Share2,
  Heart,
  Layers,
  Star,
  Camera,
  Coffee,
  Smartphone,
  Home,
  Sliders,
  Gift,
  Grid,
  Users,
  TrendingUp,
  BadgeCheck,
  Clock,
  Wallet,
  CalendarCheck,
  MessageCircle,
  Eye,
  Lock,
  CreditCard,
  RefreshCw,
  FileCheck,
  Globe,
} from 'lucide-react';

/* =========================================================================
   AUTHENTIC BRAND LOGOS (VECTOR SVGS)
   ========================================================================= */
function LorealLogo() {
  return (
    <svg width="120" height="26" viewBox="0 0 160 32" fill="currentColor">
      <text
        x="0"
        y="23"
        fontFamily="Didot, 'Bodoni MT', 'Cinzel', serif"
        fontSize="24"
        fontWeight="bold"
        letterSpacing="3"
      >
        L'ORÉAL
      </text>
      <text
        x="98"
        y="30"
        fontFamily="sans-serif"
        fontSize="7"
        fontWeight="600"
        letterSpacing="2"
      >
        PARIS
      </text>
    </svg>
  );
}

function SamsungLogo() {
  return (
    <svg width="115" height="24" viewBox="0 0 130 26" fill="currentColor">
      <text
        x="0"
        y="21"
        fontFamily="'Arial Black', sans-serif"
        fontSize="21"
        fontWeight="900"
        letterSpacing="1"
      >
        SAMSUNG
      </text>
    </svg>
  );
}

function NikeLogo() {
  return (
    <svg width="56" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.707 5.293c-2.455 2.183-5.748 4.673-9.524 7.234-2.883 1.954-5.32 3.385-7.147 4.225-.664.306-1.196.474-1.574.474-.467 0-.795-.213-.984-.637-.215-.483-.2-1.077.045-1.782.355-1.025 1.157-2.316 2.39-3.844 1.158-1.438 2.227-2.612 3.203-3.52 1.344-1.25 2.457-1.875 3.34-1.875.424 0 .762.146 1.013.438.318.371.41.873.275 1.506-.214 1.002-.916 2.302-2.106 3.901-1.05 1.412-1.867 2.368-2.451 2.868.513-.243 1.155-.589 1.927-1.037 2.463-1.43 5.485-3.541 9.068-6.333 1.012-.787 1.85-1.393 2.514-1.818.106-.068.271-.097.495-.088.358.015.632.184.821.508.19.324.237.669.141 1.034-.047.18-.184.428-.41.745z" />
    </svg>
  );
}

function AdidasLogo() {
  return (
    <svg width="44" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.2 19.5h3.6L12 8.5 9.2 8.5 3.2 19.5zm6.5 0h3.6L18 6.5h-2.8L9.7 19.5zm6.5 0h3.6L24 4.5h-2.8l-5 15z" />
    </svg>
  );
}

function HmLogo() {
  return (
    <svg width="46" height="24" viewBox="0 0 60 30" fill="currentColor">
      <text
        x="0"
        y="25"
        fontFamily="'Impact', 'Arial Black', sans-serif"
        fontSize="30"
        fontStyle="italic"
        fontWeight="900"
        letterSpacing="2"
      >
        H&amp;M
      </text>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3 15.67 6.34 6.34 0 0 0 9.34 22a6.34 6.34 0 0 0 6.34-6.33V9.21a8.16 8.16 0 0 0 4.91 1.63v-3.5a4.83 4.83 0 0 1-1-.65z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

/* =========================================================================
   INDUSTRY TABS CONFIGURATION
   ========================================================================= */
type IndustryCategory = 'beauty' | 'fitness' | 'food' | 'fashion' | 'tech' | 'home';

interface IndustryData {
  id: IndustryCategory;
  name: string;
  icon: string;
  title: string;
  desc: string;
  features: string[];
  images: string[];
}

const INDUSTRIES: Record<IndustryCategory, IndustryData> = {
  beauty: {
    id: 'beauty',
    name: 'Beauty & Skincare',
    icon: '🌸',
    title: 'Beauty & Skincare',
    desc: 'Elegant product photography, skincare campaigns and luxury visuals.',
    features: ['Premium aesthetic', 'On-brand style', 'Stunning results'],
    images: [
      '/images/beauty/slide_1_hook.jpg',
      '/images/beauty/slide_2_value.jpg',
      '/images/beauty/slide_3_cta.jpg',
    ],
  },
  fitness: {
    id: 'fitness',
    name: 'Supplements & Fitness',
    icon: '🏋️',
    title: 'Supplements & Fitness',
    desc: 'High-impact athletic staging, gym atmospheres and dark titanium podiums.',
    features: ['Athletic key lighting', 'High-converting ad angles', 'Authentic gym vibes'],
    images: [
      '/images/nut1.png',
      '/images/nut2.png',
      '/images/nut3.png',
    ],
  },
  food: {
    id: 'food',
    name: 'Food & Beverage',
    icon: '☕',
    title: 'Food & Beverage',
    desc: 'Mouthwatering café staging, rich coffee beans, and artisan gourmet aesthetics.',
    features: ['Appetizing natural shadows', 'Warm lifestyle settings', 'Ready for delivery & social'],
    images: [
      '/images/food1.jpg',
      '/images/food2.jpg',
      '/images/foo3.jpg',
    ],
  },
  fashion: {
    id: 'fashion',
    name: 'Fashion & Accessories',
    icon: '👗',
    title: 'Fashion & Accessories',
    desc: 'Modern editorial lookbooks, sneakers staging, and premium retail displays.',
    features: ['Studio light perfection', 'True-to-life colors', 'Multi-ratio exports'],
    images: [
      '/images/adora_sneakers_clean.jpg',
      '/images/adora_fashion_model.jpg',
      '/images/adora_sneakers_clean.jpg',
    ],
  },
  tech: {
    id: 'tech',
    name: 'Electronics',
    icon: '⚙️',
    title: 'Electronics',
    desc: 'Clean sleek tech backdrops, metallic pedestals, and crisp futuristic lighting.',
    features: ['Ultra-crisp reflections', 'Razor sharp edges', 'Minimalist aesthetics'],
    images: [
      '/images/elec1.png',
      '/images/elec2.png',
      '/images/elec3.png',
    ],
  },
  home: {
    id: 'home',
    name: 'Home & Lifestyle',
    icon: '🏠',
    title: 'Home & Lifestyle',
    desc: 'Sunlit living rooms, organic stone surfaces, and calm architectural scenes.',
    features: ['Soft ambient light', 'Natural textures', 'Harmonious interiors'],
    images: [
      '/images/image.png',
      '/images/adora_hero_perfume.jpg',
      '/images/hero_lifestyle.jpg',
    ],
  },
};

interface FaqItem {
  id: number;
  category: 'product' | 'plans' | 'rights';
  question: string;
  answer: string;
  highlight?: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 0,
    category: 'product',
    question: 'Does MarkMosaiq alter, warp, or redraw my actual product?',
    answer: 'No! Unlike generic image generation tools that redraw or distort products, MarkMosaiq extracts your exact physical product, preserving your logos, text, and details with 100% pixel fidelity, while rendering a bespoke commercial background and realistic shadows.',
    highlight: 'Zero product hallucination • 100% pixel fidelity',
  },
  {
    id: 1,
    category: 'product',
    question: 'What kind of photo do I need to start?',
    answer: 'A simple photo taken with your smartphone is enough! Ensure decent lighting and keep the entire product in frame. Our automatic cutout removes the background seamlessly.',
    highlight: 'Smartphone camera ready • Instant automatic cutout',
  },
  {
    id: 2,
    category: 'rights',
    question: 'Can I use these images for commercial advertising & Shopify?',
    answer: 'Yes, absolutely. All generated images come with full commercial rights for your e-commerce store, Instagram, Facebook, TikTok ads, print materials, and catalogs.',
    highlight: 'Full commercial rights • Unlimited ad usage worldwide',
  },
  {
    id: 3,
    category: 'product',
    question: 'How fast are the visuals generated?',
    answer: 'Visuals are generated within seconds. You can stage your product across multiple angles and scenes without any waiting or studio scheduling.',
    highlight: '5–10 second render time • Instant 4K export',
  },
  {
    id: 4,
    category: 'plans',
    question: 'What is included in the Free Trial?',
    answer: 'Every new account gets 5 free credits upon signup with zero credit card required. You get full access to all studio categories, lighting presets, and high-resolution exports to test your product immediately.',
    highlight: '5 free credits • No credit card required',
  },
  {
    id: 5,
    category: 'plans',
    question: 'Do unused credits expire at the end of the month?',
    answer: 'No! Unused credits rollover to the next month on all active plans, so you never lose what you have paid for. You can accumulate credits and use them when launching new collections or seasonal drops.',
    highlight: 'Automatic credit rollover • No wasted balance',
  },
  {
    id: 6,
    category: 'rights',
    question: 'What export resolutions and aspect ratios are supported?',
    answer: 'We support crisp 4K resolution exports in all standard social and e-commerce formats: 1:1 Square (Feed & Shopify), 9:16 Vertical (Instagram Stories & TikTok), 4:5 Portrait, and 16:9 Landscape (Web banners).',
    highlight: '4K Ultra-HD • 1:1, 9:16, 4:5, and 16:9 ready',
  },
];

export default function HomePage() {
  const { user } = useWorkspace();
  const { locale } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<IndustryCategory>('beauty');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currency, setCurrency] = useState<'USD' | 'EUR'>('USD');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqFilter, setFaqFilter] = useState<'all' | 'product' | 'plans' | 'rights'>('all');

  // Auto-detect European visitors
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const lang = (typeof navigator !== 'undefined' && navigator.language) || '';
      const isEu =
        tz.includes('Europe') ||
        tz.includes('Dublin') ||
        tz.includes('London') ||
        lang.includes('-IE') ||
        lang.includes('-FR') ||
        lang.includes('-DE') ||
        lang.includes('-ES') ||
        lang.includes('-IT');
      if (isEu) {
        setCurrency('EUR');
      }
    } catch {
      // fallback
    }
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const currentCategory = INDUSTRIES[activeCategory];

  return (
    <div className={s.landingWrapper}>
      {/* Decorative Floating Blossom Petals */}
      <div className={s.petalBackgroundLayer} aria-hidden="true">
        <div className={`${s.petal} ${s.petal1}`} />
        <div className={`${s.petal} ${s.petal2}`} />
        <div className={`${s.petal} ${s.petal3}`} />
        <div className={`${s.petal} ${s.petal4}`} />
        <div className={`${s.petal} ${s.petal5}`} />
      </div>

      {/* =========================================================================
          1. HEADER / NAVBAR
          ========================================================================= */}
      <header className={s.navbar}>
        <div className={s.navContainer}>
          {/* Logo */}
          <Link href="/" className={s.logoLink}>
            <img
              src="/images/logo.png"
              alt="MarkMosaiq Logo"
              className={s.logoIcon}
            />
            <span className={s.logoText}>MarkMosaiq</span>
          </Link>

          {/* Navigation Links Desktop */}
          <nav className={s.navLinks}>
            <a href="#features" className={s.navLink}>
              <span>Features</span>
              <ChevronDown size={14} />
            </a>
            <a href="#examples" className={s.navLink}>Examples</a>
            <a href="#pricing" className={s.navLink}>Pricing</a>
            <a href="#faq" className={s.navLink}>FAQ</a>
          </nav>

          {/* Right Actions */}
          <div className={s.navActions}>
            <LanguageSwitcher variant="light" />

            {user ? (
              <Link href="/studio" className={s.darkPillBtn}>
                <span>Studio IA</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <Link href="/signup?pack=free" className={s.darkPillBtn}>
                <span>Try for Free</span>
                <ArrowRight size={15} />
              </Link>
            )}

            <button
              type="button"
              className={s.mobileMenuBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className={s.mobileDropdown}>
            <a href="#features" className={s.navLink} onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#examples" className={s.navLink} onClick={() => setMobileMenuOpen(false)}>Examples</a>
            <a href="#pricing" className={s.navLink} onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" className={s.navLink} onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', borderTop: '1px solid #E2E8F0', paddingTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.84rem', color: '#64748B' }}>Language:</span>
                <LanguageSwitcher variant="light" />
              </div>
              <Link
                href={user ? '/studio' : '/signup?pack=free'}
                className={s.purplePrimaryBtn}
                style={{ textAlign: 'center', justifyContent: 'center' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>{user ? 'Studio IA' : 'Try for Free'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION
          ========================================================================= */}
      <section className={s.heroSection}>
        <div className={s.container}>
          <div className={s.heroGrid}>
            {/* Left Column */}
            <div className={s.heroLeft}>
              {/* Badge */}
              <div className={s.heroBadge}>
                <Sparkles size={13} color="#7C3AED" />
                <span>AI Visuals for E-commerce Brands</span>
              </div>

              {/* Main Headline */}
              <h1 className={s.heroTitle}>
                Your products<br />
                deserve <span className={s.italicBetter}>better</span><br />
                than ordinary photos.
              </h1>

              {/* Subtitle */}
              <p className={s.heroSubtitle}>
                Turn one simple product photo into stunning, on-brand Instagram posts, Stories, and advertising visuals. No designer, no photography studio needed.
              </p>

              {/* CTAs */}
              <div className={s.heroCtas}>
                <Link href={user ? '/studio' : '/signup?pack=free'} className={s.purplePrimaryBtn}>
                  <span>Create my first visuals</span>
                  <ArrowRight size={16} />
                </Link>

                <a href="#how-it-works" className={s.heroPlayLink}>
                  <span className={s.heroPlayCircle}>
                    <Play size={14} fill="#FFFFFF" color="#FFFFFF" style={{ marginLeft: '2px' }} />
                  </span>
                  <span>See how it works</span>
                </a>
              </div>

              {/* Trust Points */}
              <div className={s.heroTrustRow}>
                <div className={s.heroTrustItem}>
                  <Gift size={15} color="#7C3AED" />
                  <span>5 free credits</span>
                </div>
                <div className={s.heroTrustItem}>
                  <Grid size={15} color="#7C3AED" />
                  <span>All product categories</span>
                </div>
                <div className={s.heroTrustItem}>
                  <ShieldCheck size={16} color="#7C3AED" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Staged Luxury Product Podium */}
            <div className={s.heroRight}>
              <div className={s.heroStagingStage}>
                <img
                  src="/images/Présentation e-commerce pastel haut de gamme.png"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = '1';
                      img.src = '/images/hero-presentation.png';
                    }
                  }}
                  alt="MarkMosaiq AI Product Staging Visuals - Luxury Presentation"
                  className={s.heroMainVisualImg}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2.5. SOCIAL PROOF, ACTIVE USERS & ATTRACTION REVIEWS SECTION
          ========================================================================= */}
      <section className={s.socialProofSection}>
        <div className={s.container}>
          {/* Section Header */}
          <div className={s.sectionHeaderCenter}>
            <div className={s.pillBadgePurple}>
              <Sparkles size={13} color="#7C3AED" />
              <span>Early Access &amp; Launch Traction</span>
            </div>
            <h2 className={s.sectionTitle}>
              Trusted by 140+ Early E-Commerce Brands
            </h2>
            <p className={s.socialProofSubtitle}>
              Launched this month: see how early store owners and boutique brands are already staging studio-grade visuals in seconds.
            </p>
          </div>

          {/* 4 Traction Stat Counters */}
          <div className={s.statsTractionGrid}>
            <div className={s.statTractionCard}>
              <div className={s.statBadgePill}>
                <span className={s.liveDot} />
                <span>Launch Cohort</span>
              </div>
              <div className={s.statIconWrap}>
                <Users size={22} color="#7C3AED" />
              </div>
              <div className={s.statBigNumber}>140+</div>
              <div className={s.statLabel}>Early Store Owners</div>
              <div className={s.statSubtext}>Joined this month&apos;s launch cohort</div>
            </div>

            <div className={s.statTractionCard}>
              <div className={s.statBadgePill}>
                <span>6 Categories</span>
              </div>
              <div className={s.statIconWrap}>
                <Sparkles size={22} color="#9333EA" />
              </div>
              <div className={s.statBigNumber}>3,800+</div>
              <div className={s.statLabel}>Visuals Staged</div>
              <div className={s.statSubtext}>Created across 6 categories</div>
            </div>

            <div className={s.statTractionCard}>
              <div className={s.statBadgePill}>
                <span>34 Verified Reviews</span>
              </div>
              <div className={s.statIconWrap}>
                <Star size={22} color="#F59E0B" fill="#F59E0B" />
              </div>
              <div className={s.statBigNumber}>4.8 / 5.0</div>
              <div className={s.statLabel}>Early Customer Rating</div>
              <div className={s.statSubtext}>From 34 verified store reviews</div>
            </div>

            <div className={s.statTractionCard}>
              <div className={s.statBadgePill}>
                <span>Zero Studio Delay</span>
              </div>
              <div className={s.statIconWrap}>
                <TrendingUp size={22} color="#10B981" />
              </div>
              <div className={s.statBigNumber}>3.5x</div>
              <div className={s.statLabel}>Faster Content Production</div>
              <div className={s.statSubtext}>Zero photoshoot turnaround wait</div>
            </div>
          </div>


        </div>
      </section>
      {/* =========================================================================
          4. SECTION 3: FROM A SIMPLE PHOTO TO A COMPLETE CONTENT PACKAGE
          ========================================================================= */}
      <section id="features" className={s.contentPackageSection}>
        <div className={s.container}>
          <div className={s.contentPackageGrid}>
            {/* Left: Copy & Bulletpoints */}
            <div className={s.contentPackageLeft}>
              <div className={s.pillBadgePink}>
                <span>From a Simple Photo</span>
              </div>

              <h2 className={s.contentPackageTitle}>
                To a Complete<br />
                Content Package
              </h2>

              <p className={s.contentPackageSubtitle}>
                One phone photo in, a ready-to-post campaign out. Post, Story and Banner, generated together in under a minute.
              </p>

              <div className={s.contentPackageChecklist}>
                <div className={s.solutionCheckItem}>
                  <div className={s.purpleCheckIcon}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>Studio-quality scenes, zero photoshoot</span>
                </div>
                <div className={s.solutionCheckItem}>
                  <div className={s.purpleCheckIcon}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>Every format at once (Post, Story, Banner)</span>
                </div>
                <div className={s.solutionCheckItem}>
                  <div className={s.purpleCheckIcon}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span>Your real product, kept 100% intact</span>
                </div>
              </div>

              <Link href={user ? '/studio' : '/signup?pack=free'} className={`${s.purplePrimaryBtn} ${s.contentPackageCta}`}>
                <span>Try it with your product</span>
                <ArrowRight size={16} />
              </Link>

              {/* Handwritten Note with Curved Arrow */}
              <div className={s.creativeHandwrittenWrap}>
                <span className={s.creativeHandwrittenText}>
                  Your product,<br />
                  our creativity!
                </span>
                <svg width="48" height="42" viewBox="0 0 48 42" fill="none" className={s.creativeArrowSvg}>
                  <path
                    d="M6 8C18 4 38 12 40 34M40 34L32 28M40 34L44 24"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Right: The Complete Transformation (Before + After + Multiple Formats) */}
            <div className={s.contentPackageRight}>
              <div className={s.packageVisualShowcase}>
                <img
                  src="/images/mockup/whey_transformation_full_hd.png"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/mockup/whey_transformation_full.jpg';
                  }}
                  alt="From a simple photo to a complete content package: Before, After, and Multiple Formats"
                  className={s.packageVisualImg}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SECTION 2: INDUSTRY SHOWCASE ("Perfect for every industry")
          ========================================================================= */}
      <section id="examples" className={s.industrySection}>
        <div className={s.container}>
          <div className={s.sectionHeaderCenter}>
            <div className={s.pillBadgePurple}>
              <span>Explore what MarkMosaiq can create</span>
            </div>
            <h2 className={s.sectionTitle}>Perfect for every industry</h2>
          </div>

          {/* Category Tabs */}
          <div className={s.industryTabsRow}>
            {(Object.keys(INDUSTRIES) as IndustryCategory[]).map((catKey) => {
              const item = INDUSTRIES[catKey];
              const isActive = activeCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveCategory(catKey)}
                  className={`${s.industryTabBtn} ${isActive ? s.industryTabBtnActive : ''}`}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Display Card */}
          <div className={s.industryDisplayCard}>
            {/* Left Content */}
            <div className={s.industryLeftContent}>
              <h3 className={s.industryTitle}>{currentCategory.title}</h3>
              <p className={s.industryDesc}>{currentCategory.desc}</p>

              <div className={s.industryFeaturesList}>
                {currentCategory.features.map((feat, idx) => (
                  <div key={idx} className={s.industryFeatureItem}>
                    <div className={s.purpleCheckIcon}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <Link href={user ? '/studio' : '/signup?pack=free'} className={s.whiteOutlinePillBtn}>
                <span>See examples</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Right 3 Showcase Cards */}
            <div className={s.industryShowcaseGrid}>
              {currentCategory.images.map((imgUrl, i) => (
                <div key={i} className={s.industryShowcaseItem}>
                  <img
                    src={imgUrl}
                    alt={`${currentCategory.name} ${i + 1}`}
                    className={s.industryImg}
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallback) {
                        img.dataset.fallback = '1';
                        if (currentCategory.id === 'beauty') {
                          img.src = `/images/slide_${i + 1}_${i === 0 ? 'hook' : i === 1 ? 'value' : 'cta'}.jpg`;
                        } else {
                          img.src = '/images/image.png';
                        }
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3.5. PAIN POINT: THE OLD WAY VS THE MARKMOSAIQ WAY + ENGAGEMENT LOOP
          ========================================================================= */}
      <section className={s.painSection}>
        <div className={s.container}>
          <div className={s.sectionHeaderCenter}>
            <div className={s.pillBadgePurple}>
              <Clock size={13} color="#7C3AED" />
              <span>Stop waiting for photoshoots</span>
            </div>
            <h2 className={s.sectionTitle}>
              Content shouldn&apos;t depend on a photographer
            </h2>
            <p className={s.socialProofSubtitle}>
              Booking shoots, waiting for edits and paying per session keeps your feed empty. MarkMosaiq lets you create scroll-stopping visuals yourself, in seconds, whenever you need them.
            </p>
          </div>

          {/* Old Way vs New Way */}
          <div className={s.painCompareGrid}>
            <div className={`${s.painCard} ${s.painCardOld}`}>
              <div className={s.painCardHead}>
                <div className={`${s.painCardIcon} ${s.painCardIconOld}`}>
                  <Camera size={20} />
                </div>
                <div>
                  <div className={s.painCardLabel}>The old way</div>
                  <h3 className={s.painCardTitle}>Hiring a photographer</h3>
                </div>
              </div>
              <ul className={s.painList}>
                <li className={s.painListItem}>
                  <span className={s.painDotOld}><X size={12} strokeWidth={3} /></span>
                  <span>Book a date and wait <strong>3–7 days</strong> for edited photos</span>
                </li>
                <li className={s.painListItem}>
                  <span className={s.painDotOld}><X size={12} strokeWidth={3} /></span>
                  <span>Pay <strong>$150–$400</strong> per session, for every new product</span>
                </li>
                <li className={s.painListItem}>
                  <span className={s.painDotOld}><X size={12} strokeWidth={3} /></span>
                  <span>A handful of photos, then your feed goes quiet again</span>
                </li>
                <li className={s.painListItem}>
                  <span className={s.painDotOld}><X size={12} strokeWidth={3} /></span>
                  <span>Resize each image by hand for Post, Story and Banner</span>
                </li>
              </ul>
              <div className={s.painMetricOld}>
                <Clock size={15} />
                <span>Days of waiting per campaign</span>
              </div>
            </div>

            <div className={s.painVsBadge}>VS</div>

            <div className={`${s.painCard} ${s.painCardNew}`}>
              <div className={s.painCardHead}>
                <div className={`${s.painCardIcon} ${s.painCardIconNew}`}>
                  <Zap size={20} />
                </div>
                <div>
                  <div className={s.painCardLabelNew}>The MarkMosaiq way</div>
                  <h3 className={s.painCardTitle}>Create it yourself, instantly</h3>
                </div>
              </div>
              <ul className={s.painList}>
                <li className={s.painListItem}>
                  <span className={s.painDotNew}><Check size={12} strokeWidth={3} /></span>
                  <span>Snap your product with your phone and upload it</span>
                </li>
                <li className={s.painListItem}>
                  <span className={s.painDotNew}><Check size={12} strokeWidth={3} /></span>
                  <span>Get studio-quality visuals in <strong>under a minute</strong></span>
                </li>
                <li className={s.painListItem}>
                  <span className={s.painDotNew}><Check size={12} strokeWidth={3} /></span>
                  <span>Fresh scenes for every drop, promo and season</span>
                </li>
                <li className={s.painListItem}>
                  <span className={s.painDotNew}><Check size={12} strokeWidth={3} /></span>
                  <span>Post, Story and Banner formats generated together</span>
                </li>
              </ul>
              <div className={s.painMetricNew}>
                <Zap size={15} />
                <span>From photo to post in ~30 seconds</span>
              </div>
            </div>
          </div>

          {/* Engagement & Trust Loop */}
          <div className={s.loopWrap}>
            <div className={s.loopHeader}>
              <h3 className={s.loopTitle}>Stay in front of your audience, every day</h3>
              <p className={s.loopSubtitle}>
                Consistent, beautiful content is what grows engagement and builds trust. Now it&apos;s effortless.
              </p>
            </div>
            <div className={s.loopGrid}>
              <div className={s.loopStep}>
                <div className={s.loopIcon}><CalendarCheck size={20} /></div>
                <div className={s.loopStepTitle}>Post consistently</div>
                <div className={s.loopStepDesc}>New visuals ready whenever you need them</div>
              </div>
              <ArrowRight size={18} className={s.loopArrow} />
              <div className={s.loopStep}>
                <div className={s.loopIcon}><Eye size={20} /></div>
                <div className={s.loopStepTitle}>Stay visible</div>
                <div className={s.loopStepDesc}>Algorithms reward accounts that show up often</div>
              </div>
              <ArrowRight size={18} className={s.loopArrow} />
              <div className={s.loopStep}>
                <div className={s.loopIcon}><Heart size={20} /></div>
                <div className={s.loopStepTitle}>Grow engagement</div>
                <div className={s.loopStepDesc}>Pro visuals earn more likes, saves and shares</div>
              </div>
              <ArrowRight size={18} className={s.loopArrow} />
              <div className={s.loopStep}>
                <div className={s.loopIcon}><MessageCircle size={20} /></div>
                <div className={s.loopStepTitle}>Build trust &amp; sell</div>
                <div className={s.loopStepDesc}>A polished feed turns followers into DM orders</div>
              </div>
            </div>
          </div>

          {/* Conversion CTA Row */}
          <div className={s.sectionCtaRow}>
            <div className={s.sectionCtaText}>
              <strong>Ready to stop wasting time on photoshoots?</strong>
              <span>Turn your existing product photos into daily engaging social posts in seconds.</span>
            </div>
            <Link href={user ? '/studio' : '/signup?pack=free'} className={s.purplePrimaryBtn}>
              <span>Create engaging visuals</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>



      {/* =========================================================================
          5. SECTION 4: HOW IT WORKS / 3 SIMPLE STEPS & LAPTOP MOCKUP
          ========================================================================= */}
      <section id="how-it-works" className={s.howItWorksSection}>
        <div className={s.container}>
          <div className={s.sectionHeaderCenter}>
            <div className={s.pillBadgePurple}>
              <span>How It Works</span>
            </div>
            <h2 className={s.sectionTitle}>In just 3 simple steps</h2>
          </div>

          <div className={s.howItWorksContainer}>
            {/* Left: Angled Laptop Mockup */}
            <div className={s.laptopMockupFrame}>
              <img
                src="/images/pc mockup.png"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/api/assets-crop?asset=laptop';
                }}
                alt="MarkMosaiq Studio App Interface"
                className={s.laptopImg}
              />
            </div>

            {/* Right: 3 Simple Process Steps */}
            <div className={s.stepsFlowRight}>
              <div className={s.stepsListCard}>
                {/* Step 1 */}
                <div className={s.stepBlock}>
                  <div className={s.stepNumberCircle}>1</div>
                  <div className={s.stepIconWrap}>
                    <UploadCloud size={24} />
                  </div>
                  <div className={s.stepTitle}>Upload</div>
                  <div className={s.stepDesc}>Add your product photo in seconds</div>
                </div>

                <div className={s.stepConnectorArrow}>➔</div>

                {/* Step 2 */}
                <div className={s.stepBlock}>
                  <div className={s.stepNumberCircle}>2</div>
                  <div className={s.stepIconWrap}>
                    <Sparkles size={24} />
                  </div>
                  <div className={s.stepTitle}>Generate</div>
                  <div className={s.stepDesc}>Get stunning visuals powered by AI</div>
                </div>

                <div className={s.stepConnectorArrow}>➔</div>

                {/* Step 3 */}
                <div className={s.stepBlock}>
                  <div className={s.stepNumberCircle}>3</div>
                  <div className={s.stepIconWrap}>
                    <Download size={24} />
                  </div>
                  <div className={s.stepTitle}>Download &amp; Share</div>
                  <div className={s.stepDesc}>Use your new content on any platform</div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversion CTA Row */}
          <div className={s.sectionCtaRow}>
            <div className={s.sectionCtaText}>
              <strong>From raw photo to studio-quality content in 30 seconds.</strong>
              <span>No design experience needed. Instant high-resolution downloads for every platform.</span>
            </div>
            <Link href={user ? '/studio' : '/signup?pack=free'} className={s.purplePrimaryBtn}>
              <span>Try in 3 simple steps (Free)</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SECTION 5: WHY CHOOSE MARKMOSAIQ (4 FEATURE CARDS)
          ========================================================================= */}
      <section className={s.whyChooseSection}>
        <div className={s.container}>
          <div className={s.sectionHeaderCenter}>
            <div className={s.pillBadgePurple}>
              <span>Why Choose MarkMosaiq?</span>
            </div>
            <h2 className={s.sectionTitle}>A premium AI creative platform for ambitious brands</h2>
          </div>

          <div className={s.fourCardsGrid}>
            {/* Card 1 */}
            <div className={s.featureWhiteCard}>
              <div className={s.featureCardIcon}>
                <Zap size={20} />
              </div>
              <h3 className={s.cardTitle}>Premium Aesthetics</h3>
              <p className={s.cardDesc}>Create on-brand visuals that match your style.</p>
            </div>

            {/* Card 2 */}
            <div className={s.featureWhiteCard}>
              <div className={s.featureCardIcon}>
                <Play size={20} fill="#7C3AED" />
              </div>
              <h3 className={s.cardTitle}>Super Fast</h3>
              <p className={s.cardDesc}>Get from product to stunning content in seconds.</p>
            </div>

            {/* Card 3 */}
            <div className={s.featureWhiteCard}>
              <div className={s.featureCardIcon}>
                <Heart size={20} />
              </div>
              <h3 className={s.cardTitle}>Keep Your Brand</h3>
              <p className={s.cardDesc}>Your product, your colors, your identity.</p>
            </div>

            {/* Card 4 */}
            <div className={s.featureWhiteCard}>
              <div className={s.featureCardIcon}>
                <Sparkles size={20} />
              </div>
              <h3 className={s.cardTitle}>No Design Skills</h3>
              <p className={s.cardDesc}>Just upload and let AI do the magic.</p>
            </div>
          </div>

          {/* Testimonial & Purple CTA Banner from Mockup */}
          <div className={s.ctaTestimonialGrid} style={{ marginTop: '36px' }}>
            {/* Left: Testimonial & Brand Logos Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className={s.testimonialCard}>
                <div className={s.testimonialAvatarWrap}>
                  <img
                    src="/api/assets-crop?asset=sarah"
                    alt="Sarah M."
                    className={s.testimonialAvatarImg}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className={s.avatarInitials} style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}>
                    SM
                  </div>
                </div>
                <div className={s.testimonialQuoteArea}>
                  <p className={s.testimonialQuoteText}>
                    &ldquo;MarkMosaiq changed the way we create content. It&apos;s simple, fast and the results are amazing!&rdquo;
                  </p>
                  <div className={s.starsRow}>
                    ★★★★★
                  </div>
                  <div className={s.testimonialAuthor}>&mdash; Sarah M., Skincare Brand</div>
                </div>
              </div>

              {/* Trusted Brands Card */}
              <div className={s.brandsProofCard}>
                <span className={s.brandsProofLabel}>Trusted by forward-thinking brands</span>
                <div className={s.brandsLogosRow}>
                  <div className={s.brandLogoItem}><LorealLogo /></div>
                  <div className={s.brandLogoItem}><SamsungLogo /></div>
                  <div className={s.brandLogoItem}><NikeLogo /></div>
                  <div className={s.brandLogoItem}><AdidasLogo /></div>
                  <div className={s.brandLogoItem}><HmLogo /></div>
                </div>
              </div>
            </div>

            {/* Right: Purple CTA Banner */}
            <div className={s.purpleCtaBanner}>
              <Sparkles size={28} color="#F3E8FF" />
              <h3 className={s.purpleBannerTitle}>Ready to transform your product marketing?</h3>
              <p className={s.purpleBannerSub}>
                Join 140+ early store owners creating stunning content with MarkMosaiq.
              </p>
              <Link href={user ? '/studio' : '/signup?pack=free'} className={s.whiteBannerBtn}>
                <span>Create my first visuals</span>
                <ArrowRight size={18} />
              </Link>
              <div className={s.bannerGuaranteeNote}>
                No credit card required &bull; 5 free credits
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* =========================================================================
          7.5. TRUST & SAFETY SECTION
          ========================================================================= */}
      <section className={s.trustSection}>
        <div className={s.container}>
          <div className={s.sectionHeaderCenter}>
            <div className={s.pillBadgePurple}>
              <ShieldCheck size={13} color="#7C3AED" />
              <span>Built on trust</span>
            </div>
            <h2 className={s.sectionTitle}>Your brand is safe with us</h2>
            <p className={s.socialProofSubtitle}>
              Clear rules, transparent pricing and full ownership of everything you create. No surprises.
            </p>
          </div>

          <div className={s.trustGrid}>
            <div className={s.trustCard}>
              <div className={s.trustIcon}><BadgeCheck size={20} /></div>
              <div className={s.trustCardTitle}>Your real product, untouched</div>
              <div className={s.trustCardDesc}>We keep your exact product, logo and label. AI only creates the scene around it.</div>
            </div>
            <div className={s.trustCard}>
              <div className={s.trustIcon}><FileCheck size={20} /></div>
              <div className={s.trustCardTitle}>100% commercial rights</div>
              <div className={s.trustCardDesc}>Every image you generate is yours to use in ads, stores and social media.</div>
            </div>
            <div className={s.trustCard}>
              <div className={s.trustIcon}><Lock size={20} /></div>
              <div className={s.trustCardTitle}>Private by default</div>
              <div className={s.trustCardDesc}>Your uploads and visuals stay inside your workspace. We never sell your data.</div>
            </div>
            <div className={s.trustCard}>
              <div className={s.trustIcon}><CreditCard size={20} /></div>
              <div className={s.trustCardTitle}>Secure checkout in USD &amp; EUR</div>
              <div className={s.trustCardDesc}>Encrypted card payments. Transparent prices, no hidden fees.</div>
            </div>
            <div className={s.trustCard}>
              <div className={s.trustIcon}><RefreshCw size={20} /></div>
              <div className={s.trustCardTitle}>Cancel anytime</div>
              <div className={s.trustCardDesc}>No long-term contract. Unused credits roll over on active plans.</div>
            </div>
            <div className={s.trustCard}>
              <div className={s.trustIcon}><Gift size={20} /></div>
              <div className={s.trustCardTitle}>Try before you pay</div>
              <div className={s.trustCardDesc}>5 free credits to test with your own product. No credit card required.</div>
            </div>
          </div>

          <div className={s.trustStrip}>
            <div className={s.trustStripItem}><Lock size={15} /><span>SSL encrypted</span></div>
            <div className={s.trustStripDivider} />
            <div className={s.trustStripItem}><Globe size={15} /><span>Available worldwide</span></div>
            <div className={s.trustStripDivider} />
            <div className={s.trustStripItem}><MessageCircle size={15} /><span>Real human support</span></div>
            <div className={s.trustStripDivider} />
            <div className={s.trustStripItem}><ShieldCheck size={15} /><span>No credit card to start</span></div>
          </div>

          {/* Conversion CTA Row */}
          <div className={s.sectionCtaRow}>
            <div className={s.sectionCtaText}>
              <strong>Full Commercial Ownership &bull; Zero Risk</strong>
              <span>Start free with 5 credits &mdash; no credit card required, instant access.</span>
            </div>
            <Link href={user ? '/studio' : '/signup?pack=free'} className={s.purplePrimaryBtn}>
              <span>Start with 5 free credits</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. PRICING SECTION
          ========================================================================= */}
      <section id="pricing" className={s.pricingSection}>
        <div className={s.container}>
          <div className={s.pricingHeader}>
            <div className={s.pillBadgePurple}>
              <span>Pricing</span>
            </div>
            <h2 className={s.sectionTitle}>
              Simple pricing, <span className={s.gradientPurpleText}>unlimited growth</span>
            </h2>
          </div>

          {/* Controls: Billing Cycle & Currency */}
          <div className={s.pricingControlsRow}>
            {/* Billing Cycle */}
            <div className={s.cycleTogglePill}>
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`${s.cycleToggleBtn} ${billingCycle === 'monthly' ? s.cycleToggleBtnActive : ''}`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`${s.cycleToggleBtn} ${billingCycle === 'annual' ? s.cycleToggleBtnActive : ''}`}
              >
                <span>Annual</span>
                <span className={s.discountMiniBadge}>-20%</span>
              </button>
            </div>

            {/* Currency Toggle */}
            <div className={s.cycleTogglePill}>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`${s.cycleToggleBtn} ${currency === 'USD' ? s.cycleToggleBtnActive : ''}`}
              >
                $ USD
              </button>
              <button
                type="button"
                onClick={() => setCurrency('EUR')}
                className={`${s.cycleToggleBtn} ${currency === 'EUR' ? s.cycleToggleBtnActive : ''}`}
              >
                € EUR
              </button>
            </div>
          </div>

          {/* 4 Plans Grid */}
          <div className={s.pricingCardsGrid}>
            {/* Plan 1: Free */}
            <div className={s.pricingCard}>
              <div>
                <div className={s.planName}>Free Discovery</div>
                <div className={s.planDesc}>Try the magic of AI staging risk-free</div>

                <div className={s.planPriceWrap}>
                  <span className={s.planPriceAmount}>
                    {currency === 'EUR' ? '€0' : '$0'}
                  </span>
                  <span className={s.planPricePer}>/month</span>
                </div>

                <div className={s.planBadgeCredits}>5 free visual credits</div>

                <div className={s.planFeaturesList}>
                  <div className={s.planFeatureRow}>
                    <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>5 Visual generations</span>
                  </div>
                  <div className={s.planFeatureRow}>
                    <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Feed 1:1 and Stories 9:16</span>
                  </div>
                  <div className={s.planFeatureRow}>
                    <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Instant background cutout</span>
                  </div>
                </div>
              </div>

              <Link
                href={user ? '/studio' : '/signup?pack=free'}
                className={s.whiteSecondaryBtn}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Get Started</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Plan 2: Starter */}
            <div className={s.pricingCard}>
              <div>
                <div className={s.planName}>Starter Pack</div>
                <div className={s.planDesc}>Ideal for growing online stores</div>

                <div className={s.planPriceWrap}>
                  <span className={s.planPriceAmount}>
                    {currency === 'EUR'
                      ? billingCycle === 'annual' ? '€14' : '€18'
                      : billingCycle === 'annual' ? '$15' : '$19'}
                  </span>
                  <span className={s.planPricePer}>/month</span>
                </div>

                <div className={s.planBadgeCredits}>20 credits per month</div>

                <div className={s.planFeaturesList}>
                  <div className={s.planFeatureRow}>
                    <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>20 High-res visual credits</span>
                  </div>
                  <div className={s.planFeatureRow}>
                    <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Commercial ad staging presets</span>
                  </div>
                  <div className={s.planFeatureRow}>
                    <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>High resolution 4K export</span>
                  </div>
                </div>
              </div>

              <Link
                href={user ? buildCheckoutUrl({ pack: 'flash', cycle: billingCycle, currency: (currency === 'EUR' ? 'EUR' : 'USD') }) : `/signup?pack=flash&cycle=${billingCycle}&currency=${currency}`}
                className={s.whiteSecondaryBtn}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Choose Starter</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Plan 3: Pro (Featured) */}
            <div className={`${s.pricingCard} ${s.pricingCardFeatured}`}>
              <div className={s.pricingPopularTag}>MOST POPULAR</div>

              <div>
                <div className={s.planName}>Pro Launch</div>
                <div className={s.planDesc}>Complete content powerhouse for top brands</div>

                <div className={s.planPriceWrap}>
                  <span className={s.planPriceAmount}>
                    {currency === 'EUR'
                      ? billingCycle === 'annual' ? '€36' : '€45'
                      : billingCycle === 'annual' ? '$39' : '$49'}
                  </span>
                  <span className={s.planPricePer}>/month</span>
                </div>

                <div className={s.planBadgeCredits}>50 credits per month</div>

                <div className={s.planFeaturesList}>
                  <div className={s.planFeatureRow}>
                    <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>50 Full-resolution credits</span>
                  </div>
                  <div className={s.planFeatureRow}>
                    <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>All industry scene collections</span>
                  </div>
                  <div className={s.planFeatureRow}>
                    <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Priority rendering pipeline</span>
                  </div>
                  <div className={s.planFeatureRow}>
                    <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Full commercial license</span>
                  </div>
                </div>
              </div>

              <Link
                href={user ? buildCheckoutUrl({ pack: 'pro', cycle: billingCycle, currency: (currency === 'EUR' ? 'EUR' : 'USD') }) : `/signup?pack=pro&cycle=${billingCycle}&currency=${currency}`}
                className={s.purplePrimaryBtn}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Choose Pro</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            {/* Plan 4: Agency */}
            <div className={s.pricingCard}>
              <div>
                <div className={s.planName}>Omnipresence Agency</div>
                <div className={s.planDesc}>For agencies and multi-brand catalogs</div>

                <div className={s.planPriceWrap}>
                  <span className={s.planPriceAmount}>
                    {currency === 'EUR'
                      ? billingCycle === 'annual' ? '€72' : '€89'
                      : billingCycle === 'annual' ? '$79' : '$99'}
                  </span>
                  <span className={s.planPricePer}>/month</span>
                </div>

                <div className={s.planBadgeCredits}>120 credits per month</div>

                <div className={s.planFeaturesList}>
                  <div className={s.planFeatureRow}>
                    <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>120 Credits per month</span>
                  </div>
                  <div className={s.planFeatureRow}>
                    <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Multi-workspace team support</span>
                  </div>
                  <div className={s.planFeatureRow}>
                    <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>Dedicated account manager</span>
                  </div>
                </div>
              </div>

              <Link
                href={user ? buildCheckoutUrl({ pack: 'agency_299', cycle: billingCycle, currency: (currency === 'EUR' ? 'EUR' : 'USD') }) : `/signup?pack=agency_299&cycle=${billingCycle}&currency=${currency}`}
                className={s.whiteSecondaryBtn}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Choose Agency</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8.3 CUSTOMER REVIEWS SHOWCASE SECTION
          ========================================================================= */}
      <section className={s.reviewsShowcaseSection}>
        <div className={s.container}>
          {/* Section Header */}
          <div className={s.sectionHeaderCenter}>
            <div className={s.pillBadgePurple}>
              <Star size={13} color="#F59E0B" fill="#F59E0B" />
              <span>Early Customer Reviews</span>
            </div>
            <h2 className={s.sectionTitle}>
              Rated 4.8 / 5.0 by Early Store Owners
            </h2>
            <p className={s.socialProofSubtitle}>
              Real feedback from 34 verified boutique owners and brands who joined this month&apos;s launch cohort.
            </p>
          </div>

          {/* Attraction Reviews 3-Card Grid */}
          <div className={s.reviewsShowcaseGrid}>
        {/* Review 1 */}
        <div className={s.reviewCard}>
          <div className={s.reviewCardHeader}>
            <div className={s.reviewRatingRow}>
              <div className={s.reviewStars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} color="#F59E0B" fill="#F59E0B" />
                ))}
              </div>
              <span className={s.reviewTag}>Cosmetics &amp; Skincare</span>
            </div>
            <div className={s.metricHighlightBadge}>
              <TrendingUp size={13} />
              <span>+28% CTR on Instagram</span>
            </div>
          </div>

          <p className={s.reviewQuote}>
            &ldquo;We jumped on the launch this week to test new serum visuals. In 10 minutes we generated 8 clean Instagram variations that look like they were shot in a professional studio. The reflections on glass are insane.&rdquo;
          </p>

          <div className={s.reviewAuthorRow}>
            <div className={s.reviewAvatarWrap}>
              <img
                src="/api/assets-crop?asset=sarah"
                alt="Sarah M."
                className={s.reviewAvatarImg}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className={s.avatarInitials} style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}>
                SM
              </div>
            </div>
            <div className={s.reviewAuthorInfo}>
              <div className={s.reviewAuthorName}>
                <span>Sarah M.</span>
                <BadgeCheck size={16} color="#7C3AED" />
              </div>
              <div className={s.reviewAuthorRole}>Founder &bull; Lueur Botanical Skincare</div>
            </div>
          </div>
        </div>

        {/* Review 2 */}
        <div className={s.reviewCard}>
          <div className={s.reviewCardHeader}>
            <div className={s.reviewRatingRow}>
              <div className={s.reviewStars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} color="#F59E0B" fill="#F59E0B" />
                ))}
              </div>
              <span className={s.reviewTag}>Supplements &amp; Fitness</span>
            </div>
            <div className={s.metricHighlightBadge}>
              <TrendingUp size={13} />
              <span>Launch Cohort Member</span>
            </div>
          </div>

          <p className={s.reviewQuote}>
            &ldquo;As an early-stage brand, booking a photography studio wasn&apos;t in our launch budget yet. MarkMosaiq gave us high-end marble podium shots from day one. Super clean contact shadows and zero distortion.&rdquo;
          </p>

          <div className={s.reviewAuthorRow}>
            <div className={s.reviewAvatarWrap}>
              <div className={s.avatarInitials} style={{ background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' }}>
                MV
              </div>
            </div>
            <div className={s.reviewAuthorInfo}>
              <div className={s.reviewAuthorName}>
                <span>Marcus Vance</span>
                <BadgeCheck size={16} color="#7C3AED" />
              </div>
              <div className={s.reviewAuthorRole}>Growth Lead &bull; Apex Performance Nutrition</div>
            </div>
          </div>
        </div>

        {/* Review 3 */}
        <div className={s.reviewCard}>
          <div className={s.reviewCardHeader}>
            <div className={s.reviewRatingRow}>
              <div className={s.reviewStars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} color="#F59E0B" fill="#F59E0B" />
                ))}
              </div>
              <span className={s.reviewTag}>Fashion &amp; Jewelry</span>
            </div>
            <div className={s.metricHighlightBadge}>
              <TrendingUp size={13} />
              <span>First 100 Early User</span>
            </div>
          </div>

          <p className={s.reviewQuote}>
            &ldquo;Took our raw watch photos from a smartphone and turned them into magazine-style staging in seconds. It saved us days of back-and-forth editing for our collection drop this week.&rdquo;
          </p>

          <div className={s.reviewAuthorRow}>
            <div className={s.reviewAvatarWrap}>
              <div className={s.avatarInitials} style={{ background: 'linear-gradient(135deg, #F59E0B, #EA580C)' }}>
                AK
              </div>
            </div>
            <div className={s.reviewAuthorInfo}>
              <div className={s.reviewAuthorName}>
                <span>Amira Khemir</span>
                <BadgeCheck size={16} color="#7C3AED" />
              </div>
              <div className={s.reviewAuthorRole}>Creative Director &bull; Velours Studio</div>
            </div>
          </div>
        </div>
        </div>

        {/* Bottom Conversion Banner */}
        <div className={s.reviewsCtaBanner}>
          <div className={s.reviewsCtaContent}>
            <div className={s.reviewsCtaAvatars}>
              <span className={s.reviewsAvatarDot} style={{ background: '#7C3AED' }}>★</span>
              <span className={s.reviewsAvatarDot} style={{ background: '#EC4899' }}>★</span>
              <span className={s.reviewsAvatarDot} style={{ background: '#F59E0B' }}>★</span>
              <span className={s.reviewsAvatarDot} style={{ background: '#10B981' }}>★</span>
              <span className={s.reviewsAvatarDot} style={{ background: '#6366F1' }}>★</span>
            </div>
            <div>
              <h4 className={s.reviewsCtaTitle}>Join 140+ early store owners generating daily high-engagement content</h4>
              <p className={s.reviewsCtaSub}>Be part of this month&apos;s launch cohort. 3,800+ visuals staged with zero photoshoot turnaround wait.</p>
            </div>
          </div>
          <Link href={user ? '/studio' : '/signup?pack=free'} className={s.purplePrimaryBtn}>
            <span>Get started for free</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>

      {/* =========================================================================
          8.5 FAQ SECTION
          ========================================================================= */}
  <section id="faq" className={s.faqSection}>
    <div className={s.container}>
      {/* Section Header */}
      <div className={s.sectionHeaderCenter}>
        <div className={s.pillBadgePurple}>
          <Sparkles size={13} color="#7C3AED" />
          <span>Everything You Need to Know</span>
        </div>
        <h2 className={s.sectionTitle}>Frequently Asked Questions</h2>
        <p className={s.faqSectionSubtitle}>
          Have questions about photorealism, commercial rights, or how MarkMosaiq works? We have answers.
        </p>
      </div>

      {/* Interactive Category Filter Pills */}
      <div className={s.faqCategoryTabs}>
        <button
          type="button"
          onClick={() => setFaqFilter('all')}
          className={`${s.faqCategoryTab} ${faqFilter === 'all' ? s.faqCategoryTabActive : ''}`}
        >
          All Questions ({FAQ_ITEMS.length})
        </button>
        <button
          type="button"
          onClick={() => setFaqFilter('product')}
          className={`${s.faqCategoryTab} ${faqFilter === 'product' ? s.faqCategoryTabActive : ''}`}
        >
          Product Fidelity &amp; AI
        </button>
        <button
          type="button"
          onClick={() => setFaqFilter('plans')}
          className={`${s.faqCategoryTab} ${faqFilter === 'plans' ? s.faqCategoryTabActive : ''}`}
        >
          Credits &amp; Free Trial
        </button>
        <button
          type="button"
          onClick={() => setFaqFilter('rights')}
          className={`${s.faqCategoryTab} ${faqFilter === 'rights' ? s.faqCategoryTabActive : ''}`}
        >
          Commercial Rights &amp; 4K
        </button>
      </div>

      {/* FAQ Accordion List Divided in Two Verticals */}
      {(() => {
        const filteredFaqs = FAQ_ITEMS.filter((item) => faqFilter === 'all' || item.category === faqFilter);
        const half = Math.ceil(filteredFaqs.length / 2);
        const leftColumnFaqs = filteredFaqs.slice(0, half);
        const rightColumnFaqs = filteredFaqs.slice(half);

        const renderFaqItem = (item: FaqItem) => {
          const isOpen = openFaqIndex === item.id;
          return (
            <div
              key={item.id}
              className={`${s.faqItemCard} ${isOpen ? s.faqItemCardOpen : ''}`}
            >
              <button
                type="button"
                className={s.faqQuestionBtn}
                onClick={() => toggleFaq(item.id)}
                aria-expanded={isOpen}
              >
                <div className={s.faqQuestionLeft}>
                  <span className={s.faqNumberBadge}>0{item.id + 1}</span>
                  <span className={s.faqQuestionText}>{item.question}</span>
                </div>
                <div className={`${s.faqChevronCircle} ${isOpen ? s.faqChevronCircleOpen : ''}`}>
                  <ChevronDown size={18} />
                </div>
              </button>

              <div className={`${s.faqAnswerCollapse} ${isOpen ? s.faqAnswerCollapseOpen : ''}`}>
                <div className={s.faqAnswerInner}>
                  <p className={s.faqAnswerParagraph}>{item.answer}</p>
                  {item.highlight && (
                    <div className={s.faqHighlightPill}>
                      <Sparkles size={12} color="#7C3AED" />
                      <span>{item.highlight}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        };

        return (
          <div className={s.faqListGrid}>
            <div className={s.faqColumn}>
              {leftColumnFaqs.map(renderFaqItem)}
            </div>
            <div className={s.faqColumn}>
              {rightColumnFaqs.map(renderFaqItem)}
            </div>
          </div>
        );
      })()}

      {/* Bottom Help & Support Banner */}
      <div className={s.faqSupportBanner}>
        <div className={s.faqSupportLeft}>
          <div className={s.faqSupportIconCircle}>
            <HelpCircle size={24} color="#7C3AED" />
          </div>
          <div>
            <h4 className={s.faqSupportTitle}>Still have questions?</h4>
            <p className={s.faqSupportSub}>
              Can&apos;t find what you&apos;re looking for? Try MarkMosaiq free or reach out to our team.
            </p>
          </div>
        </div>
        <Link href={user ? '/studio' : '/signup?pack=free'} className={s.darkPillBtn}>
          <span>Try for Free (5 Credits)</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  </section>

  {/* =========================================================================
          9. FOOTER
          ========================================================================= */}
  <footer className={s.footer}>
    <div className={s.footerContainer}>
      {/* Left: Brand */}
      <div className={s.footerBrandArea}>
        <div className={s.footerLogoRow}>
          <img
            src="/images/logo.png"
            alt="MarkMosaiq Logo"
            className={s.logoIcon}
          />
          <span className={s.logoText}>MarkMosaiq</span>
        </div>
        <div className={s.footerTagline}>
          AI visuals for e-commerce brands
        </div>
      </div>

      {/* Center Links */}
      <div className={s.footerNavLinks}>
        <a href="#features" className={s.footerNavLink}>Features</a>
        <a href="#examples" className={s.footerNavLink}>Examples</a>
        <a href="#pricing" className={s.footerNavLink}>Pricing</a>
        <a href="#faq" className={s.footerNavLink}>FAQ</a>
      </div>

      {/* Right Socials & Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div className={s.footerSocialRow}>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={s.footerSocialIcon} aria-label="Instagram">
            <InstagramIcon />
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className={s.footerSocialIcon} aria-label="TikTok">
            <TikTokIcon />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className={s.footerSocialIcon} aria-label="YouTube">
            <YouTubeIcon />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={s.footerSocialIcon} aria-label="LinkedIn">
            <LinkedInIcon />
          </a>
        </div>

        <Link href={user ? '/studio' : '/signup?pack=free'} className={s.darkPillBtn}>
          <span>Try for Free</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  </footer>
    </div >
  );
}
