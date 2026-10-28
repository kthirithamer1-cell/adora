'use client';

import React, { useState, useRef, useEffect } from 'react';
import StudioShell from '@/components/StudioShell';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { useLanguage } from '@/lib/LanguageContext';
import { ensureSampleImagesAction } from '@/actions/generations.actions';
import { CatalogProduct } from '@/lib/brandkit';
import CheckoutModal from '@/components/CheckoutModal';
import s from './carousel.module.css';
import {
  Sparkles,
  Layers,
  UploadCloud,
  Check,
  CheckCircle2,
  ChevronRight,
  Target,
  Sliders,
  Globe,
  Smartphone,
  Download,
  Copy,
  Plus,
  X,
  ShoppingBag,
  RotateCcw,
  Flower2,
  Leaf,
  Sparkle,
  ArrowRight,
  Loader2,
} from 'lucide-react';

/* =========================================================================
   TYPES & PRESETS
   ========================================================================= */

type CampaignGoal = 'Increase engagement' | 'Drive sales & orders' | 'Launch new product' | 'Promote discount offer';
type SlideCount = '3 slides' | '5 slides';
type CampaignLang = 'French' | 'Tunisian Darija' | 'English' | 'Arabic';
type FormatRatio = 'Portrait (4:5)' | 'Square (1:1)' | 'Story (9:16)';

interface SlideState {
  index: number;
  role: 'HOOK' | 'VALUE' | 'CTA';
  headline?: string;
  subheadline?: string;
  bulletPoints?: { text: string; icon: 'leaf' | 'flower' | 'sparkle' }[];
  ctaText?: string;
  bgUrl: string;
}





export default function CarouselStudioPage() {
  const { workspace, refreshSession } = useWorkspace();
  const { t, locale } = useLanguage();

  // Étape 1 : Produit & Image
  const [productName, setProductName] = useState('Eau de Rose — Haute Parfumerie');
  const [productImage, setProductImage] = useState<string>('/images/adora_hero_perfume.jpg');
  const [isUploadActive, setIsUploadActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Étape 2 : Réglages de campagne
  const [goal, setGoal] = useState<CampaignGoal>('Increase engagement');
  const [slidesCount, setSlidesCount] = useState<SlideCount>('3 slides');
  const [format, setFormat] = useState<FormatRatio>('Portrait (4:5)');

  // Modal sélecteur de réglages
  const [activeSettingModal, setActiveSettingModal] = useState<
    'goal' | 'slides' | 'format' | null
  >(null);

  // Étape 3 : Prompt & Génération
  const [prompt, setPrompt] = useState(
    'Create a luxury 3-slide carousel for my perfume. Use elegant, warm lighting, show the product in a romantic setting, highlight the main benefit, and end with a strong call to action. Target young women, French language, 4:5 format.'
  );
  const [selectedChip, setSelectedChip] = useState('Use default prompt');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Slides actuelles affichées
  const [slides, setSlides] = useState<SlideState[]>([]);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Initialisation et copie des arrières-plans réels
  useEffect(() => {
    ensureSampleImagesAction().catch(() => { });
  }, []);

  // Upload manuel de produit
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Veuillez importer un fichier image valide (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target?.result as string;
      setProductImage(b64);
      setProductName(file.name.replace(/\.[^/.]+$/, ''));
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Sélection depuis le catalogue produit officiel du Workspace
  const handleSelectCatalogProduct = (product: CatalogProduct) => {
    setProductName(product.name);
    const img = product.cutoutImageUrl || product.originalImageUrl;
    if (img) {
      setProductImage(img);
    }
  };

  // Sélection d'un tag de prompt


  // Lancement de la génération IA
  const handleGenerateCarousel = async () => {
    if (workspace && workspace.creditsRemaining < 3) {
      setErrorMsg('Solde insuffisant (3 crédits requis pour un carrousel complet).');
      setIsCheckoutOpen(true);
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratingStep(1);

    const stepTimer = setInterval(() => {
      setGeneratingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 2400);

    try {
      const aspectCode = format === 'Square (1:1)' ? '1:1' : format === 'Story (9:16)' ? '9:16' : '4:5';

      const res = await fetch('/api/generate-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: productImage,
          productName,
          category: 'carousel',
          aspect: aspectCode,
          prompt,
          workspaceId: workspace?.id || 'ws_default',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        if (res.status === 402 || data.code === 'INSUFFICIENT_CREDITS') {
          setIsCheckoutOpen(true);
        }
        throw new Error(data.error || 'Erreur lors de la génération du carrousel.');
      }

      // Mise à jour des slides avec les visuels complets créés par l'IA
      if (Array.isArray(data.slides) && data.slides.length >= 3) {
        setSlides([
          {
            index: 1,
            role: 'HOOK',
            bgUrl: data.slides[0].image || '',
          },
          {
            index: 2,
            role: 'VALUE',
            bgUrl: data.slides[1].image || '',
          },
          {
            index: 3,
            role: 'CTA',
            bgUrl: data.slides[2].image || '',
          },
        ]);
      }

      if (refreshSession) {
        await refreshSession();
      }
    } catch (err: any) {
      console.warn('Génération carrousel notice :', err.message);
      setErrorMsg(err.message || 'Une erreur est survenue lors de la génération.');
    } finally {
      clearInterval(stepTimer);
      setIsGenerating(false);
    }
  };

  // Téléchargement du ZIP complet
  const handleDownloadAll = async () => {
    if (slides.length === 0) return;
    setIsDownloadingZip(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      // Télécharger et empaqueter les 3 images
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        let imgBlob: Blob;
        if (slide.bgUrl.startsWith('data:')) {
          const res = await fetch(slide.bgUrl);
          imgBlob = await res.blob();
        } else {
          const res = await fetch(slide.bgUrl);
          imgBlob = await res.blob();
        }
        zip.file(`slide_${slide.index}_${slide.role.toLowerCase()}.jpg`, imgBlob);
      }

      // Fichier texte de légende
      const captionText = `=====================================================
MarkMosaiq — PACK CARROUSEL INSTAGRAM 3-SLIDES
Produit : ${productName}
Format : ${format} | Objectif : ${goal}
=====================================================

SLIDE 1 [HOOK] :
${slides[0]?.headline || 'Slide 1 — Hook'}
${slides[0]?.subheadline || ''}

SLIDE 2 [VALEUR & BÉNÉFICES] :
${slides[1]?.headline || 'Slide 2 — Valeur'}
${(slides[1]?.bulletPoints || []).map((b) => `• ${b.text}`).join('\n')}

SLIDE 3 [ACTION & CONVERSION] :
${slides[2]?.headline || 'Slide 3 — Action'}
CTA : ${slides[2]?.ctaText || 'Découvrir maintenant →'}

-----------------------------------------------------
LÉGENDE COMPLÈTE PRÊTE À PUBLIER :
-----------------------------------------------------
${caption || `Découvrez ${productName} ! Commandez dès maintenant.`}

HASHTAGS :
${hashtags.length > 0 ? hashtags.join(' ') : `#${productName.toLowerCase().replace(/[^a-z0-9]/g, '')} #tunisie #ecommerce`}
`;
      zip.file('legende_instagram_carrousel.txt', captionText);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carrousel_markmosaiq_${productName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur compression ZIP carrousel :', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Copie de la légende Instagram
  const handleCopyCaption = () => {
    navigator.clipboard.writeText(`${caption}\n\n${hashtags.join(' ')}`);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2200);
  };

  return (
    <StudioShell
      activeNav="carousel"
      pageTitle="AI Carousel Studio"
      pageBadge={
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            color: '#7C3AED',
            background: '#F5F3FF',
            border: '1px solid #EDE9FE',
            borderRadius: '20px',
            padding: '3px 10px',
            fontWeight: 800,
            fontSize: '11px',
          }}
        >
          <Sparkles size={12} color="#7C3AED" /> 4K Staging v2
        </span>
      }
      onSelectCatalogProduct={handleSelectCatalogProduct}
    >
      <div className={s.pageWrapper}>
        {/* ============================================================== */}
        {/* BANNIÈRE HÉROS HAUTE (STYLE EXACT DE L'IMAGE FOURNIE)          */}
        {/* ============================================================== */}
        <div className={s.headerBanner}>
          <div className={s.headerLeft}>
            <div className={s.headerIconBox}>
              <Layers size={26} strokeWidth={2.2} />
            </div>
            <div>
              <h1 className={s.headerTitle}>AI Carousel Studio</h1>
              <p className={s.headerSubtitle}>
                Turn one product into a complete Instagram carousel. Keep your brand identity, tell a better story,
                and boost engagement with AI-powered visuals.
              </p>
            </div>
          </div>

          <div className={s.headerBadgeCard}>
            <Sparkles size={20} color="#7C3AED" />
            <div>
              <div className={s.headerBadgeTitle}>3 slides • Same product • One story</div>
              <div className={s.headerBadgeSub}>Hook → Value → CTA</div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* GRILLE PRINCIPALE À DEUX COLONNES (STUDIO SHELL)               */}
        {/* ============================================================== */}
        <div className={s.studioGrid}>
          {/* ================= COLONNE GAUCHE (CONFIGURATION) ============ */}
          <div className={s.configColumn}>
            {/* CARTE 1 : PRODUCT & BRAND */}
            <div className={s.card}>
              <div className={s.cardHeader}>
                <div className={s.cardHeaderLeft}>
                  <div className={s.stepNumberCircle}>1</div>
                  <h3 className={s.cardTitle}>Product & Brand</h3>
                </div>
                <div className={s.badgeCompleted}>
                  <CheckCircle2 size={14} color="#10B981" />
                  <span>Completed</span>
                </div>
              </div>

              <div className={s.productRow}>
                <div className={s.productInfoLeft}>
                  <img
                    src={productImage}
                    alt={productName}
                    className={s.productThumb}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/sample_perfume_amber.jpg';
                    }}
                  />
                  <div>
                    <div className={s.productName}>{productName}</div>
                    <button
                      type="button"
                      className={s.changeProductBtn}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change product
                    </button>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png,image/jpeg,image/webp"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </div>
            </div>

            {/* CARTE 2 : CAMPAIGN SETTINGS */}
            <div className={s.card}>
              <div className={s.cardHeader}>
                <div className={s.cardHeaderLeft}>
                  <div className={s.stepNumberCircle}>2</div>
                  <h3 className={s.cardTitle}>Campaign Settings</h3>
                </div>
                <div className={s.badgeRecommended}>Recommended</div>
              </div>

              <div className={s.settingsList}>
                {/* Goal */}
                <button
                  type="button"
                  className={s.settingRow}
                  onClick={() => setActiveSettingModal('goal')}
                >
                  <div className={s.settingRowLeft}>
                    <Target size={16} color="#7C3AED" />
                    <span>Goal</span>
                  </div>
                  <div className={s.settingRowRight}>
                    <span>{goal}</span>
                    <ChevronRight size={15} className={s.settingChevron} />
                  </div>
                </button>

                {/* Slides */}
                <button
                  type="button"
                  className={s.settingRow}
                  onClick={() => setActiveSettingModal('slides')}
                >
                  <div className={s.settingRowLeft}>
                    <Layers size={16} color="#7C3AED" />
                    <span>Slides</span>
                  </div>
                  <div className={s.settingRowRight}>
                    <span>{slidesCount}</span>
                    <ChevronRight size={15} className={s.settingChevron} />
                  </div>
                </button>

                {/* Style */}




                {/* Format */}
                <button
                  type="button"
                  className={s.settingRow}
                  onClick={() => setActiveSettingModal('format')}
                >
                  <div className={s.settingRowLeft}>
                    <Smartphone size={16} color="#7C3AED" />
                    <span>Format</span>
                  </div>
                  <div className={s.settingRowRight}>
                    <span>{format}</span>
                    <ChevronRight size={15} className={s.settingChevron} />
                  </div>
                </button>
              </div>
            </div>

            {/* CARTE 3 : GENERATE CAROUSEL */}
            <div className={s.card}>
              <div className={s.cardHeader}>
                <div className={s.cardHeaderLeft}>
                  <div className={s.stepNumberCircle}>3</div>
                  <h3 className={s.cardTitle}>Generate Carousel</h3>
                </div>
                <div className={s.badgeReady}>
                  <Check size={14} color="#7C3AED" />
                  <span>Ready to generate</span>
                </div>
              </div>

              <div className={s.promptHeader}>
                <Sparkles size={14} color="#7C3AED" />
                <span>Prompt</span>
              </div>
              <p className={s.promptSubtext}>
                You can describe your vision or use the default prompt. Be specific about your product, style, target
                audience, and any important details.
              </p>

              <div className={s.textareaWrap}>
                <textarea
                  className={s.promptTextarea}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value.slice(0, 1000))}
                  placeholder="e.g. Create a luxury 3-slide carousel for my perfume. Use elegant, warm lighting, show the product in a romantic setting, highlight the main benefit, and end with a strong call to action. Target young women, French language, 4:5 format."
                  rows={4}
                />
                <span className={s.charCount}>{prompt.length}/1000</span>
              </div>

              {/* Tags rapides de prompt */}


              {errorMsg && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    fontSize: '12px',
                    fontWeight: 700,
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <span>{errorMsg}</span>
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(true)}
                    style={{
                      background: '#DC2626',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Voir les offres ➔
                  </button>
                </div>
              )}

              {/* Bouton de génération officiel */}
              <button
                type="button"
                className={s.generateBtn}
                onClick={handleGenerateCarousel}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>
                      {generatingStep === 1
                        ? '1/3 Direction artistique du carrousel...'
                        : generatingStep === 2
                          ? '2/3 Rendu photographique 4K...'
                          : '3/3 Finalisation des textes & CTA...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Generate Carousel (3 credits) →</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ================= COLONNE DROITE (PREVIEW 3 SLIDES) ======== */}
          <div className={s.previewColumn}>
            <div className={s.previewCard}>
              <div className={s.previewHeader}>
                <div className={s.previewTitleWrap}>
                  <div className={s.previewIconBox}>
                    <Layers size={18} strokeWidth={2.2} />
                  </div>
                  <h2 className={s.previewTitle}>Carousel Preview</h2>
                  <span className={s.badgeSlidesCount}>
                    {slides.length > 0 ? `${slides.length} slides` : '0 slide'}
                  </span>
                </div>

                <div className={s.previewActions}>
                  <button
                    type="button"
                    className={s.downloadAllBtn}
                    onClick={handleDownloadAll}
                    disabled={isDownloadingZip || slides.length === 0}
                  >
                    {isDownloadingZip ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    <span>Download All</span>
                  </button>

                  <button
                    type="button"
                    className={s.actionIconBtn}
                    onClick={handleCopyCaption}
                    disabled={slides.length === 0}
                    title="Copier la légende Instagram"
                  >
                    {copiedCaption ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* LES 3 SLIDES CÔTE À CÔTE */}
              <div className={s.slidesGrid}>
                {slides.length >= 3 ? (
                  <>
                    {/* SLIDE 1 : HOOK */}
                    <div className={s.slideCard}>
                      <img
                        src={slides[0].bgUrl}
                        alt="Slide 1 Hook"
                        className={s.slideBgImage}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/image.png';
                        }}
                      />
                      <div className={s.slideBadgeNumber}>1</div>
                    </div>

                    {/* SLIDE 2 : VALUE */}
                    <div className={s.slideCard}>
                      <img
                        src={slides[1].bgUrl}
                        alt="Slide 2 Value"
                        className={s.slideBgImage}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/image.png';
                        }}
                      />
                      <div className={s.slideBadgeNumber}>2</div>
                    </div>

                    {/* SLIDE 3 : CTA */}
                    <div className={s.slideCard}>
                      <img
                        src={slides[2].bgUrl}
                        alt="Slide 3 CTA"
                        className={s.slideBgImage}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/adora_hero_perfume.jpg';
                        }}
                      />
                      <div className={s.slideBadgeNumber}>3</div>
                    </div>
                  </>
                ) : (
                  [1, 2, 3].map((num) => (
                    <div
                      key={num}
                      className={s.slideCard}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#F8FAFC',
                        border: '2px dashed #E2E8F0',
                        minHeight: '380px',
                      }}
                    >
                      <div className={s.slideBadgeNumber}>{num}</div>
                      <div style={{ textAlign: 'center', padding: '20px', color: '#64748B' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: '#EDE9FE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 12px auto',
                            color: '#7C3AED',
                          }}
                        >
                          <Layers size={18} />
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#334155', marginBottom: '4px' }}>
                          {num === 1 ? 'Slide 1 — Hook' : num === 2 ? 'Slide 2 — Value' : 'Slide 3 — CTA'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          En attente de génération
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* BANNIÈRE DE NOTE EN BAS DU PRÉVIEW */}
              <div className={s.bottomNoteBanner}>
                <Sparkles size={16} />
                <span>
                  This is a preview. Your final images will be generated with your brand kit, fonts and colors.
                </span>
              </div>

              {/* SECTION LÉGENDE RÉSEAUX SOCIAUX & HASHTAGS */}
              {caption && (
                <div className={s.captionCard}>
                  <div className={s.captionHeader}>
                    <div className={s.captionTitle}>
                      <Sparkles size={15} color="#7C3AED" />
                      <span>Légende Instagram & Hashtags prêts à publier</span>
                    </div>
                    <button
                      type="button"
                      className={s.copyCaptionBtn}
                      onClick={handleCopyCaption}
                    >
                      {copiedCaption ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                      <span>{copiedCaption ? 'Copié !' : 'Copier'}</span>
                    </button>
                  </div>
                  <div className={s.captionContent}>
                    {caption}
                    {hashtags.length > 0 && (
                      <>
                        {'\n\n'}
                        <strong style={{ color: '#7C3AED' }}>{hashtags.join(' ')}</strong>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MODAL SÉLECTEUR DE PARAMÈTRE (GOAL, STYLE, LANG, FORMAT)       */}
        {/* ============================================================== */}
        {activeSettingModal && (
          <div
            className={s.settingModalBackdrop}
            onClick={() => setActiveSettingModal(null)}
          >
            <div
              className={s.settingModal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={s.settingModalTitle}>
                <span>
                  {activeSettingModal === 'goal' && 'Select Campaign Goal'}
                  {activeSettingModal === 'slides' && 'Select Number of Slides'}
                  {activeSettingModal === 'format' && 'Select Image Format'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveSettingModal(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className={s.settingOptionsList}>
                {activeSettingModal === 'goal' &&
                  (['Increase engagement', 'Drive sales & orders', 'Launch new product', 'Promote discount offer'] as CampaignGoal[]).map(
                    (opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={`${s.settingOptionBtn} ${goal === opt ? s.settingOptionBtnActive : ''}`}
                        onClick={() => {
                          setGoal(opt);
                          setActiveSettingModal(null);
                        }}
                      >
                        <span>{opt}</span>
                        {goal === opt && <Check size={16} color="#7C3AED" />}
                      </button>
                    )
                  )}

                {activeSettingModal === 'slides' &&
                  (['3 slides', '5 slides'] as SlideCount[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`${s.settingOptionBtn} ${slidesCount === opt ? s.settingOptionBtnActive : ''}`}
                      onClick={() => {
                        setSlidesCount(opt);
                        setActiveSettingModal(null);
                      }}
                    >
                      <span>{opt}</span>
                      {slidesCount === opt && <Check size={16} color="#7C3AED" />}
                    </button>
                  ))}





                {activeSettingModal === 'format' &&
                  (['Portrait (4:5)', 'Square (1:1)', 'Story (9:16)'] as FormatRatio[]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={`${s.settingOptionBtn} ${format === opt ? s.settingOptionBtnActive : ''}`}
                      onClick={() => {
                        setFormat(opt);
                        setActiveSettingModal(null);
                      }}
                    >
                      <span>{opt}</span>
                      {format === opt && <Check size={16} color="#7C3AED" />}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal des Offres & Forfaits MarkMosaiq */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialPlanId="pro"
      />
    </StudioShell>
  );
}
