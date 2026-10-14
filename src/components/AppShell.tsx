'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import WorkspaceSelector from '@/components/WorkspaceSelector';
import { useWorkspace } from '@/lib/WorkspaceContext';
import {
  Sparkles,
  Layers,
  Scissors,
  LayoutDashboard,
  Palette,
  Calendar,
  Building2,
  Users,
  Tag,
  CreditCard,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Zap,
  ArrowUpRight,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  activeNav?: string;
  pageTitle?: string;
}

export default function AppShell({ children, activeNav, pageTitle }: AppShellProps) {
  const pathname = usePathname();
  const { workspace, user, role } = useWorkspace();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    window.location.href = '/login';
  };

  useEffect(() => {
    const saved = localStorage.getItem('adora_sidebar_collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('adora_sidebar_collapsed', String(next));
      return next;
    });
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // 1. Navigation Principale (L'essentiel MVP - Clair, direct et accessible)
  const primaryNavItems = [
    {
      id: 'dashboard',
      label: 'Accueil',
      href: '/dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'studio',
      label: 'Créer une Publicité',
      href: '/studio',
      icon: <Sparkles size={18} />,
      badge: 'Nouveau',
    },
    {
      id: 'cutout',
      label: 'Enlever le Fond',
      href: '/cutout',
      icon: <Scissors size={18} />,
      badge: 'Détourage',
    },
    {
      id: 'brand-kit',
      label: 'Mes Produits & Photos',
      href: '/brand-kit',
      icon: <Palette size={18} />,
    },
    {
      id: 'pricing',
      label: 'Tarifs & Offres',
      href: '/pricing',
      icon: <CreditCard size={18} />,
      badge: 'Dès 29 DT',
    },
  ];

  // 2. Options Avancées (repliables pour ne pas surcharger les utilisateurs débutants)
  const advancedNavItems = [
    {
      id: 'social',
      label: 'Calendrier Social Hub',
      href: '/social',
      icon: <Calendar size={17} />,
    },
    {
      id: 'agency',
      label: 'Espace Agence B2B',
      href: '/agency',
      icon: <Building2 size={17} />,
    },
    {
      id: 'billing-history',
      label: 'Historique Factures',
      href: '/billing/history',
      icon: <FileText size={17} />,
    },
  ];

  const allNavItems = [...primaryNavItems, ...advancedNavItems];
  const currentNav = activeNav || allNavItems.find((n) => pathname?.startsWith(n.href))?.id || '';

  const isAdvancedActive = advancedNavItems.some(
    (n) => currentNav === n.id || (pathname && pathname.startsWith(n.href))
  );
  const [showAdvanced, setShowAdvanced] = useState(isAdvancedActive);

  useEffect(() => {
    if (isAdvancedActive) {
      setShowAdvanced(true);
    }
  }, [isAdvancedActive]);

  const isExpanded = !collapsed || mobileOpen;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', color: '#0F172A', position: 'relative' }}>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 95,
          }}
        />
      )}

      {/* SIDEBAR MINIMISÉE & COMPACTE — STYLE LUXE SOMBRE ADORA */}
      <aside
        className={`appshell-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: isExpanded ? '232px' : '68px',
          background: '#0B0E14',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.22s ease',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 90,
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isExpanded ? 'space-between' : 'center',
            padding: isExpanded ? '0 16px' : '0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}
          >
            <img
              src="/images/Adora_logo.png"
              alt="Adora Logo"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                objectFit: 'contain',
                background: '#FFFFFF',
                boxShadow: '0 0 16px rgba(0, 229, 255, 0.3)',
              }}
            />
            {isExpanded && (
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  ADORA
                </span>
                <span style={{ display: 'block', fontSize: '0.6rem', color: '#00E5FF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  SaaS E-commerce TN
                </span>
              </div>
            )}
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Bouton de fermeture sur mobile */}
            <button
              type="button"
              className="appshell-mobile-close-btn"
              onClick={() => setMobileOpen(false)}
              title="Fermer le menu"
            >
              <X size={16} />
            </button>

            {!collapsed && !mobileOpen && (
              <button
                onClick={toggleCollapsed}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '26px',
                  height: '26px',
                  transition: 'all 0.15s ease',
                }}
                title="Minimiser la barre latérale"
              >
                <ChevronLeft size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Toggle button when minimized on desktop */}
        {collapsed && !mobileOpen && (
          <div style={{ textAlign: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              onClick={toggleCollapsed}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#00E5FF',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '26px',
                height: '26px',
              }}
              title="Agrandir la barre latérale"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav style={{ flex: 1, padding: isExpanded ? '14px 10px' : '14px 8px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {/* Section Principale MVP */}
          {primaryNavItems.map((item) => {
            const isActive = currentNav === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isExpanded ? 'space-between' : 'center',
                  padding: isExpanded ? '9px 12px' : '10px 0',
                  borderRadius: '9px',
                  textDecoration: 'none',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.14) 0%, rgba(124, 58, 237, 0.18) 100%)'
                    : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(0, 229, 255, 0.35)' : 'transparent'}`,
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 800 : 500,
                  boxShadow: isActive ? '0 0 16px rgba(0, 229, 255, 0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
                title={!isExpanded ? item.label : undefined}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#00E5FF' : '#64748B' }}>
                    {item.icon}
                  </span>
                  {isExpanded && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
                </div>
                {isExpanded && item.badge && (
                  <span
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isActive ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                      color: isActive ? '#00E5FF' : '#94A3B8',
                      border: `1px solid ${isActive ? 'rgba(0, 229, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Séparateur pour options avancées */}
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '10px 4px' }} />

          {/* Options Avancées (Collapsible) */}
          {!isExpanded ? (
            // En mode rétracté, on affiche les icônes avancées discrètement
            advancedNavItems.map((item) => {
              const isActive = currentNav === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 0',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    background: isActive ? 'rgba(0, 229, 255, 0.12)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(0, 229, 255, 0.3)' : 'transparent'}`,
                    color: isActive ? '#00E5FF' : '#64748B',
                    transition: 'all 0.15s ease',
                  }}
                  title={item.label}
                >
                  {item.icon}
                </Link>
              );
            })
          ) : (
            // En mode déplié : bouton toggle simple
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '7px 10px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#64748B',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
              >
                <span>Options Avancées</span>
                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {showAdvanced && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                  {advancedNavItems.map((item) => {
                    const isActive = currentNav === item.id;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          background: isActive
                            ? 'linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(124, 58, 237, 0.14) 100%)'
                            : 'transparent',
                          border: `1px solid ${isActive ? 'rgba(0, 229, 255, 0.3)' : 'transparent'}`,
                          color: isActive ? '#FFFFFF' : '#94A3B8',
                          fontSize: '0.78rem',
                          fontWeight: isActive ? 700 : 500,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#00E5FF' : '#64748B' }}>
                          {item.icon}
                        </span>
                        <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Sidebar Footer Info */}
        <div style={{ padding: isExpanded ? '14px 14px' : '12px 8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)' }}>
          {workspace && (
            <div>
              {!isExpanded ? (
                <Link
                  href="/checkout"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 0',
                    borderRadius: '6px',
                    background: 'rgba(0, 229, 255, 0.1)',
                    color: '#00E5FF',
                    textDecoration: 'none',
                  }}
                  title={`Solde : ${workspace.creditsRemaining} crédits - Recharger`}
                >
                  <Zap size={16} />
                </Link>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>SOLDE BOUTIQUE</span>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#00E5FF', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Zap size={13} /> {workspace.creditsRemaining} crédits
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.14) 0%, rgba(124, 58, 237, 0.18) 100%)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      color: '#00E5FF',
                      borderRadius: '6px',
                      padding: '7px 10px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      textDecoration: 'none',
                      boxShadow: '0 2px 10px rgba(0, 229, 255, 0.1)',
                    }}
                  >
                    <span>Recharger en Dinars</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Bouton Déconnexion dans la Sidebar */}
          {isExpanded ? (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '10px',
                padding: '7px 8px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
                borderRadius: '6px',
                transition: 'all 0.15s ease',
              }}
              title="Se déconnecter"
            >
              <LogOut size={13} />
              <span>Déconnexion</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '8px',
                padding: '7px 0',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                cursor: 'pointer',
                width: '100%',
                borderRadius: '6px',
              }}
              title="Déconnexion"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </aside>

      {/* CONTENU CENTRAL AVEC NAVBAR TOP */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header className="appshell-top-header">
          <div className="appshell-header-left">
            <button
              type="button"
              className="appshell-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              title="Menu de navigation"
            >
              <Menu size={18} />
            </button>
            <div className="appshell-header-brand-title">
              <Link href="/dashboard" className="appshell-brand-link">
                <img
                  src="/images/Adora_logo.png"
                  alt="Adora Logo"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    objectFit: 'contain',
                    background: '#FFFFFF',
                    boxShadow: '0 0 10px rgba(0, 229, 255, 0.25)',
                  }}
                />
                <span>Adora</span>
              </Link>
              {pageTitle && (
                <>
                  <span className="appshell-title-separator">/</span>
                  <h1 className="appshell-page-title" title={pageTitle}>
                    {pageTitle}
                  </h1>
                </>
              )}
            </div>
          </div>

          <div className="appshell-header-right">
            <WorkspaceSelector />

            <Link
              href="/studio"
              className="appshell-cta-btn"
              title="Créer un visuel"
            >
              <Sparkles size={14} />
              <span className="appshell-cta-text">Créer un visuel</span>
            </Link>

            {/* Menu Compte Utilisateur & Déconnexion */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '9999px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="Mon Compte & Déconnexion"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00E5FF, #7C3AED)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                  }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }} className="appshell-user-text">
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }}>
                    {user?.name || 'Mon Compte'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#00E5FF', fontWeight: 700 }}>
                    {role === 'owner' ? 'Propriétaire' : role === 'manager' ? 'Manager' : 'Designer'}
                  </span>
                </div>
                <ChevronDown size={14} color="#94A3B8" />
              </button>

              {/* Menu Déroulant Profil & Déconnexion */}
              {userMenuOpen && (
                <>
                  <div
                    onClick={() => setUserMenuOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 98 }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '260px',
                      background: '#0B0E14',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '12px',
                      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.55)',
                      backdropFilter: 'blur(20px)',
                      zIndex: 99,
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    {/* En-tête Utilisateur */}
                    <div style={{ paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#FFFFFF' }}>
                        {user?.name || 'Mohamed Ben Salah'}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94A3B8', wordBreak: 'break-all' }}>
                        {user?.email || 'mohamed@nutristore.tn'}
                      </p>
                      {workspace && (
                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                          <span style={{ fontSize: '0.72rem', color: '#00E5FF', fontWeight: 700 }}>
                            {workspace.name}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#F59E0B', fontWeight: 800 }}>
                            ⚡ {workspace.creditsRemaining} crédits
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Liens rapides */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: '#E2E8F0',
                          textDecoration: 'none',
                        }}
                      >
                        <LayoutDashboard size={14} color="#00E5FF" />
                        Tableau de bord
                      </Link>
                      <Link
                        href="/brand-kit"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: '#E2E8F0',
                          textDecoration: 'none',
                        }}
                      >
                        <Palette size={14} color="#A855F7" />
                        Mon Brand Kit & Produits
                      </Link>
                      <Link
                        href="/checkout"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          color: '#E2E8F0',
                          textDecoration: 'none',
                        }}
                      >
                        <CreditCard size={14} color="#10B981" />
                        Recharger en Dinars (TND)
                      </Link>
                    </div>

                    <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)' }} />

                    {/* Bouton de Déconnexion */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#EF4444',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <LogOut size={15} />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="appshell-main-padding" style={{ flex: 1, padding: '32px 28px', minWidth: 0 }}>
          {children}
        </main>

        {/* Footer Officiel AppShell */}
        <footer
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'rgba(11, 14, 20, 0.75)',
            backdropFilter: 'blur(12px)',
            fontSize: '0.78rem',
            color: '#64748B',
            marginTop: 'auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/images/Adora_logo.png"
              alt="Adora Logo"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                objectFit: 'contain',
                background: '#FFFFFF',
                boxShadow: '0 0 10px rgba(0, 229, 255, 0.25)',
              }}
            />
            <span style={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>ADORA</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
            <span style={{ color: '#94A3B8' }}>Studio IA E-Commerce 4K — Tunisie 🇹🇳</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span>Paiements en Dinars (TND) via Flouci</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
            <span>24 Gouvernorats</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
            <span>© 2026 Adora AI</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
