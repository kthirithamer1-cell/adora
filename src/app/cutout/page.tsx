'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import AuthRedirectScreen from '@/components/AuthRedirectScreen';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { useLanguage } from '@/lib/LanguageContext';
import {
  Scissors,
  Zap,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Download,
  Copy,
  RotateCcw,
  Image as ImageIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
} from 'lucide-react';

interface SampleItem {
  id: string;
  nameKey: 'sneaker' | 'perfume' | 'cream' | 'watch' | 'headphones';
  originalUrl: string;
  cutoutUrl: string;
}

const CUTOUT_I18N = {
  en: {
    pageTitle: 'AI Background Remover & Product Staging',
    tagline: 'BACKGROUND REMOVER',
    title: 'Remove background in one click',
    subtitle: 'Get clean, professional product images in just seconds.',
    ultraFast: 'Ultra fast',
    inSeconds: 'in a few seconds',
    highPrecision: 'High precision',
    detailsSub: 'even for fine details',
    quality4k: '4K Quality',
    noLossSub: 'lossless resolution',
    uploadTitle: 'Upload your image',
    uploadSubtitle: 'Drag & drop or click to browse',
    uploadFormats: 'JPG, PNG, WebP • Max 10 MB',
    or: 'OR',
    examples: 'Examples',
    removeBtn: 'Remove background →',
    processingBtn: 'Processing in progress...',
    processTimeNote: 'Processed in seconds',
    tabPreview: 'Preview',
    tabResult: 'Result',
    toggleCompare: 'Before / After',
    badgeOriginal: 'Original image',
    badgeCutout: 'Background removed',
    btnDownload: 'Download',
    btnCopy: 'Copy image',
    copiedFeedback: 'Copied!',
    btnNew: 'New',
    insufficientCredits: '⚠️ Insufficient credits balance. Please recharge your pack to remove backgrounds.',
    successCutout: (credits: number) => `✓ AI background removal successful! Balance: ${credits} credits`,
    sampleNames: {
      sneaker: 'Dunk Low Sneaker',
      perfume: 'Amber Gold Perfume',
      cream: 'Lumina Face Cream',
      watch: 'Chronograph Watch',
      headphones: 'Studio Headphones',
    },
  },
  fr: {
    pageTitle: 'Studio Détourage IA & Prise de Vue',
    tagline: 'BACKGROUND REMOVER',
    title: "Supprimez l'arrière-plan en un clic",
    subtitle: 'Obtenez des images de produits propres et professionnelles en quelques secondes.',
    ultraFast: 'Ultra rapide',
    inSeconds: 'en quelques secondes',
    highPrecision: 'Haute précision',
    detailsSub: 'même pour les détails',
    quality4k: 'Qualité 4K',
    noLossSub: 'sans perte de qualité',
    uploadTitle: 'Téléchargez votre image',
    uploadSubtitle: 'Glissez-déposez ou cliquez pour parcourir',
    uploadFormats: 'JPG, PNG, WebP • Max 10 Mo',
    or: 'OU',
    examples: 'Exemples',
    removeBtn: "Supprimer l'arrière-plan →",
    processingBtn: 'Traitement en cours...',
    processTimeNote: 'Traitement en quelques secondes',
    tabPreview: 'Aperçu',
    tabResult: 'Résultat',
    toggleCompare: 'Avant / Après',
    badgeOriginal: 'Image originale',
    badgeCutout: 'Fond supprimé',
    btnDownload: 'Télécharger',
    btnCopy: "Copier l'image",
    copiedFeedback: 'Copié !',
    btnNew: 'Nouveau',
    insufficientCredits: '⚠️ Solde de crédits insuffisant. Veuillez recharger votre pack pour détourer vos produits.',
    successCutout: (credits: number) => `✓ Détourage IA réussi ! Solde : ${credits} crédits`,
    sampleNames: {
      sneaker: 'Sneaker Dunk Low',
      perfume: 'Parfum Ambre Doré',
      cream: 'Crème Visage Lumina',
      watch: 'Montre Chronographe',
      headphones: 'Casque Audio Studio',
    },
  },
  ar: {
    pageTitle: 'استوديو تفريغ الصور بالذكاء الاصطناعي',
    tagline: 'إزالة خلفية المنتجات',
    title: 'احذف الخلفية بنقرة واحدة',
    subtitle: 'احصل على صور منتجات نظيفة واحترافية في ثوانٍ معدودة.',
    ultraFast: 'سريع جداً',
    inSeconds: 'في ثوانٍ معدودة',
    highPrecision: 'دقة فائقة',
    detailsSub: 'حتى لأدق التفاصيل',
    quality4k: 'جودة 4K',
    noLossSub: 'بدون أي فقدان للجودة',
    uploadTitle: 'ارفع صورة منتجك',
    uploadSubtitle: 'اسحب وأفلت أو انقر للاختيار',
    uploadFormats: 'JPG, PNG, WebP • أقصى حجم 10 ميجا',
    or: 'أو',
    examples: 'أمثلة جاهزة',
    removeBtn: 'إزالة الخلفية ←',
    processingBtn: 'جارٍ المعالجة...',
    processTimeNote: 'معالجة فورية خلال ثوانٍ',
    tabPreview: 'معاينة الأصل',
    tabResult: 'النتيجة',
    toggleCompare: 'قبل / بعد',
    badgeOriginal: 'الصورة الأصلية',
    badgeCutout: 'خلفية شفافة',
    btnDownload: 'تحميل',
    btnCopy: 'نسخ الرابط',
    copiedFeedback: 'تم النسخ!',
    btnNew: 'جديد',
    insufficientCredits: '⚠️ رصيدك من الاعتمادات غير كافٍ. يرجى شحن باقتك للمتابعة.',
    successCutout: (credits: number) => `✓ تم تفريغ الصورة بنجاح! الرصيد المتبقي: ${credits}`,
    sampleNames: {
      sneaker: 'حذاء رياضي Dunk Low',
      perfume: 'عطر عنبر ذهبي',
      cream: 'كريم عناية لومينا',
      watch: 'ساعة كرونوغراف فاخرة',
      headphones: 'سماعة رأس استوديو',
    },
  },
};

export default function CutoutStudioPage() {
  const router = useRouter();
  const { workspace, user, isLoading: isAuthLoading, updateCredits } = useWorkspace();
  const { locale } = useLanguage();
  const t = CUTOUT_I18N[(locale as 'en' | 'fr' | 'ar')] || CUTOUT_I18N.en;

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login?redirect=/cutout');
    }
  }, [isAuthLoading, user, router]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 5 Exemples de démonstration
  const sampleProducts: SampleItem[] = [
    {
      id: 'sneaker',
      nameKey: 'sneaker',
      originalUrl: '/images/sample_sneaker_panda.jpg',
      cutoutUrl: '/images/sample_sneaker_panda.jpg',
    },
    {
      id: 'perfume',
      nameKey: 'perfume',
      originalUrl: '/images/sample_perfume_amber.jpg',
      cutoutUrl: '/images/sample_perfume_amber.jpg',
    },
    {
      id: 'cream',
      nameKey: 'cream',
      originalUrl: '/images/sample_cream_jar.jpg',
      cutoutUrl: '/images/sample_cream_jar.jpg',
    },
    {
      id: 'watch',
      nameKey: 'watch',
      originalUrl: '/images/test_watch_source.jpg',
      cutoutUrl: '/images/test_watch_birefnet_output.png',
    },
    {
      id: 'headphones',
      nameKey: 'headphones',
      originalUrl: '/images/bottle_nutrex.png',
      cutoutUrl: '/images/bottle_nutrex.png',
    },
  ];

  const [selectedSampleId, setSelectedSampleId] = useState<string>('sneaker');
  const [inputImage, setInputImage] = useState<string>('/images/sample_sneaker_panda.jpg');
  const [outputTransparent, setOutputTransparent] = useState<string | null>('/images/sample_sneaker_panda.jpg');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'result'>('preview');
  const [isCompareMode, setIsCompareMode] = useState<boolean>(true);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Gestion du glissement du curseur Avant / Après
  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(5, Math.min(95, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const onStop = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onStop);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onStop);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onStop);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onStop);
    };
  }, [isDragging, handleMove]);

  // Exécution du détourage IA via l'API
  const runCutout = async (imgSource: string) => {
    if (workspace && workspace.creditsRemaining <= 0) {
      setStatusMessage({
        text: t.insufficientCredits,
        error: true,
      });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const isBase64 = imgSource.startsWith('data:');
      const payload = isBase64
        ? { imageBase64: imgSource, workspaceId: workspace?.id }
        : { sampleFile: imgSource, workspaceId: workspace?.id };

      const res = await fetch('/api/cutout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.transparentBase64) {
        setOutputTransparent(data.transparentBase64);
        if (data.creditsRemaining !== undefined) {
          updateCredits(data.creditsRemaining);
        }
        setStatusMessage({
          text: t.successCutout(data.creditsRemaining ?? workspace?.creditsRemaining ?? 0),
        });
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage({ text: data.error || 'Cutout complete.', error: false });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err: any) {
      setStatusMessage({ text: err.message || 'Error processing request', error: true });
    } finally {
      setIsProcessing(false);
    }
  };

  // Téléversement d'image utilisateur
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setInputImage(b64);
      setOutputTransparent(b64);
      setSelectedSampleId('');
      runCutout(b64);
    };
    reader.readAsDataURL(file);
  };

  // Sélection d'un exemple prédéfini
  const handleSelectSample = (sample: SampleItem) => {
    setSelectedSampleId(sample.id);
    setInputImage(sample.originalUrl);
    setOutputTransparent(sample.cutoutUrl);
    setStatusMessage(null);
  };

  // Téléchargement du résultat
  const handleDownload = () => {
    const targetUrl = outputTransparent || inputImage;
    if (!targetUrl) return;
    const a = document.createElement('a');
    a.href = targetUrl;
    a.download = `product_cutout_MarkMosaiq_${Date.now()}.png`;
    a.click();
  };

  // Copie dans le presse-papier
  const handleCopy = async () => {
    try {
      const targetUrl = outputTransparent || inputImage;
      if (!targetUrl) return;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.origin + targetUrl);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
      }
    } catch {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  // Réinitialisation "Nouveau"
  const handleReset = () => {
    handleSelectSample(sampleProducts[0]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!user) {
    return <AuthRedirectScreen />;
  }

  return (
    <AppShell
      activeNav="cutout"
      pageTitle="Studio Détourage IA & Prise de Vue"
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
          <Scissors size={12} color="#7C3AED" /> BiRefNet 4K
        </span>
      }
    >
      <div suppressHydrationWarning style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '32px' }}>

        {/* ============================================================== */}
        {/* BANNIÈRE HÉROS HAUTE : BACKGROUND REMOVER                      */}
        {/* ============================================================== */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
        }}>
          {/* Groupe Titre Gauche */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: '#EDE9FE',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.15)',
              flexShrink: 0,
            }}>
              <Scissors size={26} color="#7C3AED" strokeWidth={2.2} />
            </div>

            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#7C3AED',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: '2px',
              }}>
                {t.tagline}
              </div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>
                {t.title}
              </h1>
              <p style={{
                fontSize: '13px',
                color: '#64748B',
                margin: '4px 0 0 0',
              }}>
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Groupe Badges Droite */}
          <div style={{
            background: '#F5F3FF',
            border: '1px solid #EDE9FE',
            borderRadius: '16px',
            padding: '10px 18px',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.04)',
          }}>
            {/* Item 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: '#8B5CF6' }}>
                <Zap size={18} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>{t.ultraFast}</div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{t.inSeconds}</div>
              </div>
            </div>

            {/* Item 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: '#3B82F6' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>{t.highPrecision}</div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{t.detailsSub}</div>
              </div>
            </div>

            {/* Item 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ color: '#A855F7' }}>
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>{t.quality4k}</div>
                <div style={{ fontSize: '10px', color: '#94A3B8' }}>{t.noLossSub}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Message d'état */}
        {statusMessage && (
          <div style={{
            padding: '10px 18px',
            borderRadius: '10px',
            marginBottom: '18px',
            fontSize: '13px',
            fontWeight: 700,
            background: statusMessage.error ? '#FEF2F2' : '#EEF2FF',
            border: `1px solid ${statusMessage.error ? '#FECACA' : '#C7D2FE'}`,
            color: statusMessage.error ? '#DC2626' : '#4F46E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}
            >
              ×
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* GRILLE PRINCIPALE À DEUX COLONNES                              */}
        {/* ============================================================== */}
        <div
          className="responsive-2col-sidebar"
          style={{
            display: 'grid',
            gridTemplateColumns: '380px 1fr',
            gap: '24px',
            alignItems: 'start',
          }}
        >

          {/* ============================================================ */}
          {/* COLONNE GAUCHE : TÉLÉVERSEMENT & EXEMPLES                    */}
          {/* ============================================================ */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png,image/jpeg,image/webp"
              style={{ display: 'none' }}
            />

            {/* Boîte de Téléversement */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    const b64 = reader.result as string;
                    setInputImage(b64);
                    setOutputTransparent(b64);
                    setSelectedSampleId('');
                    runCutout(b64);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              style={{
                background: '#FFFFFF',
                border: '2px dashed #818CF8',
                borderRadius: '16px',
                padding: '30px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px',
                color: '#4F46E5',
              }}>
                <UploadCloud size={38} strokeWidth={1.8} />
              </div>
              <div style={{
                fontSize: '15px',
                fontWeight: 800,
                color: '#0F172A',
                marginBottom: '4px',
              }}>
                {t.uploadTitle}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#64748B',
                marginBottom: '4px',
              }}>
                {t.uploadSubtitle}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#94A3B8',
              }}>
                {t.uploadFormats}
              </div>
            </div>

            {/* Séparateur "OU" / "OR" */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '14px 0',
            }}>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              <span style={{
                padding: '0 10px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#94A3B8',
                textTransform: 'uppercase',
              }}>
                {t.or}
              </span>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            </div>

            {/* Rangée d'Exemples */}
            <div>
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '8px',
              }}>
                {t.examples}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '8px',
              }}>
                {sampleProducts.map((sample) => {
                  const isSelected = selectedSampleId === sample.id;
                  const label = t.sampleNames[sample.nameKey];
                  return (
                    <button
                      key={sample.id}
                      onClick={() => handleSelectSample(sample)}
                      style={{
                        background: '#FFFFFF',
                        border: isSelected ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                        borderRadius: '10px',
                        padding: '4px',
                        height: '58px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 0 2px rgba(79, 70, 229, 0.15)' : 'none',
                      }}
                      title={label}
                    >
                      {sample.id === 'sneaker' && (
                        <img
                          src="/images/sample_sneaker_panda.jpg"
                          alt="Sneaker"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/adora_sneakers_clean.jpg';
                          }}
                          style={{ maxHeight: '42px', maxWidth: '42px', objectFit: 'contain' }}
                        />
                      )}

                      {sample.id === 'perfume' && (
                        <img
                          src="/images/sample_perfume_amber.jpg"
                          alt="Perfume"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/adora_hero_perfume.jpg';
                          }}
                          style={{ maxHeight: '42px', maxWidth: '42px', objectFit: 'contain' }}
                        />
                      )}

                      {sample.id === 'cream' && (
                        <img
                          src="/images/sample_cream_jar.jpg"
                          alt="Cream"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/gnc_pro_whey_tub_1791150838901.jpg';
                          }}
                          style={{ maxHeight: '42px', maxWidth: '42px', objectFit: 'contain' }}
                        />
                      )}

                      {sample.id === 'watch' && (
                        <img
                          src="/images/test_watch_source.jpg"
                          alt="Watch"
                          style={{ maxHeight: '42px', maxWidth: '42px', objectFit: 'contain' }}
                        />
                      )}

                      {sample.id === 'headphones' && (
                        <img
                          src="/images/bottle_nutrex.png"
                          alt="Headphones"
                          style={{ maxHeight: '42px', maxWidth: '42px', objectFit: 'contain' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bouton d'Action Principal */}
            <button
              onClick={() => runCutout(inputImage)}
              disabled={isProcessing}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '13px 20px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                borderRadius: '12px',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 800,
                cursor: isProcessing ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{t.processingBtn}</span>
                </>
              ) : (
                <>
                  <Scissors size={16} />
                  <span>{t.removeBtn}</span>
                </>
              )}
            </button>

            {/* Note de traitement */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '10px',
              color: '#64748B',
              fontSize: '12px',
            }}>
              <Clock size={13} color="#64748B" />
              <span>{t.processTimeNote}</span>
            </div>

          </div>

          {/* ============================================================ */}
          {/* COLONNE DROITE : VISUALISEUR AVANT / APRÈS                   */}
          {/* ============================================================ */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}>

            {/* Barre de contrôle supérieure */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              {/* Onglets Aperçu / Résultat */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    setActiveTab('preview');
                    setIsCompareMode(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: (!isCompareMode && activeTab === 'preview') || isCompareMode ? '#4F46E5' : 'transparent',
                    color: (!isCompareMode && activeTab === 'preview') || isCompareMode ? '#FFFFFF' : '#64748B',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <ImageIcon size={14} />
                  <span>{t.tabPreview}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('result');
                    setIsCompareMode(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: !isCompareMode && activeTab === 'result' ? '#4F46E5' : 'transparent',
                    color: !isCompareMode && activeTab === 'result' ? '#FFFFFF' : '#64748B',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Sparkles size={14} />
                  <span>{t.tabResult}</span>
                </button>
              </div>

              {/* Commutateur Avant / Après */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  {t.toggleCompare}
                </span>
                <div
                  onClick={() => setIsCompareMode(!isCompareMode)}
                  style={{
                    width: '38px',
                    height: '20px',
                    borderRadius: '10px',
                    background: isCompareMode ? '#4F46E5' : '#CBD5E1',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    position: 'absolute',
                    top: '2px',
                    left: isCompareMode ? '20px' : '2px',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
              </div>
            </div>

            {/* Zone Visuelle Principale */}
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              style={{
                position: 'relative',
                borderRadius: '14px',
                overflow: 'hidden',
                height: 'clamp(280px, 55vw, 420px)',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                userSelect: 'none',
                touchAction: 'pan-y',
                cursor: isCompareMode ? 'ew-resize' : 'default',
              }}
            >
              {isCompareMode ? (
                <>
                  {/* Côté Gauche : Image originale */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: `${sliderPosition}%`,
                    overflow: 'hidden',
                    background: '#F1F5F9',
                    zIndex: 2,
                  }}>
                    {/* Badge Image originale */}
                    <div style={{
                      position: 'absolute',
                      top: '14px',
                      left: '14px',
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      zIndex: 5,
                    }}>
                      {t.badgeOriginal}
                    </div>

                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: containerRef.current?.clientWidth || 700,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <img
                        src={inputImage}
                        alt="Original"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/adora_sneakers_clean.jpg';
                        }}
                        style={{
                          maxHeight: '340px',
                          maxWidth: '85%',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                  </div>

                  {/* Côté Droit : Fond supprimé avec damier transparent */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    overflow: 'hidden',
                    zIndex: 1,
                    backgroundColor: '#FFFFFF',
                    backgroundImage: 'linear-gradient(45deg, #F1F5F9 25%, transparent 25%), linear-gradient(-45deg, #F1F5F9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #F1F5F9 75%), linear-gradient(-45deg, transparent 75%, #F1F5F9 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {/* Badge Fond supprimé */}
                    <div style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      background: '#4F46E5',
                      color: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      zIndex: 5,
                    }}>
                      {t.badgeCutout}
                    </div>

                    <img
                      src={outputTransparent || inputImage}
                      alt="Cutout"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/adora_sneakers_clean.jpg';
                      }}
                      style={{
                        maxHeight: '340px',
                        maxWidth: '85%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.12))',
                      }}
                    />
                  </div>

                  {/* Curseur de séparation vertical */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: `${sliderPosition}%`,
                    transform: 'translateX(-50%)',
                    width: '2px',
                    background: '#FFFFFF',
                    boxShadow: '0 0 6px rgba(0,0,0,0.25)',
                    zIndex: 10,
                    cursor: 'ew-resize',
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4F46E5',
                    }}>
                      <ChevronLeft size={13} strokeWidth={3} />
                      <ChevronRight size={13} strokeWidth={3} />
                    </div>
                  </div>
                </>
              ) : (
                /* Mode simple : Aperçu seul OU Résultat seul */
                <div style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  backgroundColor: activeTab === 'preview' ? '#F1F5F9' : '#FFFFFF',
                  backgroundImage: activeTab === 'result'
                    ? 'linear-gradient(45deg, #F1F5F9 25%, transparent 25%), linear-gradient(-45deg, #F1F5F9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #F1F5F9 75%), linear-gradient(-45deg, transparent 75%, #F1F5F9 75%)'
                    : 'none',
                  backgroundSize: '16px 16px',
                  backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '14px',
                    left: '14px',
                    background: activeTab === 'preview' ? 'rgba(15, 23, 42, 0.75)' : '#4F46E5',
                    color: '#FFFFFF',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 700,
                    zIndex: 5,
                  }}>
                    {activeTab === 'preview' ? t.badgeOriginal : t.badgeCutout}
                  </div>

                  <img
                    src={activeTab === 'preview' ? inputImage : (outputTransparent || inputImage)}
                    alt="Selected view"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/adora_sneakers_clean.jpg';
                    }}
                    style={{
                      maxHeight: '340px',
                      maxWidth: '85%',
                      objectFit: 'contain',
                      filter: activeTab === 'result' ? 'drop-shadow(0 15px 25px rgba(0,0,0,0.12))' : 'none',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Barre d'Actions Inférieure */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              flexWrap: 'wrap',
              gap: '10px',
            }}>
              {/* Gauche : Télécharger & Copier */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleDownload}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Download size={14} />
                  <span>{t.btnDownload}</span>
                </button>

                <button
                  onClick={handleCopy}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '9px 18px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {copyFeedback ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  <span>{copyFeedback ? t.copiedFeedback : t.btnCopy}</span>
                </button>
              </div>

              {/* Droite : Nouveau */}
              <button
                onClick={handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 20px',
                  background: '#FFFFFF',
                  border: '1.5px solid #C7D2FE',
                  borderRadius: '10px',
                  color: '#6366F1',
                  fontSize: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <RotateCcw size={14} color="#6366F1" />
                <span>{t.btnNew}</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </AppShell>
  );
}
