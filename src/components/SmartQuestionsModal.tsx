'use client';

import React, { useState } from 'react';
import s from './SmartQuestionsModal.module.css';
import {
  Sparkles,
  Heart,
  Shield,
  Zap,
  ShoppingBag,
  Check,
  ArrowRight,
  ArrowLeft,
  Users,
  Smartphone,
  Briefcase,
  Award,
  Pencil as Edit2,
  X,
  Target,
  Palette,
  Type,
  FileText,
  Globe,
} from 'lucide-react';
import { CreativeIntentType } from '@/lib/artDirector';

const InstagramIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export interface SmartQuestionsPayload {
  intentId: CreativeIntentType;
  goal: string;
  styleId: string;
  stylePrompt?: string;
  audienceId: string;
  platform: string;
  adText: string;
  copyLanguage: 'ar' | 'fr' | 'darija';
}

export interface TailoredStyleOption {
  id: string;
  name: string;
  description: string;
  promptModifier?: string;
  thumbnail?: string;
  bgGradient?: string;
  intentId?: CreativeIntentType;
  hotRate?: string;
  referenceCampaign?: string;
}

interface SmartQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productImage: string;
  priceDinars: string;
  brandName?: string;
  brandLogoUrl?: string;
  initialIntentId?: CreativeIntentType;
  initialCopyLanguage?: 'ar' | 'fr' | 'darija';
  onGenerate: (payload: SmartQuestionsPayload) => void;
  isGenerating?: boolean;
  customStyles?: TailoredStyleOption[];
}

// 1. DÉFINITION DES 4 OBJECTIFS COMMERCIAUX (PHASE 1)
const GOAL_OPTIONS = [
  {
    id: 'desire',
    title: 'Create desire',
    desc: 'Make the product look irresistible and premium.',
    icon: Heart,
    intentId: 'prestige_elevation' as CreativeIntentType,
  },
  {
    id: 'trust',
    title: 'Build trust',
    desc: 'Show authenticity, quality and reliability.',
    icon: Shield,
    intentId: 'lifestyle_authentic' as CreativeIntentType,
  },
  {
    id: 'scroll',
    title: 'Stop the scroll',
    desc: 'Grab attention with a bold and eye-catching design.',
    icon: Zap,
    intentId: 'conversion_flash' as CreativeIntentType,
  },
  {
    id: 'sales',
    title: 'Drive sales',
    desc: 'Push for action and increase conversions.',
    icon: ShoppingBag,
    intentId: 'conversion_flash' as CreativeIntentType,
  },
];

// 2. DÉFINITION DES 6 STYLES VISUELS (PHASE 2)
const STYLE_OPTIONS: TailoredStyleOption[] = [
  {
    id: 'luxury',
    name: 'Editorial Luxury',
    thumbnail: '/images/whey_studio_podium.jpg',
    intentId: 'prestige_elevation' as CreativeIntentType,
    description: 'A refined and sophisticated style with dramatic lighting, rich textures and a premium atmosphere.',
  },
  {
    id: 'minimal',
    name: 'Minimal & Clean',
    thumbnail: '/images/adora_sneakers_clean.jpg',
    intentId: 'prestige_elevation' as CreativeIntentType,
    description: 'Pure, clutter-free staging with soft studio illumination highlighting product craftsmanship.',
  },
  {
    id: 'dramatic',
    name: 'Bold & Dramatic',
    thumbnail: '/images/creatine_story.jpg',
    intentId: 'conversion_flash' as CreativeIntentType,
    description: 'High-contrast lighting, sharp rim illumination and deep atmospheric tones designed to hook attention.',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    thumbnail: '/images/hero_lifestyle.jpg',
    intentId: 'lifestyle_authentic' as CreativeIntentType,
    description: 'Natural sunlit setting with authentic textures, creating an organic and relatable everyday appeal.',
  },
  {
    id: 'fresh',
    name: 'Modern & Fresh',
    thumbnail: '/images/adora_hero_perfume.jpg',
    intentId: 'lifestyle_authentic' as CreativeIntentType,
    description: 'Vibrant Mediterranean terrace atmosphere with bright morning light and refreshing coastal accents.',
  },
  {
    id: 'vintage',
    name: 'Vintage / Classic',
    thumbnail: '/images/adora_fashion_model.jpg',
    intentId: 'lifestyle_authentic' as CreativeIntentType,
    description: 'Warm retro travertine and olive wood textures delivering timeless artisanal authenticity.',
  },
];

// 3. DÉFINITION DES 4 AUDIENCES CIBLES (PHASE 3)
const AUDIENCE_OPTIONS = [
  {
    id: 'general',
    title: 'General Audience',
    desc: 'Everyone — broad appeal across Tunisia',
    icon: Users,
  },
  {
    id: 'youth',
    title: 'Young Adults (18–24)',
    desc: 'Trendy, social media, modern dynamic style',
    icon: Smartphone,
  },
  {
    id: 'pros',
    title: 'Professionals (25–40)',
    desc: 'Premium, success, elegance and reliability',
    icon: Briefcase,
  },
  {
    id: 'enthusiasts',
    title: 'Collectors / Enthusiasts',
    desc: 'Detailed, authentic, certified original quality',
    icon: Award,
  },
];

// 4. PLATEFORMES
const PLATFORMS = [
  { id: 'instagram', label: 'Instagram (1:1)', icon: InstagramIcon },
  { id: 'tiktok', label: 'TikTok / Story (9:16)', icon: Smartphone },
  { id: 'facebook', label: 'Facebook Ads', icon: FacebookIcon },
  { id: 'web', label: 'Website / E-commerce', icon: Globe },
];

export default function SmartQuestionsModal({
  isOpen,
  onClose,
  productName,
  productImage,
  priceDinars,
  brandName = 'NutriStore Tunisie',
  brandLogoUrl,
  initialIntentId = 'prestige_elevation',
  initialCopyLanguage = 'darija',
  onGenerate,
  isGenerating = false,
  customStyles,
}: SmartQuestionsModalProps) {
  // Navigation entre les 6 étapes : 0 = Intro, 1 = Goal, 2 = Style, 3 = Audience, 4 = Text, 5 = Review
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Styles disponibles : personnalisés par GPT-4o-mini pour ce produit précis, ou catalogue par défaut
  const availableStyles = (customStyles && customStyles.length > 0) ? customStyles : STYLE_OPTIONS;

  // Sélections de l'utilisateur
  const [selectedGoal, setSelectedGoal] = useState<string>('desire');
  const [selectedStyle, setSelectedStyle] = useState<string>(availableStyles[0]?.id || 'luxury');
  const [selectedAudience, setSelectedAudience] = useState<string>('general');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('instagram');
  const [copyLanguage, setCopyLanguage] = useState<'ar' | 'fr' | 'darija'>(initialCopyLanguage);
  const [textTab, setTextTab] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('p1');
  const [customText, setCustomText] = useState<string>('');

  if (!isOpen) return null;

  // BANQUE D'ACCROCHES LOCALISÉES SELON LA LANGUE CHOISIE (PHASE 4)
  const PRESET_HOOKS = {
    darija: [
      { id: 'p1', text: 'Badel el mood mteek w a3tihom el chic fi kol blasa.' },
      { id: 'p2', text: 'Promo flash w stock ma 93ad fih chay ! El khlass waqt el livri.' },
      { id: 'p3', text: 'Qualité 100% originale w livri fisaa fi tounes el kol (24-48h).' },
      { id: 'p4', text: 'A7sen forsa bech tekhou produit original b a7sen soum.' },
    ],
    ar: [
      { id: 'p1', text: 'أناقة لا تتكرر : تميز بأعلى جودة أصلية.' },
      { id: 'p2', text: 'تخفيض استثنائي وكمية محدودة ! الدفع عند الاستلام.' },
      { id: 'p3', text: 'توصيل سريع لباب دارك لكامل تراب الجمهورية (24-48 ساعة).' },
      { id: 'p4', text: 'الاختيار الأول في تونس : جودة مضمونة وسعر مميز.' },
    ],
    fr: [
      { id: 'p1', text: 'L\'Élégance intemporelle : le raffinement sans compromis.' },
      { id: 'p2', text: 'Offre exclusive limitée : commandez dès maintenant.' },
      { id: 'p3', text: 'Qualité 100% certifiée originale. Livraison express 24h-48h.' },
      { id: 'p4', text: 'Paiement à la livraison sécurisé sur toute la Tunisie.' },
    ],
  };

  const activePresets = PRESET_HOOKS[copyLanguage] || PRESET_HOOKS.darija;
  const activeStyleObj = availableStyles.find((s) => s.id === selectedStyle) || availableStyles[0];
  const activeGoalObj = GOAL_OPTIONS.find((g) => g.id === selectedGoal) || GOAL_OPTIONS[0];
  const activeAudienceObj = AUDIENCE_OPTIONS.find((a) => a.id === selectedAudience) || AUDIENCE_OPTIONS[0];

  // Résolution du texte final
  const resolvedAdText =
    textTab === 'custom' && customText.trim()
      ? customText.trim()
      : activePresets.find((p) => p.id === selectedPresetId)?.text || activePresets[0].text;

  // SOUMISSION & LANCEMENT DE LA GÉNÉRATION DU MASTER SHOT
  const handleFinalSubmit = () => {
    // Mapping vers l'intention IA appropriée
    let targetIntent: CreativeIntentType = activeStyleObj.intentId || 'prestige_elevation';
    if (!activeStyleObj.intentId) {
      if (selectedStyle === 'luxury' || selectedStyle === 'minimal') {
        targetIntent = 'prestige_elevation';
      } else if (selectedStyle === 'dramatic' || selectedGoal === 'sales' || selectedGoal === 'scroll') {
        targetIntent = 'conversion_flash';
      } else {
        targetIntent = 'lifestyle_authentic';
      }
    }

    onGenerate({
      intentId: targetIntent,
      goal: activeGoalObj.title,
      styleId: activeStyleObj.name,
      stylePrompt: activeStyleObj.promptModifier,
      audienceId: activeAudienceObj.title,
      platform: selectedPlatform,
      adText: resolvedAdText,
      copyLanguage,
    });
  };

  return (
    <div className={s.overlay}>
      <div className={s.modalCard}>
        {/* =========================================================================
            HEADER & STEPPER HORIZONTAL (VISIBLE DES ÉTAPES 1 À 5)
            ========================================================================= */}
        {currentStep > 0 && (
          <div className={s.header}>
            <div className={s.headerBrand}>
              <Sparkles size={18} className={s.brandIcon} />
              <span>Adora</span>
            </div>

            {/* Stepper horizontal connecté */}
            <div className={s.stepperWrap}>
              {[
                { num: 1, label: 'Goal' },
                { num: 2, label: 'Style' },
                { num: 3, label: 'Audience' },
                { num: 4, label: 'Text' },
                { num: 5, label: 'Review' },
              ].map((step, idx) => {
                const isActive = currentStep === step.num;
                const isDone = currentStep > step.num;
                return (
                  <React.Fragment key={step.num}>
                    <div className={s.stepItem}>
                      <div
                        className={`${s.stepBadge} ${isActive ? s.stepBadgeActive : ''} ${
                          isDone ? s.stepBadgeDone : ''
                        }`}
                      >
                        {isDone ? <Check size={14} /> : step.num}
                      </div>
                      <span
                        className={`${s.stepLabel} ${isActive ? s.stepLabelActive : ''} ${
                          isDone ? s.stepLabelDone : ''
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < 4 && (
                      <div
                        className={`${s.stepConnector} ${
                          currentStep > step.num ? s.stepConnectorDone : ''
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <button type="button" onClick={onClose} className={s.closeBtn}>
              Cancel
            </button>
          </div>
        )}

        {/* =========================================================================
            CONTENU DÉFILANT DU MODAL
            ========================================================================= */}
        <div className={s.bodyContent}>
          {/* -----------------------------------------------------------------------
              PHASE 0 : INTRO / PRODUCT READY
              ----------------------------------------------------------------------- */}
          {currentStep === 0 && (
            <div className={s.introContainer}>
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#8B5CF6" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#94A3B8' }}>
                    New Campaign
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Aperçu Hero du Produit */}
              <div className={s.introHeroCard}>
                <img
                  src={productImage || '/images/image.png'}
                  alt={productName}
                  className={s.introProductImg}
                />
              </div>

              <h2
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 900,
                  margin: '0 0 8px 0',
                  letterSpacing: '-0.02em',
                }}
              >
                Your product is ready!
              </h2>
              <p
                style={{
                  fontSize: '0.88rem',
                  color: '#94A3B8',
                  maxWidth: '460px',
                  lineHeight: 1.5,
                  margin: '0 0 24px 0',
                }}
              >
                Now let&apos;s create the perfect ad. Answer a few smart questions and we&apos;ll handle the creative direction.
              </p>

              {/* 3 Badges de Réassurance */}
              <div className={s.introFeaturesRow}>
                <div className={s.introFeatureItem}>
                  <Target size={18} className={s.introFeatureIcon} />
                  <div className={s.introFeatureTitle}>Smart guidance</div>
                  <div className={s.introFeatureDesc}>Not just a form</div>
                </div>
                <div className={s.introFeatureItem}>
                  <Zap size={18} className={s.introFeatureIcon} />
                  <div className={s.introFeatureTitle}>One clear direction</div>
                  <div className={s.introFeatureDesc}>No confusion</div>
                </div>
                <div className={s.introFeatureItem}>
                  <Sparkles size={18} className={s.introFeatureIcon} />
                  <div className={s.introFeatureTitle}>AI-powered</div>
                  <div className={s.introFeatureDesc}>Creative & professional</div>
                </div>
              </div>

              <button
                type="button"
                className={s.nextBtn}
                onClick={() => setCurrentStep(1)}
                style={{ width: '100%', maxWidth: '380px', padding: '14px 24px', justifyContent: 'center' }}
              >
                <span>Start Smart Questions</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          {/* -----------------------------------------------------------------------
              PHASE 1 (STEP 1 OF 5) : GOAL
              ----------------------------------------------------------------------- */}
          {currentStep === 1 && (
            <div>
              <div className={s.stepIndicator}>Step 1 of 5</div>
              <h2 className={s.questionTitle}>What is the main goal of this ad?</h2>
              <p className={s.questionSubtitle}>
                This helps us choose the right visual style, mood and message for your audience.
              </p>

              <div className={s.goalsGrid}>
                {GOAL_OPTIONS.map((g) => {
                  const isSelected = selectedGoal === g.id;
                  const Icon = g.icon;
                  return (
                    <div
                      key={g.id}
                      className={`${s.goalCard} ${isSelected ? s.goalCardActive : ''}`}
                      onClick={() => setSelectedGoal(g.id)}
                    >
                      <div className={s.goalCardHeader}>
                        <div className={s.goalIconBox}>
                          <Icon size={18} />
                        </div>
                        <div className={`${s.radioCircle} ${isSelected ? s.radioCircleActive : ''}`} />
                      </div>
                      <div className={s.goalCardTitle}>{g.title}</div>
                      <div className={s.goalCardDesc}>{g.desc}</div>
                    </div>
                  );
                })}
              </div>

              <div className={s.tipBox}>
                <Sparkles size={14} color="#8B5CF6" />
                <span>Pro tip: You can always refine the result in the next step.</span>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------------
              PHASE 2 (STEP 2 OF 5) : STYLE
              ----------------------------------------------------------------------- */}
          {currentStep === 2 && (
            <div>
              <div className={s.stepIndicator}>Step 2 of 5</div>
              <h2 className={s.questionTitle}>Choose a visual style</h2>
              <p className={s.questionSubtitle}>
                We&apos;ll use this style as a base for the creative direction.
              </p>

              <div className={s.stylesGrid}>
                {availableStyles.map((st) => {
                  const isSelected = selectedStyle === st.id;
                  return (
                    <div
                      key={st.id}
                      className={`${s.styleCard} ${isSelected ? s.styleCardActive : ''}`}
                      onClick={() => setSelectedStyle(st.id)}
                    >
                      <div className={s.styleThumbnailBox} style={{ background: st.bgGradient || '#0F172A' }}>
                        {st.thumbnail ? (
                          <img src={st.thumbnail} alt={st.name} className={s.styleThumbnailImg} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Palette size={22} color="#FFFFFF" style={{ opacity: 0.85 }} />
                          </div>
                        )}
                        {st.hotRate && (
                          <div className={s.styleHotRateBadge}>
                            {st.hotRate}
                          </div>
                        )}
                        {isSelected && (
                          <div className={s.styleSelectedCheck}>
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                      <div className={s.styleCardName}>
                        <div style={{ fontWeight: 800 }}>{st.name}</div>
                        {st.referenceCampaign && (
                          <div className={s.styleCampaignTag}>{st.referenceCampaign}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Détail du style actif */}
              <div className={s.styleDetailBox}>
                <Sparkles size={18} className={s.styleDetailIcon} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span className={s.styleDetailTitle}>{activeStyleObj.name}</span>
                    {activeStyleObj.hotRate && (
                      <span className={s.styleDetailHotRate}>{activeStyleObj.hotRate}</span>
                    )}
                  </div>
                  <div className={s.styleDetailDesc}>{activeStyleObj.description}</div>
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------------
              PHASE 3 (STEP 3 OF 5) : AUDIENCE & PLATFORMS
              ----------------------------------------------------------------------- */}
          {currentStep === 3 && (
            <div>
              <div className={s.stepIndicator}>Step 3 of 5</div>
              <h2 className={s.questionTitle}>Who is your target audience?</h2>
              <p className={s.questionSubtitle}>
                This helps us adjust the tone, atmosphere and visual details.
              </p>

              <div className={s.audiencesList}>
                {AUDIENCE_OPTIONS.map((aud) => {
                  const isSelected = selectedAudience === aud.id;
                  const Icon = aud.icon;
                  return (
                    <div
                      key={aud.id}
                      className={`${s.audienceCard} ${isSelected ? s.audienceCardActive : ''}`}
                      onClick={() => setSelectedAudience(aud.id)}
                    >
                      <div className={s.audienceIconBox}>
                        <Icon size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className={s.audienceTitle}>{aud.title}</div>
                        <div className={s.audienceDesc}>{aud.desc}</div>
                      </div>
                      <div className={`${s.radioCircle} ${isSelected ? s.radioCircleActive : ''}`} />
                    </div>
                  );
                })}
              </div>

              {/* Choix des plateformes */}
              <div className={s.platformsSection}>
                <div className={s.sectionLabel}>Where will you use this ad?</div>
                <div className={s.sectionDesc}>
                  We optimize the format and style for the right platform.
                </div>
                <div className={s.platformsGrid}>
                  {PLATFORMS.map((p) => {
                    const isSelected = selectedPlatform === p.id;
                    const Icon = p.icon;
                    return (
                      <div
                        key={p.id}
                        className={`${s.platformPill} ${isSelected ? s.platformPillActive : ''}`}
                        onClick={() => setSelectedPlatform(p.id)}
                      >
                        <Icon size={14} />
                        <span>{p.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------------
              PHASE 4 (STEP 4 OF 5) : TEXT
              ----------------------------------------------------------------------- */}
          {currentStep === 4 && (
            <div>
              <div className={s.stepIndicator}>Step 4 of 5</div>
              <h2 className={s.questionTitle}>Add your ad text (optional)</h2>
              <p className={s.questionSubtitle}>
                You can choose a preset option or write your own message. We&apos;ll place it naturally in the design.
              </p>

              {/* Sélecteur de langue */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94A3B8' }}>
                  Langue commerciale :
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className={`${s.platformPill} ${copyLanguage === 'darija' ? s.platformPillActive : ''}`}
                    onClick={() => setCopyLanguage('darija')}
                    style={{ padding: '6px 12px', fontSize: '0.74rem' }}
                  >
                    ⚡ 3arbi
                  </button>
                  <button
                    type="button"
                    className={`${s.platformPill} ${copyLanguage === 'ar' ? s.platformPillActive : ''}`}
                    onClick={() => setCopyLanguage('ar')}
                    style={{ padding: '6px 12px', fontSize: '0.74rem' }}
                  >
                    🇹🇳 عربي
                  </button>
                  <button
                    type="button"
                    className={`${s.platformPill} ${copyLanguage === 'fr' ? s.platformPillActive : ''}`}
                    onClick={() => setCopyLanguage('fr')}
                    style={{ padding: '6px 12px', fontSize: '0.74rem' }}
                  >
                    🇫🇷 Français
                  </button>
                </div>
              </div>

              {/* Onglets Preset vs Custom */}
              <div className={s.tabsRow}>
                <button
                  type="button"
                  className={`${s.tabBtn} ${textTab === 'preset' ? s.tabBtnActive : ''}`}
                  onClick={() => setTextTab('preset')}
                >
                  <FileText size={14} />
                  <span>Use a preset</span>
                </button>
                <button
                  type="button"
                  className={`${s.tabBtn} ${textTab === 'custom' ? s.tabBtnActive : ''}`}
                  onClick={() => setTextTab('custom')}
                >
                  <Edit2 size={14} />
                  <span>Write my own</span>
                </button>
              </div>

              {textTab === 'preset' ? (
                <div className={s.presetsList}>
                  {activePresets.map((p) => {
                    const isSelected = selectedPresetId === p.id;
                    return (
                      <div
                        key={p.id}
                        className={`${s.presetCard} ${isSelected ? s.presetCardActive : ''}`}
                        onClick={() => setSelectedPresetId(p.id)}
                      >
                        <span className={s.presetText}>&laquo; {p.text} &raquo;</span>
                        <div className={`${s.radioCircle} ${isSelected ? s.radioCircleActive : ''}`} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  className={s.customTextarea}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Tapez votre accroche ou promotion personnalisée ici (ex: Promo flash 48h, Livraison gratuite dans toute la Tunisie)..."
                />
              )}

              <div className={s.tipBox}>
                <Sparkles size={14} color="#8B5CF6" />
                <span>Don&apos;t worry — if you skip this, we&apos;ll create a beautiful ad with minimal or no text.</span>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------------
              PHASE 5 (STEP 5 OF 5) : REVIEW & GENERATE
              ----------------------------------------------------------------------- */}
          {currentStep === 5 && (
            <div>
              <div className={s.stepIndicator}>Step 5 of 5</div>
              <h2 className={s.questionTitle}>Ready to create your ad?</h2>
              <p className={s.questionSubtitle}>
                Here&apos;s a summary of your choices. You can go back to edit any section before generating.
              </p>

              <div className={s.reviewSplitGrid}>
                {/* Aperçu Produit */}
                <div className={s.reviewHeroCard}>
                  <img
                    src={productImage || '/images/image.png'}
                    alt={productName}
                    className={s.reviewProductImg}
                  />
                </div>

                {/* Résumé des choix avec crayons d'édition */}
                <div className={s.reviewSummaryList}>
                  <div className={s.reviewRow}>
                    <div className={s.reviewLabelWrap}>
                      <Heart size={14} color="#8B5CF6" />
                      <span>Goal</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={s.reviewValue}>{activeGoalObj.title}</span>
                      <button
                        type="button"
                        className={s.editStepBtn}
                        onClick={() => setCurrentStep(1)}
                        title="Modifier l'objectif"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className={s.reviewRow}>
                    <div className={s.reviewLabelWrap}>
                      <Palette size={14} color="#8B5CF6" />
                      <span>Style</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={s.reviewValue}>{activeStyleObj.name}</span>
                      <button
                        type="button"
                        className={s.editStepBtn}
                        onClick={() => setCurrentStep(2)}
                        title="Modifier le style"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className={s.reviewRow}>
                    <div className={s.reviewLabelWrap}>
                      <Users size={14} color="#8B5CF6" />
                      <span>Audience</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={s.reviewValue}>{activeAudienceObj.title}</span>
                      <button
                        type="button"
                        className={s.editStepBtn}
                        onClick={() => setCurrentStep(3)}
                        title="Modifier l'audience"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className={s.reviewRow}>
                    <div className={s.reviewLabelWrap}>
                      <InstagramIcon size={14} />
                      <span>Platforms</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={s.reviewValue}>{selectedPlatform}</span>
                      <button
                        type="button"
                        className={s.editStepBtn}
                        onClick={() => setCurrentStep(3)}
                        title="Modifier la plateforme"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className={s.reviewRow}>
                    <div className={s.reviewLabelWrap}>
                      <Type size={14} color="#8B5CF6" />
                      <span>Text</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={s.reviewValue}>&laquo; {resolvedAdText} &raquo;</span>
                      <button
                        type="button"
                        className={s.editStepBtn}
                        onClick={() => setCurrentStep(4)}
                        title="Modifier le texte"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info banner : What happens next? */}
              <div className={s.whatHappensBox}>
                <Sparkles size={18} color="#8B5CF6" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF', marginBottom: '2px' }}>
                    What happens next?
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#CBD5E1', lineHeight: 1.45 }}>
                    We&apos;ll build one creative direction and generate your master ad. You can then refine it if needed (&lt;500ms, 0 credit).
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            FOOTER AVEC NAVIGATION (BACK / NEXT / GENERATE)
            ========================================================================= */}
        {currentStep > 0 && (
          <div className={s.footer}>
            <button
              type="button"
              className={s.backBtn}
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                className={s.nextBtn}
                onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className={s.generateBtn}
                onClick={handleFinalSubmit}
                disabled={isGenerating}
              >
                <Sparkles size={18} />
                <span>Generate my ad</span>
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
