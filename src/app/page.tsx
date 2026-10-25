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
  Smartphone,
  Sun,
  PenTool,
  Target,
  Image as ImageIcon,
  Crop,
  Calendar,
  BarChart3,
  Star,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Menu,
  X,
  Layers,
  ShoppingBag,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useWorkspace();
  const { locale, setLocale, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(true);
  const [likesCount, setLikesCount] = useState<number>(1348);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'DT'>('USD');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Auto-detect Irish and European visitors to default to EUR pricing
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

  const toggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((c) => c - 1);
    } else {
      setIsLiked(true);
      setLikesCount((c) => c + 1);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className={s.landingWrapper}>
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
            <a href="#accueil" className={s.navLink}>{t.navbar.home}</a>
            <a href="#fonctionnalites" className={s.navLink}>{t.navbar.features}</a>
            <a href="#tarifs" className={s.navLink}>{t.navbar.pricing}</a>
            <a href="#exemples" className={s.navLink}>{t.navbar.examples}</a>
            <a href="#faq" className={s.navLink}>{t.navbar.faq}</a>
            <Link href="/contact" className={s.navLink}>Contact</Link>
          </nav>

          {/* Right Actions: Authenticated vs Visitor + Language Switcher */}
          <div className={s.navActions}>
            <LanguageSwitcher variant="navbar" />

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link href="/studio" className={s.primaryPillBtn}>
                  <span>{t.navbar.studioIa}</span>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login" className={s.loginBtn}>
                  {t.navbar.login}
                </Link>
                <Link href="/signup?pack=free" className={s.primaryPillBtn}>
                  <span>{t.navbar.startFree}</span>
                </Link>
              </>
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
            <a href="#accueil" className={s.navLink} onClick={() => setMobileMenuOpen(false)}>{t.navbar.home}</a>
            <a href="#fonctionnalites" className={s.navLink} onClick={() => setMobileMenuOpen(false)}>{t.navbar.features}</a>
            <a href="#tarifs" className={s.navLink} onClick={() => setMobileMenuOpen(false)}>{t.navbar.pricing}</a>
            <a href="#exemples" className={s.navLink} onClick={() => setMobileMenuOpen(false)}>{t.navbar.examples}</a>
            <a href="#faq" className={s.navLink} onClick={() => setMobileMenuOpen(false)}>{t.navbar.faq}</a>
            <Link href="/contact" className={s.navLink} onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Langue / Language:</span>
                <LanguageSwitcher variant="navbar" />
              </div>
              {user ? (
                <Link
                  href="/studio"
                  className={s.primaryPillBtn}
                  style={{ textAlign: 'center', justifyContent: 'center' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t.navbar.studioIa}
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={s.secondaryPillBtn}
                    style={{ textAlign: 'center', justifyContent: 'center' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.navbar.login}
                  </Link>
                  <Link
                    href="/signup"
                    className={s.primaryPillBtn}
                    style={{ textAlign: 'center', justifyContent: 'center' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t.navbar.startFree} ➔
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION (Dark with Atmospheric Glow)
          ========================================================================= */}
      <section id="accueil" className={s.heroSection}>
        <div className={s.container}>
          <div className={s.heroGrid}>
            {/* Left Column */}
            <div className={s.heroLeft}>
              {/* Badge */}
              <div className={s.heroPillBadge}>
                <Sparkles size={14} color="#C084FC" />
                <span>{t.hero.pillBadge}</span>
              </div>

              {/* Main Headline */}
              <h1 className={s.heroTitle}>
                {t.hero.titlePart1}{' '}
                <span className={s.gradientPurpleText}>{t.hero.titleHighlight}</span>
              </h1>

              {/* Subtitle */}
              <p className={s.heroSubtitle}>
                {t.hero.subtitle}
              </p>

              {/* CTAs */}
              <div className={s.heroCtas}>
                <Link href={user ? '/studio' : '/signup?pack=free'} className={s.primaryPillBtn}>
                  <span>{t.hero.ctaPrimary}</span>
                  <ArrowRight size={16} />
                </Link>

                <a href="#fonctionnalites" className={s.secondaryPillBtn}>
                  <Play size={14} fill="#FFFFFF" />
                  <span>{t.hero.ctaSecondary}</span>
                </a>
              </div>

              {/* Trust Points */}
              <div className={s.heroTrustList}>
                <div className={s.heroTrustItem}>
                  <Zap size={14} color="#C084FC" />
                  <span>{t.hero.trustNoSkills}</span>
                </div>
                <div className={s.heroTrustItem}>
                  <Zap size={14} color="#C084FC" />
                  <span>{t.hero.trustInstant}</span>
                </div>
                <div className={s.heroTrustItem}>
                  <Smartphone size={14} color="#C084FC" />
                  <span>{t.hero.trustSocial}</span>
                </div>
              </div>

              {/* Differentiator Callout (Why We Are Better) */}
              <div
                style={{
                  marginTop: '22px',
                  padding: '12px 16px',
                  background: 'rgba(0, 229, 255, 0.06)',
                  border: '1px solid rgba(0, 229, 255, 0.22)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <ShieldCheck size={20} color="#00E5FF" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.82rem', color: '#E2E8F0', lineHeight: 1.45 }}>
                  <strong style={{ color: '#00E5FF' }}>Accurate Product Preservation:</strong> Unlike generic AI tools that hallucinate and warp text, MarkMosaiq preserves your exact physical product, labels, and logos with 100% fidelity.
                </div>
              </div>
            </div>

            {/* Right Column: 3D Stack Mockup */}
            <div className={s.heroRight}>
              <div className={s.mockupBackdropStack}>
                {/* Angled background card left (Sneakers) */}
                <div className={s.angledCardLeft}>
                  <img
                    src="/images/adora_sneakers_clean.jpg"
                    alt="Sneakers Mockup"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Angled background card right (Creatine) */}
                <div className={s.angledCardRight}>
                  <img
                    src="/images/creatine_story.jpg"
                    alt="Fitness Mockup"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Hand-drawn annotation note */}
                <div className={s.floatingAnnotation}>
                  <span className={s.annotationText}>{t.hero.annotation}</span>
                  <svg width="60" height="36" viewBox="0 0 60 36" fill="none">
                    <path
                      d="M50 4C36 12 18 16 6 28M6 28L14 26M6 28L10 20"
                      stroke="#E2E8F0"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Main Front Instagram Card */}
                <div className={s.mainInstagramCard}>
                  {/* Instagram post header */}
                  <div className={s.instaHeader}>
                    <div className={s.instaUserWrap}>
                      <img
                        src="/images/hero_lifestyle.jpg"
                        alt="Retailer"
                        className={s.instaAvatar}
                      />
                      <div>
                        <div className={s.instaHandle}>atlanticbotanicals.ie</div>
                        <span className={s.instaSponsored}>{t.hero.instaSponsored}</span>
                      </div>
                    </div>
                    <div style={{ color: '#94A3B8', fontSize: '1rem', cursor: 'pointer' }}>•••</div>
                  </div>

                  {/* Staged Product Visual */}
                  <div className={s.instaMediaArea}>
                    <img
                      src="/images/adora_hero_perfume.jpg"
                      alt="Product visual"
                      className={s.instaMediaImg}
                    />

                    {/* Headline overlaid */}
                    <div className={s.instaOverlayHeadline}>
                      {t.hero.instaHeadline}
                    </div>

                    {/* Promo Badge */}
                    <div className={s.instaPromoBadge}>
                      <div style={{ fontSize: '0.55rem', opacity: 0.9 }}>{t.hero.instaSpecialOffer}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 900 }}>-10%</div>
                      <div style={{ fontSize: '0.52rem' }}>{t.hero.instaAvailable}</div>
                    </div>
                  </div>

                  {/* Instagram Interaction Bar */}
                  <div className={s.instaActions}>
                    <div className={s.instaActionsLeft}>
                      <button
                        type="button"
                        onClick={toggleLike}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                      >
                        <Heart
                          size={18}
                          color={isLiked ? '#E11D48' : '#0F172A'}
                          fill={isLiked ? '#E11D48' : 'none'}
                        />
                      </button>
                      <MessageCircle size={18} color="#0F172A" />
                      <Send size={18} color="#0F172A" />
                    </div>
                    <Bookmark size={18} color="#0F172A" />
                  </div>

                  {/* Likes count */}
                  <div className={s.instaLikes}>
                    {likesCount.toLocaleString(locale === 'en' ? 'en-US' : 'fr-FR')} {t.hero.instaLikes}
                  </div>

                  {/* Caption */}
                  <div className={s.instaCaption}>
                    <span className={s.instaCaptionUsername}>atlanticbotanicals.ie</span>
                    {t.hero.instaCaption}
                  </div>
                </div>

                {/* Floating Metric Pill */}
                <div className={s.floatingStatBadge}>
                  <div className={s.statTopRow}>
                    <span style={{ color: '#A855F7' }}>📈</span>
                    <span>+80%</span>
                  </div>
                  <div className={s.statSubLabel}>{t.hero.statPill}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SECTION 2: ALLIÉ MARKETING (LARGE WHITE CARD)
          ========================================================================= */}
      <section className={s.marketingSection}>
        <div className={s.container}>
          <div className={s.marketingWhiteCard}>
            {/* Left Column */}
            <div className={s.marketingLeft}>
              <div className={s.lavenderBadge}>
                <Zap size={14} color="#7C3AED" />
                <span>{t.marketing.pillBadge}</span>
              </div>

              <h2 className={s.marketingTitle}>
                {t.marketing.titlePart1}{' '}
                <span style={{ color: '#6366F1' }}>{t.marketing.titleHighlight}</span>.
              </h2>

              <p className={s.marketingDesc}>
                {t.marketing.description}
              </p>

              {/* 4 Feature Items */}
              <div className={s.marketingFeaturesGrid}>
                <div className={s.marketingFeatureItem}>
                  <div className={s.featureIconCircle}>
                    <Sun size={16} />
                  </div>
                  <div>
                    <div className={s.featureItemTitle}>{t.marketing.features.advancedAi}</div>
                    <div className={s.featureItemSub}>{t.marketing.features.advancedAiSub}</div>
                  </div>
                </div>

                <div className={s.marketingFeatureItem}>
                  <div className={s.featureIconCircle}>
                    <PenTool size={16} />
                  </div>
                  <div>
                    <div className={s.featureItemTitle}>{t.marketing.features.customStyles}</div>
                    <div className={s.featureItemSub}>{t.marketing.features.customStylesSub}</div>
                  </div>
                </div>

                <div className={s.marketingFeatureItem}>
                  <div className={s.featureIconCircle}>
                    <Target size={16} />
                  </div>
                  <div>
                    <div className={s.featureItemTitle}>{t.marketing.features.optimizedSocial}</div>
                    <div className={s.featureItemSub}>{t.marketing.features.optimizedSocialSub}</div>
                  </div>
                </div>

                <div className={s.marketingFeatureItem}>
                  <div className={s.featureIconCircle}>
                    <Zap size={16} />
                  </div>
                  <div>
                    <div className={s.featureItemTitle}>{t.marketing.features.fastEasy}</div>
                    <div className={s.featureItemSub}>{t.marketing.features.fastEasySub}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Step-by-Step Card */}
            <div className={s.steppedCard}>
              <div className={s.lavenderBadge} style={{ alignSelf: 'flex-start' }}>
                <Zap size={13} color="#7C3AED" />
                <span>{t.marketing.timeline.pillBadge}</span>
              </div>

              <div className={s.steppedTimeline}>
                {/* Step 1 */}
                <div className={s.timelineStep}>
                  <div className={s.stepNumber}>1</div>
                  <div>
                    <div className={s.stepTitle}>{t.marketing.timeline.step1Title}</div>
                    <div className={s.stepDesc}>{t.marketing.timeline.step1Desc}</div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className={s.timelineStep}>
                  <div className={s.stepNumber}>2</div>
                  <div>
                    <div className={s.stepTitle}>{t.marketing.timeline.step2Title}</div>
                    <div className={s.stepDesc}>{t.marketing.timeline.step2Desc}</div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={s.timelineStep}>
                  <div className={s.stepNumber}>3</div>
                  <div>
                    <div className={s.stepTitle}>{t.marketing.timeline.step3Title}</div>
                    <div className={s.stepDesc}>{t.marketing.timeline.step3Desc}</div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className={s.timelineStep}>
                  <div className={s.stepNumber}>4</div>
                  <div>
                    <div className={s.stepTitle}>{t.marketing.timeline.step4Title}</div>
                    <div className={s.stepDesc}>{t.marketing.timeline.step4Desc}</div>
                  </div>
                </div>
              </div>

              <Link href={user ? '/studio' : '/signup'} className={s.primaryPillBtn} style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}>
                <span>{t.marketing.timeline.cta}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. SECTION 3: SECTEURS & POSSIBILITÉS (DARK)
          ========================================================================= */}
      <section id="exemples" className={s.sectorsSection}>
        <div className={s.container}>
          <div className={s.sectorsGridRow}>
            {/* Left Column */}
            <div className={s.sectorsLeft}>
              <div className={s.heroPillBadge}>
                <span>{t.sectors.pillBadge}</span>
              </div>

              <h2 className={s.sectorsTitle}>
                {t.sectors.titlePart1}{' '}
                <span className={s.gradientPurpleText}>{t.sectors.titleHighlight}</span>
              </h2>

              <p className={s.sectorsSubtitle}>
                {t.sectors.subtitle}
              </p>

              <div>
                <Link href="/studio" className={s.secondaryPillBtn}>
                  <span>{t.sectors.cta}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right Column: 2x3 Grid */}
            <div className={s.sectorsCardsGrid}>
              {/* Card 1: Skincare & Beauty */}
              <div className={s.sectorCard}>
                <img
                  src="/images/adora_hero_perfume.jpg"
                  alt={t.sectors.cards.perfumeBeauty}
                  className={s.sectorCardImg}
                />
                <div className={s.sectorCardGradient} />
                <div className={s.sectorPillLabel}>{t.sectors.cards.perfumeBeauty}</div>
              </div>

              {/* Card 2: Candles & Wellness */}
              <div className={s.sectorCard}>
                <img
                  src="/images/creatine_story.jpg"
                  alt={t.sectors.cards.nutritionSport}
                  className={s.sectorCardImg}
                />
                <div className={s.sectorCardGradient} />
                <div className={s.sectorPillLabel}>{t.sectors.cards.nutritionSport}</div>
              </div>

              {/* Card 3: Apparel & Knitwear */}
              <div className={s.sectorCard}>
                <img
                  src="/images/adora_fashion_model.jpg"
                  alt={t.sectors.cards.fashionApparel}
                  className={s.sectorCardImg}
                />
                <div className={s.sectorCardGradient} />
                <div className={s.sectorPillLabel}>{t.sectors.cards.fashionApparel}</div>
              </div>

              {/* Card 4: Hair & Body */}
              <div className={s.sectorCard}>
                <img
                  src="/images/hero_lifestyle.jpg"
                  alt={t.sectors.cards.hairBeauty}
                  className={s.sectorCardImg}
                />
                <div className={s.sectorCardGradient} />
                <div className={s.sectorPillLabel}>{t.sectors.cards.hairBeauty}</div>
              </div>

              {/* Card 5: Artisan Food & Gourmet */}
              <div className={s.sectorCard}>
                <img
                  src="/images/hero_lifestyle.jpg"
                  alt={t.sectors.cards.foodDining}
                  className={s.sectorCardImg}
                />
                <div className={s.sectorCardGradient} />
                <div className={s.sectorPillLabel}>{t.sectors.cards.foodDining}</div>
              </div>

              {/* Card 6: Pottery & Living */}
              <div className={s.sectorCard}>
                <img
                  src="/images/image.png"
                  alt={t.sectors.cards.realEstateServices}
                  className={s.sectorCardImg}
                />
                <div className={s.sectorCardGradient} />
                <div className={s.sectorPillLabel}>{t.sectors.cards.realEstateServices}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. SECTION 4: TOUT CE QU'IL TE FAUT (DARK STUDIO APP PREVIEW)
          ========================================================================= */}
      <section id="fonctionnalites" className={s.appPreviewSection}>
        <div className={s.container}>
          <div className={s.appPreviewGrid}>
            {/* Left Feature list */}
            <div>
              <div className={s.heroPillBadge}>
                <Zap size={14} color="#C084FC" />
                <span>{t.appPreview.pillBadge}</span>
              </div>

              <h2 className={s.sectorsTitle} style={{ marginTop: '16px' }}>
                {t.appPreview.titlePart1}{' '}
                <span className={s.gradientPurpleText}>{t.appPreview.titleHighlight}</span>
              </h2>

              <p className={s.sectorsSubtitle} style={{ margin: '14px 0 24px' }}>
                {t.appPreview.subtitle}
              </p>

              <div className={s.featuresList}>
                <div className={s.featureRow}>
                  <div className={s.featureSquareIcon}>
                    <ImageIcon size={18} />
                  </div>
                  <div>
                    <div className={s.featureRowTitle}>{t.appPreview.feature1Title}</div>
                    <div className={s.featureRowDesc}>{t.appPreview.feature1Desc}</div>
                  </div>
                </div>

                <div className={s.featureRow}>
                  <div className={s.featureSquareIcon}>
                    <Crop size={18} />
                  </div>
                  <div>
                    <div className={s.featureRowTitle}>{t.appPreview.feature2Title}</div>
                    <div className={s.featureRowDesc}>{t.appPreview.feature2Desc}</div>
                  </div>
                </div>

                <div className={s.featureRow}>
                  <div className={s.featureSquareIcon}>
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div className={s.featureRowTitle}>{t.appPreview.feature3Title}</div>
                    <div className={s.featureRowDesc}>{t.appPreview.feature3Desc}</div>
                  </div>
                </div>

                <div className={s.featureRow}>
                  <div className={s.featureSquareIcon}>
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <div className={s.featureRowTitle}>{t.appPreview.feature4Title}</div>
                    <div className={s.featureRowDesc}>{t.appPreview.feature4Desc}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <Link href="/studio" className={s.primaryPillBtn}>
                  <span>{t.appPreview.cta}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right: Studio Dashboard Mockup */}
            <div className={s.studioMockupFrame}>
              {/* Studio Sidebar */}
              <div className={s.studioMockupSidebar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <img src="/images/logo.png" alt="Logo" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFFFFF' }}>MarkMosaiq</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#6366F1', fontWeight: 700, padding: '4px 6px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '6px' }}>
                  ● Générer une image
                </div>
                <div style={{ fontSize: '0.68rem', color: '#94A3B8', padding: '4px 6px' }}>Mes créations</div>
                <div style={{ fontSize: '0.68rem', color: '#94A3B8', padding: '4px 6px' }}>Publications</div>
                <div style={{ fontSize: '0.68rem', color: '#94A3B8', padding: '4px 6px' }}>Statistiques</div>
                <div style={{ fontSize: '0.68rem', color: '#94A3B8', padding: '4px 6px' }}>Paramètres</div>
              </div>

              {/* Studio Main Workspace */}
              <div className={s.studioMockupMain}>
                <div className={s.studioMockupTopRow}>
                  {/* Left Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFFFFF' }}>
                      {t.appPreview.studioMockup.createVisual}
                    </div>
                    <div className={s.mockupPromptBox}>
                      {t.appPreview.studioMockup.promptPlaceholder}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#131823', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <span>{t.appPreview.studioMockup.styleRealistic}</span>
                      <span>▾</span>
                    </div>
                    <button
                      type="button"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                        border: 'none',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        padding: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        marginTop: '4px',
                      }}
                    >
                      {t.appPreview.studioMockup.generateBtn}
                    </button>
                  </div>

                  {/* Rendered Preview */}
                  <div className={s.mockupResultArea}>
                    <img
                      src="/images/adora_hero_perfume.jpg"
                      alt="Résultat IA"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#E11D48',
                        color: '#FFF',
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px dashed #FFF',
                      }}
                    >
                      -10%
                    </div>
                  </div>
                </div>

                {/* Bottom carousel thumbnails */}
                <div className={s.mockupBottomThumbnails}>
                  <div className={s.thumbItem}>
                    <img src="/images/adora_sneakers_clean.jpg" alt="Sneakers" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className={s.thumbItem}>
                    <img src="/images/creatine_story.jpg" alt="Fitness" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className={s.thumbItem}>
                    <img src="/images/hero_lifestyle.jpg" alt="Food" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div className={s.thumbItem}>
                    <img src="/images/image.png" alt="Villa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SECTION 5: WORKFLOW SHOWCASE LIGHT
          ========================================================================= */}
      <section className={s.lightWorkflowSection}>
        <div className={s.container}>
          <div className={s.lightWorkflowGrid}>
            <div>
              <div className={s.lavenderBadge}>
                <Star size={13} color="#7C3AED" />
                <span>{t.workflow.pillBadge}</span>
              </div>

              <h2 className={s.marketingTitle} style={{ marginTop: '14px' }}>
                {t.workflow.titlePart1}{' '}
                <span style={{ color: '#6366F1' }}>{t.workflow.titleHighlight}</span>
              </h2>

              <p className={s.marketingDesc} style={{ margin: '12px 0 24px' }}>
                {t.workflow.subtitle}
              </p>

              <div className={s.featuresList}>
                <div className={s.featureRow}>
                  <img
                    src="/images/hero_lifestyle.jpg"
                    alt="Aoife Murphy"
                    style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #EDE9FE' }}
                  />
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>Aoife Murphy</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>"{t.workflow.testimonialQuote}"</div>
                  </div>
                </div>

                <div className={s.featureRow}>
                  <div className={s.featureSquareIcon} style={{ background: '#EEF2FF', borderColor: '#C7D2FE', color: '#4F46E5' }}>
                    <Crop size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>{t.workflow.multiChannel}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{t.workflow.multiChannelSub}</div>
                  </div>
                </div>

                <div className={s.featureRow}>
                  <div className={s.featureSquareIcon} style={{ background: '#EEF2FF', borderColor: '#C7D2FE', color: '#4F46E5' }}>
                    <Calendar size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>{t.workflow.publishing}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{t.workflow.publishingSub}</div>
                  </div>
                </div>

                <div className={s.featureRow}>
                  <div className={s.featureSquareIcon} style={{ background: '#EEF2FF', borderColor: '#C7D2FE', color: '#4F46E5' }}>
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>{t.workflow.analytics}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{t.workflow.analyticsSub}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <Link href="/studio" className={s.primaryPillBtn}>
                  <span>{t.workflow.cta}</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Right: Clean White Dashboard Frame */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '20px',
                boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              {/* Sidebar */}
              <div
                style={{
                  width: '140px',
                  background: '#F8FAFC',
                  borderRight: '1px solid #E2E8F0',
                  padding: '16px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <img src="/images/logo.png" alt="Logo" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>MarkMosaiq</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: '#4F46E5', fontWeight: 700, padding: '4px 6px', background: '#EEF2FF', borderRadius: '6px' }}>
                  ● Générer une image
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', padding: '4px 6px' }}>Mes créations</div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', padding: '4px 6px' }}>Publications</div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', padding: '4px 6px' }}>Statistiques</div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', padding: '4px 6px' }}>Paramètres</div>
              </div>

              {/* Main Workspace */}
              <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>
                      {t.appPreview.studioMockup.createVisual}
                    </div>
                    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '10px', fontSize: '0.72rem', color: '#334155' }}>
                      {t.appPreview.studioMockup.promptPlaceholder}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                      <span>{t.appPreview.studioMockup.styleRealistic}</span>
                      <span>▾</span>
                    </div>
                    <button
                      type="button"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                        border: 'none',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        padding: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        marginTop: '4px',
                      }}
                    >
                      {t.appPreview.studioMockup.generateBtn}
                    </button>
                  </div>

                  <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: 1 }}>
                    <img
                      src="/images/adora_hero_perfume.jpg"
                      alt="Parfum"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#E11D48', color: '#FFF', fontSize: '0.6rem', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>
                      -10%
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <div style={{ height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    <img src="/images/adora_sneakers_clean.jpg" alt="1" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    <img src="/images/creatine_story.jpg" alt="2" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    <img src="/images/hero_lifestyle.jpg" alt="3" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ height: '50px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                    <img src="/images/image.png" alt="4" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. SECTION 6: TÉMOIGNAGES CLIENTS
          ========================================================================= */}
      <section id="temoignages" className={s.testimonialsSection}>
        <div className={s.container}>
          <div className={s.testimonialsHeader}>
            <div className={s.lavenderBadge}>
              <Heart size={13} color="#7C3AED" />
              <span>{t.testimonials.pillBadge}</span>
            </div>

            <h2 className={s.sectorsTitle}>
              {t.testimonials.titlePart1} <span className={s.gradientPurpleText}>{t.testimonials.titleHighlight}</span>
            </h2>
          </div>

          <div className={s.testimonialsGrid}>
            {/* Testimonial 1 */}
            <div className={s.testimonialCard}>
              <div className={s.testimonialUser}>
                <img
                  src="/images/hero_lifestyle.jpg"
                  alt="Aoife Murphy"
                  className={s.testimonialAvatar}
                />
                <div>
                  <div className={s.testimonialName}>Aoife Murphy</div>
                  <div className={s.testimonialRole}>{t.testimonials.review1Role}</div>
                </div>
              </div>

              <p className={s.testimonialQuote}>
                "{t.testimonials.review1Quote}"
              </p>

              <div className={s.testimonialStars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className={s.testimonialCard}>
              <div className={s.testimonialUser}>
                <img
                  src="/images/creatine_story.jpg"
                  alt="Liam O'Connor"
                  className={s.testimonialAvatar}
                />
                <div>
                  <div className={s.testimonialName}>Liam O'Connor</div>
                  <div className={s.testimonialRole}>{t.testimonials.review2Role}</div>
                </div>
              </div>

              <p className={s.testimonialQuote}>
                "{t.testimonials.review2Quote}"
              </p>

              <div className={s.testimonialStars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className={s.testimonialCard}>
              <div className={s.testimonialUser}>
                <img
                  src="/images/adora_fashion_model.jpg"
                  alt="Ciara Walsh"
                  className={s.testimonialAvatar}
                />
                <div>
                  <div className={s.testimonialName}>Ciara Walsh</div>
                  <div className={s.testimonialRole}>{t.testimonials.review3Role}</div>
                </div>
              </div>

              <p className={s.testimonialQuote}>
                "{t.testimonials.review3Quote}"
              </p>

              <div className={s.testimonialStars}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. SECTION 7: PRICING BANNER ("Choisis la formule qui te correspond")
          ========================================================================= */}
      <section id="tarifs" className={s.pricingSection}>
        <div className={s.container}>
          <div className={s.pricingHeader}>
            <div className={s.heroPillBadge}>
              <Zap size={13} color="#C084FC" />
              <span>{t.pricing.pillBadge}</span>
            </div>

            <h2 className={s.sectorsTitle}>
              {t.pricing.titlePart1} <span className={s.gradientPurpleText}>{t.pricing.titleHighlight}</span>
            </h2>
          </div>

          <div className={s.pricingBannerCard}>
            {/* Top row: Brand & Billing Controls */}
            <div className={s.pricingBannerTop}>
              <div className={s.pricingBrandCol}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img src="/images/logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
                  <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#FFFFFF' }}>MarkMosaiq</span>
                </div>
                <p className={s.pricingBrandText}>
                  {t.pricing.brandHeadline}
                </p>
              </div>

              {/* Controls: Mensuel / Annuel & Devise */}
              <div className={s.pricingControlsRow}>
                {/* Billing Cycle */}
                <div className={s.cycleTogglePill}>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`${s.cycleToggleBtn} ${billingCycle === 'monthly' ? s.cycleToggleBtnActive : ''}`}
                  >
                    {t.pricing.monthly}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    className={`${s.cycleToggleBtn} ${billingCycle === 'annual' ? s.cycleToggleBtnActive : ''}`}
                  >
                    <span>{t.pricing.annual}</span>
                    <span className={s.discountMiniBadge}>{t.pricing.discount20}</span>
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
                  {locale === 'fr' && (
                    <button
                      type="button"
                      onClick={() => setCurrency('DT')}
                      className={`${s.cycleToggleBtn} ${currency === 'DT' ? s.cycleToggleBtnActive : ''}`}
                    >
                      DT
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 4 Real Plans Grid */}
            <div className={s.pricingBannerGrid}>
              {/* PLAN 1: GRATUIT / FREE */}
              <div className={s.freePlanBox}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF' }}>{t.pricing.free.name}</div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px' }}>
                    {t.pricing.free.desc}
                  </div>

                  <div className={s.planPriceRow}>
                    <span className={s.planPrice}>
                      {currency === 'EUR' ? '€0' : currency === 'DT' ? '0 DT' : '$0'}
                    </span>
                    <span className={s.planPriceCycle}>
                      {billingCycle === 'annual' ? t.pricing.cyclePerMonthBilledAnnually : t.pricing.cyclePerMonth}
                    </span>
                  </div>

                  <div className={s.planCreditsHighlight} style={{ color: '#10B981' }}>
                    {t.pricing.free.creditsBadge}
                  </div>

                  <div className={s.planFeatures}>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.free.feat1}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.free.feat2}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.free.feat3}</span>
                    </div>
                
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.free.feat5}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Link
                    href={user ? '/studio' : '/signup?pack=free'}
                    className={s.secondaryPillBtn}
                    style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}
                  >
                    <span>{t.pricing.free.cta}</span>
                    <ArrowRight size={15} />
                  </Link>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8', textAlign: 'center', marginTop: '8px' }}>
                    {t.pricing.free.note}
                  </div>
                </div>
              </div>

              {/* PLAN 2: STARTER */}
              <div className={s.starterPlanBox}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF' }}>{t.pricing.starter.name}</div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px' }}>
                    {t.pricing.starter.desc}
                  </div>

                  <div className={s.planPriceRow}>
                    <span className={s.planPrice}>
                      {currency === 'EUR'
                        ? billingCycle === 'annual' ? '€14' : '€18'
                        : currency === 'DT'
                        ? billingCycle === 'annual' ? '47 DT' : '59 DT'
                        : billingCycle === 'annual' ? '$15' : '$19'}
                    </span>
                    <span className={s.planPriceCycle}>
                      {billingCycle === 'annual' ? t.pricing.cyclePerMonthBilledAnnually : t.pricing.cyclePerMonth}
                    </span>
                  </div>

                  <div className={s.planCreditsHighlight}>
                    {t.pricing.starter.creditsBadge}
                  </div>

                  <div className={s.planFeatures}>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#00E5FF" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.starter.feat1}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#00E5FF" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.starter.feat2}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#00E5FF" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.starter.feat3}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#00E5FF" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.starter.feat4}</span>
                    </div>
                   
                  </div>
                </div>

                <div>
                  <Link
                    href={user ? buildCheckoutUrl({ pack: 'flash', cycle: billingCycle, currency: (currency === 'EUR' ? 'EUR' : 'USD') }) : `/signup?pack=flash&cycle=${billingCycle}&currency=${currency}`}
                    className={s.secondaryPillBtn}
                    style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}
                  >
                    <span>{t.pricing.starter.cta}</span>
                    <ArrowRight size={15} />
                  </Link>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8', textAlign: 'center', marginTop: '8px' }}>
                    {t.pricing.starter.note}
                  </div>
                </div>
              </div>

              {/* PLAN 3: PRO (HIGHLIGHTED) */}
              <div className={s.proPlanBox}>
                <div className={s.popularBadge}>{t.pricing.pro.popularBadge}</div>

                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF' }}>{t.pricing.pro.name}</div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px' }}>
                    {t.pricing.pro.desc}
                  </div>

                  <div className={s.planPriceRow}>
                    <span className={s.planPrice}>
                      {currency === 'EUR'
                        ? billingCycle === 'annual' ? '€36' : '€45'
                        : currency === 'DT'
                        ? billingCycle === 'annual' ? '119 DT' : '149 DT'
                        : billingCycle === 'annual' ? '$39' : '$49'}
                    </span>
                    <span className={s.planPriceCycle}>
                      {billingCycle === 'annual' ? t.pricing.cyclePerMonthBilledAnnually : t.pricing.cyclePerMonth}
                    </span>
                  </div>

                  <div className={s.planCreditsHighlight} style={{ color: '#C084FC' }}>
                    {t.pricing.pro.creditsBadge}
                  </div>

                  <div className={s.planFeatures}>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.pro.feat1}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.pro.feat2}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.pro.feat3}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.pro.feat4}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.pro.feat5}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.pro.feat6}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Link
                    href={user ? buildCheckoutUrl({ pack: 'pro', cycle: billingCycle, currency: (currency === 'EUR' ? 'EUR' : 'USD') }) : `/signup?pack=pro&cycle=${billingCycle}&currency=${currency}`}
                    className={s.primaryPillBtn}
                    style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}
                  >
                    <span>{t.pricing.pro.cta}</span>
                    <ArrowRight size={15} />
                  </Link>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8', textAlign: 'center', marginTop: '8px' }}>
                    {t.pricing.pro.note}
                  </div>
                </div>
              </div>

              {/* PLAN 4: BUSINESS / ADVANCED */}
              <div className={s.businessPlanBox}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF' }}>{t.pricing.agency.name}</div>
                  <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginTop: '2px' }}>
                    {t.pricing.agency.desc}
                  </div>

                  <div className={s.planPriceRow}>
                    <span className={s.planPrice}>
                      {currency === 'EUR'
                        ? billingCycle === 'annual' ? '€72' : '€89'
                        : currency === 'DT'
                        ? billingCycle === 'annual' ? '239 DT' : '299 DT'
                        : billingCycle === 'annual' ? '$79' : '$99'}
                    </span>
                    <span className={s.planPriceCycle}>
                      {billingCycle === 'annual' ? t.pricing.cyclePerMonthBilledAnnually : t.pricing.cyclePerMonth}
                    </span>
                  </div>

                  <div className={s.planCreditsHighlight} style={{ color: '#F59E0B' }}>
                    {t.pricing.agency.creditsBadge}
                  </div>

                  <div className={s.planFeatures}>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.agency.feat1}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.agency.feat2}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.agency.feat3}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.agency.feat4}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.agency.feat5}</span>
                    </div>
                    <div className={s.planFeatureItem}>
                      <Check size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{t.pricing.agency.feat6}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Link
                    href={user ? buildCheckoutUrl({ pack: 'agency_299', cycle: billingCycle, currency: (currency === 'EUR' ? 'EUR' : 'USD') }) : `/signup?pack=agency_299&cycle=${billingCycle}&currency=${currency}`}
                    className={s.secondaryPillBtn}
                    style={{ width: '100%', justifyContent: 'center', textAlign: 'center' }}
                  >
                    <span>{t.pricing.agency.cta}</span>
                    <ArrowRight size={15} />
                  </Link>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8', textAlign: 'center', marginTop: '8px' }}>
                    {t.pricing.agency.note}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Reassurance & Full Details Link */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#94A3B8' }}>
                <ShieldCheck size={16} color="#10B981" />
                <span>{t.pricing.reassuranceWhop}</span>
              </div>
              <Link
                href="/pricing"
                style={{
                  color: '#00E5FF',
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{t.pricing.compareAll}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8.5 FAQ SECTION (Accordeon interactif)
          ========================================================================= */}
      <section id="faq" className={s.faqSection}>
        <div className={s.container}>
          <div className={s.faqHeader}>
            <div className={s.heroPillBadge}>
              <HelpCircle size={14} color="#C084FC" />
              <span>{t.faq.pillBadge}</span>
            </div>
            <h2 className={s.sectorsTitle}>
              {t.faq.titlePart1} <span className={s.gradientPurpleText}>{t.faq.titleHighlight}</span>
            </h2>
            <p className={s.sectorsSubtitle}>
              {t.faq.subtitle}
            </p>
          </div>

          <div className={s.faqGrid}>
            {/* FAQ 1 */}
            <div className={s.faqItem}>
              <button
                type="button"
                className={s.faqQuestionBtn}
                onClick={() => toggleFaq(0)}
              >
                <span>{t.faq.q1}</span>
                {openFaqIndex === 0 ? <ChevronUp size={18} color="#00E5FF" /> : <ChevronDown size={18} color="#94A3B8" />}
              </button>
              {openFaqIndex === 0 && (
                <div className={s.faqAnswerText}>
                  {t.faq.a1}
                </div>
              )}
            </div>

            {/* FAQ 2 */}
            <div className={s.faqItem}>
              <button
                type="button"
                className={s.faqQuestionBtn}
                onClick={() => toggleFaq(1)}
              >
                <span>{t.faq.q2}</span>
                {openFaqIndex === 1 ? <ChevronUp size={18} color="#00E5FF" /> : <ChevronDown size={18} color="#94A3B8" />}
              </button>
              {openFaqIndex === 1 && (
                <div className={s.faqAnswerText}>
                  {t.faq.a2}
                </div>
              )}
            </div>

            {/* FAQ 3 */}
            <div className={s.faqItem}>
              <button
                type="button"
                className={s.faqQuestionBtn}
                onClick={() => toggleFaq(2)}
              >
                <span>{t.faq.q3}</span>
                {openFaqIndex === 2 ? <ChevronUp size={18} color="#00E5FF" /> : <ChevronDown size={18} color="#94A3B8" />}
              </button>
              {openFaqIndex === 2 && (
                <div className={s.faqAnswerText}>
                  {t.faq.a3}
                </div>
              )}
            </div>

            {/* FAQ 4 */}
            <div className={s.faqItem}>
              <button
                type="button"
                className={s.faqQuestionBtn}
                onClick={() => toggleFaq(3)}
              >
                <span>{t.faq.q4}</span>
                {openFaqIndex === 3 ? <ChevronUp size={18} color="#00E5FF" /> : <ChevronDown size={18} color="#94A3B8" />}
              </button>
              {openFaqIndex === 3 && (
                <div className={s.faqAnswerText}>
                  {t.faq.a4}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FOOTER
          ========================================================================= */}
      <footer className={s.footer}>
        <div className={s.footerContainer} style={{ flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.94rem', marginBottom: '4px' }}>
                MarkMosaiq Technologies Ltd.
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                The Chase, Carmanhall Road, Sandyford Business Park, Dublin 18, D18 Y3X2, Ireland
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '4px' }}>
                {t.footer.rights}
              </div>
            </div>
            <div className={s.footerLinks} style={{ alignItems: 'center' }}>
              <Link href="/terms" className={s.footerLink}>{t.footer.legal}</Link>
              <Link href="/privacy" className={s.footerLink}>{t.footer.privacy}</Link>
              <Link href="/contact" className={s.footerLink}>{t.footer.contact}</Link>
              <LanguageSwitcher variant="footer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
