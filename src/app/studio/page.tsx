'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import s from './studio.module.css';
import { LOCAL_BADGES } from '@/lib/templates';
import CheckoutModal from '@/components/CheckoutModal';
import BrandKitModal from '@/components/BrandKitModal';
import ProductCatalogModal from '@/components/ProductCatalogModal';
import StudioSidebar from '@/components/StudioSidebar';
import StudioNavbar from '@/components/StudioNavbar';
import SocialPublisherModal from '@/components/SocialPublisherModal';
import SmartQuestionsModal, { SmartQuestionsPayload } from '@/components/SmartQuestionsModal';
import WorkspaceSelector from '@/components/WorkspaceSelector';
import OnboardingChecklist from '@/components/OnboardingChecklist';
import AuthRedirectScreen from '@/components/AuthRedirectScreen';
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
  buildArtDirectedPrompt,
} from '@/lib/artDirector';
import { VisionCriticEvaluation } from '@/lib/visionCritic';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { useLanguage } from '@/lib/LanguageContext';
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
  LogOut,
  User as UserIcon,
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
    desc: 'Mise en avant immédiate du prix clair, de la réassurance de livraison et de la garantie de satisfaction pour déclencher l\'achat immédiat.',
    focus: 'Prix clair • Livraison Express • Bouton Acheter',
    icon: '🛒',
  },
  promotion: {
    title: 'Vision Urgence Commerciale (FOMO)',
    desc: 'Crée un fort sentiment de rareté avec mise en valeur de la réduction, compte à rebours visuel et stock limité.',
    focus: 'Remise Flash • Stock Restreint • Réserver maintenant',
    icon: '🔥',
  },
  branding: {
    title: 'Vision Image de Marque & Notoriété',
    desc: 'Met en majesté le logo et l\'histoire de la marque avec un décor épuré, des matériaux nobles et une typographie haut de gamme.',
    focus: 'Logo sublimé • Décor prestigieux • Signature unique',
    icon: '👑',
  },
  social: {
    title: 'Vision Viralité Réseaux & Commandes Directes',
    desc: 'Accroches engageantes créées pour générer des partages, des commentaires et des commandes directes en message privé (DM).',
    focus: 'Accroche percutante • Commande en DM • Preuve sociale',
    icon: '💬',
  },
};

export const isArabicText = (text?: string): boolean => {
  return Boolean(text && /[\u0600-\u06FF]/.test(text));
};

export function getCopyPropositions(
  obj: AdObjective,
  lang: 'en' | 'fr' | 'ar' | 'autre' | string,
  prodName: string,
  price: string
): CopyProposition[] {
  // 1. OBJECTIF VENTE DIRECTE
  if (obj === 'vente') {
    if (lang === 'en') {
      return [
        {
          id: 'v-en-1',
          angleTag: '🎯 Client Benefit & Comfort',
          headline: `Elevate Your Everyday Style with ${prodName}`,
          subheadline: `Discover ${prodName}: crafted to elevate your daily routine without compromise. Available now for ${price}.`,
          bulletPoints: ['Certified Premium Quality', 'Fast Express Shipping', '100% Satisfaction Guarantee'],
          badgeText: '🚚 Express Delivery',
          ctaText: 'Order Now →',
        },
        {
          id: 'v-en-2',
          angleTag: '💵 Unbeatable Value',
          headline: `The Smartest Choice for Your Lifestyle`,
          subheadline: `Enjoy unmatched quality at the exclusive price of ${price} with full satisfaction guarantee.`,
          bulletPoints: ['100% Authentic Product', '7/7 Dedicated Support', 'Easy & Secure Checkout'],
          badgeText: '⭐ Top Rated Choice',
          ctaText: 'Claim Your Offer →',
        },
        {
          id: 'v-en-3',
          angleTag: '⭐ Best-Seller Proven',
          headline: `Trusted by Over 1,200+ Happy Customers`,
          subheadline: `Our boutique's flagship product. Order yours today before current inventory runs out.`,
          bulletPoints: ['4.9/5 Rating ★', 'Limited Inventory', 'Dispatched in 24h'],
          badgeText: '⭐ Best-Seller N°1',
          ctaText: 'Buy in 1 Click →',
        },
      ];
    }
    if (lang === 'ar') {
      return [
        {
          id: 'v-ar-1',
          angleTag: '🎯 الأناقة والراحة اليومية',
          headline: `الأناقة والجودة العالية بين يديك`,
          subheadline: `اكتشف ${prodName} : صُمم خصيصاً ليمنحك تجربة استثنائية بسعر ${price} فقط.`,
          bulletPoints: ['جودة أصلية ومضمونة', 'شحن سريع ومباشر', 'دفع آمن ومريح'],
          badgeText: '🚚 توصيل سريع',
          ctaText: 'اطلب الآن ➔',
        },
        {
          id: 'v-ar-2',
          angleTag: '💵 قيمة استثنائية مقابل السعر',
          headline: `الخيار الأفضل والمثالي لاحتياجاتك`,
          subheadline: `متوفر حالياً بسعر خاص ${price} مع ضمان الرضا الكامل وخدمة عملاء راقية.`,
          bulletPoints: ['أفضل سعر مضمون', 'دعم فني 7/7', 'ضمان استرجاع سهل'],
          badgeText: '⭐ جودة معتمدة',
          ctaText: 'استفد من السعر ➔',
        },
        {
          id: 'v-ar-3',
          angleTag: '⭐ ثقة العملاء',
          headline: `أكثر من 1200 عميل يثقون بجودتنا`,
          subheadline: `المنتج الأكثر طلباً في متجرنا. احجز طلبك اليوم قبل نفاد الكمية المتاحة.`,
          bulletPoints: ['تقييم 4.9/5 ★', 'كمية محدودة', 'تجهيز سريع للطلب'],
          badgeText: '⭐ الأكثر مبيعاً',
          ctaText: 'احجز طلبك الآن ➔',
        },
      ];
    }
    if (lang === 'autre') {
      return [
        {
          id: 'v-aut-1',
          angleTag: '🎯 Arrivage & Qualité',
          headline: `Dispo dès maintenant : ${prodName}`,
          subheadline: `Profitez d'un tarif exceptionnel de ${price} avec livraison rapide et paiement facile.`,
          bulletPoints: ['Qualité originale 100%', 'Livraison rapide', 'Paiement à la réception'],
          badgeText: '🚚 Livraison Rapide',
          ctaText: 'Commander →',
        },
        {
          id: 'v-aut-2',
          angleTag: '💵 Rapport Qualité/Prix',
          headline: `Le meilleur choix au meilleur prix`,
          subheadline: `Qualité garantie au prix de ${price}. Contactez-nous pour réserver.`,
          bulletPoints: ['Garantie totale', 'Service rapide', 'Zéro risque'],
          badgeText: '💵 Paiement Réception',
          ctaText: 'Envoyer un message →',
        },
        {
          id: 'v-aut-3',
          angleTag: '⭐ Preuve Sociale',
          headline: `Le produit préféré de nos clients`,
          subheadline: `Faites comme des centaines de clients satisfaits. Commandez avant rupture.`,
          bulletPoints: ['Avis 5 étoiles', 'Stock limité', 'Service premium'],
          badgeText: '⭐ Best-Seller N°1',
          ctaText: 'Réserver maintenant →',
        },
      ];
    }
    // Langue par défaut : Français (fr)
    return [
      {
        id: 'v-f-1',
        angleTag: '🎯 Bénéfice Client & Confort',
        headline: `L'élégance et la qualité au quotidien`,
        subheadline: `Découvrez ${prodName} : conçu pour sublimer votre style sans compromis. Seulement ${price}.`,
        bulletPoints: ['Qualité certifiée', 'Livraison Express', 'Paiement sécurisé'],
        badgeText: '🚚 Livraison Express',
        ctaText: 'Commander maintenant →',
      },
      {
        id: 'v-f-2',
        angleTag: '💵 Rapport Qualité/Prix',
        headline: `Le meilleur choix pour votre budget`,
        subheadline: `Disponible au tarif exclusif de ${price} avec garantie de satisfaction complète.`,
        bulletPoints: ['Garantie 100%', 'Service client 7j/7', 'Retour facile'],
        badgeText: '✓ Qualité Certifiée',
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

  // 2. OBJECTIF PROMOTION & URGENCE
  if (obj === 'promotion') {
    if (lang === 'en') {
      return [
        {
          id: 'p-en-1',
          angleTag: '🔥 24H Flash Sale',
          headline: `24-Hour Flash Sale: Once-in-a-Lifetime Deal!`,
          subheadline: `Take advantage of our exclusive discount now for only ${price}. Almost sold out!`,
          bulletPoints: ['Instant Discount', 'Fast Express Shipping', 'Very Limited Quantity'],
          badgeText: '🔥 Limited Offer',
          ctaText: 'Claim Discount →',
        },
        {
          id: 'p-en-2',
          angleTag: '📦 Special Value Pack',
          headline: `Value Pack: Save Big Today!`,
          subheadline: `The ultimate opportunity to experience ${prodName} with fast shipping and full guarantee.`,
          bulletPoints: ['Maximum Savings', 'Priority Dispatch', 'Certified Authentic'],
          badgeText: '🎁 Value Pack',
          ctaText: 'View Special Offer →',
        },
        {
          id: 'p-en-3',
          angleTag: '⏳ Final Batch Alert',
          headline: `Final Units Remaining Before Sold Out!`,
          subheadline: `Order now to secure your piece before orders close for this batch.`,
          bulletPoints: ['Last Remaining Pieces', 'Secure Payment', '100% Original'],
          badgeText: '⚡ Selling Out Fast',
          ctaText: 'Order Immediately →',
        },
      ];
    }
    if (lang === 'ar') {
      return [
        {
          id: 'p-ar-1',
          angleTag: '🔥 عرض فلاش 24 ساعة',
          headline: `عرض فلاش 24 ساعة : فرصة استثنائية !`,
          subheadline: `استفد من التخفيض الحصري الآن بسعر ${price} فقط. الكمية المتبقية محدودة جداً !`,
          bulletPoints: ['خصم فوري ومباشر', 'شحن سريع وموثوق', 'كمية محدودة'],
          badgeText: '🔥 عرض محدود',
          ctaText: 'احصل على الخصم ➔',
        },
        {
          id: 'p-ar-2',
          angleTag: '🎁 باقة التوفير الكبرى',
          headline: `باقة التوفير : وفّر الكثير اليوم !`,
          subheadline: `أفضل فرصة للحصول على ${prodName} بأفضل سعر مع توصيل سريع وضمان شامل.`,
          bulletPoints: ['توفير حقيقي في السعر', 'توصيل ميسر', 'جودة أصلية معتمدة'],
          badgeText: '🎁 باقة مميزة',
          ctaText: 'اكتشف العرض ➔',
        },
        {
          id: 'p-ar-3',
          angleTag: '⚡ آخر قطع متوفرة',
          headline: `آخر قطع متوفرة قبل نفاد المخزون !`,
          subheadline: `سارع بحجز طلبك الآن قبل إغلاق باب الطلبيات لهذه الدفعة الاستثنائية.`,
          bulletPoints: ['آخر فرصة للشراء', 'دفع مريح', 'أصلي 100%'],
          badgeText: '⚡ اقتراب النفاد',
          ctaText: 'اطلب فوراً ➔',
        },
      ];
    }
    if (lang === 'autre') {
      return [
        {
          id: 'p-aut-1',
          angleTag: '🔥 Vente Flash',
          headline: `Offre Flash : Profitez de la remise !`,
          subheadline: `Disponible au tarif réduit de ${price}. Quantités très limitées !`,
          bulletPoints: ['Remise immédiate', 'Livraison rapide', 'Stock limité'],
          badgeText: '🔥 Offre Limitée',
          ctaText: 'Réserver →',
        },
        {
          id: 'p-aut-2',
          angleTag: '📦 Pack Promo',
          headline: `Pack Spécial : Économisez maintenant`,
          subheadline: `La meilleure offre sur ${prodName} avec livraison rapide chez vous.`,
          bulletPoints: ['Belle économie', 'Livraison prioritaire', 'Garantie totale'],
          badgeText: '🎁 Pack Économique',
          ctaText: 'Voir l\'offre →',
        },
        {
          id: 'p-aut-3',
          angleTag: '⏳ Fin Proche',
          headline: `Dernières pièces en stock !`,
          subheadline: `Envoyez-nous un message pour réserver avant la rupture complète.`,
          bulletPoints: ['Derniers exemplaires', 'Paiement à réception', 'Original certifié'],
          badgeText: '⚡ Rupture Proche',
          ctaText: 'Commander d\'urgence →',
        },
      ];
    }
    // Langue par défaut : Français (fr)
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
        subheadline: `L'opportunité du mois sur ${prodName}. Livraison rapide et soignée.`,
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
        ctaText: 'Réserver mon exemplaire →',
      },
    ];
  }

  // 3. OBJECTIF BRANDING & NOTORIÉTÉ
  if (obj === 'branding') {
    if (lang === 'en') {
      return [
        {
          id: 'b-en-1',
          angleTag: '👑 Pure Prestige & Luxury',
          headline: `The True Art of Excellence & Elegance`,
          subheadline: `A signature creation tailored for connoisseurs who value fine craftsmanship. Rediscover ${prodName}.`,
          bulletPoints: ['Exclusive Creation', 'Noble Materials', 'Timeless Architectural Design'],
          badgeText: '💎 Pure Prestige',
          ctaText: 'Explore Maison →',
        },
        {
          id: 'b-en-2',
          angleTag: '✨ Authentic Heritage',
          headline: `Uncompromising Authenticity & Trust`,
          subheadline: `Where timeless aesthetics meet master craft. Discover the universe of our house.`,
          bulletPoints: ['Clean Formulation', 'Ethical & Transparent', 'Globally Recognized'],
          badgeText: '🛡️ 100% Authentic',
          ctaText: 'Discover the Brand →',
        },
        {
          id: 'b-en-3',
          angleTag: '🌟 Aspirational Living',
          headline: `Elevate Your Signature Presence with ${prodName}`,
          subheadline: `Express your identity with a refined piece crafted to naturally set you apart.`,
          bulletPoints: ['Unique Signature', 'Immediate Impact', 'Prestige Collector Edition'],
          badgeText: '🌟 Special Edition',
          ctaText: 'View Collection →',
        },
      ];
    }
    if (lang === 'ar') {
      return [
        {
          id: 'b-ar-1',
          angleTag: '👑 فخامة وأناقة راقية',
          headline: `الفخامة والأناقة في أدق التفاصيل`,
          subheadline: `تصميم راقٍ ومكونات فاخرة صُممت لعشاق التميز والجودة الاستثنائية.`,
          bulletPoints: ['تصميم استثنائي', 'أصلي 100%', 'فخامة لا تضاهى'],
          badgeText: '💎 جودة نقية وفاخرة',
          ctaText: 'اكتشف التشكيلة ➔',
        },
        {
          id: 'b-ar-2',
          angleTag: '✨ أصالة العلامة التجارية',
          headline: `أصالة العلامة وثقة عملائنا المميزين`,
          subheadline: `صُنعت بكل إتقان واهتمام لنقدم لك دائماً أعلى معايير الجودة والتميز.`,
          bulletPoints: ['علامة موثوقة', 'ثقة مستمرة', 'خدمة راقية'],
          badgeText: '🛡️ أصلي ومضمون 100%',
          ctaText: 'تصفح المتجر ➔',
        },
        {
          id: 'b-ar-3',
          angleTag: '🌟 أسلوب حياة متميز',
          headline: `اجعل أسلوبك يعبّر عن تميزك`,
          subheadline: `ليس مجرد منتج، بل أسلوب حياة يعكس ذوقك الرفيع وأناقتك مع ${prodName}.`,
          bulletPoints: ['بصمة فريدة', 'إصدار مميز', 'توصيل معتمد'],
          badgeText: '🌟 إصدار خاص',
          ctaText: 'اكتشف المزيد ➔',
        },
      ];
    }
    if (lang === 'autre') {
      return [
        {
          id: 'b-aut-1',
          angleTag: '👑 Prestige & Qualité',
          headline: `L'élégance dans chaque détail`,
          subheadline: `Créé spécialement pour ceux qui recherchent l'excellence et la distinction.`,
          bulletPoints: ['Design soigné', '100% Original', 'Prestige garanti'],
          badgeText: '💎 Qualité Pure',
          ctaText: 'Découvrir la collection →',
        },
        {
          id: 'b-aut-2',
          angleTag: '✨ Confiance & Marque',
          headline: `L'authenticité d'une vraie marque`,
          subheadline: `Un savoir-faire reconnu pour vous offrir le meilleur à chaque commande.`,
          bulletPoints: ['Finition parfaite', 'Grande confiance', 'Service VIP'],
          badgeText: '🛡️ 100% Original',
          ctaText: 'Voir la boutique →',
        },
        {
          id: 'b-aut-3',
          angleTag: '🌟 Signature Unique',
          headline: `Affirmez votre style avec ${prodName}`,
          subheadline: `Bien plus qu'un simple produit, c'est une véritable signature pour votre quotidien.`,
          bulletPoints: ['Style unique', 'Qualité supérieure', 'Édition soignée'],
          badgeText: '🌟 Édition Spéciale',
          ctaText: 'Voir plus →',
        },
      ];
    }
    // Langue par défaut : Français (fr)
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
        ctaText: 'Découvrir l\'univers →',
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

  // 4. OBJECTIF SOCIAL & VIRALITÉ
  if (lang === 'en') {
    return [
      {
        id: 's-en-1',
        angleTag: '💬 Trending on Social Media',
        headline: `The Season's Most Talked-About Product!`,
        subheadline: `Everyone is loving ${prodName} on Instagram. Send us a quick direct message to secure yours!`,
        bulletPoints: ['Trending N°1', 'Verified Quality', 'Fast Shipping'],
        badgeText: '💬 Order via DM',
        ctaText: 'Send a Message 💬',
      },
      {
        id: 's-en-2',
        angleTag: '📲 Instant 1-Click Order',
        headline: `Order in 30 Seconds via Direct Message`,
        subheadline: `Simply drop us a message with your details and have your package delivered to your door.`,
        bulletPoints: ['Instant Support', 'Reliable Delivery', 'Secure Checkout'],
        badgeText: '📲 Quick Message',
        ctaText: 'Order via Chat 📲',
      },
      {
        id: 's-en-3',
        angleTag: '✨ Community Favorite',
        headline: `100% Loved by Our Community ✨`,
        subheadline: `Over 1,000+ positive reviews. Tag someone special who needs this in their life!`,
        bulletPoints: ['5/5 Stars Rating', 'Active Community', '100% Guaranteed'],
        badgeText: '⭐ Community Approved',
        ctaText: 'Share & Order →',
      },
    ];
  }
  if (lang === 'ar') {
    return [
      {
        id: 's-ar-1',
        angleTag: '💬 ترند السوشيال ميديا',
        headline: `المنتج الأكثر طلباً وشهرة هذا الموسم !`,
        subheadline: `وصلت الدفعة الجديدة في متجرنا ! راسلنا عبر الرسائل الخاصة لحجز نسختك سريعاً.`,
        bulletPoints: ['ترند رقم 1', 'دفع عند الاستلام', 'توصيل فوري'],
        badgeText: '💬 الطلب عبر الرسائل (DM)',
        ctaText: 'راسلنا على الخاص 💬',
      },
      {
        id: 's-ar-2',
        angleTag: '📲 طلب سريع ومباشر',
        headline: `اطلب في 30 ثانية عبر الرسائل`,
        subheadline: `أرسل لنا اسمك وعنوانك في رسالة وستصلك طلبيتك مباشرة وبكل سهولة.`,
        bulletPoints: ['إجابة فورية', 'توصيل شامل', 'دفع عند الاستلام'],
        badgeText: '📲 رسالة سريعة',
        ctaText: 'اطلب بالمحادثة 📲',
      },
      {
        id: 's-ar-3',
        angleTag: '✨ خيار المجتمع الأول',
        headline: `خيار العملاء المفضل والأول ✨`,
        subheadline: `شارك المنشور مع من تحب ! أكثر من 1000 تقييم إيجابي ورضا كامل عن الجودة.`,
        bulletPoints: ['تقييم 5/5 ★', 'ثقة تامة', 'رضا مضمون'],
        badgeText: '⭐ معتمد ومجرّب',
        ctaText: 'شارك واطلب ➔',
      },
    ];
  }
  if (lang === 'autre') {
    return [
      {
        id: 's-aut-1',
        angleTag: '💬 Viral Réseaux',
        headline: `Le produit phare dont tout le monde parle !`,
        subheadline: `Envoyez-nous un message privé pour réserver votre pièce rapidement.`,
        bulletPoints: ['Très demandé', '100% Original', 'Livraison rapide'],
        badgeText: '💬 Commande en DM',
        ctaText: 'Envoyer un message 💬',
      },
      {
        id: 's-aut-2',
        angleTag: '📲 Commande Rapide en 1 Clic',
        headline: `Commandez en 30 secondes par message`,
        subheadline: `Envoyez-nous votre nom et adresse pour recevoir votre commande rapidement.`,
        bulletPoints: ['Réponse rapide', 'Livraison soignée', 'Paiement réception'],
        badgeText: '📲 Message Rapide',
        ctaText: 'Commander par message 📲',
      },
      {
        id: 's-aut-3',
        angleTag: '✨ Coup de Cœur',
        headline: `Votre coup de cœur du moment ✨`,
        subheadline: `Recommandé par nos clients. Partagez l'offre avec vos proches !`,
        bulletPoints: ['Validé 100%', 'Avis 5 étoiles', 'Livraison rapide'],
        badgeText: '⭐ Validé Clients',
        ctaText: 'Partager l\'offre →',
      },
    ];
  }
  // Langue par défaut : Français (fr)
  return [
    {
      id: 's-f-1',
      angleTag: '💬 Le Produit Viral Réseaux',
      headline: `Le coup de cœur de la saison sur Instagram !`,
      subheadline: `Craquez pour ${prodName} dont tout le monde parle. Commandez directement en message privé.`,
      bulletPoints: ['Tendance N°1', 'Plein les yeux', 'Livraison Express'],
      badgeText: '💬 Commande en DM',
      ctaText: 'Commander en DM 💬',
    },
    {
      id: 's-f-2',
      angleTag: '📲 Commande Message Express',
      headline: `Commandez en 30 secondes par message`,
      subheadline: `Envoyez-nous un message avec votre adresse pour recevoir votre colis chez vous rapidement.`,
      bulletPoints: ['Réponse en 5 min', 'Livraison rapide', 'Paiement sécurisé'],
      badgeText: '📲 Message Rapide',
      ctaText: 'Commander par Message 📲',
    },
    {
      id: 's-f-3',
      angleTag: '✨ Preuve Sociale & Partage',
      headline: `100% Validé par notre communauté`,
      subheadline: `Plus de 1 000 avis positifs. Taggez un proche pour lui faire plaisir !`,
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
    previewImg: '/images/MarkMosaiq_hero_perfume.jpg',
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
    previewImg: '/images/MarkMosaiq_sneakers_clean.jpg',
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
    previewImg: '/images/MarkMosaiq_fashion_model.jpg',
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
    headline: "L'élégance au quotidien",
    subheadline: "Découvrez notre collection exclusive avec livraison express et garantie de satisfaction.",
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
    headline: "Limited Edition / Offre Spéciale",
    subheadline: "Premium design and verified quality. Fast shipping right to your doorstep.",
    ctaText: "Shop Now →",
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
    headline: "التميز والجودة العالية",
    subheadline: "تجربة فريدة مع جودة أصلية مضمونة وتوصيل فوري حتى باب منزلك.",
    ctaText: "اطلب الآن ➔",
    bgImage: '/images/image.png',
    bulletPoints: ['Qualité certifiée', 'Livraison Express', 'Paiement sécurisé'],
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
    headline: "Pure Performance & Luxury",
    subheadline: "Formulé pour sublimer votre quotidien avec des ingrédients nobles.",
    ctaText: "Découvrir →",
    bgImage: '/images/image.png',
    styleName: 'Édition Pure',
    price: '89 DT',
    badgeText: '💎 Qualité Pure'
  }
];

export default function StudioCreativePage() {
  const router = useRouter();
  const { workspace, user, isLoading: isAuthLoading, logout, updateCredits } = useWorkspace();
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();

  // Accès réservé aux comptes connectés
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login?redirect=/studio');
    }
  }, [isAuthLoading, user, router]);
  const [hasGeneratedFirstVisual, setHasGeneratedFirstVisual] = useState<boolean>(false);
  const [hasExportedVisual, setHasExportedVisual] = useState<boolean>(false);
  const [showFirstVisualCelebration, setShowFirstVisualCelebration] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('markmosaiq_has_generated_first_visual') === 'true') {
        setHasGeneratedFirstVisual(true);
      }
      if (localStorage.getItem('markmosaiq_has_exported_visual') === 'true') {
        setHasExportedVisual(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Navigation & Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutInitialPlan, setCheckoutInitialPlan] = useState<'flash' | 'pro' | 'agency_299'>('pro');
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [selectedSocialVisual, setSelectedSocialVisual] = useState<string | null>(null);
  const [studioSidebarMobileOpen, setStudioSidebarMobileOpen] = useState(false);
  // Détection du forfait actif
  const currentPlan = workspace?.plan || 'trial';
  const isAgencyPlan = currentPlan === 'agency' || (currentPlan as string) === 'agency_299';
  const isProPlan = currentPlan === 'pro';

  // Étape 1 : Produit
  const [productImage, setProductImage] = useState<string>('/images/image.png');
  const [productName, setProductName] = useState<string>('Eau de Rose — Haute Parfumerie');
  const [cutoutBase64, setCutoutBase64] = useState<string | null>(null);
  const [isAnalyzingProduct, setIsAnalyzingProduct] = useState<boolean>(false);
  const [productAnalysis, setProductAnalysis] = useState<any>(null);
  const [tailoredProductStyles, setTailoredProductStyles] = useState<any[]>(() => getAdBenchmarksForProduct('cosmetics', 'Eau de Rose'));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

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

  // Identité de Marque & Personnalisation Branding (MarkMosaiq-60, MarkMosaiq-61)
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [brandName, setBrandName] = useState<string>('Eau de Rose');
  const [brandLogoUrl, setBrandLogoUrl] = useState<string>('/images/logo.png');
  const [primaryColor, setPrimaryColor] = useState<string>('#00E5FF');
  const [secondaryColor, setSecondaryColor] = useState<string>('#FF5722');
  const [logoPosition, setLogoPosition] = useState<'top-left' | 'top-right' | 'watermark'>('top-left');
  const [logoStyle, setLogoStyle] = useState<'original' | 'white'>('original');
  const [isExtractingColors, setIsExtractingColors] = useState<boolean>(false);
  const [isColorsFromLogo, setIsColorsFromLogo] = useState<boolean>(true);
  const [copyLanguage, setCopyLanguage] = useState<'en' | 'fr' | 'ar' | 'autre'>('fr');
  const [customDialectNote, setCustomDialectNote] = useState<string>('');
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

  // Édition d'une carte unitaire & retouche décor IA (gpt-image-2.5-flare)
  const [editingCard, setEditingCard] = useState<VisualCardData | null>(null);
  const [editingCardTab, setEditingCardTab] = useState<'copy' | 'ai_prompt'>('copy');
  const [cardEditPrompt, setCardEditPrompt] = useState<string>('');
  const [isRegeneratingCardImage, setIsRegeneratingCardImage] = useState<boolean>(false);

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

  // Prompt IA éditable personnalisé (vide par défaut selon la demande utilisateur)
  const [editablePrompt, setEditablePrompt] = useState<string>('');
  const [isPromptEdited, setIsPromptEdited] = useState<boolean>(false);

  // État du menu déroulant de téléchargement & sélection personnalisée des formats (Top Right)
  const [isDownloadDropdownOpen, setIsDownloadDropdownOpen] = useState<boolean>(false);
  const [selectedVisualIdsForDownload, setSelectedVisualIdsForDownload] = useState<string[]>(['vis-1', 'vis-2', 'vis-3', 'vis-4']);
  const downloadDropdownRef = useRef<HTMLDivElement>(null);

  // Fermeture automatique du dropdown lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (downloadDropdownRef.current && !downloadDropdownRef.current.contains(e.target as Node)) {
        setIsDownloadDropdownOpen(false);
      }
    };
    if (isDownloadDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDownloadDropdownOpen]);

  // Synchronisation des IDs sélectionnés lorsque de nouveaux visuels sont chargés
  useEffect(() => {
    if (visuals && visuals.length > 0) {
      setSelectedVisualIdsForDownload(visuals.map((v) => v.id));
    }
  }, [visuals]);

  const toggleSelectVisualForDownload = (id: string) => {
    setSelectedVisualIdsForDownload((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllVisualsForDownload = () => {
    setSelectedVisualIdsForDownload(visuals.map((v) => v.id));
  };

  const deselectAllVisualsForDownload = () => {
    setSelectedVisualIdsForDownload([]);
  };

  // Téléchargement autonome des textes publicitaires de vente (.txt)
  const handleDownloadAdCopies = () => {
    try {
      const darijaText = productAnalysis?.darijaHook || `🔥 Weslet el ${productName} fi boutique mteena !\nQualité originale 100% w riha tched nhar kemel.\n🚚 Livri fisaa fi tounes el kol (24-48h)\n💰 Khlas fel livraison\n👉 Abathna message al page bech treservi flacon mteek !`;
      const frenchText = productAnalysis?.instagramCaption || `✨ Sublimez votre quotidien avec ${productName}.\nUne création olfactive raffinée, intense et durable au prix de ${priceDinars}.\n✅ Produit certifié 100% original\n🚚 Livraison express sur toute la Tunisie (24 à 48h)\n💵 Paiement à la réception en toute sécurité\n👉 Commandez dès maintenant par message privé !`;

      const copyFileContent = `========================================================================
MarkMosaiq AI STUDIO — PACK PUBLICITAIRE CLÉ EN MAIN
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
      const blob = new Blob([copyFileContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Textes_de_vente_${productName.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Textes de vente téléchargés !');
    } catch {
      showToast('Erreur lors du téléchargement des textes');
    }
  };

  // Chargement des dernières préférences marchandes mémorisées
  useEffect(() => {
    try {
      const saved = localStorage.getItem('MarkMosaiq_last_studio_preferences');
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
      localStorage.setItem('MarkMosaiq_last_studio_preferences', JSON.stringify({
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

  // Option d'affichage des résultats IA dans la console du navigateur (MarkMosaiq-74 & Debug)
  const [enableConsoleLogs, setEnableConsoleLogs] = useState<boolean>(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Extraction algorithmique des couleurs du logo (MarkMosaiq-61)
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
          copyLanguage,
          customDialectNote,
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

        // Synchroniser immédiatement les cartes de preview STRICTEMENT avec les textes générés par l'IA dans la langue choisie
        const briefs = payloadData.strategyBriefs;
        const b1 = briefs?.[0];
        const b2 = briefs?.[1];
        const b3 = briefs?.[2];
        const b4 = briefs?.[3];

        const getCardHeadline = (b: any, fallbackStr?: string) => {
          if (copyLanguage === 'en') {
            return b?.hookHeadlineEn || payloadData.hookHeadlineEn || payloadData.hookHeadline || fallbackStr || name;
          }
          if (copyLanguage === 'ar') {
            return b?.hookHeadlineAr || payloadData.hookHeadlineAr || payloadData.hookHeadline || fallbackStr || name;
          }
          if (copyLanguage === 'autre') {
            return b?.hookHeadlineAutre || payloadData.customDialectHook || b?.hookHeadlineDarija || fallbackStr || name;
          }
          return b?.hookHeadlineFr || payloadData.hookHeadlineFr || payloadData.hookHeadline || fallbackStr || name;
        };

        const getCardBadge = (b: any, defBadge: string) => {
          if (copyLanguage === 'ar') return '⭐ جودة معتمدة';
          if (copyLanguage === 'en') return '⭐ Top Choice';
          return b?.badgeText || payloadData.promoBadge || defBadge;
        };

        const getCardCta = (b: any, defCta: string) => {
          if (copyLanguage === 'ar') return 'اطلب الآن ➔';
          if (copyLanguage === 'en') return 'Order Now →';
          return b?.callToAction || defCta;
        };

        if (b1 || payloadData.hookHeadline) {
          setVisuals((prev) => [
            {
              ...prev[0],
              headline: getCardHeadline(b1, 'Scène Studio Signature'),
              subheadline: b1?.targetPainPoint || payloadData.instagramCaption || '',
              badgeText: getCardBadge(b1, '✓ 100% Efficace'),
              ctaText: getCardCta(b1, 'Commander'),
              price: payloadData.pricingAngle || priceDinars,
              styleName: b1?.angleLabel || 'Scène IA',
            },
            {
              ...prev[1],
              headline: getCardHeadline(b2, 'Édition Prestige'),
              subheadline: b2?.targetPainPoint || payloadData.instagramCaption || '',
              badgeText: getCardBadge(b2, '⭐ Best-Seller N°1'),
              ctaText: getCardCta(b2, 'Commander'),
              price: payloadData.pricingAngle || priceDinars,
              styleName: b2?.angleLabel || 'Prestige Studio',
            },
            {
              ...prev[2],
              headline: getCardHeadline(b3, 'Offre Spéciale'),
              subheadline: b3?.targetPainPoint || payloadData.instagramCaption || '',
              badgeText: getCardBadge(b3, '🔥 Offre Limitée'),
              ctaText: getCardCta(b3, 'Commander'),
              price: payloadData.pricingAngle || priceDinars,
              styleName: b3?.angleLabel || 'Story Conversion',
            },
            {
              ...prev[3],
              headline: getCardHeadline(b4, 'Qualité Pure'),
              subheadline: b4?.targetPainPoint || payloadData.instagramCaption || '',
              badgeText: getCardBadge(b4, '💎 Qualité Pure'),
              ctaText: getCardCta(b4, 'Commander'),
              price: payloadData.pricingAngle || priceDinars,
              styleName: b4?.angleLabel || 'Édition Spéciale',
            },
          ]);
        }

        if (enableConsoleLogs) {
          console.group('%c🧠 [MarkMosaiq AI] Analyse Stratégique Produit', 'background: #059669; color: #FFF; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
          console.log('📦 Résultat analyse produit :', data);
          if (typeof window !== 'undefined') {
            (window as any).__LAST_PRODUCT_ANALYSIS__ = data;
          }
          console.groupEnd();
        }
      }
    } catch (err) {
      if (enableConsoleLogs) {
        console.warn('⚠️ [MarkMosaiq AI] Analyse produit locale appliquée suite à :', err);
      }
      // Analyse locale intelligente de secours multilingue
      const fallbackHeadline = copyLanguage === 'en'
        ? `${name} - Premium Everyday Quality`
        : copyLanguage === 'ar'
          ? `${name} - الأناقة والجودة العالية بين يديك`
          : copyLanguage === 'autre' && customDialectNote
            ? `${name} - Qualité certifiée et livraison rapide`
            : `${name} : L'élégance au quotidien`;

      const fallbackCaption = copyLanguage === 'en'
        ? `✨ Elevate your everyday lifestyle with ${name}. Fast, secured shipping & satisfaction guaranteed!`
        : copyLanguage === 'ar'
          ? `✨ ارتقِ بأسلوبك اليومي مع ${name}. شحن سريع وتوصيل آمن ورضا مضمون!`
          : copyLanguage === 'autre'
            ? `🔥 Découvrez ${name} dès maintenant ! Qualité garantie et livraison rapide.`
            : `✨ Sublimez votre quotidien avec ${name}. Livraison soignée et satisfaction garantie !`;

      setProductAnalysis({
        productName: name,
        hookHeadline: fallbackHeadline,
        hookHeadlineEn: `${name} - Premium Everyday Quality`,
        hookHeadlineFr: `${name} : L'élégance au quotidien`,
        hookHeadlineAr: `${name} - الأناقة والجودة العالية بين يديك`,
        pricingAngle: priceDinars,
        instagramCaption: fallbackCaption,
      });
    } finally {
      setIsAnalyzingProduct(false);
    }
  }, [priceDinars, brandKit?.industry, workspace?.id, copyLanguage, customDialectNote]);

  // Détection du changement de produit


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

  // Chargement de l'identité de marque du Brand Kit actif (MarkMosaiq-60, MarkMosaiq-61)
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
          copyLanguage,
          customDialectNote,
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
          .replace(/^MarkMosaiq_/i, '')
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
      showToast('⚠️ Zero credits remaining. Upgrade via Whop from $19 to stage unlimited products.');
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
      showToast('⚠️ Zero credits remaining. Upgrade via Whop from $19 to stage unlimited products.');
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
    if (payload.copyLanguage) setCopyLanguage(payload.copyLanguage === 'darija' ? 'ar' : (payload.copyLanguage as any));
    savePreferences(payload.intentId, payload.copyLanguage, payload.goal, payload.adText);
    showToast(`✨ Direction validée : ${payload.styleId} (${payload.goal})`);
    handleGenerate(payload.intentId, payload.stylePrompt);
  };

  // LOGIQUE DE GÉNÉRATION DES CRÉATIONS PUBLICITAIRES (handleGenerate)
  const handleGenerate = async (overrideIntent?: CreativeIntentType, overrideStylePrompt?: string) => {
    // Garde-fou crédits (MarkMosaiq-73) : Vérification préalable avant tout calcul
    if (workspace && workspace.creditsRemaining <= 0) {
      showToast('⚠️ Zero credits remaining. Upgrade via Whop from $19 to stage unlimited products.');
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

      // Génération et mise en scène publicitaire professionnelle via le pipeline MarkMosaiq (MarkMosaiq-67)
      let customAiBg = activeStyleObj.previewImg || '/images/image.png';
      let generatedFormats: Record<string, string> = {};
      try {
        // Envoi STRICT des deux seules images nécessaires : l'image importée du produit et le logo de la marque (MarkMosaiq)
        const importedProduct = cutoutBase64 || (productImage && !productImage.includes('image.png') ? productImage : undefined);
        const importedLogo = brandLogoUrl && !brandLogoUrl.includes('logo.png') ? brandLogoUrl : (brandLogoUrl || undefined);

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
          stylePrompt: overrideStylePrompt || editablePrompt || activeStyleObj.promptModifier,
          userEditedPrompt: overrideStylePrompt || editablePrompt,
          model: 'gpt-image-2.5-flare',
          brandName: brandName,
          brandLogoUrl: importedLogo,
        };

        if (enableConsoleLogs) {
          console.group('%c🚀 [MarkMosaiq AI] Lancement du Master Shot Dirigé (/api/master-shot)', 'background: #00E5FF; color: #07090E; font-weight: 900; padding: 4px 10px; border-radius: 4px;');
          console.log('📤 Paramètres transmis à /api/master-shot :', payload);
        }
        console.log("data sent", JSON.stringify(payload))

        const genRes = await fetch('/api/master-shot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const genData = await genRes.json();
        console.log("sending", genData)

        if (enableConsoleLogs) {
          console.log('📡 Statut Réponse HTTP :', genRes.status, genRes.ok ? '✅ SUCCÈS (200 OK)' : `❌ ERREUR HTTP (${genRes.status})`);
          console.log('📥 Données brutes renvoyées par le moteur IA (JSON complet) :', genData);
        }

        // Si solde de crédits insuffisant renvoyé par l'API
        if (genRes.status === 402 || genData.code === 'INSUFFICIENT_CREDITS') {
          if (enableConsoleLogs) {
            console.warn('⚠️ [MarkMosaiq AI] SOLDE DE CRÉDITS INSUFFISANT :', genData.error);
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
            console.error('❌ [MarkMosaiq AI] ERREUR MOTEUR IA :', genData?.error || 'Échec de génération');
          }
        }

        // Synchronisation du solde de crédits restant
        if (genData.creditsRemaining !== undefined) {
          updateCredits(genData.creditsRemaining);
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
          (window as any).__LAST_MarkMosaiq_AI_RESULT__ = genData;
          (window as any).__MarkMosaiq_STUDIO_FORMATS__ = generatedFormats;
          (window as any).__MarkMosaiq_STUDIO_BG__ = customAiBg;

          // Helper sécurisé pour ouvrir l'image sans blocage Chrome (Chrome bloque window.open avec data:image)
          (window as any).viewMarkMosaiqImage = () => {
            const targetUrl = returnedUrl || genData.url || (window as any).__MarkMosaiq_STUDIO_BG__;
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
              win.document.title = 'MarkMosaiq AI — Aperçu Studio Haute Définition';
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
            console.log('%c👁️ POUR OUVRIR L\'IMAGE EN GRAND SANS PAGE BLANCHE : Tapez %cviewMarkMosaiqImage()%c dans la console !', 'color: #10B981; font-size: 12px; font-weight: bold;', 'color: #00E5FF; font-weight: 900; background: #131823; padding: 2px 8px; border-radius: 4px; border: 1px solid #00E5FF;', 'color: #10B981; font-size: 12px; font-weight: bold;');
            console.log('%c💡 ASTUCE DEBUG : Tapez %c__LAST_MarkMosaiq_AI_RESULT__%c pour inspecter l\'objet JavaScript brut !', 'color: #A855F7; font-size: 11px;', 'color: #00E5FF; font-weight: bold; background: #131823; padding: 2px 6px; border-radius: 4px;', 'color: #A855F7; font-size: 11px;');
          }
        }

        if (enableConsoleLogs) {
          console.groupEnd();
        }
      } catch (err) {
        if (enableConsoleLogs) {
          console.error('❌ [MarkMosaiq AI] Erreur Exceptionnelle :', err);
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
      if (!hasGeneratedFirstVisual) {
        setHasGeneratedFirstVisual(true);
        setShowFirstVisualCelebration(true);
        try {
          localStorage.setItem('markmosaiq_has_generated_first_visual', 'true');
        } catch {
          // ignore
        }
      }
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

  // Ouverture du Studio d'Édition unitaire pour un visuel
  const openCardEditor = (card: VisualCardData) => {
    setEditingCard(card);
    setEditingCardTab('copy');
    setCardEditPrompt(editablePrompt);
  };

  // Régénération IA unitaire d'un visuel avec gpt-image-2.5-flare (Préservation absolue du produit)
  const handleRegenerateCardWithAI = async (cardToUpdate: VisualCardData, promptOverride?: string) => {
    try {
      setIsRegeneratingCardImage(true);
      showToast(`⚡ Régénération du visuel (${cardToUpdate.formatLabel || '1:1'}) en cours...`);

      const aspect = cardToUpdate.format === 'story' || cardToUpdate.format === 'tiktok'
        ? '9:16'
        : cardToUpdate.format === 'facebook'
          ? '1.91:1'
          : '1:1';

      const importedProduct = cutoutBase64 || (productImage && !productImage.includes('image.png') ? productImage : undefined);
      const importedLogo = brandLogoUrl && !brandLogoUrl.includes('logo.png') ? brandLogoUrl : (brandLogoUrl || undefined);

      const finalPrompt = (promptOverride || cardEditPrompt || editablePrompt).trim();

      const payload = {
        cutoutBase64: importedProduct,
        imageBase64: importedProduct,
        productName: cardToUpdate.headline || productName,
        priceTND: cardToUpdate.price || priceDinars,
        intentId: selectedIntentId,
        aspect,
        workspaceId: workspace?.id || 'ws_nutristore',
        customHook: cardToUpdate.subheadline,
        copyLanguage,
        reassuranceBadge: reassuranceBadgeEnabled,
        stylePrompt: finalPrompt,
        userEditedPrompt: finalPrompt,
        model: 'gpt-image-2.5-flare',
        brandName,
        brandLogoUrl: importedLogo,
      };

      const res = await fetch('/api/master-shot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Échec de la régénération du visuel');
      }

      const newImageUrl = data.masterVisualUrl || data.url || data.images?.[0];
      if (newImageUrl) {
        const updatedCard: VisualCardData = {
          ...cardToUpdate,
          bgImage: newImageUrl,
        };
        setEditingCard(updatedCard);
        setVisuals((prev) => prev.map((c) => (c.id === cardToUpdate.id ? updatedCard : c)));
        showToast('✅ Décor régénéré avec succès !');
      }
    } catch (err: any) {
      console.error('Erreur régénération carte:', err);
      showToast(`❌ Erreur: ${err.message || 'Échec de régénération'}`);
    } finally {
      setIsRegeneratingCardImage(false);
    }
  };

  // Régénération unitaire rapide d'une carte depuis la barre d'outils
  const handleRegenerateSingle = (cardId: string) => {
    const targetCard = visuals.find((c) => c.id === cardId);
    if (!targetCard) return;
    handleRegenerateCardWithAI(targetCard);
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

    // Si le visuel est déjà une affiche publicitaire complète (image.png ou composition MarkMosaiq), on préserve sa pureté
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
      a.download = `MarkMosaiq_${productName.replace(/\s+/g, '_')}_${card.format}_${card.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('Téléchargement terminé !');
    } catch {
      window.open(card.bgImage, '_blank');
    }
  };

  // TÉLÉCHARGEMENT GROUPÉ EN ARCHIVE ZIP OU SÉLECTION PERSONNALISÉE (handleDownloadAllZip)
  const handleDownloadAllZip = async (selectedIds?: string[] | unknown) => {
    const isIdList = Array.isArray(selectedIds) && selectedIds.every((id) => typeof id === 'string');
    const targetCards = isIdList && (selectedIds as string[]).length > 0
      ? visuals.filter((v) => (selectedIds as string[]).includes(v.id))
      : visuals;

    if (targetCards.length === 0) {
      showToast('Veuillez cocher au moins un format à télécharger.');
      return;
    }

    // Si l'utilisateur a sélectionné 1 seul visuel personnalisé, on télécharge directement le fichier JPG HD
    if (isIdList && (selectedIds as string[]).length === 1 && targetCards.length === 1) {
      await handleDownloadSingle(targetCards[0]);
      setIsDownloadDropdownOpen(false);
      return;
    }

    setIsZipping(true);
    showToast(`Génération de l'archive ZIP (${targetCards.length} visuels)...`);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Dossier 1 : Visuels publicitaires rendus
      const visualsFolder = zip.folder('01_Visuels_Publicitaires_HD');
      for (let i = 0; i < targetCards.length; i++) {
        const v = targetCards[i];
        try {
          const blob = await renderCardToCanvasBlob(v);
          const filename = `MarkMosaiq_0${i + 1}_${v.formatLabel.replace(/[\s:]/g, '_')}.jpg`;
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
MarkMosaiq AI STUDIO — PACK PUBLICITAIRE CLÉ EN MAIN
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
      a.download = `Pack_MarkMosaiq_${productName.replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setHasExportedVisual(true);
      try {
        localStorage.setItem('markmosaiq_has_exported_visual', 'true');
      } catch {
        // ignore
      }
      showToast('Pack ZIP téléchargé avec succès !');
      setIsDownloadDropdownOpen(false);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la génération du ZIP');
    } finally {
      setIsZipping(false);
    }
  };

  if (!user) {
    return <AuthRedirectScreen />;
  }

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

      {/* Shared Studio Sidebar */}
      <StudioSidebar
        activeNav="studio"
        mobileOpen={studioSidebarMobileOpen}
        onCloseMobile={() => setStudioSidebarMobileOpen(false)}
        onOpenBrandKit={() => setIsBrandKitOpen(true)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenCheckout={(planId) => {
          if (planId === 'agency_299' || planId === 'flash' || planId === 'pro') {
            setCheckoutInitialPlan(planId);
          }
          setIsCheckoutOpen(true);
        }}
      />

      {/* =========================================================================
          ZONE PRINCIPALE (SPLIT WIZARD GAUCHE + CRÉATIONS GÉNÉRÉES DROITE)
          ========================================================================= */}
      <main className={s.mainLayout}>
        {/* Shared Studio Top Navbar */}
        <StudioNavbar
          pageTitle={t.studio.navbar.title}
          pageBadge={
            <span className={s.navLiveEngineBadge}>
              <Sparkles size={11} /> {t.studio.navbar.liveEngine}
            </span>
          }
          onToggleMobileSidebar={() => setStudioSidebarMobileOpen(!studioSidebarMobileOpen)}
          onOpenBrandKit={() => setIsBrandKitOpen(true)}
          onOpenCheckout={(planId) => {
            if (planId === 'agency_299' || planId === 'flash' || planId === 'pro') {
              setCheckoutInitialPlan(planId);
            }
            setIsCheckoutOpen(true);
          }}
        />

        <div className={s.contentSplit}>

          {/* =====================================================================
              COLONNE DU CENTRE : WIZARD 4 ÉTAPES (MarkMosaiq-51 à 54)
              ===================================================================== */}
          <section className={s.wizardCol}>
            {/* Titre & Sous-titre */}
            <div className={s.pageTitleSection}>
              <h1 className={s.pageTitle}>
                <span>{t.studio.page.headerTitle}</span>
                <Sparkles size={22} color="#7C3AED" />
              </h1>
              <p className={s.pageSubtitle}>
                {t.studio.page.headerSubtitle}
              </p>
            </div>

            {/* Welcome Trial Banner (2026 SaaS Action-First Pattern) */}
            {searchParams?.get('trial') === 'active' && !hasGeneratedFirstVisual && (
              <div
                style={{
                  marginBottom: '20px',
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                      🎉 Free Trial Active — 3 4K Commercial Credits Unlocked!
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                      Drop your first product image below. Our AI Art Director will render studio backdrops with realistic physics in 30 seconds.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('studio-product-dropzone');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#4F46E5',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Stage Now ➔
                </button>
              </div>
            )}

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
                  <h3 className={s.stepTitle}>{t.studio.page.step1Title}</h3>
                  <p className={s.stepDescription}>
                    {t.studio.page.step1Subtitle}
                  </p>
                </div>
              </div>

              {/* Zone Drag & Drop ou aperçu produit */}
              <div
                id="studio-product-dropzone"
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
                        .replace(/^MarkMosaiq_/i, '')
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
                        {productName || (locale === 'en' ? 'Imported product' : 'Produit importé')}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>
                        ✓ {cutoutBase64 ? t.studio.page.cutoutSuccess : (locale === 'en' ? 'Photo ready' : 'Photo prête')} · {t.studio.page.changePhoto}
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
                      {t.studio.sidebar.navCatalog}
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud size={28} className={s.uploadCloudIcon} />
                    <div style={{ textAlign: 'left' }}>
                      <span className={s.dropzonePrompt} style={{ fontSize: '0.84rem' }}>{t.studio.page.uploadDropzone}</span>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: '#94A3B8' }}>{t.studio.page.uploadFormats}</span>
                    </div>
                  </>
                )}
              </div>

              {/* 3 champs compacts : Nom, Prix en DT, Badge commercial */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    {t.studio.page.productNameLabel}
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder={t.studio.page.productNamePlaceholder}
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





                {/* Sélecteur de Langue des Textes & Accroches */}


                {/* Badge Réassurance cumulable */}

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

            {/* STATUT OU RÉSULTAT DE L'ANALYSE STRATÉGIQUE DU PRODUIT */}




            {/* ÉTAPE 2 : STRATÉGIE MARKETING & PROMPT DÉCOR IA (gpt-image-2.5-flare) */}
            <div className={s.stepCard} style={{ padding: '18px 20px', marginBottom: '16px', border: '1px solid #E2E8F0', borderRadius: '14px', background: '#FFFFFF', width: '100%', boxSizing: 'border-box' }}>
              <div className={s.stepHeader} style={{ marginBottom: '12px' }}>
                <div className={s.stepNumber} style={{ background: '#EDE9FE', color: '#7C3AED' }}>2</div>
                <div className={s.stepTitleWrap}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 className={s.stepTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{t.studio.page.step2Title}</span>
                    </h3>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#EDE9FE', border: '1px solid #C4B5FD', color: '#7C3AED', padding: '2px 8px', borderRadius: '12px' }}>
                      ⚡ {locale === 'en' ? '4K Ultra-HD Studio Render' : 'Rendu Studio 4K Ultra-HD'}
                    </span>
                  </div>
                  <p className={s.stepDescription}>
                    {t.studio.page.step2Subtitle}
                  </p>
                </div>
              </div>

              {/* Textarea du prompt éditable (blank par défaut, responsive pleine largeur, fond clair non-noir) */}
              <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                <textarea
                  value={editablePrompt}
                  onChange={(e) => {
                    setEditablePrompt(e.target.value);
                    setIsPromptEdited(true);
                  }}
                  rows={6}
                  placeholder={locale === 'en' ? "Write your backdrop prompt here (leave empty to use default style)..." : "Écrivez votre prompt de décor ici (laisser vide pour utiliser le style par défaut)..."}
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    border: '1.5px solid #CBD5E1',
                    color: '#0F172A',
                    fontSize: '0.86rem',
                    lineHeight: 1.55,
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                    boxShadow: 'none',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.70rem', color: '#64748B' }}>
                    {editablePrompt.trim().length > 0
                      ? `${editablePrompt.trim().length} ${locale === 'en' ? 'characters' : 'caractères'}`
                      : (locale === 'en' ? 'Leave empty to automatically use active artistic style' : 'Laisser vide pour utiliser automatiquement le style artistique actif')}
                  </span>

                  {editablePrompt.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPromptEdited(false);
                        setEditablePrompt('');
                        showToast(locale === 'en' ? 'Prompt cleared' : 'Prompt effacé');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      {locale === 'en' ? 'Clear prompt' : 'Effacer le prompt'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* BOUTON D'ACTION PRINCIPALE : LANCE LA GÉNÉRATION AVEC LE PROMPT ÉDITÉ */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className={s.generateActionBtn}
                onClick={() => {
                  if (workspace && workspace.creditsRemaining <= 0) {
                    showToast('⚠️ Zero credits remaining. Upgrade via Whop from $19 to stage unlimited products.');
                    setIsCheckoutOpen(true);
                    return;
                  }
                  handleGenerate(selectedIntentId, editablePrompt);
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
                    <span>{t.studio.page.generatingBtn} ({generationProgress}%)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>🚀 {t.studio.page.generateBtn}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              {/* Bouton secondaire questionnaire guidé */}


              <div style={{
                textAlign: 'center',
                fontSize: '0.73rem',
                color: '#64748B',
                lineHeight: 1.4,
                marginTop: '2px',
              }}>
                {locale === 'en' ? (
                  <>
                    ✓ <strong>1 Master Shot:</strong> -70% API consumption • 0 alteration to authentic product
                    <br />
                    ✓ <strong>Automatic Variants:</strong> Feed 1:1, Story 9:16 (Safe Zones) and Facebook Ads
                  </>
                ) : (
                  <>
                    ✓ <strong>1 Seul Cliché Maître :</strong> -70% de consommation API • 0 altération du produit réel
                    <br />
                    ✓ <strong>Déclinaisons Automatiques :</strong> Feed 1:1, Story 9:16 (Safe Zones) et Facebook Ads
                  </>
                )}
              </div>
            </div>


          </section>

          {/* =====================================================================
              COLONNE DE DROITE : VOS CRÉATIONS GÉNÉRÉES 2x2 (MarkMosaiq-55 & MarkMosaiq-56)
              ===================================================================== */}
          <section className={s.resultsCol}>
            {/* Header supérieur de la section de résultats */}
            <div className={s.resultsHeader}>
              <div className={s.resultsTitleLeft}>
                <div className={s.resultsTitleRow}>
                  <h2 className={s.resultsTitle}>
                    <Sparkles size={18} color="#7C3AED" />
                    <span>{t.studio.page.resultsTitle}</span>
                  </h2>
                  <span className={s.visualsCountBadge}>{visuals.length} {locale === 'en' ? 'visuals' : 'visuels'}</span>
                </div>
                <p className={s.resultsSubtitle}>
                  {t.studio.page.resultsSubtitle}
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
                    <span>{locale === 'en' ? 'True Social Media Formats (Instagram Post, Stories & Facebook)' : 'Format Réseaux Sociaux Réels (Instagram Post, Stories & Facebook)'}</span>
                  </span>
                </div>
              </div>

              {/* BOUTON DE TÉLÉCHARGEMENT ATTRACTIF EN HAUT À DROITE AVEC MENU DÉROULANT */}
              <div className={s.downloadDropdownWrapper} ref={downloadDropdownRef}>
                <button
                  type="button"
                  className={s.attractiveDownloadBtn}
                  onClick={() => setIsDownloadDropdownOpen((prev) => !prev)}
                  disabled={isZipping}
                  aria-expanded={isDownloadDropdownOpen}
                  title={locale === 'en' ? "Download your HD creations" : "Télécharger vos créations HD"}
                >
                  <div className={s.downloadBtnContent}>
                    {isZipping ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    <span className={s.downloadBtnLabel}>
                      {isZipping ? (locale === 'en' ? 'Exporting...' : 'Exportation...') : (locale === 'en' ? 'Download' : 'Télécharger')}
                    </span>
                    <span className={s.downloadBtnBadge}>
                      {visuals.length} {locale === 'en' ? 'HD Formats' : 'Formats HD'}
                    </span>
                    <ChevronDown
                      size={13}
                      style={{
                        transform: isDownloadDropdownOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                </button>

                {/* MENU DÉROULANT / POPUP SÉLECTION & TOUT TÉLÉCHARGER */}
                {isDownloadDropdownOpen && (
                  <div className={s.downloadDropdownMenu}>
                    <div className={s.dropdownHeader}>
                      <div>
                        <div className={s.dropdownTitle}>
                          <Download size={15} color="#0F172A" />
                          <span>{locale === 'en' ? 'Studio 4K Export' : 'Exportation Studio 4K'}</span>
                        </div>
                        <div className={s.dropdownSubtitle}>
                          {locale === 'en' ? 'Download full pack or select formats' : "Téléchargez l'ensemble ou choisissez vos formats"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDownloadDropdownOpen(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748B',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                        }}
                        title={locale === 'en' ? 'Close' : 'Fermer'}
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* Option 1: TOUT TÉLÉCHARGER (ALL) EN 1 CLIC */}
                    <button
                      type="button"
                      className={s.dropdownHeroBtn}
                      onClick={() => handleDownloadAllZip()}
                      disabled={isZipping}
                      title={locale === 'en' ? "Download all visuals + copy + badges in 1 complete ZIP" : "Télécharger tous les visuels + textes + badges en 1 ZIP complet"}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '8px',
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#0F172A',
                            flexShrink: 0,
                            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
                          }}
                        >
                          <Download size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                            {t.studio.page.downloadZip}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                            {locale === 'en' ? `Full pack: ${visuals.length} HD Formats + Badges + Copy` : `Pack complet : ${visuals.length} Formats HD + Badges + Textes`}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          background: '#0F172A',
                          color: '#FFFFFF',
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {locale === 'en' ? '1 Click ➔' : '1 Clic ➔'}
                      </span>
                    </button>

                    <div className={s.dropdownDivider}>
                      <span>{locale === 'en' ? 'Or pick specific formats' : 'Ou choisir vos formats'}</span>
                    </div>

                    {/* Toolbar de sélection */}
                    <div className={s.dropdownSelectionToolbar}>
                      <span>
                        {locale === 'en' ? 'Selected:' : 'Sélectionnés :'} <strong>{selectedVisualIdsForDownload.length}</strong> / {visuals.length}
                      </span>
                      <div className={s.dropdownToolbarLinks}>
                        <button
                          type="button"
                          className={s.dropdownTextBtn}
                          onClick={selectAllVisualsForDownload}
                        >
                          {locale === 'en' ? 'Select all' : 'Tout cocher'}
                        </button>
                        <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
                        <button
                          type="button"
                          className={s.dropdownTextBtn}
                          onClick={deselectAllVisualsForDownload}
                        >
                          {locale === 'en' ? 'Deselect all' : 'Tout décocher'}
                        </button>
                      </div>
                    </div>

                    {/* Liste des formats avec checkboxes & téléchargement unitaire direct */}
                    <div className={s.dropdownFormatsList}>
                      {visuals.map((v) => {
                        const isChecked = selectedVisualIdsForDownload.includes(v.id);
                        const formatIcon = v.format === 'story' || v.format === 'tiktok' ? '📱' : v.format === 'facebook' ? '🖼️' : '📸';
                        const resolutionText = v.format === 'story' || v.format === 'tiktok' ? '1080 × 1920px (9:16)' : v.format === 'facebook' ? '1200 × 628px (1.91:1)' : '1080 × 1080px (1:1)';

                        return (
                          <div
                            key={v.id}
                            className={`${s.dropdownFormatItem} ${isChecked ? s.selected : ''}`}
                            onClick={() => toggleSelectVisualForDownload(v.id)}
                          >
                            <div className={s.dropdownFormatItemLeft}>
                              <input
                                type="checkbox"
                                className={s.dropdownItemCheckbox}
                                checked={isChecked}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSelectVisualForDownload(v.id);
                                }}
                              />
                              <span style={{ fontSize: '1rem' }}>{formatIcon}</span>
                              <div className={s.dropdownFormatItemInfo}>
                                <div className={s.dropdownFormatName}>
                                  {v.formatLabel}
                                </div>
                                <div className={s.dropdownFormatSub}>
                                  {resolutionText}
                                </div>
                              </div>
                            </div>

                            {/* Bouton téléchargement individuel direct 1-clic */}
                            <button
                              type="button"
                              className={s.dropdownItemSingleBtn}
                              title={`${locale === 'en' ? 'Download' : 'Télécharger'} ${v.formatLabel} ${locale === 'en' ? 'in HD' : 'seul en HD'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadSingle(v);
                              }}
                            >
                              <Download size={12} />
                              <span>JPG</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bouton d'action pour la sélection */}
                    <button
                      type="button"
                      className={s.dropdownActionBtn}
                      onClick={() => handleDownloadAllZip(selectedVisualIdsForDownload)}
                      disabled={isZipping || selectedVisualIdsForDownload.length === 0}
                    >
                      <Download size={14} />
                      <span>
                        {locale === 'en'
                          ? `Download selection (${selectedVisualIdsForDownload.length} format${selectedVisualIdsForDownload.length > 1 ? 's' : ''})`
                          : `Télécharger la sélection (${selectedVisualIdsForDownload.length} format${selectedVisualIdsForDownload.length > 1 ? 's' : ''})`}
                      </span>
                    </button>

                    {/* Liens bonus texte et badges */}
                    <div className={s.dropdownFooterExtra}>
                      <button
                        type="button"
                        onClick={handleDownloadAdCopies}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748B',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.72rem',
                          padding: '2px',
                        }}
                        title={locale === 'en' ? "Download ad copy file in text format" : "Télécharger le fichier de légendes Facebook/Instagram/Darija au format texte"}
                      >
                        <FileText size={12} color="#0F172A" />
                        <span>{locale === 'en' ? 'Ad Copy (.txt)' : 'Textes de vente (.txt)'}</span>
                      </button>

                      <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
                        Studio 4K Ultra-HD
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* GRILLE 2x2 DES CRÉATIONS GÉNÉRÉES (MarkMosaiq-55) */}
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
                        title={locale === 'en' ? "Edit text or AI backdrop" : "Modifier le texte ou le décor IA"}
                        onClick={() => openCardEditor(card)}
                      >
                        <Edit3 size={15} />
                      </button>

                      {/* Régénérer */}
                      <button
                        type="button"
                        className={s.toolActionBtn}
                        title={locale === 'en' ? "Regenerate this visual with AI Studio" : "Régénérer ce visuel avec le Studio IA"}
                        onClick={() => handleRegenerateSingle(card.id)}
                      >
                        <RefreshCw size={15} />
                      </button>

                      {/* Télécharger ce visuel unitaire */}
                      <button
                        type="button"
                        className={s.toolActionBtn}
                        title={t.studio.page.downloadSingle}
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



            {/* BANNIÈRE DE STATUT & TÉLÉCHARGEMENT GROUPÉ (MarkMosaiq-56) */}
            <div className={s.statusBanner}>
              <div className={s.statusLeft}>
                <div className={s.statusCheckIcon}>
                  <CheckCircle2 size={18} />
                </div>
                <div className={s.statusTextWrap}>
                  <h4 className={s.statusTitle}>
                    {locale === 'en' ? 'Your visuals are ready!' : 'Vos créations sont prêtes !'}
                  </h4>
                  <p className={s.statusDesc}>
                    {locale === 'en'
                      ? 'You can now customize them, generate additional variants, or download to publish on your social channels.'
                      : "Vous pouvez maintenant les modifier, en générer d'autres ou les télécharger pour les publier sur vos réseaux."}
                  </p>
                </div>
              </div>

              {/* Actions de partage & téléchargement (WhatsApp & ZIP) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>


                {/* Bouton Tout télécharger (ZIP) */}
                <button
                  type="button"
                  className={s.downloadAllBtn}
                  onClick={() => handleDownloadAllZip()}
                  disabled={isZipping}
                  title={locale === 'en' ? "Download complete ZIP archive" : "Télécharger l'archive ZIP complète des créations"}
                >
                  {isZipping ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>{locale === 'en' ? 'Creating ZIP...' : 'Création du ZIP...'}</span>
                    </>
                  ) : (
                    <>
                      <Download size={15} />
                      <span>{t.studio.page.downloadZip}</span>
                    </>
                  )}
                </button>

                {/* Bouton Personnaliser / Choisir les formats */}
                <button
                  type="button"
                  onClick={() => {
                    setIsDownloadDropdownOpen(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    color: '#0F172A',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                  }}
                  title="Choisir individuellement quels formats télécharger"
                >
                  <Sliders size={13} />
                  <span>Choisir les formats</span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* =========================================================================
          MODAL D'ÉDITION UNITAIRE D'UN VISUEL (MarkMosaiq Dark Luxury Studio)
          ========================================================================= */}
      {editingCard && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 9, 14, 0.88)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
          }}
        >
          <div
            style={{
              background: '#0B0E14',
              borderRadius: '18px',
              border: '1.5px solid rgba(0, 229, 255, 0.35)',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 229, 255, 0.10)',
              width: '100%',
              maxWidth: '860px',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              color: '#F8FAFC',
            }}
          >
            {/* Header du Modal */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#0E131E',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Studio d&apos;Édition — {editingCard.formatLabel}</span>
                  </h3>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      background: 'rgba(0, 229, 255, 0.14)',
                      border: '1px solid #00E5FF',
                      color: '#00E5FF',
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    ⚡ Rendu Studio 4K Ultra-HD
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px' }}>
                  Ambiance : {editingCard.styleName} · Retouchez les textes commerciaux ou régénérez le décor IA
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#94A3B8',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Onglets de contrôle */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                padding: '10px 24px',
                background: '#0B0E14',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <button
                type="button"
                onClick={() => setEditingCardTab('copy')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: editingCardTab === 'copy' ? '#131823' : 'transparent',
                  color: editingCardTab === 'copy' ? '#00E5FF' : '#94A3B8',
                  boxShadow: editingCardTab === 'copy' ? 'inset 0 0 0 1px #00E5FF' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FileText size={14} />
                <span>✍️ Textes & Offre Commerciale</span>
              </button>
              <button
                type="button"
                onClick={() => setEditingCardTab('ai_prompt')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: editingCardTab === 'ai_prompt' ? '#131823' : 'transparent',
                  color: editingCardTab === 'ai_prompt' ? '#00E5FF' : '#94A3B8',
                  boxShadow: editingCardTab === 'ai_prompt' ? 'inset 0 0 0 1px #00E5FF' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Wand2 size={14} />
                <span>🎨 Retouche Décor Studio IA</span>
              </button>
            </div>

            {/* Corps du modal en 2 colonnes (Aperçu à gauche / Formulaire à droite) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(260px, 320px) 1fr',
                gap: '20px',
                padding: '20px 24px',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              {/* Colonne Gauche : Aperçu visuel en direct */}
              <div
                style={{
                  background: '#07090E',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignSelf: 'start',
                }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: editingCard.format === 'story' ? '9/16' : '1/1', background: '#000' }}>
                  <img
                    src={editingCard.bgImage || '/images/image.png'}
                    alt={editingCard.headline}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />

                  {/* Badge commercial superposé */}
                  {editingCard.badgeText && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(11, 14, 23, 0.85)',
                        border: '1px solid #00E5FF',
                        color: '#00E5FF',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.66rem',
                        fontWeight: 900,
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      {editingCard.badgeText}
                    </div>
                  )}

                  {/* Cartouche bas de prévisualisation */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      right: '12px',
                      background: 'rgba(11, 14, 23, 0.88)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ fontSize: '0.80rem', fontWeight: 900, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {editingCard.headline}
                    </div>
                    {editingCard.subheadline && (
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {editingCard.subheadline}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#00E5FF' }}>
                        {editingCard.price || '89 DT'}
                      </span>
                      <span style={{ fontSize: '0.64rem', background: '#7C3AED', color: '#FFF', padding: '3px 8px', borderRadius: '4px', fontWeight: 800 }}>
                        {editingCard.ctaText || 'Commander'}
                      </span>
                    </div>
                  </div>

                  {/* Indicateur de chargement si régénération en cours */}
                  {isRegeneratingCardImage && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(7, 9, 14, 0.85)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        padding: '16px',
                        textAlign: 'center',
                      }}
                    >
                      <RefreshCw size={26} className="animate-spin" color="#00E5FF" />
                      <div style={{ fontSize: '0.80rem', fontWeight: 800, color: '#00E5FF' }}>
                        Régénération Studio IA en cours...
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                        Composition physique et ombres en cours de calcul
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne Droite : Formulaire d'édition actif */}
              <div>
                {editingCardTab === 'copy' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                        Titre d&apos;accroche (Headline)
                      </label>
                      <input
                        type="text"
                        value={editingCard.headline}
                        onChange={(e) => setEditingCard({ ...editingCard, headline: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          background: '#131823',
                          color: '#FFFFFF',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                        Sous-titre / Copywriting Darija ou Français
                      </label>
                      <textarea
                        rows={2}
                        value={editingCard.subheadline}
                        onChange={(e) => setEditingCard({ ...editingCard, subheadline: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          background: '#131823',
                          color: '#FFFFFF',
                          resize: 'none',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                          Prix affiché (Dinars DT)
                        </label>
                        <input
                          type="text"
                          value={editingCard.price || ''}
                          onChange={(e) => setEditingCard({ ...editingCard, price: e.target.value })}
                          placeholder="89 DT"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            fontSize: '0.84rem',
                            background: '#131823',
                            color: '#FFFFFF',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                          Badge commercial
                        </label>
                        <input
                          type="text"
                          value={editingCard.badgeText || ''}
                          onChange={(e) => setEditingCard({ ...editingCard, badgeText: e.target.value })}
                          placeholder="🚚 Livraison 24-48h"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            borderRadius: '8px',
                            fontSize: '0.84rem',
                            background: '#131823',
                            color: '#FFFFFF',
                            outline: 'none',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
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
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          background: '#131823',
                          color: '#FFFFFF',
                          outline: 'none',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                        Bouton d&apos;action (CTA)
                      </label>
                      <input
                        type="text"
                        value={editingCard.ctaText}
                        onChange={(e) => setEditingCard({ ...editingCard, ctaText: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          fontSize: '0.84rem',
                          background: '#131823',
                          color: '#FFFFFF',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}

                {editingCardTab === 'ai_prompt' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ fontSize: '0.74rem', color: '#94A3B8', lineHeight: '1.5' }}>
                      Modifiez le décor d&apos;accueil vacant de ce visuel. Le moteur <strong style={{ color: '#00E5FF' }}>Studio IA 4K</strong> va recréer l&apos;ambiance tout en conservant votre produit physique 100% intact.
                    </div>

                    {/* Raccourcis d'ambiance pour cette variante */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {[
                        { label: '✨ + Lumière Dorée', append: 'soft golden hour sunlight with warm amber rim reflections' },
                        { label: '🏛️ + Marbre Sombre', append: 'dark polished imperial marble counter with deep reflection' },
                        { label: '⚡ + Néons & Contraste', append: 'high-contrast athletic club lighting with electric cyan backlight accents' },
                        { label: '🌊 + Sidi Bou Saïd', append: 'sunlit Sidi Bou Said white terrace with soft bougainvillea accents' },
                        { label: '⭐ + Minimaliste Pur', append: 'ultra clean minimalist catalog podium with soft shadow gradient' },
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setCardEditPrompt((prev) => `${prev.trim()}, ${chip.append}`);
                            showToast(`Ambiance ajoutée : ${chip.label}`);
                          }}
                          style={{
                            background: '#131823',
                            border: '1px solid rgba(255, 255, 255, 0.12)',
                            color: '#E2E8F0',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    {/* Textarea du prompt éditable pour cette carte */}
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#00E5FF', display: 'block', marginBottom: '6px' }}>
                        Prompt Décor IA pour ce visuel ({editingCard.formatLabel})
                      </label>
                      <textarea
                        rows={4}
                        value={cardEditPrompt}
                        onChange={(e) => setCardEditPrompt(e.target.value)}
                        placeholder="Tapez le prompt décrivant le décor d'accueil souhaité..."
                        style={{
                          width: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                          padding: '12px',
                          border: '1.5px solid rgba(0, 229, 255, 0.40)',
                          borderRadius: '8px',
                          fontSize: '0.80rem',
                          fontFamily: 'monospace, sans-serif',
                          lineHeight: '1.45',
                          background: '#07090E',
                          color: '#FFFFFF',
                          outline: 'none',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    {/* Bouton de régénération IA pour cette carte */}
                    <button
                      type="button"
                      disabled={isRegeneratingCardImage}
                      onClick={() => handleRegenerateCardWithAI(editingCard, cardEditPrompt)}
                      style={{
                        padding: '12px 18px',
                        background: 'linear-gradient(135deg, #00E5FF 0%, #7C3AED 100%)',
                        color: '#07090E',
                        fontWeight: 900,
                        fontSize: '0.84rem',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: isRegeneratingCardImage ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 18px rgba(0, 229, 255, 0.30)',
                      }}
                    >
                      {isRegeneratingCardImage ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Génération Studio IA en cours...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>⚡ Régénérer le décor Studio IA</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer du modal */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: '#0E131E',
              }}
            >
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                style={{
                  padding: '9px 18px',
                  background: '#131823',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#94A3B8',
                  cursor: 'pointer',
                }}
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={() => {
                  setVisuals((prev) => prev.map((c) => (c.id === editingCard.id ? editingCard : c)));
                  setEditingCard(null);
                  showToast('✅ Modifications du visuel enregistrées !');
                }}
                style={{
                  padding: '9px 22px',
                  background: 'linear-gradient(135deg, #7C3AED, #6366F1)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
                }}
              >
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals tierces intégrées */}
      {isCheckoutOpen && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          initialPlanId={checkoutInitialPlan}
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

      {/* Floating Onboarding Checklist (2026 SaaS UI Pattern) */}
      <OnboardingChecklist
        hasGeneratedFirstVisual={hasGeneratedFirstVisual}
        hasExportedVisual={hasExportedVisual}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onScrollToStaging={() => {
          const el = document.getElementById('studio-product-dropzone');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
      />

      {/* Micro-Celebration Modal upon 1st Visual Staged */}
      {showFirstVisualCelebration && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
              textAlign: 'center',
              position: 'relative',
              border: '1px solid #E2E8F0',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366F1, #EC4899)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
              }}
            >
              <Sparkles size={32} />
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              🎉 Incredible! Your First 4K Ad Visual is Ready
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, marginBottom: '24px' }}>
              You've experienced the power of MarkMosaiq AI Staging. Download your free pack now, or unlock high creative velocity with 30 monthly 4K credits on Pro.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowFirstVisualCelebration(false);
                  handleDownloadAllZip();
                }}
                style={{
                  padding: '14px 20px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Download size={16} />
                <span>Download Free 4K Pack (.ZIP)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowFirstVisualCelebration(false);
                  setIsCheckoutOpen(true);
                }}
                style={{
                  padding: '12px 20px',
                  borderRadius: '10px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#0F172A',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Crown size={15} color="#F59E0B" />
                <span>Explore Pro Plan ($49 / mo via Whop)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowFirstVisualCelebration(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '6px',
                  marginTop: '4px',
                }}
              >
                Continue Editing Visuals
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
