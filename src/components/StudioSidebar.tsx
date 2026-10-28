'use client';

import React from 'react';
import Link from 'next/link';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { useLanguage } from '@/lib/LanguageContext';
import {
  Sparkles,
  Scissors,
  Palette,
  ShoppingBag,
  Building2,
  Calendar,
  CreditCard,
  Zap,
  Crown,
  X,
  Layers,
} from 'lucide-react';
import s from './StudioShell.module.css';

export interface StudioSidebarProps {
  activeNav?: string;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenBrandKit?: () => void;
  onOpenCatalog?: () => void;
  onOpenCheckout?: (planId?: string) => void;
}

export default function StudioSidebar({
  activeNav = 'studio',
  mobileOpen = false,
  onCloseMobile,
  onOpenBrandKit,
  onOpenCatalog,
  onOpenCheckout,
}: StudioSidebarProps) {
  const { workspace } = useWorkspace();
  const { t } = useLanguage();

  // Détection du forfait actif et calcul de la prochaine offre ou recharge
  const currentPlan = workspace?.plan || 'trial';
  const isAgencyPlan = currentPlan === 'agency' || (currentPlan as string) === 'agency_299';
  const isProPlan = currentPlan === 'pro';

  const nextPlanConfig = isAgencyPlan
    ? {
        targetPlanId: 'agency_299' as const,
        navLabel: `+ ${t.studio.navbar.topUp}`,
        sidebarTitle: t.studio.sidebar.agencyTitle,
        sidebarBadge: 'MAX',
        sidebarBadgeColor: '#10B981',
        sidebarDesc: t.studio.sidebar.agencyDesc,
        sidebarBtnLabel: t.studio.navbar.topUp,
        icon: Zap,
        navBtnBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      }
    : isProPlan
    ? {
        targetPlanId: 'agency_299' as const,
        navLabel: t.studio.navbar.upgradeAgency,
        sidebarTitle: t.studio.navbar.upgradeAgency,
        sidebarBadge: '$99',
        sidebarBadgeColor: '#A855F7',
        sidebarDesc: t.studio.sidebar.agencyDesc,
        sidebarBtnLabel: t.studio.navbar.upgradeAgency,
        icon: Sparkles,
        navBtnBg: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
      }
    : {
        targetPlanId: 'pro' as const,
        navLabel: t.studio.navbar.upgradePro,
        sidebarTitle: t.studio.sidebar.proTitle,
        sidebarBadge: '$49',
        sidebarBadgeColor: '#FF5722',
        sidebarDesc: t.studio.sidebar.proDesc,
        sidebarBtnLabel: t.studio.sidebar.proBtn,
        icon: Crown,
        navBtnBg: 'linear-gradient(135deg, #FF5722 0%, #E11D48 100%)',
      };

  const handleCatalogClick = (e: React.MouseEvent) => {
    if (onOpenCatalog) {
      e.preventDefault();
      onOpenCatalog();
      if (onCloseMobile) onCloseMobile();
    }
  };

  const handleBrandKitClick = (e: React.MouseEvent) => {
    if (onOpenBrandKit && activeNav === 'brand-kit') {
      e.preventDefault();
      onOpenBrandKit();
      if (onCloseMobile) onCloseMobile();
    }
  };

  const handleCheckoutClick = () => {
    if (onOpenCheckout) {
      onOpenCheckout(nextPlanConfig.targetPlanId);
    } else {
      window.location.href = `/checkout?pack=${nextPlanConfig.targetPlanId}`;
    }
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className={`${s.sidebar} ${mobileOpen ? s.sidebarOpenMobile : ''}`}>
      <div>
        {/* Logo MarkMosaiq officiel & bouton fermeture mobile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <Link
            href="/"
            className={s.brandHeader}
            style={{ borderBottom: 'none', padding: 0, margin: 0, flex: 1, textDecoration: 'none' }}
            onClick={onCloseMobile}
          >
            <img
              src="/images/logo.png"
              alt="MarkMosaiq Logo"
              className={s.brandLogoIcon}
            />
            <div className={s.brandTitles}>
              <span className={s.brandName}>MarkMosaiq</span>
              <span className={s.brandTagline}>{t.studio.sidebar.tagline}</span>
            </div>
          </Link>

          {mobileOpen && (
            <button
              type="button"
              className={s.sidebarMobileCloseBtn}
              onClick={onCloseMobile}
              title="Fermer le menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Menu de navigation complet */}
        <nav className={s.navSection}>
          <div className={s.navGroupLabel}>{t.studio.sidebar.groupStudio}</div>

          {/* 1. Créer une publicité */}
          <Link
            href="/studio"
            className={`${s.navItem} ${activeNav === 'studio' ? s.navItemActive : ''}`}
            onClick={onCloseMobile}
          >
            <Sparkles size={18} className={activeNav === 'studio' ? s.navIconActive : undefined} />
            <span>{t.studio.sidebar.navCreateAd}</span>
            {activeNav === 'studio' && <span className={s.navBadge}>{t.studio.sidebar.activeBadge}</span>}
          </Link>

          {/* 1.1 Carrousel IA 3-Slides Coordonnées */}
          <Link
            href="/carousel"
            className={`${s.navItem} ${activeNav === 'carousel' ? s.navItemActive : ''}`}
            title="Campagnes Carrousel 3-Slides Synchronisées"
            onClick={onCloseMobile}
          >
            <Layers size={18} className={activeNav === 'carousel' ? s.navIconActive : undefined} />
            <span>Carrousel IA 3-Slides</span>
            <span style={{ fontSize: '10px', background: 'linear-gradient(135deg, #00E5FF, #6366F1)', color: '#FFF', padding: '2px 6px', borderRadius: '4px', fontWeight: 900 }}>HOT</span>
          </Link>

          {/* 2. Remove background */}
          <Link
            href="/cutout"
            className={`${s.navItem} ${activeNav === 'cutout' ? s.navItemActive : ''}`}
            title="Remove background / Détourage IA"
            onClick={onCloseMobile}
          >
            <Scissors size={18} className={activeNav === 'cutout' ? s.navIconActive : undefined} />
            <span>{t.studio.sidebar.navCutout}</span>
            <span className={s.navBadgeCyan}>/cutout</span>
          </Link>

          {/* 3. Brand Kit & Charte */}
          <Link
            href="/brand-kit"
            className={`${s.navItem} ${activeNav === 'brand-kit' ? s.navItemActive : ''}`}
            onClick={(e) => {
              handleBrandKitClick(e);
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <Palette size={18} className={activeNav === 'brand-kit' ? s.navIconActive : undefined} />
            <span>{t.studio.sidebar.navBrandKit}</span>
          </Link>

          {/* 4. Catalogue produits */}
          {onOpenCatalog ? (
            <button
              type="button"
              className={`${s.navItem} ${activeNav === 'catalog' ? s.navItemActive : ''}`}
              onClick={handleCatalogClick}
            >
              <ShoppingBag size={18} className={activeNav === 'catalog' ? s.navIconActive : undefined} />
              <span>{t.studio.sidebar.navCatalog}</span>
              {activeNav === 'catalog' && <span className={s.navBadge}>{t.studio.sidebar.activeBadge}</span>}
            </button>
          ) : (
            <Link
              href="/brand-kit?tab=catalog"
              className={`${s.navItem} ${activeNav === 'catalog' ? s.navItemActive : ''}`}
              onClick={onCloseMobile}
            >
              <ShoppingBag size={18} className={activeNav === 'catalog' ? s.navIconActive : undefined} />
              <span>{t.studio.sidebar.navCatalog}</span>
              {activeNav === 'catalog' && <span className={s.navBadge}>{t.studio.sidebar.activeBadge}</span>}
            </Link>
          )}

          {/* Tarifs & Offres */}
          <Link
            href="/pricing"
            className={`${s.navItem} ${activeNav === 'pricing' ? s.navItemActive : ''}`}
            onClick={onCloseMobile}
          >
            <CreditCard size={18} className={activeNav === 'pricing' ? s.navIconActive : undefined} />
            <span>{t.studio.sidebar.navPricing}</span>
          </Link>
        </nav>
      </div>

      {/* Bas de sidebar : Carte Passez à Pro .*/}
      <div>
        <div className={s.proCard} suppressHydrationWarning>
          <div className={s.proHeader} suppressHydrationWarning>
            <nextPlanConfig.icon size={16} />
            <span suppressHydrationWarning>{nextPlanConfig.sidebarTitle}</span>
            <span
              suppressHydrationWarning
              style={{
                fontSize: '0.64rem',
                background: nextPlanConfig.sidebarBadgeColor,
                color: '#FFF',
                padding: '2px 7px',
                borderRadius: '8px',
                marginLeft: 'auto',
                fontWeight: 800,
              }}
            >
              {nextPlanConfig.sidebarBadge}
            </span>
          </div>
          <p className={s.proDesc} suppressHydrationWarning>{nextPlanConfig.sidebarDesc}</p>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <button
              type="button"
              className={s.proBtn}
              style={{ flex: 1, background: nextPlanConfig.navBtnBg }}
              onClick={handleCheckoutClick}
            >
              {nextPlanConfig.sidebarBtnLabel}
            </button>
            <Link
              href={`/checkout?pack=${nextPlanConfig.targetPlanId}`}
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
              title="Consulter tous les forfaits"
              onClick={onCloseMobile}
            >
              {t.studio.sidebar.viewPlans}
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
