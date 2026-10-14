'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import s from './studio.module.css';
import { LOCAL_BADGES } from '@/lib/templates';
import CheckoutModal from '@/components/CheckoutModal';
import BrandKitModal from '@/components/BrandKitModal';
import ProductCatalogModal from '@/components/ProductCatalogModal';
import SocialPublisherModal from '@/components/SocialPublisherModal';
import SmartQuestionsModal, { SmartQuestionsPayload } from '@/components/SmartQuestionsModal';
import WorkspaceSelector from '@/components/WorkspaceSelector';
import { CatalogProduct, BrandKit, getBrandKitByWorkspace } from '@/lib/brandkit';
import { getAdBenchmarksForProduct } from '@/lib/adBenchmarks';
import {
  CreativeIntent,
  CreativeIntentType,
  ProductDNA,
  MasterSceneSpec,
  generateCreativeIntents,
  DynamicDirectorQuestion,
  generateDynamicDirectorQuestions,
} from '@/lib/artDirector';
import { VisionCriticEvaluation } from '@/lib/visionCritic';
import { useWorkspace } from '@/lib/WorkspaceContext';
import {
  Sparkles,
  ShoppingBag,
  Layers,
  Target,
  ChartBar as BarChart3,
  CreditCard,
  Crown,
  Menu,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  CloudUpload as UploadCloud,
  RefreshCw,
  Pencil as Edit3,
  Download,
  EllipsisVertical as MoreVertical,
  CircleCheck as CheckCircle2,
  Bell,
  Music,
  Smartphone,
  SlidersHorizontal as Sliders,
  Check,
  X,
  Share2,
  Palette,
  Type,
  Globe,
  Tag,
  CheckCheck,
  FileText,
  Wand2,
  Upload,
  Scissors,
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  Zap,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import { extractPaletteFromLogo } from '@/lib/colorExtractor';

const FacebookIcon = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

/* =========================================================================
   TYPES & CONSTANTES
   ========================================================================= */

type AdObjective = 'vente' | 'promotion' | 'branding' | 'social';
type AdFormat = 'instagram' | 'facebook' | 'tiktok' | 'story';
type AdStyle = 'ai_auto' | 'sidi_bou_said' | 'moderne' | 'elegant' | 'minimaliste' | 'lifestyle' | 'dynamique' | 'vintage' | 'creatif';

export interface CopyProposition {
  id: string;
  angleTag: string;
  headline: string;
  subheadline: string;
  bulletPoints: string[];
  badgeText: string;
  ctaText: string;
}

export const BRAND_COLOR_PRESETS = [
  { name: 'Néon Cyber', primary: '#00E5FF', secondary: '#FF5722', accent: '#10B981' },
  { name: 'Luxe Médina', primary: '#F59E0B', secondary: '#E11D48', accent: '#8B5CF6' },
  { name: 'Bio Vert', primary: '#10B981', secondary: '#065F46', accent: '#F59E0B' },
  { name: 'Royal Violet', primary: '#7C3AED', secondary: '#4F46E5', accent: '#00E5FF' },
  { name: 'Dark Titane', primary: '#E11D48', secondary: '#1E293B', accent: '#00E5FF' },
];

export const OBJECTIVE_VISIONS: Record<AdObjective, { title: string; desc: string; focus: string; icon: string }> = {
  vente: {
    title: 'Vision Vente Directe & Conversion',
    desc: 'Mise en avant immédiate du prix clair en Dinars, de la réassurance de livraison 24-48h et du paiement à la réception pour déclencher l\'achat immédiat.',
    focus: 'Prix en DT • Livraison 24-48h • Bouton Acheter',
    icon: '🛒',
  },
  promotion: {
    title: 'Vision Urgence Commerciale (FOMO)',
    desc: 'Crée un fort sentiment de rareté avec mise en valeur de la réduction, compte à rebours visuel et stock limité en Tunisie.',
    focus: 'Remise Flash • Stock Restreint • Réserver tawa',
    icon: '🔥',
  },
  branding: {
    title: 'Vision Image de Marque & Notoriété',
    desc: 'Met en majesté le logo et l\'histoire de la marque avec un décor épuré, des matériaux nobles et une typographie haut de gamme.',
    focus: 'Logo sublimé • Décor prestigieux • Signature unique',
    icon: '👑',
  },
  social: {
    title: 'Vision Viralité Réseaux & Commandes DM',
    desc: 'Accroches authentiques en Darija tunisienne créées pour générer des partages, des commentaires et des commandes directes en message privé (DM).',
    focus: 'Darija certifié • Commande en DM • Preuve sociale',
    icon: '💬',
  },
};

export const isArabicText = (text?: string): boolean => {
  return Boolean(text && /[\u0600-\u06FF]/.test(text));
};

export function getCopyPropositions(
  obj: AdObjective,
  lang: 'ar' | 'fr' | 'darija' | 'mixte',
  prodName: string,
  price: string
): CopyProposition[] {
  if (obj === 'vente') {
    if (lang === 'ar') {
      return [
        {
          id: 'v-ar-1',
          angleTag: '🎯 وصول جديد وفوائد',
          headline: `وصلت الكوموند في البوتيك متاعنا !`,
          subheadline: `أقوى جودة في تونس لـ ${prodName} مع الخلاص عند الاستلام وباب الدار بسعر ${price}.`,
          bulletPoints: ['سلعة أصلية 100%', 'توصيل سريع 24-48h', 'خلاص عند الاستلام'],
          badgeText: '🚚 توصيل لكامل تراب الجمهورية',
          ctaText: 'اطلب توة ➔',
        },
        {
          id: 'v-ar-2',
          angleTag: '💵 أحسن سوم وجودة',
          headline: `أقوى جودة وأحسن سوم في تونس !`,
          subheadline: `متوفر حالياً بسعر استثنائي ${price} لكافة الولايات الـ 24 مع ضمان الرضا.`,
          bulletPoints: ['أحسن سوم مضمون', 'خدمة حرفاء 7/7', 'ضمان الاسترجاع'],
          badgeText: '💵 خلاص عند التسليم',
          ctaText: 'ابعثلنا ميساج ➔',
        },
        {
          id: 'v-ar-3',
          angleTag: '⭐ ثقة الحرفاء',
          headline: `أكثر من 1000 حريف راضي في تونس !`,
          subheadline: `الكل يحكيو عليه في إنستغرام. احجز متاعك اليوم قبل ما يوفى الستوك.`,
          bulletPoints: ['تقييم 5 نجوم ★', 'كمية محدودة', 'أفضل المبيعات'],
          badgeText: '⭐ المنتج رقم 1 في تونس',
          ctaText: 'احجز قطعتك توة ➔',
        },
      ];
    }
    if (lang === 'darija') {
      return [
        {
          id: 'v-d-1',
          angleTag: '🎯 Bénéfice & Arrivage',
          headline: `Weslet el ${prodName} fi boutique mteena !`,
          subheadline: `A7sen qualité fi tounes w el khlas waqt el livri l beb eddar b ${price}.`,
          bulletPoints: ['100% Original', 'Livri fisaa 24-48h', 'Khlas and el livri'],
          badgeText: '🚚 Livraison 24-48h',
          ctaText: 'Commander tawa →',
        },
        {
          id: 'v-d-2',
          angleTag: '💵 Rapport Qualité/Prix',
          headline: `Aqwé rapport qualité / soum fi tounes`,
          subheadline: `Dispo tawa b ${price} kahaw fi 24 gouvernorats. Zéro risque.`,
          bulletPoints: ['Aswem tayara', 'Garantie mteena', 'Khlas fel livraison'],
          badgeText: '💵 Khlas fel livraison',
          ctaText: 'Abathna message →',
        },
        {
          id: 'v-d-3',
          angleTag: '⭐ Preuve Sociale',
          headline: `Akther men 1 000 client radi fi tounes !`,
          subheadline: `El kol yahkiw alih fi Instagram. Khoudh mteek qbal ma youfa le stock.`,
          bulletPoints: ['Avis 5 njoum ★', 'Stock limité', 'Khlas fel livri'],
          badgeText: '⭐ Best-Seller N°1',
          ctaText: 'Rezervi mteek →',
        },
      ];
    }
    return [
      {
        id: 'v-f-1',
        angleTag: '🎯 Bénéfice Client & Confort',
        headline: `L'élégance et la qualité au quotidien`,
        subheadline: `Découvrez ${prodName} : conçu pour sublimer votre style sans compromis. Seulement ${price}.`,
        bulletPoints: ['Qualité certifiée', 'Livraison 24h Express', 'Paiement à la réception'],
        badgeText: '🚚 Livraison 24-48h',
        ctaText: 'Commander maintenant →',
      },
      {
        id: 'v-f-2',
        angleTag: '💵 Rapport Qualité/Prix Tunisie',
        headline: `Le meilleur choix pour votre budget`,
        subheadline: `Disponible au tarif exclusif de ${price} sur toute la Tunisie avec garantie satisfaction.`,
        bulletPoints: ['Garantie 100%', 'Service client 7j/7', 'Retour facile'],
        badgeText: '💵 Khlas fel livraison',
        ctaText: 'Profiter du prix →',
      },
      {
        id: 'v-f-3',
        angleTag: '⭐ Best-Seller Confirmé',
        headline: `Recommandé par plus de 1 200 clients`,
        subheadline: `Le produit phare de notre boutique. Commandez aujourd'hui avant rupture de stock.`,
        bulletPoints: ['Note 4.9/5 ★', 'Stock limité', 'Expédition 24h'],
        badgeText: '⭐ Best-Seller N°1',
        ctaText: 'Acheter en 1 clic →',
      },
    ];
  }
  if (obj === 'promotion') {
    if (lang === 'ar') {
      return [
        {
          id: 'p-ar-1',
          angleTag: '🔥 برومو فلاش 24 ساعة',
          headline: `برومو فلاش 24 ساعة : سوم ما يتعاودش !`,
          subheadline: `استغل التخفيض الاستثنائي توة بسعر ${price} كهو. قريب يوفى الستوك !`,
          bulletPoints: ['-30% تخفيض فوري', 'توصيل سريع 24h', 'كمية محدودة جداً'],
          badgeText: '🔥 عرض محدود',
          ctaText: 'احجز بالتخفيض ➔',
        },
        {
          id: 'p-ar-2',
          angleTag: '🎁 باك إقتصادي مميز',
          headline: `باك إقتصادي : اربحها من توة !`,
          subheadline: `أحسن فرصة بش تاخو ${prodName} مع توصيل مجاني لكامل تراب الجمهورية.`,
          bulletPoints: ['ربح كبير في السوم', 'توصيل مجاني لباب الدار', 'جودة أصلية'],
          badgeText: '🎁 باك إقتصادي',
          ctaText: 'شوف العرض ➔',
        },
        {
          id: 'p-ar-3',
          angleTag: '⚡ آخر قطع متوفرة',
          headline: `آخر قطع متوفرة قبل نفاد المخزون !`,
          subheadline: `ابعثلنا ميساج توة بش تحجز طلبك قبل ما نغلقوا باب الطلبيات.`,
          bulletPoints: ['آخر فرصة', 'خلاص عند الاستلام', 'أصلي 100%'],
          badgeText: '⚡ اقتراب النفاد',
          ctaText: 'اطلب بصفة عاجلة ➔',
        },
      ];
    }
    if (lang === 'darija') {
      return [
        {
          id: 'p-d-1',
          angleTag: '🔥 Promo Flash 24H',
          headline: `Promo Flash 24h : Soum ma yet3awadhch !`,
          subheadline: `Profiti fel remise tawa b ${price} kahaw. Qrib youfa el stock fi tounes !`,
          bulletPoints: ['-30% Immédiat', 'Livri fisaa 24h', 'Stock limité'],
          badgeText: '🔥 Offre Limitée',
          ctaText: 'Rezervi tawa →',
        },
        {
          id: 'p-d-2',
          angleTag: '📦 Pack Promo Découverte',
          headline: `Pack Économique : Rab7ha men tawa !`,
          subheadline: `A7sen forsa bech tekhou ${prodName} b a7sen soum w livraison gratuite.`,
          bulletPoints: ['Rabha kbira', 'Livraison gratuite', 'Qualité garantie'],
          badgeText: '🎁 Pack Économique',
          ctaText: 'Chouf l\'offre →',
        },
        {
          id: 'p-d-3',
          angleTag: '⏳ Derniers Flacons',
          headline: `Akhir forsa qbal ma youfa le stock !`,
          subheadline: `Abathna message tawa bech thot commondtek qbal el rupture.`,
          bulletPoints: ['Dernières pièces', 'Khlas waqt el livri', '100% Original'],
          badgeText: '⚡ Rupture Proche',
          ctaText: 'Commander d\'urgence →',
        },
      ];
    }
    return [
      {
        id: 'p-f-1',
        angleTag: '🔥 Vente Flash Exclusive',
        headline: `Offre Flash 24H : Remise Immédiate !`,
        subheadline: `Profitez de notre vente flash exclusive à ${price}. Seulement quelques unités disponibles.`,
        bulletPoints: ['-30% Immédiat', 'Livraison 24h Express', 'Quantités Limitées'],
        badgeText: '🔥 Offre Limitée',
        ctaText: 'Profiter de l\'offre →',
      },
      {
        id: 'p-f-2',
        angleTag: '📦 Pack Duo Économique',
        headline: `Pack Économique : 1 Acheté = Le 2ème à -50%`,
        subheadline: `L'opportunité du mois sur ${prodName}. Livraison rapide sur les 24 gouvernorats.`,
        bulletPoints: ['Économie maximale', 'Livraison offerte', 'Édition spéciale'],
        badgeText: '🎁 Pack Économique',
        ctaText: 'Profiter du pack →',
      },
      {
        id: 'p-f-3',
        angleTag: '⏳ Alerte Stock Restreint',
        headline: `Dernières pièces avant rupture`,
        subheadline: `Ne ratez pas les dernières pièces disponibles à ce tarif promotionnel unique.`,
        bulletPoints: ['Derniers stocks', 'Expédition le jour même', 'Zéro risque'],
        badgeText: '⚡ Rupture Proche',
        ctaText: 'Réserver mon pot →',
      },
    ];
  }
  if (obj === 'branding') {
    if (lang === 'ar') {
      return [
        {
          id: 'b-ar-1',
          angleTag: '👑 فخامة وأناقة',
          headline: `الفخامة والأناقة في كل تفصيل`,
          subheadline: `تصميم راقي ومكونات فاخرة خُلقت للناس اللي تلوّج عالتميّز والجودة العالية.`,
          bulletPoints: ['تصميم استثنائي', 'أصلي 100%', 'فخامة مضمونة'],
          badgeText: '💎 جودة نقية وفاخرة',
          ctaText: 'اكتشف المجموعة ➔',
        },
        {
          id: 'b-ar-2',
          angleTag: '✨ أصالة الماركة',
          headline: `أصالة الماركة وثقة الحرفاء في تونس`,
          subheadline: `خدمة نظيفة ومتقونة بكل حب بش نقدملك ديما الأفضل وأرقى المستويات.`,
          bulletPoints: ['ماركة معتمدة', 'ثقة كبيرة', 'خدمة كبار الشخصيات'],
          badgeText: '🛡️ أصلي ومضمون 100%',
          ctaText: 'تصفح المتجر ➔',
        },
        {
          id: 'b-ar-3',
          angleTag: '🌟 أسلوب حياة متميز',
          headline: `خلّي الستيل متاعك يتكلّم عليك`,
          subheadline: `مش مجرد منتوج، هو أسلوب حياة يعبّر على شخصيتك وأناقتك مع ${prodName}.`,
          bulletPoints: ['بصمة فريدة', 'إصدار مميز', 'توصيل لكامل تونس'],
          badgeText: '🌟 إصدار خاص',
          ctaText: 'اكتشف المزيد ➔',
        },
      ];
    }
    if (lang === 'darija') {
      return [
        {
          id: 'b-d-1',
          angleTag: '👑 Luxe & Fkhama',
          headline: `El grandeur wel fkhama fi kol détail`,
          subheadline: `Créee spécialement l nass li y7ebou l'excellence wel qualité el tayara.`,
          bulletPoints: ['Design 3alami', '100% Original', 'Prestige garanti'],
          badgeText: '💎 Qualité Pure',
          ctaText: 'Iktachef el collection →',
        },
        {
          id: 'b-d-2',
          angleTag: '✨ Asalet el Marque',
          headline: `Asalet el marque mteena wel thika mteek`,
          subheadline: `Khedma ndhifa w ma3moula b 7ob bech tebherkom dima.`,
          bulletPoints: ['Khedma ndhifa', 'Thika kbira', 'Service VIP'],
          badgeText: '🛡️ 100% Original',
          ctaText: 'Chouf el boutique →',
        },
        {
          id: 'b-d-3',
          angleTag: '🌟 Mode de Vie',
          headline: `Khelli el style mteek yetkallem alik`,
          subheadline: `Mouch juste produit, c'est un mode de vie li yelzem ykoun m3ak.`,
          bulletPoints: ['Style unique', 'Qualité top', 'Livraison fi tounes'],
          badgeText: '🌟 Édition Spéciale',
          ctaText: 'Chouf akther →',
        },
      ];
    }
    return [
      {
        id: 'b-f-1',
        angleTag: '👑 Haute Parfumerie & Prestige',
        headline: `L'Art de l'Excellence et du Raffinement`,
        subheadline: `Une signature unique conçue avec les matières les plus nobles pour marquer les esprits.`,
        bulletPoints: ['Création exclusive', 'Matières d\'exception', 'Design intemporel'],
        badgeText: '💎 Qualité Pure',
        ctaText: 'Explorer la Maison →',
      },
      {
        id: 'b-f-2',
        angleTag: '✨ Signature Authentique',
        headline: `La Pureté d'une Marque Authentique`,
        subheadline: `Quand l'élégance rencontre le savoir-faire artisanal. Découvrez l'univers de notre maison.`,
        bulletPoints: ['Formule pure', 'Éthique & Transparent', 'Marque reconnue'],
        badgeText: '🛡️ 100% Original',
        ctaText: 'Découvrir le sillage →',
      },
      {
        id: 'b-f-3',
        angleTag: '🌟 Style Aspirationnel',
        headline: `Sublimez votre quotidien avec ${prodName}`,
        subheadline: `Affirmez votre personnalité avec une création faite pour vous distinguer naturellement.`,
        bulletPoints: ['Signature unique', 'Impact immédiat', 'Édition prestigieuse'],
        badgeText: '🌟 Édition Spéciale',
        ctaText: 'Voir la collection →',
      },
    ];
  }
  // social
  if (lang === 'ar') {
    return [
      {
        id: 's-ar-1',
        angleTag: '💬 ترند السوشيال ميديا',
        headline: `المنتج الأكثر طلباً وشهرة في تونس !`,
        subheadline: `وصلت الكوموند في البوتيك متاعنا ! ابعثلنا ميساج عالباج بش تحجز قطعتك فيسع.`,
        bulletPoints: ['ترند رقم 1', 'خلاص عند الاستلام', 'توصيل فيسع'],
        badgeText: '💬 الطلب عبر الرسائل (DM)',
        ctaText: 'ابعثلنا ميساج عالباج 💬',
      },
      {
        id: 's-ar-2',
        angleTag: '📲 طلب سريع عالواتساب',
        headline: `اطلب في 30 ثانية عبر الواتساب`,
        subheadline: `ابعثلنا اسمك وولايتك في ميساج والطلبية توصلك لباب الدار في 24 ساعة.`,
        bulletPoints: ['إجابة في 5 دقائق', '24 ولاية', 'الدفع عند الاستلام'],
        badgeText: '📲 واتساب سريع',
        ctaText: 'اطلب عالواتساب توة 📲',
      },
      {
        id: 's-ar-3',
        angleTag: '✨ الخيار رقم 1',
        headline: `خيار الحرفاء الأول في تونس ✨`,
        subheadline: `طاقي صاحبك اللي يستحق هذا! أكثر من 500 تقييم إيجابي من كل الولايات.`,
        bulletPoints: ['تقييم 5/5', '100% تونسي', 'رضا مضمون'],
        badgeText: '⭐ معتمد ومجرّب',
        ctaText: 'بارطاجي واطلب ➔',
      },
    ];
  }
  if (lang === 'darija') {
    return [
      {
        id: 's-d-1',
        angleTag: '💬 Viral Instagram / TikTok',
        headline: `Weslet el commande fi boutique mteena !`,
        subheadline: `Abathna message al page bech treservi flacon mteek fisaa ! Khlas fel livri.`,
        bulletPoints: ['Khlas fel livri', '100% Original', 'Livri fisaa'],
        badgeText: '💬 Commande en DM',
        ctaText: 'Envoyer un message 💬',
      },
      {
        id: 's-d-2',
        angleTag: '📲 Commande WhatsApp 1 Clic',
        headline: `Commander fi 30 secondes sur WhatsApp`,
        subheadline: `Abathna nom w ville mteek w el commande touslek l beb eddar fi 24h.`,
        bulletPoints: ['Jawb en 5 min', '24 gouvernorats', 'Paiement à la livraison'],
        badgeText: '📲 WhatsApp Rapide',
        ctaText: 'Commander sur WhatsApp 📲',
      },
      {
        id: 's-d-3',
        angleTag: '✨ Coup de Cœur Communauté',
        headline: `Votre Coup de Cœur du Moment ✨`,
        subheadline: `Taggez un proche qui aimerait recevoir ce cadeau ! Déjà +500 clients conquis.`,
        bulletPoints: ['Validé 100%', 'Avis 5 étoiles', 'Livraison express'],
        badgeText: '⭐ Validé Communauté',
        ctaText: 'Partager l\'offre →',
      },
    ];
  }
  return [
    {
      id: 's-f-1',
      angleTag: '💬 Le Produit Viral Réseaux',
      headline: `Le coup de cœur de la saison sur Instagram !`,
      subheadline: `Craquez pour ${prodName} dont tout le monde parle. Commandez directement en message privé.`,
      bulletPoints: ['Tendance N°1', 'Plein les yeux', 'Livraison 24h'],
      badgeText: '💬 Commande en DM',
      ctaText: 'Commander en DM 💬',
    },
    {
      id: 's-f-2',
      angleTag: '📲 Commande WhatsApp Express',
      headline: `Commandez en 30 secondes par message`,
      subheadline: `Envoyez-nous un message avec votre adresse pour recevoir votre colis chez vous en 24h.`,
      bulletPoints: ['Réponse en 5 min', 'Livraison 24 Gouvernorats', 'Paiement à la livraison'],
      badgeText: '📲 WhatsApp Rapide',
      ctaText: 'Commander sur WhatsApp 📲',
    },
    {
      id: 's-f-3',
      angleTag: '✨ Preuve Sociale & Partage',
      headline: `100% Validé par notre communauté`,
      subheadline: `Plus de 500 avis positifs sur toute la Tunisie. Taggez un proche pour lui faire plaisir !`,
      bulletPoints: ['Avis 5/5 ★', 'Communauté active', 'Satisfaction 100%'],
      badgeText: '⭐ Validé Communauté',
      ctaText: 'Partager & Commander →',
    },
  ];
}

interface VisualCardData {
  id: string;
  format: AdFormat;
  formatLabel: string;
  formatRatio: string;
  icon: 'instagram' | 'facebook' | 'tiktok' | 'story';
  headline: string;
  subheadline: string;
  ctaText: string;
  bgImage: string;
  bulletPoints?: string[];
  styleName: string;
  price?: string;
  badgeText?: string;
}

const STYLES_LIST: { id: AdStyle; label: string; bgGradient: string; previewImg: string; promptModifier: string }[] = [
  {
    id: 'ai_auto',
    label: 'Ambiance IA Sur-Mesure (Recommandé)',
    bgGradient: 'linear-gradient(135deg, #00E5FF, #7C3AED)',
    previewImg: '/images/whey_studio_podium.jpg',
    promptModifier: 'Commercial luxury product staging set, empty elegant vacant pedestal cleanly awaiting an object, soft directional studio lighting, clean background'
  },
  {
    id: 'sidi_bou_said',
    label: 'Sidi Bou Saïd (Best-Seller)',
    bgGradient: 'linear-gradient(135deg, #0284C7, #F43F5E)',
    previewImg: '/images/hero_lifestyle.jpg',
    promptModifier: 'Sidi Bou Said Mediterranean terrace, sunlit warm stone balustrade, vibrant bougainvillea flowers, shallow depth of field, turquoise sea view, soft morning light'
  },
  {
    id: 'moderne',
    label: 'Moderne',
    bgGradient: 'linear-gradient(135deg, #FCE7F3, #EDE9FE)',
    previewImg: '/images/adora_hero_perfume.jpg',
    promptModifier: 'luxury contemporary soft pink and white floral marble pedestal, gentle ambient lighting, clean aesthetic'
  },
  {
    id: 'elegant',
    label: 'Élégant',
    bgGradient: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
    previewImg: '/images/whey_studio_podium.jpg',
    promptModifier: 'luxury golden champagne rim light, dark polished stone podium, elegant high-end commercial backdrop'
  },
  {
    id: 'minimaliste',
    label: 'Minimaliste',
    bgGradient: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)',
    previewImg: '/images/adora_sneakers_clean.jpg',
    promptModifier: 'pure soft light grey studio pedestal, subtle contact shadow, ultra-clean catalog e-commerce look'
  },
  {
    id: 'lifestyle',
    label: 'Lifestyle',
    bgGradient: 'linear-gradient(135deg, #FED7AA, #FDBA74)',
    previewImg: '/images/hero_lifestyle.jpg',
    promptModifier: 'warm authentic interior with natural sunlight, light oak table, gentle morning shadows'
  },
  {
    id: 'dynamique',
    label: 'Dynamique',
    bgGradient: 'linear-gradient(135deg, #C7D2FE, #818CF8)',
    previewImg: '/images/creatine_story.jpg',
    promptModifier: 'high contrast energetic scene, dramatic deep violet and electric blue neon rim lighting'
  },
  {
    id: 'vintage',
    label: 'Vintage',
    bgGradient: 'linear-gradient(135deg, #E2D9C8, #C5B8A5)',
    previewImg: '/images/adora_fashion_model.jpg',
    promptModifier: 'warm retro architectural travertine stone, soft sepia hues, cinematic editorial atmosphere'
  },
  {
    id: 'creatif',
    label: 'Créatif',
    bgGradient: 'linear-gradient(135deg, #DDD6FE, #FBCFE8)',
    previewImg: '/images/gnc_pro_whey_tub_1791150838901.jpg',
    promptModifier: 'artistic pastel dreamscape, surreal floating botanicals, soft diffused studio light'
  },
];

const INITIAL_VISUALS: VisualCardData[] = [
  {
    id: 'vis-1',
    format: 'instagram',
    formatLabel: 'Instagram 1:1 Post',
    formatRatio: '1:1',
    icon: 'instagram',
    headline: "Visuel Commercial IA",
    subheadline: "Accroche générée automatiquement par l'IA",
    ctaText: "Commander",
    bgImage: '/images/image.png',
    styleName: 'Scène IA',
    price: '89 DT',
    badgeText: '✓ 100% Efficace'
  },
  {
    id: 'vis-2',
    format: 'story',
    formatLabel: 'Instagram Story 9:16',
    formatRatio: '9:16',
    icon: 'story',
    headline: "Promo & Conversion IA",
    subheadline: "Accroche Darija & livraison 24 gouvernorats",
    ctaText: "Réserver tawwa",
    bgImage: '/images/image.png',
    styleName: 'Story IA',
    price: '89 DT',
    badgeText: '🔥 Offre Limitée'
  },
  {
    id: 'vis-3',
    format: 'facebook',
    formatLabel: 'Facebook Ads Feed',
    formatRatio: '1.91:1',
    icon: 'facebook',
    headline: "Campagne Meta Ads IA",
    subheadline: "El khlass waqt el livri fi tounes el kol",
    ctaText: "Acheter en 1 Clic",
    bgImage: '/images/image.png',
    bulletPoints: ['Qualité certifiée', 'Livraison 24-48h', 'Paiement à la livraison'],
    styleName: 'Prestige Studio',
    price: '89 DT',
    badgeText: '⭐ Best-Seller N°1'
  },
  {
    id: 'vis-4',
    format: 'instagram',
    formatLabel: 'Instagram Post Carré',
    formatRatio: '1:1',
    icon: 'instagram',
    headline: "Édition Spéciale IA",
    subheadline: "Bénéfice clé et réassurance client",
    ctaText: "Découvrir →",
    bgImage: '/images/image.png',
    styleName: 'Édition Pure',
    price: '89 DT',
    badgeText: '💎 Qualité Pure'
  }
];

export default function StudioCreativePage() {
  const { workspace, user } = useWorkspace();

  // Navigation & Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [selectedSocialVisual, setSelectedSocialVisual] = useState<string | null>(null);
  const [studioSidebarMobileOpen, setStudioSidebarMobileOpen] = useState(false);

  // Étape 1 : Produit
  const [productImage, setProductImage] = useState<string>('/images/image.png');
  const [productName, setProductName] = useState<string>('Eau de Rose — Parfumerie Tunisienne');
  const [cutoutBase64, setCutoutBase64] = useState<string | null>(null);
  const [isAnalyzingProduct, setIsAnalyzingProduct] = useState<boolean>(false);
  const [productAnalysis, setProductAnalysis] = useState<any>(null);
  const [tailoredProductStyles, setTailoredProductStyles] = useState<any[]>(() => getAdBenchmarksForProduct('cosmetics', 'Eau de Rose'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Étape 2 : Objectif
  const [objective, setObjective] = useState<AdObjective>('vente');

  const [selectedStyle, setSelectedStyle] = useState<string>('ai_auto');
  const currentStyles = tailoredProductStyles.length > 0 ? tailoredProductStyles : STYLES_LIST;
  const activeStyleObj = currentStyles.find((s) => s.id === selectedStyle) || currentStyles[0];
  const carouselTrackRef = useRef<HTMLDivElement>(null);

  // Étape 4 : Format & Paramètres
  const [selectedFormat, setSelectedFormat] = useState<AdFormat>('instagram');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [priceDinars, setPriceDinars] = useState<string>('89 DT');
  const [activeBadge, setActiveBadge] = useState<string>('livraison');
  const [aiImageModel, setAiImageModel] = useState<'gpt-image-2.5-flare' | 'gpt-image-2.5-sunburst' | 'gpt-image-2'>('gpt-image-2.5-flare');

  // Identité de Marque & Personnalisation Branding (ADORA-60, ADORA-61)
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [brandName, setBrandName] = useState<string>('Eau de Rose');
  const [brandLogoUrl, setBrandLogoUrl] = useState<string>('/images/Adora_logo.png');
  const [primaryColor, setPrimaryColor] = useState<string>('#00E5FF');
  const [secondaryColor, setSecondaryColor] = useState<string>('#FF5722');
  const [logoPosition, setLogoPosition] = useState<'top-left' | 'top-right' | 'watermark'>('top-left');
  const [logoStyle, setLogoStyle] = useState<'original' | 'white'>('original');
  const [isExtractingColors, setIsExtractingColors] = useState<boolean>(false);
  const [isColorsFromLogo, setIsColorsFromLogo] = useState<boolean>(true);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [copyLanguage, setCopyLanguage] = useState<'ar' | 'fr' | 'darija' | 'mixte'>('ar');
  const [isPropositionsOpen, setIsPropositionsOpen] = useState<boolean>(false);

  // Mode d'affichage Réseaux Sociaux Réalistes (Post, Stories & Facebook)
  const [previewMode, setPreviewMode] = useState<'social_mockup'>('social_mockup');
  const [likedVisuals, setLikedVisuals] = useState<Record<string, boolean>>({ 'vis-1': true, 'vis-4': false });

  // Rendu des créations & Génération
  const [visuals, setVisuals] = useState<VisualCardData[]>(INITIAL_VISUALS);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(100);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Édition d'une carte unitaire
  const [editingCard, setEditingCard] = useState<VisualCardData | null>(null);

  // Directed Generation & Art Director States (Pipeline 6 étapes & Système de décision à 3 niveaux)
  const [creativeIntents, setCreativeIntents] = useState<CreativeIntent[]>([]);
  const [selectedIntentId, setSelectedIntentId] = useState<CreativeIntentType>('prestige_elevation');
  const [productDNA, setProductDNA] = useState<ProductDNA | null>(null);
  const [masterSceneSpec, setMasterSceneSpec] = useState<MasterSceneSpec | null>(null);
  const [visionEvaluation, setVisionEvaluation] = useState<VisionCriticEvaluation | null>(null);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [masterFormats, setMasterFormats] = useState<{ feed?: string; story?: string; banner?: string }>({});
  const [activeFormatTab, setActiveFormatTab] = useState<'feed' | 'story' | 'banner'>('feed');

  // Système de décision interactif (Une question par page)
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState<boolean>(false);
  const [dynamicQuestions, setDynamicQuestions] = useState<DynamicDirectorQuestion[]>([]);
  const [currentQuestionStep, setCurrentQuestionStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);

  // Mémorisation des préférences (localStorage) & Personnalisation avancée (Plan Directeur v2.0)
  const [reassuranceBadgeEnabled, setReassuranceBadgeEnabled] = useState<boolean>(true);
  const [customHookText, setCustomHookText] = useState<string>('');

  // Chargement des dernières préférences marchandes mémorisées
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adora_last_studio_preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.intentId) setSelectedIntentId(parsed.intentId);
        if (parsed.copyLanguage) setCopyLanguage(parsed.copyLanguage);
        if (parsed.objective) setObjective(parsed.objective);
        if (typeof parsed.reassuranceBadgeEnabled === 'boolean') {
          setReassuranceBadgeEnabled(parsed.reassuranceBadgeEnabled);
        }
        if (parsed.customHookText) setCustomHookText(parsed.customHookText);
      }
    } catch {
      // ignore
    }
  }, []);

  const savePreferences = (intent: CreativeIntentType, lang: string, obj: string, hook?: string) => {
    try {
      localStorage.setItem('adora_last_studio_preferences', JSON.stringify({
        intentId: intent,
        copyLanguage: lang,
        objective: obj,
        reassuranceBadgeEnabled,
        customHookText: hook !== undefined ? hook : customHookText,
      }));
    } catch {
      // ignore
    }
  };

  // Initialisation Brand Kit (Pilier N°0) & Intentions Créatives Ancrées
  useEffect(() => {
    const wsId = workspace?.id || 'ws_nutristore';
    const bk = getBrandKitByWorkspace(wsId);
    setBrandKit(bk);
    setBrandName(bk.shopName);
    if (bk.logoUrl) setBrandLogoUrl(bk.logoUrl);
    if (bk.primaryColor) setPrimaryColor(bk.primaryColor);
    if (bk.secondaryColor) setSecondaryColor(bk.secondaryColor);

    const priceNum = parseFloat(priceDinars.replace(/[^0-9.]/g, '')) || 89;
    generateCreativeIntents({
      productDNA: {
        productName,
        brandName: bk.shopName,
        category: (bk.industry as any) || 'cosmetics',
        packagingMaterials: ['verre haute pureté', 'bouchon premium'],
        dominantTones: [bk.palette?.primary || bk.primaryColor, '#F59E0B'],
        perceivedPriceLevel: bk.positioning === 'luxury' ? 'luxury' : 'premium',
        lightingAffinity: 'warm_golden',
        surfaceRequirements: 'polished marble',
        brandKitAlignmentScore: 96,
        brandKitNotes: `Alignement parfait avec le Brand Kit de ${bk.shopName}`,
      },
      brandKit: bk,
      priceTND: priceNum,
    }).then((intents) => {
      setCreativeIntents(intents);
      const rec = intents.find((i) => i.isRecommended) || intents[0];
      if (rec) setSelectedIntentId(rec.id);
    });
  }, [workspace?.id]);

  // Option d'affichage des résultats IA dans la console du navigateur (ADORA-74 & Debug)
  const [enableConsoleLogs, setEnableConsoleLogs] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Extraction algorithmique des couleurs du logo (ADORA-61)
  const handleExtractColorsFromLogo = useCallback(async (logoSrcToAnalyze?: string) => {
    const src = logoSrcToAnalyze || brandLogoUrl;
    if (!src) return;
    setIsExtractingColors(true);
    try {
      const palette = await extractPaletteFromLogo(src);
      if (palette.isExtracted) {
        setPrimaryColor(palette.primary);
        setSecondaryColor(palette.secondary);
        setIsColorsFromLogo(true);
        showToast(`✨ Couleurs du logo synchronisées : ${palette.primary} & ${palette.secondary}`);
      } else {
        showToast('ℹ️ Logo neutre/monochrome : Palette de contraste optimisée appliquée.');
      }
    } catch (e) {
      console.warn('Erreur extraction couleurs logo:', e);
    } finally {
      setIsExtractingColors(false);
    }
  }, [brandLogoUrl]);

  // Téléversement d'un nouveau logo (PNG, SVG, JPG, WEBP)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          setBrandLogoUrl(dataUrl);
          await handleExtractColorsFromLogo(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyse automatique IA du produit
  const analyzeProduct = useCallback(async (imgSrc: string, name: string) => {
    setIsAnalyzingProduct(true);
    try {
      const res = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: brandKit?.industry || 'E-commerce',
          userNotes: `Produit : ${name}`,
          imageBase64: imgSrc.startsWith('data:image') ? imgSrc : undefined,
          workspaceId: workspace?.id || 'ws_nutristore',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProductAnalysis(data);

        // Synchroniser immédiatement les affiches de référence à fort taux de conversion
        const payloadData = data.data || data;
        if (payloadData.tailoredStyles && Array.isArray(payloadData.tailoredStyles) && payloadData.tailoredStyles.length > 0) {
          setTailoredProductStyles(payloadData.tailoredStyles);
        }

        // Synchroniser immédiatement les cartes de preview STRICTEMENT avec les textes générés par l'IA
        const briefs = payloadData.strategyBriefs;
        const b1 = briefs?.[0];
        const b2 = briefs?.[1];
        const b3 = briefs?.[2];
        const b4 = briefs?.[3];

        if (b1 || payloadData.hookHeadline) {
          setVisuals((prev) => [
            {
              ...prev[0],
              headline: b1?.hookHeadlineFr || payloadData.hookHeadline || name,
              subheadline: b1?.targetPainPoint || payloadData.instagramCaption || '',
              badgeText: b1?.badgeText || payloadData.promoBadge || '✓ 100% Efficace',
              ctaText: b1?.callToAction || 'Commander',
              price: payloadData.pricingAngle || priceDinars,
              styleName: b1?.angleLabel || 'Scène IA',
            },
            {
              ...prev[1],
              headline: b2?.hookHeadlineDarija || payloadData.darijaHook || name,
              subheadline: b2?.targetPainPoint || payloadData.instagramCaption || '',
              badgeText: b2?.badgeText || '⭐ Best-Seller N°1',
              ctaText: b2?.callToAction || 'Commander',
              price: payloadData.pricingAngle || priceDinars,
              styleName: b2?.angleLabel || 'Prestige Studio',
            },
            {
              ...prev[2],
              headline: b3?.hookHeadlineDarija || payloadData.darijaHook || name,
              subheadline: b3?.targetPainPoint || payloadData.instagramCaption || '',
              badgeText: b3?.badgeText || '🔥 Offre Limitée',
              ctaText: b3?.callToAction || 'Commander',
              price: payloadData.pricingAngle || priceDinars,
              styleName: b3?.angleLabel || 'Story Conversion',
            },
            {
              ...prev[3],
              headline: b4?.hookHeadlineFr || payloadData.hookHeadline || name,
              subheadline: b4?.targetPainPoint || payloadData.instagramCaption || '',
              badgeText: b4?.badgeText || '💎 Qualité Pure',
              ctaText: b4?.callToAction || 'Commander',
              price: payloadData.pricingAngle || priceDinars,
              styleName: b4?.angleLabel || 'Édition Spéciale',
            },
          ]);
        }

        if (enableConsoleLogs) {
          console.group('%c🧠 [ADORA AI] Analyse Stratégique Produit & Copywriting Darija', 'background: #059669; color: #FFF; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
          console.log('📦 Résultat analyse produit :', data);
          if (typeof window !== 'undefined') {
            (window as any).__LAST_PRODUCT_ANALYSIS__ = data;
          }
          console.groupEnd();
        }
      }
    } catch (err) {
      if (enableConsoleLogs) {
        console.warn('⚠️ [ADORA AI] Analyse produit locale appliquée suite à :', err);
      }
      // Analyse locale intelligente de secours
      setProductAnalysis({
        productName: name,
        hookHeadline: "L'élégance au quotidien",
        darijaHook: `🔥 Weslet el ${name} fi boutique mteena ! Qualité originale w khlas fel livraison.`,
        pricingAngle: priceDinars,
        instagramCaption: `✨ Sublimez votre style avec ${name}. Livraison 24/48h sur toute la Tunisie !`,
      });
    } finally {
      setIsAnalyzingProduct(false);
    }
  }, [priceDinars, brandKit?.industry, workspace?.id]);

  // Détection du changement de produit
  useEffect(() => {
    analyzeProduct(productImage, productName);
  }, [productImage, productName, analyzeProduct]);

  // Extraction automatique initiale des couleurs depuis le logo actif
  useEffect(() => {
    if (brandLogoUrl) {
      extractPaletteFromLogo(brandLogoUrl).then((pal) => {
        if (pal.isExtracted) {
          setPrimaryColor(pal.primary);
          setSecondaryColor(pal.secondary);
          setIsColorsFromLogo(true);
        }
      });
    }
  }, []);

  // Détection d'un productId passé en URL (ex: depuis le Brand Kit ou Catalogue)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('productId');
      if (prodId) {
        fetch(`/api/products/${prodId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.product) {
              handleSelectCatalogProduct(data.product);
            }
          })
          .catch(() => { });
      }
    }
  }, []);

  // Chargement de l'identité de marque du Brand Kit actif (ADORA-60, ADORA-61)
  useEffect(() => {
    fetch('/api/brand-kit')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setBrandKit(data.data);
          if (data.data.shopName) setBrandName(data.data.shopName);
          if (data.data.logoUrl) {
            setBrandLogoUrl(data.data.logoUrl);
            extractPaletteFromLogo(data.data.logoUrl).then((pal) => {
              if (pal.isExtracted) {
                setPrimaryColor(pal.primary);
                setSecondaryColor(pal.secondary);
                setIsColorsFromLogo(true);
              } else if (data.data.primaryColor) {
                setPrimaryColor(data.data.primaryColor);
                if (data.data.secondaryColor) setSecondaryColor(data.data.secondaryColor);
              }
            });
          } else {
            if (data.data.primaryColor) setPrimaryColor(data.data.primaryColor);
            if (data.data.secondaryColor) setSecondaryColor(data.data.secondaryColor);
          }
          if (data.data.watermarkPosition === 'top-right') setLogoPosition('top-right');
        }
      })
      .catch(() => { });
  }, [workspace?.id]);

  // Application d'une proposition de copy IA
  const handleApplyProposition = (prop: CopyProposition) => {
    setVisuals((prev) =>
      prev.map((card, idx) => {
        if (idx === 0) {
          return {
            ...card,
            headline: prop.headline,
            subheadline: prop.subheadline,
            bulletPoints: prop.bulletPoints,
            ctaText: prop.ctaText,
            badgeText: prop.badgeText,
          };
        }
        return card;
      })
    );
    showToast(`✓ Angle appliqué : ${prop.angleTag}`);
  };

  // Scroll du carrousel de styles
  const handleScrollCarousel = (direction: 'left' | 'right') => {
    if (carouselTrackRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      carouselTrackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Analyse intelligente par GPT-4o-mini pour extraire le produit et générer des styles visuels sur-mesure
  const analyzeProductWithAI = async (imgBase64: string, fallbackName?: string) => {
    setIsAnalyzingProduct(true);
    try {
      const anRes = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgBase64,
          workspaceId: workspace?.id,
        }),
      });
      const anData = await anRes.json();
      if (anData.success && anData.data) {
        setProductAnalysis(anData.data);
        if (anData.data.productName && anData.data.productName !== 'Produit E-commerce') {
          setProductName(anData.data.productName);
        }
        if (anData.data.pricingAngle) {
          setPriceDinars(anData.data.pricingAngle);
        }
        if (anData.data.tailoredStyles && Array.isArray(anData.data.tailoredStyles) && anData.data.tailoredStyles.length > 0) {
          setTailoredProductStyles(anData.data.tailoredStyles);
          showToast(`✨ GPT-4o-mini a généré 6 thèmes créatifs adaptés à ${anData.data.productName || fallbackName || 'ce produit'} !`);
        }
      }
    } catch (err) {
      console.warn('Erreur analyse produit:', err);
    } finally {
      setIsAnalyzingProduct(false);
    }
  };

  // Gestion du téléversement de fichier produit
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setProductImage(base64);

        const cleanName = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/^adora_/i, '')
          .replace(/[_\-+]+/g, ' ')
          .replace(/\(\d+\)/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        setProductName(cleanName);
        const benchmarks = getAdBenchmarksForProduct('', cleanName);
        setTailoredProductStyles(benchmarks);

        // Mettre à jour immédiatement la prévisualisation dans les templates avec le produit téléversé
        setVisuals((prev) =>
          prev.map((v) => ({
            ...v,
            bgImage: base64,
          }))
        );

        // 1. Appel automatique du détourage adaptatif
        try {
          const cutRes = await fetch('/api/cutout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64, threshold: 240 }),
          });
          const cutData = await cutRes.json();
          if (cutData.success && cutData.transparentBase64) {
            setCutoutBase64(cutData.transparentBase64);
          }
        } catch {
          // ignore
        }

        // 2. Appel automatique GPT-4o-mini pour générer les styles personnalisés
        analyzeProductWithAI(base64, cleanName);

        showToast(`Photo produit importée : ${cleanName}`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectCatalogProduct = (p: CatalogProduct) => {
    setProductName(p.name);
    setProductImage(p.originalImageUrl);
    if (p.cutoutImageUrl) setCutoutBase64(p.cutoutImageUrl);
    if (p.priceTND) setPriceDinars(`${p.priceTND} DT`);
    if (p.badgeId) setActiveBadge(p.badgeId);
    const benchmarks = getAdBenchmarksForProduct(p.category || '', p.name);
    setTailoredProductStyles(benchmarks);

    // Mettre à jour immédiatement la prévisualisation des templates avec le produit sélectionné
    const activeImg = p.cutoutImageUrl || p.originalImageUrl;
    setVisuals((prev) =>
      prev.map((v) => ({
        ...v,
        bgImage: activeImg,
      }))
    );

    // Analyse GPT-4o-mini pour styles sur-mesure
    if (activeImg) {
      analyzeProductWithAI(activeImg, p.name);
    }
    showToast(`Produit sélectionné : ${p.name}`);
  };

  // PARCOURS 1 (EXPRESS) : Génération immédiate en 1 clic (Paramètres mémorisés ou recommandés)
  const handleExpressGenerate = async () => {
    if (workspace && workspace.creditsRemaining <= 0) {
      showToast('⚠️ Solde insuffisant (0 crédit restant). Rechargez votre pack dès 29 DT.');
      setIsCheckoutOpen(true);
      return;
    }
    showToast('⚡ Lancement Express avec vos préférences...');
    savePreferences(selectedIntentId, copyLanguage, objective, customHookText);
    handleGenerate(selectedIntentId);
  };

  // PARCOURS 2 (PERSONNALISÉ) : Ouvre le modal interactif guidé à 3 étapes courtes
  const handleOpenCustomizeModal = async () => {
    if (workspace && workspace.creditsRemaining <= 0) {
      showToast('⚠️ Solde insuffisant (0 crédit restant). Rechargez votre pack dès 29 DT.');
      setIsCheckoutOpen(true);
      return;
    }

    setIsLoadingQuestions(true);
    setIsQuestionsModalOpen(true);
    setCurrentQuestionStep(0);

    const priceNum = parseFloat(priceDinars.replace(/[^0-9.]/g, '')) || 89;
    const currentDNA: ProductDNA = productDNA || {
      productName,
      brandName: brandName || 'Votre Marque',
      category: (brandKit?.industry as any) || 'cosmetics',
      packagingMaterials: ['verre', 'bouchon premium'],
      dominantTones: [primaryColor, secondaryColor],
      perceivedPriceLevel: brandKit?.positioning === 'luxury' ? 'luxury' : 'premium',
      lightingAffinity: 'warm_golden',
      surfaceRequirements: 'marble pedestal',
      brandKitAlignmentScore: 96,
      brandKitNotes: 'Charte active',
    };

    const questions = await generateDynamicDirectorQuestions({
      productDNA: currentDNA,
      brandKit: brandKit || getBrandKitByWorkspace(workspace?.id || 'ws_nutristore'),
      priceTND: priceNum,
    });

    setDynamicQuestions(questions);
    const initialAns: Record<string, string> = {};
    questions.forEach((q) => {
      initialAns[q.id] = q.options[0]?.id;
    });
    setSelectedAnswers(initialAns);
    setIsLoadingQuestions(false);
  };

  // Alias pour rétrocompatibilité
  const handleStartGenerationFlow = handleExpressGenerate;

  const handleCompleteQuestionsAndGenerate = (overrideIntent?: CreativeIntentType) => {
    setIsQuestionsModalOpen(false);
    const chosenIntent = overrideIntent || selectedIntentId;
    if (overrideIntent) {
      setSelectedIntentId(overrideIntent);
    }
    savePreferences(chosenIntent, copyLanguage, objective, customHookText);
    handleGenerate(chosenIntent);
  };

  // Soumission via le nouveau modal guidé en 5 étapes "Smart Questions" (Maquette officielle)
  const handleSmartQuestionsGenerate = (payload: SmartQuestionsPayload) => {
    setIsQuestionsModalOpen(false);
    setSelectedIntentId(payload.intentId);
    setCustomHookText(payload.adText);
    if (payload.copyLanguage) setCopyLanguage(payload.copyLanguage);
    savePreferences(payload.intentId, payload.copyLanguage, payload.goal, payload.adText);
    showToast(`✨ Direction validée : ${payload.styleId} (${payload.goal})`);
    handleGenerate(payload.intentId, payload.stylePrompt);
  };

  // LOGIQUE DE GÉNÉRATION DES CRÉATIONS PUBLICITAIRES (handleGenerate)
  const handleGenerate = async (overrideIntent?: CreativeIntentType, overrideStylePrompt?: string) => {
    // Garde-fou crédits (ADORA-73) : Vérification préalable avant tout calcul
    if (workspace && workspace.creditsRemaining <= 0) {
      showToast('⚠️ Solde insuffisant (0 crédit restant). Rechargez votre pack dès 29 DT.');
      setIsCheckoutOpen(true);
      return;
    }

    console.log('🚀 [handleGenerate] Bouton cliqué avec succès ! Début de la génération...', {
      productName,
      hasProductImage: Boolean(productImage),
      hasCutout: Boolean(cutoutBase64),
      selectedIntentId: overrideIntent || selectedIntentId,
      priceDinars,
      creditsRemaining: workspace?.creditsRemaining,
    });
    showToast('✨ Lancement de la création de votre Master Shot...');
    setIsGenerating(true);
    setGenerationProgress(10);

    const badgeLabel = LOCAL_BADGES.find((b) => b.id === activeBadge)?.label || '🚚 Livraison 24-48h';

    // Progression animée
    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 85) return prev;
        return prev + 15;
      });
    }, 250);

    try {
      // Préparation des angles de copy selon l'objectif sélectionné
      let copyPack = {
        h1: "L'élégance au quotidien",
        sub1: "Une fragrance qui vous ressemble.",
        cta1: "Découvrir →",
        h2: "Plus qu'un parfum, une attitude.",
        sub2: `Disponible immédiatement en Tunisie au prix de ${priceDinars}.`,
        cta2: "Commander maintenant →",
        bullets2: ['Élégant', 'Intense', 'Durable'],
        h3: "Sentez la différence",
        sub3: "Une fragrance qui attire tous les regards.",
        cta3: "Acheter maintenant →",
        h4: "Naturelle. Élégante. Unique.",
        sub4: "Essence pure élaborée pour marquer les esprits.",
        cta4: "Découvrir →",
      };

      if (objective === 'promotion') {
        copyPack = {
          h1: "Offre Flash Exceptionnelle !",
          sub1: `Profitez de notre remise exclusive aujourd'hui : seulement ${priceDinars}.`,
          cta1: "Profiter de l'offre →",
          h2: "Quantités Très Limitées en Tunisie",
          sub2: "Livraison express 24h & paiement sécurisé à la réception.",
          cta2: "Commander en promo →",
          bullets2: ['-30% Immédiat', 'Livraison 24h', 'Stock Restreint'],
          h3: "Derniers Flacons Disponibles",
          sub3: "Ne manquez pas l'offre de la semaine sur notre boutique !",
          cta3: "Réserver mon pot →",
          h4: "Pack Promo Découverte",
          sub4: "Le meilleur rapport qualité/prix garanti en Tunisie.",
          cta4: "Commander vite →",
        };
      } else if (objective === 'branding') {
        copyPack = {
          h1: "L'Essence de la Séduction",
          sub1: "Une signature olfactive inoubliable signée par nos maîtres créateurs.",
          cta1: "Explorer la Maison →",
          h2: "L'Art de la Haute Parfumerie",
          sub2: "Des matières premières nobles réunies dans un flacon d'exception.",
          cta2: "Découvrir le sillage →",
          bullets2: ['Haute Parfumerie', 'Sillage Sublime', 'Édition Prestigieuse'],
          h3: "Révélez Votre Aura",
          sub3: "L'accord parfait entre modernité, puissance et délicatesse.",
          cta3: "Voir la collection →",
          h4: "L'Excellence Sans Compromis",
          sub4: "Reconnu et plébiscité par les plus exigeants en Tunisie.",
          cta4: "Découvrir →",
        };
      } else if (objective === 'social') {
        copyPack = {
          h1: "Le Parfum Viral de la Saison !",
          sub1: "Craquez pour la fragrance dont tout le monde parle sur Instagram.",
          cta1: "Commander en DM →",
          h2: "Weslet el commande fi boutique mteena !",
          sub2: "Abathna message al page bech treservi flacon mteek fisaa !",
          cta2: "Envoyer un message →",
          bullets2: ['Khlas fel livraison', '100% Original', 'Livraison fisaa'],
          h3: "Votre Coup de Cœur du Moment ✨",
          sub3: "Taggez un proche qui aimerait recevoir ce parfum !",
          cta3: "Partager l'offre →",
          h4: "100% Validé par la Communauté",
          sub4: "Déjà plus de 500 clients conquis sur toute la Tunisie.",
          cta4: "Commander maintenant →",
        };
      }

      // Génération et mise en scène publicitaire professionnelle via le pipeline Adora (ADORA-67)
      let customAiBg = activeStyleObj.previewImg || '/images/image.png';
      let generatedFormats: Record<string, string> = {};
      try {
        // Envoi STRICT des deux seules images nécessaires : l'image importée du produit et le logo de la marque (ADORA)
        const importedProduct = cutoutBase64 || (productImage && !productImage.includes('image.png') ? productImage : undefined);
        const importedLogo = brandLogoUrl && !brandLogoUrl.includes('Adora_logo.png') ? brandLogoUrl : (brandLogoUrl || undefined);

        const briefs = productAnalysis?.data?.strategyBriefs || productAnalysis?.strategyBriefs;
        const b1 = briefs?.[0];
        const aiPrompt = productAnalysis?.data?.visualPrompts?.productPro
          || productAnalysis?.visualPrompts?.productPro
          || b1?.sceneBrief?.dallePrompt
          || `${activeStyleObj.promptModifier}, commercial product staging for ${productName}`;

        const payload = {
          cutoutBase64: importedProduct,
          imageBase64: importedProduct,
          productName,
          priceTND: priceDinars,
          intentId: overrideIntent || selectedIntentId,
          aspect: selectedFormat === 'story' ? '9:16' : selectedFormat === 'facebook' ? '1.91:1' : '1:1',
          workspaceId: workspace?.id || 'ws_nutristore',
          customHook: customHookText || undefined,
          copyLanguage: copyLanguage,
          reassuranceBadge: reassuranceBadgeEnabled,
          stylePrompt: overrideStylePrompt || activeStyleObj.promptModifier,
          brandName: brandName,
          brandLogoUrl: importedLogo,
        };

        if (enableConsoleLogs) {
          console.group('%c🚀 [ADORA AI] Lancement du Master Shot Dirigé (/api/master-shot)', 'background: #00E5FF; color: #07090E; font-weight: 900; padding: 4px 10px; border-radius: 4px;');
          console.log('📤 Paramètres transmis à /api/master-shot :', payload);
        }
        console.log("data sent",JSON.stringify(payload))

        const genRes = await fetch('/api/master-shot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const genData = await genRes.json();
        console.log("sending",genData)

        if (enableConsoleLogs) {
          console.log('📡 Statut Réponse HTTP :', genRes.status, genRes.ok ? '✅ SUCCÈS (200 OK)' : `❌ ERREUR HTTP (${genRes.status})`);
          console.log('📥 Données brutes renvoyées par le moteur IA (JSON complet) :', genData);
        }

        // Si solde de crédits insuffisant renvoyé par l'API
        if (genRes.status === 402 || genData.code === 'INSUFFICIENT_CREDITS') {
          if (enableConsoleLogs) {
            console.warn('⚠️ [ADORA AI] SOLDE DE CRÉDITS INSUFFISANT :', genData.error);
            console.groupEnd();
          }
          clearInterval(progressInterval);
          setIsGenerating(false);
          setGenerationProgress(0);
          showToast('⚠️ Solde de crédits insuffisant. Veuillez recharger votre pack.');
          setIsCheckoutOpen(true);
          return;
        }

        if (!genRes.ok || !genData.success) {
          if (enableConsoleLogs) {
            console.error('❌ [ADORA AI] ERREUR MOTEUR IA :', genData?.error || 'Échec de génération');
          }
        }

        // Synchronisation du solde de crédits restant
        if (genData.creditsRemaining !== undefined && workspace) {
          workspace.creditsRemaining = genData.creditsRemaining;
        }

        const returnedUrl = genData.masterVisualUrl || genData.url || genData.images?.[0] || genData.data?.[0]?.url;
        generatedFormats = {
          instagram: genData.formats?.feed || returnedUrl,
          story: genData.formats?.story || returnedUrl,
          facebook: genData.formats?.banner || returnedUrl,
        };

        if (genData.formats) setMasterFormats(genData.formats);
        if (genData.evaluation) setVisionEvaluation(genData.evaluation);
        if (genData.sceneSpec) setMasterSceneSpec(genData.sceneSpec);
        if (genData.productDNA) setProductDNA(genData.productDNA);

        if (generatedFormats.instagram || returnedUrl) {
          customAiBg = generatedFormats.instagram || returnedUrl;
          setVisuals((prev) => [
            {
              ...prev[0],
              bgImage: genData.formats?.feed || returnedUrl,
              headline: genData.selectedIntent?.hookFr || prev[0].headline,
              subheadline: genData.selectedIntent?.subtitle || prev[0].subheadline,
              badgeText: genData.selectedIntent?.badgeText || prev[0].badgeText,
              ctaText: genData.selectedIntent?.ctaText || prev[0].ctaText,
              styleName: `${genData.selectedIntent?.titleFr || 'Master Shot'} (Feed 1:1)`,
            },
            {
              ...prev[1],
              bgImage: genData.formats?.story || returnedUrl,
              headline: genData.selectedIntent?.hookDarija || prev[1].headline,
              subheadline: genData.selectedIntent?.subtitle || prev[1].subheadline,
              badgeText: genData.selectedIntent?.badgeText || prev[1].badgeText,
              ctaText: genData.selectedIntent?.ctaText || prev[1].ctaText,
              styleName: `${genData.selectedIntent?.titleFr || 'Master Shot'} (Story 9:16)`,
            },
            {
              ...prev[2],
              bgImage: genData.formats?.banner || returnedUrl,
              headline: genData.selectedIntent?.hookFr || prev[2].headline,
              subheadline: genData.selectedIntent?.subtitle || prev[2].subheadline,
              badgeText: '🔥 Offre Limitée',
              ctaText: 'Commander',
              styleName: `${genData.selectedIntent?.titleFr || 'Master Shot'} (Ads 1.91:1)`,
            },
            {
              ...prev[3],
              bgImage: genData.formats?.feed || returnedUrl,
              headline: genData.selectedIntent?.hookDarija || prev[3].headline,
              subheadline: genData.selectedIntent?.subtitle || prev[3].subheadline,
              badgeText: '✨ Édition Prestige',
              ctaText: 'Voir la Collection',
              styleName: 'Master Shot Studio',
            },
          ]);

          if (enableConsoleLogs) {
            console.log('🎨 Master Shot Dirigé & Déclinaisons multi-formats prêts !');
            console.table({
              'Master Shot (Feed 1:1)': (genData.formats?.feed || returnedUrl)?.slice(0, 90) + '...',
              'Master Shot (Story 9:16)': (genData.formats?.story || returnedUrl)?.slice(0, 90) + '...',
              'Master Shot (Facebook 1.91:1)': (genData.formats?.banner || returnedUrl)?.slice(0, 90) + '...',
              'Score Vision Critic': genData.evaluation ? `${genData.evaluation.totalScore}/100` : 'En attente',
              'Crédits Restants': genData.creditsRemaining ?? workspace?.creditsRemaining,
            });
          }
          if (genData.creditsRemaining !== undefined) {
            showToast(`✨ Cliché Maître prêt avec Score Vision ! Solde : ${genData.creditsRemaining} crédit`);
          }
        }

        // Exposer les résultats dans l'objet global window pour inspection libre (F12)
        if (typeof window !== 'undefined') {
          (window as any).__LAST_ADORA_AI_RESULT__ = genData;
          (window as any).__ADORA_STUDIO_FORMATS__ = generatedFormats;
          (window as any).__ADORA_STUDIO_BG__ = customAiBg;

          // Helper sécurisé pour ouvrir l'image sans blocage Chrome (Chrome bloque window.open avec data:image)
          (window as any).viewAdoraImage = () => {
            const targetUrl = returnedUrl || genData.url || (window as any).__ADORA_STUDIO_BG__;
            if (!targetUrl) {
              console.warn('⚠️ Aucune image générée disponible.');
              return 'Aucune image disponible';
            }
            if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
              window.open(targetUrl, '_blank');
              return targetUrl;
            }
            const win = window.open('about:blank', '_blank');
            if (win) {
              win.document.title = 'Adora AI — Aperçu Studio Haute Définition';
              win.document.body.style.margin = '0';
              win.document.body.style.backgroundColor = '#07090E';
              win.document.body.style.display = 'flex';
              win.document.body.style.alignItems = 'center';
              win.document.body.style.justifyContent = 'center';
              win.document.body.style.minHeight = '100vh';
              const img = win.document.createElement('img');
              img.src = targetUrl;
              img.style.maxWidth = '95vw';
              img.style.maxHeight = '95vh';
              img.style.borderRadius = '12px';
              img.style.boxShadow = '0 20px 60px rgba(0,0,0,0.85)';
              win.document.body.appendChild(img);
            }
            return targetUrl;
          };

          if (enableConsoleLogs) {
            console.log('%c👁️ POUR OUVRIR L\'IMAGE EN GRAND SANS PAGE BLANCHE : Tapez %cviewAdoraImage()%c dans la console !', 'color: #10B981; font-size: 12px; font-weight: bold;', 'color: #00E5FF; font-weight: 900; background: #131823; padding: 2px 8px; border-radius: 4px; border: 1px solid #00E5FF;', 'color: #10B981; font-size: 12px; font-weight: bold;');
            console.log('%c💡 ASTUCE DEBUG : Tapez %c__LAST_ADORA_AI_RESULT__%c pour inspecter l\'objet JavaScript brut !', 'color: #A855F7; font-size: 11px;', 'color: #00E5FF; font-weight: bold; background: #131823; padding: 2px 6px; border-radius: 4px;', 'color: #A855F7; font-size: 11px;');
          }
        }

        if (enableConsoleLogs) {
          console.groupEnd();
        }
      } catch (err) {
        if (enableConsoleLogs) {
          console.error('❌ [ADORA AI] Erreur Exceptionnelle :', err);
          console.groupEnd();
        }
        console.warn('Fallback staging visuel:', err);
      }

      clearInterval(progressInterval);
      setGenerationProgress(100);
      setIsGenerating(false);

      const parsedData = productAnalysis?.data || productAnalysis;
      const briefs = parsedData?.strategyBriefs;
      const b1 = briefs?.[0];
      const b2 = briefs?.[1];
      const b3 = briefs?.[2];
      const b4 = briefs?.[3];

      const realGeneratedBg = (!customAiBg?.includes('image.png') ? customAiBg : undefined)
        || (generatedFormats.instagram && !generatedFormats.instagram.includes('image.png') ? generatedFormats.instagram : undefined)
        || activeStyleObj.previewImg;

      const bgInstagram = (generatedFormats.instagram && !generatedFormats.instagram.includes('image.png')) ? generatedFormats.instagram : realGeneratedBg;
      const bgFacebook = (generatedFormats.facebook && !generatedFormats.facebook.includes('image.png')) ? generatedFormats.facebook : realGeneratedBg;
      const bgStory = (generatedFormats.story && !generatedFormats.story.includes('image.png')) ? generatedFormats.story : realGeneratedBg;

      setVisuals([
        {
          id: `vis-${Date.now()}-1`,
          format: 'instagram',
          formatLabel: 'Instagram 1:1 Post',
          formatRatio: '1:1',
          icon: 'instagram',
          headline: b1?.hookHeadlineFr || parsedData?.hookHeadline || productName,
          subheadline: b1?.targetPainPoint || parsedData?.instagramCaption || '',
          ctaText: b1?.callToAction || 'Commander',
          bgImage: bgInstagram,
          styleName: b1?.angleLabel || 'Scène IA',
          price: parsedData?.pricingAngle || priceDinars,
          badgeText: b1?.badgeText || parsedData?.promoBadge || '✓ 100% Efficace',
        },
        {
          id: `vis-${Date.now()}-2`,
          format: 'facebook',
          formatLabel: 'Facebook Ads Feed',
          formatRatio: '1.91:1',
          icon: 'facebook',
          headline: b2?.hookHeadlineDarija || parsedData?.darijaHook || productName,
          subheadline: b2?.targetPainPoint || parsedData?.instagramCaption || '',
          ctaText: b2?.callToAction || 'Commander',
          bgImage: bgFacebook,
          bulletPoints: b2?.targetPainPoint ? [b2.targetPainPoint, 'Livraison 24-48h', 'Khlas fel livraison'] : ['Qualité certifiée', 'Livraison 24-48h', 'Paiement à la livraison'],
          styleName: b2?.angleLabel || 'Prestige Studio',
          price: parsedData?.pricingAngle || priceDinars,
          badgeText: b2?.badgeText || '⭐ Best-Seller N°1',
        },
        {
          id: `vis-${Date.now()}-3`,
          format: 'story',
          formatLabel: 'Instagram Story 9:16',
          formatRatio: '9:16',
          icon: 'story',
          headline: b3?.hookHeadlineDarija || parsedData?.darijaHook || productName,
          subheadline: b3?.targetPainPoint || parsedData?.instagramCaption || '',
          ctaText: b3?.callToAction || 'Réserver tawwa',
          bgImage: bgStory,
          styleName: b3?.angleLabel || 'Story Conversion',
          price: parsedData?.pricingAngle || priceDinars,
          badgeText: b3?.badgeText || '🔥 Offre Limitée',
        },
        {
          id: `vis-${Date.now()}-4`,
          format: 'instagram',
          formatLabel: 'Instagram Post Carré',
          formatRatio: '1:1',
          icon: 'instagram',
          headline: b4?.hookHeadlineFr || parsedData?.hookHeadline || productName,
          subheadline: b4?.targetPainPoint || parsedData?.instagramCaption || '',
          ctaText: b4?.callToAction || 'Découvrir',
          bgImage: bgInstagram,
          styleName: b4?.angleLabel || 'Édition Spéciale',
          price: parsedData?.pricingAngle || priceDinars,
          badgeText: b4?.badgeText || '💎 Qualité Pure',
        },
      ]);

      showToast('Vos 4 visuels publicitaires stratégiques sont prêts !');
    } catch (err: any) {
      console.error('❌ [handleGenerate] Erreur durant la génération:', err);
      showToast('Génération terminée (mode local haute fidélité)');
    } finally {
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setIsGenerating(false);
    }
  };

  // Raffinement ciblé en mémoire (<500ms, 0 crédit déduit - Step 06)
  const handleRefine = async (action: string, params: Record<string, any> = {}) => {
    const currentBg = visuals[0]?.bgImage;
    if (!currentBg) return;
    setIsRefining(true);
    showToast('✨ Raffinement ciblé en cours (<500ms, 0 crédit)...');
    try {
      const res = await fetch('/api/master-shot/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterBackgroundBase64: currentBg,
          cutoutBase64: cutoutBase64 || productImage,
          sceneSpec: masterSceneSpec,
          refineAction: action,
          parameters: params,
          workspaceId: workspace?.id || 'ws_nutristore',
        }),
      });
      const data = await res.json();
      if (data.success && data.updatedVisualUrl) {
        setVisuals((prev) =>
          prev.map((v) => ({
            ...v,
            bgImage: data.updatedVisualUrl,
          }))
        );
        if (data.updatedSceneSpec) setMasterSceneSpec(data.updatedSceneSpec);
        showToast('✅ Raffinement appliqué avec succès (0 crédit déduit) !');
      }
    } catch {
      showToast('Erreur lors du raffinement ciblé');
    } finally {
      setIsRefining(false);
    }
  };

  // Régénération unitaire d'une carte
  const handleRegenerateSingle = (cardId: string) => {
    showToast('Régénération de la variante publicitaire...');
    setVisuals((prev) =>
      prev.map((card) => {
        if (card.id === cardId) {
          const alternateHeadlines = [
            "Le choix incontournable pour rayonner",
            "Offre exclusive : commandez maintenant",
            "Élu parfum préféré des tunisiens",
            "Un sillage puissant et raffiné",
          ];
          const randomHeadline = alternateHeadlines[Math.floor(Math.random() * alternateHeadlines.length)];
          return {
            ...card,
            id: `vis-${Date.now()}`,
            headline: randomHeadline,
          };
        }
        return card;
      })
    );
  };

  // Rendu Canvas haute définition pour téléchargement unitaire
  const renderCardToCanvasBlob = async (card: VisualCardData): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const W = 1080;
    const H = card.format === 'tiktok' || card.format === 'story' ? 1920 : card.format === 'facebook' ? 565 : 1080;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas non disponible');

    // 1. Fond d'image
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';
    bgImg.src = card.bgImage;
    await new Promise((resolve) => {
      bgImg.onload = resolve;
      bgImg.onerror = resolve;
    });

    try {
      ctx.drawImage(bgImg, 0, 0, W, H);
    } catch {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, W, H);
    }

    // Si le visuel est déjà une affiche publicitaire complète (image.png ou composition Adora), on préserve sa pureté
    const isPreDesignedAd = card.bgImage.startsWith('data:image') || card.bgImage.includes('image.png');
    if (!isPreDesignedAd) {
      // 2. Dégradé sombre pour lisibilité du texte
      const grad = ctx.createLinearGradient(0, H * 0.4, 0, H);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.75)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // 3. Logo Marque
      if (brandLogoUrl) {
        try {
          const logoImg = new Image();
          logoImg.crossOrigin = 'anonymous';
          logoImg.src = brandLogoUrl;
          await new Promise((res) => {
            logoImg.onload = res;
            logoImg.onerror = res;
          });
          // Fond capsule protectrice
          ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.beginPath();
          ctx.roundRect(40, 40, 210, 44, 8);
          ctx.fill();
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.drawImage(logoImg, 50, 48, 44, 28);
          ctx.font = '900 16px Outfit, sans-serif';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(brandName.toUpperCase(), 105, 68);
        } catch {
          ctx.font = '900 32px Outfit, sans-serif';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText(brandName.toUpperCase(), 40, 60);
        }
      } else {
        ctx.font = '900 32px Outfit, sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(brandName.toUpperCase(), 40, 60);
      }

      // 4. Badge commercial tunisien
      if (card.badgeText) {
        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.roundRect(40, 100, 230, 36, 18);
        ctx.fill();

        ctx.font = '800 15px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#0F172A';
        ctx.fillText(card.badgeText, 54, 124);
      }

      // 5. Titre et sous-titre
      ctx.font = '900 48px Outfit, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(card.headline, 40, H - 180);

      ctx.font = '500 24px Plus Jakarta Sans, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillText(card.subheadline, 40, H - 130);

      // 6. Prix en Dinars & Bouton CTA avec dégradé logo
      const ctaGrad = ctx.createLinearGradient(40, H - 90, 320, H - 38);
      ctaGrad.addColorStop(0, primaryColor);
      ctaGrad.addColorStop(1, secondaryColor);
      ctx.fillStyle = ctaGrad;
      ctx.beginPath();
      ctx.roundRect(40, H - 90, 280, 52, 12);
      ctx.fill();

      ctx.font = '900 18px Outfit, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`${card.ctaText} (${card.price || '89 DT'})`, 55, H - 56);
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob || new Blob()), 'image/jpeg', 0.95);
    });
  };

  // Téléchargement unitaire d'un visuel
  const handleDownloadSingle = async (card: VisualCardData) => {
    try {
      showToast('Génération du visuel HD...');
      const blob = await renderCardToCanvasBlob(card);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Adora_${productName.replace(/\s+/g, '_')}_${card.format}_${card.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('Téléchargement terminé !');
    } catch {
      window.open(card.bgImage, '_blank');
    }
  };

  // TÉLÉCHARGEMENT GROUPÉ EN ARCHIVE ZIP (handleDownloadAllZip)
  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    showToast('Génération de l\'archive ZIP complète...');
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Dossier 1 : Visuels publicitaires rendus
      const visualsFolder = zip.folder('01_Visuels_Publicitaires_HD');
      for (let i = 0; i < visuals.length; i++) {
        const v = visuals[i];
        try {
          const blob = await renderCardToCanvasBlob(v);
          const filename = `Adora_0${i + 1}_${v.formatLabel.replace(/[\s:]/g, '_')}.jpg`;
          visualsFolder?.file(filename, blob);
        } catch (err) {
          console.warn('Erreur ajout visuel au ZIP:', err);
        }
      }

      // Dossier 2 : Badges SVG Tunisiens officiels
      const badgesFolder = zip.folder('02_Badges_Tunisie_SVG');
      for (const badge of LOCAL_BADGES) {
        try {
          const res = await fetch(badge.svgUrl);
          if (res.ok) {
            const svgContent = await res.text();
            badgesFolder?.file(`${badge.id}.svg`, svgContent);
          }
        } catch {
          // ignore
        }
      }

      // Fichier textes & légendes prêtes à poster (Darija & Français)
      const darijaText = productAnalysis?.darijaHook || `🔥 Weslet el ${productName} fi boutique mteena !\nQualité originale 100% w riha tched nhar kemel.\n🚚 Livri fisaa fi tounes el kol (24-48h)\n💰 Khlas fel livraison\n👉 Abathna message al page bech treservi flacon mteek !`;
      const frenchText = productAnalysis?.instagramCaption || `✨ Sublimez votre quotidien avec ${productName}.\nUne création olfactive raffinée, intense et durable au prix de ${priceDinars}.\n✅ Produit certifié 100% original\n🚚 Livraison express sur toute la Tunisie (24 à 48h)\n💵 Paiement à la réception en toute sécurité\n👉 Commandez dès maintenant par message privé !`;

      const copyFileContent = `========================================================================
ADORA AI STUDIO — PACK PUBLICITAIRE CLÉ EN MAIN
Produit : ${productName}
Objectif : ${objective.toUpperCase()}
Tarif Tunisie : ${priceDinars}
========================================================================

--- 1. LÉGENDE CONVERSION DARIJA (RÉSEAUX SOCIAUX TUNISIE) ---
${darijaText}

--- 2. LÉGENDE FACEBOOK & INSTAGRAM (FRANÇAIS PRO) ---
${frenchText}

--- 3. ACCROCHE STORY INSTAGRAM / TIKTOK ---
🚨 RUPTURE DE STOCK IMMINENTE ! Cliquez vite pour commander votre ${productName} avant épuisement !

--- 4. HASHTAGS TUNISIENS ---
#parfumtunisie #ecommercetunisie #livraisontunisie #ventetunisie #tunisianshop #beaute_tunisie
`;
      zip.file('legendes_et_textes_publicitaires.txt', copyFileContent);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Pack_Adora_${productName.replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Pack ZIP téléchargé avec succès !');
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la génération du ZIP');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className={s.studioContainer}>
      {/* Toast de confirmation en haut à droite */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            background: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 9999,
            fontSize: '0.85rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <Sparkles size={16} color="#00E5FF" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Backdrop sur mobile */}
      <div
        className={`${s.studioBackdrop} ${studioSidebarMobileOpen ? s.backdropOpen : ''}`}
        onClick={() => setStudioSidebarMobileOpen(false)}
      />

      {/* =========================================================================
          GAUCHE : SIDEBAR PRO DE NAVIGATION (ADORA-50)
          ========================================================================= */}
      <aside className={`${s.sidebar} ${studioSidebarMobileOpen ? s.sidebarOpenMobile : ''}`}>
        <div>
          {/* Logo Adora officiel & bouton fermeture mobile */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
            <Link href="/" className={s.brandHeader} style={{ borderBottom: 'none', padding: 0, margin: 0, flex: 1, textDecoration: 'none' }}>
              <img
                src="/images/Adora_logo.png"
                alt="Adora Logo"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  objectFit: 'contain',
                  background: '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                }}
              />
              <div className={s.brandTitles}>
                <span className={s.brandName}>Adora</span>
                <span className={s.brandTagline}>Crée. Publie. Vends.</span>
              </div>
            </Link>

            <button
              type="button"
              className={s.studioSidebarCloseBtn}
              onClick={() => setStudioSidebarMobileOpen(false)}
              aria-label="Fermer le menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Sélecteur de Boutique Multi-Tenant (AGENTS.md) */}
          <div style={{ padding: '12px 6px 4px 6px' }}>
            <WorkspaceSelector />
          </div>

          {/* Menu de navigation complet (ADORA-63) */}
          <nav className={s.navSection}>
            {/* Section 1 : STUDIO & CRÉATION IA */}
            <div className={s.navGroupLabel}>Studio & Création IA</div>

            <div className={`${s.navItem} ${s.navItemActive}`}>
              <Sparkles size={18} className={s.navIconActive} />
              <span>Créer une publicité</span>
              <span className={s.navBadge}>Actif</span>
            </div>

            <Link href="/cutout" className={s.navItem}>
              <Scissors size={18} />
              <span>Enlever le fond (IA)</span>
              <span className={s.navBadgeCyan}>Détourage</span>
            </Link>

            <Link href="/brand-kit" className={s.navItem}>
              <Palette size={18} />
              <span>Brand Kit & Charte</span>
            </Link>

            <div
              className={s.navItem}
              onClick={() => setIsCatalogOpen(true)}
            >
              <ShoppingBag size={18} />
              <span>Catalogue produits</span>
            </div>

            {/* Section 2 : DIFFUSION & PERFORMANCE */}
            <div className={s.navGroupLabel}>Diffusion & Performance</div>

            <Link href="/dashboard" className={s.navItem}>
              <LayoutDashboard size={18} />
              <span>Tableau de bord</span>
            </Link>

            <Link href="/social" className={s.navItem}>
              <Calendar size={18} />
              <span>Campagnes & Social</span>
            </Link>

            <Link href="/pricing" className={s.navItem}>
              <Tag size={18} />
              <span>Tarifs & Offres</span>
              <span className={s.navBadgeHot}>Dès 29 DT</span>
            </Link>

            {/* Section 3 : ENTREPRISE & GESTION */}
            <div className={s.navGroupLabel}>Entreprise & Gestion</div>

            <Link href="/agency" className={s.navItem}>
              <Building2 size={18} />
              <span>Espace Agence B2B</span>
              <span className={s.navBadge}>B2B</span>
            </Link>

            <Link href="/billing/history" className={s.navItem}>
              <FileText size={18} />
              <span>Facturation & Reçus</span>
            </Link>
          </nav>
        </div>

        {/* Bas de sidebar : Carte Passez à Pro + Profil Utilisateur */}
        <div>
          {/* Carte Passez à Pro — Pack Lancement Pro */}
          <div className={s.proCard}>
            <div className={s.proHeader}>
              <Crown size={16} />
              <span>Pack Lancement Pro</span>
              <span style={{ fontSize: '0.64rem', background: '#FF5722', color: '#FFF', padding: '2px 7px', borderRadius: '8px', marginLeft: 'auto', fontWeight: 800 }}>
                59 DT
              </span>
            </div>
            <p className={s.proDesc}>
              20 visuels 4K sans filigrane, légendes Facebook Ads & archive ZIP complète.
            </p>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
              <button
                className={s.proBtn}
                style={{ flex: 1 }}
                onClick={() => setIsCheckoutOpen(true)}
              >
                Commander (59 DT)
              </button>
              <Link
                href="/pricing"
                className={s.proBtn}
                style={{
                  background: '#FFFFFF',
                  color: '#7C3AED',
                  border: '1px solid #E9D5FF',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 10px',
                }}
                title="Consulter tous les tarifs & abonnements"
              >
                Tous les tarifs
              </Link>
            </div>
          </div>

          {/* Profil utilisateur Thamer Kthiri */}
          <div
            className={s.userProfile}
            onClick={() => setIsBrandKitOpen(true)}
            title="Gérer votre entreprise & identité de marque"
          >
            <div className={s.userInfo}>
              <div className={s.userAvatar}>TK</div>
              <div className={s.userMeta}>
                <span className={s.userName}>{user?.name || 'Thamer Kthiri'}</span>
                <span className={s.userCompany}>{workspace?.name || 'Mon entreprise'}</span>
              </div>
            </div>
            <ChevronDown size={16} color="#64748B" />
          </div>
        </div>
      </aside>

      {/* =========================================================================
          ZONE PRINCIPALE (SPLIT WIZARD GAUCHE + CRÉATIONS GÉNÉRÉES DROITE)
          ========================================================================= */}
      <main className={s.mainLayout}>
        {/* =========================================================================
            NAVBAR SUPÉRIEURE PRO (ADORA-65)
            ========================================================================= */}
        <header className={s.studioTopNavbar}>
          {/* Fil d'Ariane & Navigation Retour */}
          <div className={s.navBreadcrumbWrap}>
            <button
              type="button"
              className={s.studioHamburgerBtn}
              onClick={() => setStudioSidebarMobileOpen(!studioSidebarMobileOpen)}
              title="Menu de navigation"
            >
              <Menu size={18} />
            </button>

            <Link href="/dashboard" className={s.breadcrumbBackBtn} title="Retour au tableau de bord" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <img
                src="/images/Adora_logo.png"
                alt="Adora Logo"
                style={{ width: '22px', height: '22px', borderRadius: '6px', objectFit: 'contain', background: '#FFFFFF' }}
              />
              <ChevronLeft size={16} />
              <span>Accueil</span>
            </Link>
            <span className={s.breadcrumbSeparator}>/</span>
            <div className={s.breadcrumbCurrent}>
              <span>Studio Créatif IA</span>
              <span className={s.navLiveEngineBadge}>
                <Sparkles size={11} /> 4K Staging v2
              </span>
            </div>
          </div>

          {/* Raccourcis d'actions & Multi-Tenant */}
          <div className={s.navRightActions}>
            <button
              type="button"
              className={s.navQuickActionBtn}
              onClick={() => setIsBrandKitOpen(true)}
              title="Configurer votre identité de marque et logo"
            >
              <Palette size={14} color="#7C3AED" />
              <span>Brand Kit</span>
            </button>

            <div
              className={s.navCreditsBadge}
              onClick={() => setIsCheckoutOpen(true)}
              title="Recharger vos crédits de génération"
            >
              <Zap size={13} color="#4338CA" />
              <span>{workspace?.creditsRemaining || 14} crédits</span>
            </div>

            <button
              type="button"
              className={s.navProCtaBtn}
              onClick={() => setIsCheckoutOpen(true)}
              title="Débloquer les exports 4K illimités"
            >
              <Crown size={14} />
              <span>Passer à Pro</span>
            </button>
          </div>
        </header>

        <div className={s.contentSplit}>

          {/* =====================================================================
              COLONNE DU CENTRE : WIZARD 4 ÉTAPES (ADORA-51 à 54)
              ===================================================================== */}
          <section className={s.wizardCol}>
            {/* Titre & Sous-titre */}
            <div className={s.pageTitleSection}>
              <h1 className={s.pageTitle}>
                <span>Créez vos publicités en quelques secondes</span>
                <Sparkles size={22} color="#7C3AED" />
              </h1>
              <p className={s.pageSubtitle}>
                Ajoutez votre produit, votre objectif et laissez l'IA créer automatiquement vos 4 affiches dans tous les formats.
              </p>
            </div>

            {/* Input fichier caché pour l'upload */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {/* ÉTAPE 1 : VOTRE PRODUIT & PRIX */}
            <div className={s.stepCard} style={{ padding: '18px 20px', marginBottom: '16px' }}>
              <div className={s.stepHeader} style={{ marginBottom: '14px' }}>
                <div className={s.stepNumber}>1</div>
                <div className={s.stepTitleWrap}>
                  <h3 className={s.stepTitle}>Photo & Détails du produit</h3>
                  <p className={s.stepDescription}>
                    Importez votre produit et indiquez son prix de vente en Tunisie.
                  </p>
                </div>
              </div>

              {/* Zone Drag & Drop ou aperçu produit */}
              <div
                className={s.dropzone}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      const base64 = event.target?.result as string;
                      setProductImage(base64);
                      const cleanName = file.name
                        .replace(/\.[^/.]+$/, '')
                        .replace(/^adora_/i, '')
                        .replace(/[_\-+]+/g, ' ')
                        .replace(/\(\d+\)/g, '')
                        .replace(/\s+/g, ' ')
                        .trim();
                      setProductName(cleanName);
                      setVisuals((prev) =>
                        prev.map((v) => ({
                          ...v,
                          bgImage: base64,
                        }))
                      );
                      try {
                        const cutRes = await fetch('/api/cutout', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ imageBase64: base64, threshold: 240 }),
                        });
                        const cutData = await cutRes.json();
                        if (cutData.success && cutData.transparentBase64) {
                          setCutoutBase64(cutData.transparentBase64);
                        }
                      } catch {
                        // ignore
                      }
                      analyzeProductWithAI(base64, cleanName);
                      showToast(`Photo importée : ${cleanName}`);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                style={{
                  minHeight: '100px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  borderRadius: '10px',
                  border: '2px dashed #CBD5E1',
                  background: '#F8FAFC',
                  marginBottom: '14px',
                }}
              >
                {productImage ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      background: '#FFF',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <img
                        src={cutoutBase64 || productImage}
                        alt={productName}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {productName || 'Produit importé'}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>
                        ✓ {cutoutBase64 ? 'Détouré avec succès' : 'Photo prête'} · Cliquez pour changer
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCatalogOpen(true);
                      }}
                      style={{
                        padding: '6px 10px',
                        background: '#EDE9FE',
                        color: '#6D28D9',
                        border: '1px solid #DDD6FE',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Catalogue
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={28} className={s.uploadCloudIcon} />
                    <div style={{ textAlign: 'left' }}>
                      <span className={s.dropzonePrompt} style={{ fontSize: '0.84rem' }}>Cliquez pour importer la photo du produit</span>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#94A3B8' }}>PNG, JPG ou WebP</span>
                    </div>
                  </>
                )}
              </div>

              {/* 3 champs compacts : Nom, Prix en DT, Badge commercial */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Nom du produit
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Ex: Huile de Figue de Barbarie Pure"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Prix affiché (TND)
                  </label>
                  <input
                    type="text"
                    value={priceDinars}
                    onChange={(e) => setPriceDinars(e.target.value)}
                    placeholder="Ex: 59 DT"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      outline: 'none',
                      color: '#0F172A',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Badge commercial
                  </label>
                  <select
                    value={activeBadge}
                    onChange={(e) => setActiveBadge(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      outline: 'none',
                      backgroundColor: '#FFF',
                    }}
                  >
                    {LOCAL_BADGES.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Badge Réassurance cumulable (Recommandation 4) */}
                <div style={{
                  gridColumn: 'span 2',
                  marginTop: '4px',
                  padding: '8px 10px',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 700, color: '#0F172A' }}>
                    <input
                      type="checkbox"
                      checked={reassuranceBadgeEnabled}
                      onChange={(e) => setReassuranceBadgeEnabled(e.target.checked)}
                      style={{ accentColor: '#00E5FF', width: '15px', height: '15px', cursor: 'pointer' }}
                    />
                    <span>🚚 Réassurance : Paiement à la livraison 24h-48h</span>
                  </label>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: reassuranceBadgeEnabled ? '#059669' : '#94A3B8' }}>
                    {reassuranceBadgeEnabled ? '✓ Actif' : 'Désactivé'}
                  </span>
                </div>
              </div>
            </div>

            {/* Input fichier caché pour le logo */}
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              style={{ display: 'none' }}
              onChange={handleLogoUpload}
            />

            {/* BOUTON D'ACTION PRINCIPALE : OUVRE LE POPUP DE DIRECTION ARTISTIQUE & AMBIANCE */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className={s.generateActionBtn}
                onClick={() => {
                  if (workspace && workspace.creditsRemaining <= 0) {
                    showToast('⚠️ Solde insuffisant (0 crédit restant). Rechargez votre pack dès 29 DT.');
                    setIsCheckoutOpen(true);
                    return;
                  }
                  setIsQuestionsModalOpen(true);
                }}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  padding: '16px 24px',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(0, 229, 255, 0.25)',
                }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    <span>Création du Master Shot ({generationProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>🎨 Choisir le Décor & Générer</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              {/* Bouton secondaire génération express 1 clic direct */}
              <button
                type="button"
                onClick={handleExpressGenerate}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  padding: '11px 18px',
                  borderRadius: '10px',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                }}
              >
                <Sparkles size={14} color="#7C3AED" />
                <span>⚡ Générer en 1 clic (Ambiance active)</span>
              </button>

              <div style={{
                textAlign: 'center',
                fontSize: '0.73rem',
                color: '#64748B',
                lineHeight: 1.4,
                marginTop: '2px',
              }}>
                ✓ <strong>1 Seul Cliché Maître :</strong> -70% de consommation API • 0 altération du produit réel
                <br />
                ✓ <strong>Déclinaisons Automatiques :</strong> Feed 1:1, Story 9:16 (Safe Zones) et Facebook Ads
              </div>
            </div>


          </section>

          {/* =====================================================================
              COLONNE DE DROITE : VOS CRÉATIONS GÉNÉRÉES 2x2 (ADORA-55 & ADORA-56)
              ===================================================================== */}
          <section className={s.resultsCol}>
            {/* Header supérieur de la section de résultats */}
            <div className={s.resultsHeader}>
              <div className={s.resultsTitleLeft}>
                <div className={s.resultsTitleRow}>
                  <h2 className={s.resultsTitle}>
                    <Sparkles size={18} color="#7C3AED" />
                    <span>Vos créations générées</span>
                  </h2>
                  <span className={s.visualsCountBadge}>4 visuels</span>
                </div>
                <p className={s.resultsSubtitle}>
                  Voici vos visuels publicitaires créés avec l'IA au format réel pour Instagram Post, Stories et Facebook Ads.
                </p>

                {/* Badge Format Réseaux Sociaux Réel */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: '#E1306C',
                    background: '#FDF2F8',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: '1px solid #FCE7F3',
                  }}>
                    <span>📱</span>
                    <span>Format Réseaux Sociaux Réels (Instagram Post, Stories & Facebook)</span>
                  </span>
                </div>
              </div>

              {/* Bouton de notifications & Avatar utilisateur */}
              <div className={s.headerTopActions}>
                <button
                  type="button"
                  className={s.iconCircleBtn}
                  title="Notifications de génération"
                  onClick={() => showToast('Toutes vos notifications sont à jour')}
                >
                  <Bell size={16} />
                </button>
                <div
                  className={s.headerAvatar}
                  onClick={() => setIsBrandKitOpen(true)}
                  title="Mon profil & Brand Kit"
                >
                  TK
                </div>
              </div>
            </div>

            {/* GRILLE 2x2 DES CRÉATIONS GÉNÉRÉES (ADORA-55) */}
            <div className={s.resultsGrid}>
              {visuals.map((card) => (
                <div key={card.id} className={s.adVisualCard} style={{ overflow: 'hidden', position: 'relative' }}>
                  {/* Overlay de chargement pendant la génération */}
                  {isGenerating && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(15, 23, 42, 0.78)',
                      backdropFilter: 'blur(8px)',
                      zIndex: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      color: '#FFFFFF',
                      padding: '16px',
                      textAlign: 'center',
                    }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(0, 229, 255, 0.15)', border: '2px solid #00E5FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Sparkles size={20} color="#00E5FF" className="animate-spin" />
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>Génération en cours...</div>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{card.formatLabel}</div>
                      <div style={{ width: '120px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                        <div style={{ width: `${generationProgress}%`, height: '100%', background: 'linear-gradient(90deg, #00E5FF, #7C3AED)', transition: 'width 0.3s ease' }} />
                      </div>
                    </div>
                  )}

                  {/* APERÇU FORMAT RÉSEAUX SOCIAUX (INSTAGRAM STORY, POST & FACEBOOK ADS) */}
                  <div>
                      {/* CAS A : FORMAT INSTAGRAM STORY (OU TIKTOK 9:16) */}
                      {card.format === 'story' || card.format === 'tiktok' ? (
                        <div style={{ background: '#0F172A', color: '#FFF' }}>
                          {/* Barres de progression Story */}
                          <div style={{ display: 'flex', gap: '3px', padding: '8px 10px 4px' }}>
                            <div style={{ flex: 1, height: '2px', background: '#FFFFFF', borderRadius: '2px' }} />
                            <div style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                            <div style={{ flex: 1, height: '2px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                          </div>

                          {/* Header Instagram Story */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(45deg, #F58529, #D92E7F, #833AB4)', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.6rem', color: '#7C3AED' }}>
                                  {(brandName || 'AD').slice(0, 2).toUpperCase()}
                                </div>
                              </div>
                              <div style={{ fontSize: '0.74rem', fontWeight: 800 }}>
                                {(brandName || 'boutique').toLowerCase().replace(/[^a-z0-9]/g, '') + '.tn'}
                              </div>
                            </div>
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#A855F7', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                              Story 9:16
                            </span>
                          </div>

                          {/* Image Story avec Stickers */}
                          <div style={{ position: 'relative', width: '100%', aspectRatio: '9 / 16', maxHeight: '420px', overflow: 'hidden', background: '#0F172A' }}>
                            <img
                              src={card.bgImage || activeStyleObj.previewImg || '/images/image.png'}
                              alt={card.headline}
                              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                              onError={(e) => {
                                const el = e.currentTarget;
                                if (!el.src.includes('image.png')) el.src = '/images/image.png';
                              }}
                            />

                            {/* Badge IA Story */}
                            {card.badgeText && (
                              <div style={{
                                position: 'absolute',
                                top: '12px',
                                left: '12px',
                                background: '#E11D48',
                                color: '#FFF',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.64rem',
                                fontWeight: 900,
                                boxShadow: '0 2px 8px rgba(225, 29, 72, 0.4)',
                              }}>
                                {card.badgeText}
                              </div>
                            )}

                            {/* Accroche IA Story */}
                            <div style={{
                              position: 'absolute',
                              bottom: '12px',
                              left: '12px',
                              right: '12px',
                              background: 'rgba(0, 0, 0, 0.75)',
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px',
                            }}>
                              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#FFF' }}>
                                {card.headline}
                              </div>
                              {card.price && (
                                <span style={{ fontSize: '0.68rem', color: '#34D399', fontWeight: 900, whiteSpace: 'nowrap' }}>
                                  {card.price}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Bouton d'action Story Swipe-up */}
                          <div style={{ padding: '8px 10px', background: '#0F172A' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSocialVisual(card.bgImage);
                                setIsSocialModalOpen(true);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '9999px',
                                background: '#FFFFFF',
                                color: '#0F172A',
                                fontWeight: 800,
                                fontSize: '0.74rem',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                              }}
                            >
                              <span>{card.ctaText || 'Commander'}</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      ) : card.format === 'facebook' ? (
                        /* CAS B : FORMAT FACEBOOK ADS FEED */
                        <div style={{ background: '#FFFFFF' }}>
                          {/* Header Facebook */}
                          <div style={{ padding: '10px 12px 8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 900, fontSize: '0.65rem' }}>
                                  {(brandName || 'AD').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0F172A' }}>{brandName}</span>
                                    <span style={{ color: '#1877F2', fontSize: '0.7rem' }}>✓</span>
                                  </div>
                                </div>
                              </div>
                              <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#1877F2', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px', border: '1px solid #DBEAFE' }}>
                                Facebook Ads
                              </span>
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#1E293B', lineHeight: '1.4', fontWeight: 600 }}>
                              {card.headline}
                            </div>
                          </div>

                          {/* Image Facebook */}
                          <div style={{ position: 'relative', width: '100%', background: '#F8FAFC', overflow: 'hidden', aspectRatio: '1.91 / 1' }}>
                            <img
                              src={card.bgImage || activeStyleObj.previewImg || '/images/image.png'}
                              alt={card.headline}
                              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                              onError={(e) => {
                                const el = e.currentTarget;
                                if (!el.src.includes('image.png')) el.src = '/images/image.png';
                              }}
                            />
                          </div>

                          {/* Lien et CTA Facebook Ads */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F8FAFC' }}>
                            <div style={{ flex: 1, marginRight: '8px' }}>
                              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0F172A' }}>{card.subheadline}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSocialVisual(card.bgImage);
                                setIsSocialModalOpen(true);
                              }}
                              style={{
                                background: '#1877F2',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: '0.7rem',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {card.ctaText || 'Commander'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* CAS C : FORMAT INSTAGRAM POST FEED (PAR DÉFAUT) */
                        <div style={{ background: '#FFFFFF' }}>
                          {/* Header Instagram Post */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid #F1F5F9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: 'linear-gradient(45deg, #F58529, #D92E7F, #833AB4)',
                                padding: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.62rem', color: '#7C3AED' }}>
                                  {(brandName || 'AD').slice(0, 2).toUpperCase()}
                                </div>
                              </div>
                              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#0F172A' }}>
                                {(brandName || 'boutique').toLowerCase().replace(/[^a-z0-9]/g, '') + '.tn'}
                              </span>
                            </div>
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#E1306C', background: '#FDF2F8', padding: '2px 6px', borderRadius: '4px', border: '1px solid #FCE7F3' }}>
                              Instagram Post
                            </span>
                          </div>

                          {/* Image Instagram Post */}
                          <div style={{ position: 'relative', width: '100%', background: '#F8FAFC', overflow: 'hidden', aspectRatio: '1 / 1' }}>
                            <img
                              src={card.bgImage || activeStyleObj.previewImg || '/images/image.png'}
                              alt={card.headline}
                              style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                              onError={(e) => {
                                const el = e.currentTarget;
                                if (!el.src.includes('image.png')) el.src = '/images/image.png';
                              }}
                            />
                          </div>

                          {/* Légende du Post avec Accroche IA */}
                          <div style={{ padding: '10px 12px' }}>
                            <div style={{ fontSize: '0.74rem', color: '#1E293B', lineHeight: '1.4', marginBottom: '8px' }}>
                              <span style={{ fontWeight: 800, marginRight: '6px' }}>
                                {(brandName || 'boutique').toLowerCase().replace(/[^a-z0-9]/g, '') + '.tn'}
                              </span>
                              <span>{card.headline}</span>
                              {card.subheadline && (
                                <div style={{ color: '#64748B', fontSize: '0.7rem', marginTop: '3px' }}>
                                  {card.subheadline}
                                </div>
                              )}
                            </div>

                            {/* Bouton CTA d'Achat IA */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSocialVisual(card.bgImage);
                                setIsSocialModalOpen(true);
                              }}
                              style={{
                                width: '100%',
                                padding: '8px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                                color: '#FFFFFF',
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                              }}
                            >
                              <ShoppingBag size={13} />
                              <span>{card.ctaText || 'Commander'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>


                  {/* Barre d'action unitaire sous chaque carte */}
                  <div className={s.adCardToolbar}>
                    <div className={s.toolbarActionsLeft}>
                      {/* Modifier */}
                      <button
                        type="button"
                        className={s.toolActionBtn}
                        title="Modifier le texte ou le visuel"
                        onClick={() => setEditingCard(card)}
                      >
                        <Edit3 size={15} />
                      </button>

                      {/* Régénérer */}
                      <button
                        type="button"
                        className={s.toolActionBtn}
                        title="Régénérer cette variante"
                        onClick={() => handleRegenerateSingle(card.id)}
                      >
                        <RefreshCw size={15} />
                      </button>

                      {/* Télécharger ce visuel unitaire */}
                      <button
                        type="button"
                        className={s.toolActionBtn}
                        title="Télécharger ce visuel en HD"
                        onClick={() => handleDownloadSingle(card)}
                      >
                        <Download size={15} />
                      </button>
                    </div>

                    {/* Menu contextuel (Publier sur réseaux sociaux) feature en future */}
                   
                  </div>
                </div>
              ))}
            </div>

          

            {/* BANNIÈRE DE STATUT & TÉLÉCHARGEMENT GROUPÉ (ADORA-56) */}
            <div className={s.statusBanner}>
              <div className={s.statusLeft}>
                <div className={s.statusCheckIcon}>
                  <CheckCircle2 size={18} />
                </div>
                <div className={s.statusTextWrap}>
                  <h4 className={s.statusTitle}>Vos créations sont prêtes !</h4>
                  <p className={s.statusDesc}>
                    Vous pouvez maintenant les modifier, en générer d'autres ou les télécharger pour les publier sur vos réseaux.
                  </p>
                </div>
              </div>

              {/* Actions de partage & téléchargement (WhatsApp & ZIP) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
               

                {/* Bouton Tout télécharger (ZIP) */}
                <button
                  type="button"
                  className={s.downloadAllBtn}
                  onClick={handleDownloadAllZip}
                  disabled={isZipping}
                >
                  {isZipping ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Création du ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>Tout télécharger</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* =========================================================================
          MODAL D'ÉDITION UNITAIRE D'UN VISUEL
          ========================================================================= */}
      {editingCard && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '460px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Modifier le visuel ({editingCard.formatLabel})
              </h3>
              <button
                onClick={() => setEditingCard(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Titre d'accroche (Headline)
                </label>
                <input
                  type="text"
                  value={editingCard.headline}
                  onChange={(e) => setEditingCard({ ...editingCard, headline: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Sous-titre (Copywriting)
                </label>
                <textarea
                  rows={2}
                  value={editingCard.subheadline}
                  onChange={(e) => setEditingCard({ ...editingCard, subheadline: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Prix affiché (Dinars DT)
                  </label>
                  <input
                    type="text"
                    value={editingCard.price || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, price: e.target.value })}
                    placeholder="89 DT"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Badge commercial
                  </label>
                  <input
                    type="text"
                    value={editingCard.badgeText || ''}
                    onChange={(e) => setEditingCard({ ...editingCard, badgeText: e.target.value })}
                    placeholder="🚚 Livraison 24-48h"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Arguments clés (séparés par une virgule)
                </label>
                <input
                  type="text"
                  value={editingCard.bulletPoints ? editingCard.bulletPoints.join(', ') : ''}
                  onChange={(e) =>
                    setEditingCard({
                      ...editingCard,
                      bulletPoints: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Élégant, 100% Original, Livraison 24h"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Bouton d'action (CTA)
                </label>
                <input
                  type="text"
                  value={editingCard.ctaText}
                  onChange={(e) => setEditingCard({ ...editingCard, ctaText: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  style={{ padding: '8px 16px', background: '#F1F5F9', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVisuals((prev) => prev.map((c) => (c.id === editingCard.id ? editingCard : c)));
                    setEditingCard(null);
                    showToast('Modifications enregistrées !');
                  }}
                  style={{ padding: '8px 20px', background: '#7C3AED', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals tierces intégrées */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          initialPlanId="pro"
          initialStep="offers"
        />
      )}

      {isCatalogOpen && (
        <ProductCatalogModal
          isOpen={isCatalogOpen}
          onClose={() => setIsCatalogOpen(false)}
          onSelectProduct={handleSelectCatalogProduct}
        />
      )}

      {isBrandKitOpen && (
        <BrandKitModal
          isOpen={isBrandKitOpen}
          onClose={() => setIsBrandKitOpen(false)}
        />
      )}

      {isSocialModalOpen && (
        <SocialPublisherModal
          isOpen={isSocialModalOpen}
          onClose={() => setIsSocialModalOpen(false)}
          initialImageUrl={selectedSocialVisual || undefined}
          defaultCaption={`🔥 Découvrez ${productName} ! Disponible dès maintenant en Tunisie.\n\n🚚 Livraison express 24-48h\n💵 Paiement à la réception\n\nCommandez vite en DM !`}
        />
      )}

      {/* =========================================================================
          NOUVEAU MODAL GUIDÉ "SMART QUESTIONS" EN 5 ÉTAPES (CONFORME MAQUETTE)
          ========================================================================= */}
      {isQuestionsModalOpen && (
        <SmartQuestionsModal
          isOpen={isQuestionsModalOpen}
          onClose={() => setIsQuestionsModalOpen(false)}
          productName={productName}
          productImage={cutoutBase64 || productImage}
          priceDinars={priceDinars}
          brandName={brandName}
          brandLogoUrl={brandLogoUrl}
          initialIntentId={selectedIntentId}
          initialCopyLanguage={copyLanguage as any}
          onGenerate={handleSmartQuestionsGenerate}
          isGenerating={isGenerating}
          customStyles={tailoredProductStyles}
        />
      )}
    </div>
  );
}
