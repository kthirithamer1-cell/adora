'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  Menu,
  ChevronLeft,
  ChevronDown,
  Palette,
  Zap,
  Sparkles,
  Bell,
  CreditCard,
  LayoutDashboard,
  FileText,
  LogOut,
  Crown,
} from 'lucide-react';
import s from './StudioShell.module.css';

export interface StudioNavbarProps {
  pageTitle?: string;
  pageBadge?: React.ReactNode;
  onToggleMobileSidebar?: () => void;
  onOpenBrandKit?: () => void;
  onOpenCheckout?: (planId?: string) => void;
}

export default function StudioNavbar({
  pageTitle,
  pageBadge,
  onToggleMobileSidebar,
  onOpenBrandKit,
  onOpenCheckout,
}: StudioNavbarProps) {
  const { workspace, user, logout } = useWorkspace();
  const { t, locale } = useLanguage();
  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const userInitials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'TK';

  // Forfaits et CTA
  const currentPlan = workspace?.plan || 'trial';
  const isAgencyPlan = currentPlan === 'agency' || (currentPlan as string) === 'agency_299';
  const isProPlan = currentPlan === 'pro';

  const nextPlanConfig = isAgencyPlan
    ? {
        targetPlanId: 'agency_299' as const,
        navLabel: t.studio.navbar.topUp,
        icon: Zap,
        navBtnBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        navBtnShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
      }
    : isProPlan
    ? {
        targetPlanId: 'agency_299' as const,
        navLabel: t.studio.navbar.upgradeAgency,
        icon: Sparkles,
        navBtnBg: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
        navBtnShadow: '0 2px 10px rgba(168, 85, 247, 0.35)',
      }
    : {
        targetPlanId: 'pro' as const,
        navLabel: t.studio.navbar.upgradePro,
        icon: Crown,
        navBtnBg: 'linear-gradient(135deg, #FF5722 0%, #E11D48 100%)',
        navBtnShadow: '0 2px 10px rgba(255, 87, 34, 0.35)',
      };

  const handleBrandKitAction = () => {
    if (onOpenBrandKit) {
      onOpenBrandKit();
    } else {
      window.location.href = '/brand-kit';
    }
  };

  const handleCheckoutAction = () => {
    if (onOpenCheckout) {
      onOpenCheckout(nextPlanConfig.targetPlanId);
    } else {
      window.location.href = `/checkout?pack=${nextPlanConfig.targetPlanId}`;
    }
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    window.location.href = '/login';
  };

  return (
    <header className={s.studioTopNavbar}>
      {/* Fil d'Ariane & Navigation Retour */}
      <div className={s.navBreadcrumbWrap}>
        {onToggleMobileSidebar && (
          <button
            type="button"
            className={s.studioHamburgerBtn}
            onClick={onToggleMobileSidebar}
            title="Menu de navigation"
          >
            <Menu size={18} />
          </button>
        )}

        <Link
          href="/studio"
          className={s.breadcrumbBackBtn}
          title="Retour au studio"
        >
          <img
            src="/images/logo.png"
            alt="MarkMosaiq Logo"
            style={{ width: '22px', height: '22px', borderRadius: '6px', objectFit: 'contain', background: '#FFFFFF' }}
          />
          <ChevronLeft size={16} />
          <span>{t.studio.navbar.home}</span>
        </Link>

        <span className={s.breadcrumbSeparator}>/</span>

        <div className={s.breadcrumbCurrent}>
          <span>{pageTitle || t.studio.navbar.title}</span>
          {pageBadge ? (
            pageBadge
          ) : (
            <span className={s.navLiveEngineBadge}>
              <Sparkles size={11} /> {t.studio.navbar.liveEngine}
            </span>
          )}
        </div>
      </div>

      {/* Raccourcis d'actions & Multi-Tenant */}
      <div className={s.navRightActions}>
        <button
          type="button"
          className={s.navQuickActionBtn}
          onClick={handleBrandKitAction}
          title="Configurer votre identité de marque et logo"
        >
          <Palette size={14} color="#7C3AED" />
          <span>Brand Kit</span>
        </button>

        <div
          className={s.navCreditsBadge}
          onClick={handleCheckoutAction}
          title="Recharger vos crédits de génération"
        >
          <Zap size={13} color="#4338CA" />
          <span suppressHydrationWarning>{workspace?.creditsRemaining ?? 0} {t.studio.navbar.credits}</span>
        </div>

        <button
          type="button"
          className={s.navProCtaBtn}
          style={{
            background: nextPlanConfig.navBtnBg,
            boxShadow: nextPlanConfig.navBtnShadow,
          }}
          onClick={handleCheckoutAction}
          title={isAgencyPlan ? 'Recharger des crédits supplémentaires' : `Débloquer l'offre ${nextPlanConfig.navLabel}`}
        >
          <nextPlanConfig.icon size={14} />
          <span suppressHydrationWarning>{nextPlanConfig.navLabel}</span>
        </button>

        <div className={s.navDivider} />

        {/* Embedded Studio Language Switcher */}
        <LanguageSwitcher variant="light" />

        <div className={s.navDivider} />

        {/* Notification Bell & Popover */}
        

        {/* Account Profile Avatar & Dropdown */}
        <div className={s.navUserMenuWrap} ref={userMenuRef}>
          <button
            type="button"
            className={`${s.navUserMenuBtn} ${isUserMenuOpen ? s.navUserMenuBtnActive : ''}`}
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            title="Mon compte & profil"
            aria-label="Profil utilisateur"
          >
            <div className={s.navUserAvatar} suppressHydrationWarning>{userInitials}</div>
            <ChevronDown
              size={14}
              color={isUserMenuOpen ? '#0F172A' : '#64748B'}
              style={{
                transform: isUserMenuOpen ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s ease',
              }}
            />
          </button>

          {isUserMenuOpen && (
            <div className={s.navPopover} style={{ width: '260px' }}>
              {/* User Profile Header */}
              <div
                style={{
                  padding: '14px 16px',
                  background: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  suppressHydrationWarning
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #4338CA 100%)',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.86rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {userInitials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    suppressHydrationWarning
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user?.name || 'Mon Compte'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#64748B',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user?.email || 'contact@markmosaiq.com'}
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '4px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: isAgencyPlan ? '#ECFDF5' : isProPlan ? '#EFF6FF' : '#FEF3C7',
                      color: isAgencyPlan ? '#059669' : isProPlan ? '#2563EB' : '#D97706',
                      fontSize: '0.64rem',
                      fontWeight: 800,
                    }}
                  >
                    <span>{workspace?.name || 'MarkMosaiq'}</span>
                    <span>•</span>
                    <span>{(workspace?.plan || 'TRIAL').toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div style={{ padding: '6px' }}>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#334155',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F1F5F9';
                    e.currentTarget.style.color = '#0F172A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#334155';
                  }}
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleBrandKitAction();
                  }}
                >
                  <Palette size={16} color="#7C3AED" />
                  <span>Brand Kit & Logo</span>
                </button>

                <button
                  type="button"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#334155',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F1F5F9';
                    e.currentTarget.style.color = '#0F172A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#334155';
                  }}
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleCheckoutAction();
                  }}
                >
                  <CreditCard size={16} color="#2563EB" />
                  <span>{t.studio.navbar.billing}</span>
                </button>

                <Link
                  href="/studio"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#334155',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F1F5F9';
                    e.currentTarget.style.color = '#0F172A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#334155';
                  }}
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <LayoutDashboard size={16} color="#0D9488" />
                  <span>Tableau de bord</span>
                </Link>

                <Link
                  href="/billing/history"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#334155',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F1F5F9';
                    e.currentTarget.style.color = '#0F172A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#334155';
                  }}
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <FileText size={16} color="#64748B" />
                  <span>Historique & Factures</span>
                </Link>
              </div>

              {/* Logout section */}
              <div style={{ padding: '6px', borderTop: '1px solid #F1F5F9' }}>
                <button
                  type="button"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: '#DC2626',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={handleLogout}
                >
                  <LogOut size={16} color="#DC2626" />
                  <span>{t.studio.navbar.logout}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
