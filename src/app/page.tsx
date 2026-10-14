'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Play,
  ArrowRight,
  Check,
  Zap,
  Smartphone,
  ShoppingBag,
  Store,
  Shirt,
  Sparkle,
  UtensilsCrossed,
  Home,
  Briefcase,
  UserCheck,
  Layers,
  BarChart3,
  Database,
  RefreshCw,
  Star,
  ChevronDown,
  Menu,
  X,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  ThumbsUp,
  Share2,
  Globe,
  TrendingUp,
  Users,
  Flame,
  CheckCircle2,
  ShieldCheck,
  Eye,
  MoreHorizontal,
  LogOut,
} from 'lucide-react';
import { useWorkspace } from '@/lib/WorkspaceContext';

export default function HomePage() {
  const { user, workspace } = useWorkspace();
  const [userDropdownOpen, setUserDropdownOpen] = useState<boolean>(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeSector, setActiveSector] = useState<string>('ecommerce');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    window.location.href = '/login';
  };

  const [heroSocialStatus, setHeroSocialStatus] = useState<'instagram' | 'facebook' | 'story'>('instagram');
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(3482);
  const [activeBuyerIndex, setActiveBuyerIndex] = useState<number>(0);

  const tunisianBuyers = [
    { name: 'Mariem B.', city: 'Sousse', time: 'il y a 2 min', item: 'Eau de Rose 50ml' },
    { name: 'Yassine M.', city: 'Tunis (Lac 2)', time: 'il y a 4 min', item: 'Pack Promo -10%' },
    { name: 'Sarra K.', city: 'Sfax', time: 'il y a 7 min', item: 'Eau de Rose Prestige' },
    { name: 'Ahmed G.', city: 'Ariana', time: 'il y a 11 min', item: 'Eau de Rose 50ml' },
    { name: 'Nour E.', city: 'Nabeul', time: 'il y a 14 min', item: 'Pack Duo Parfumerie' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBuyerIndex((prev) => (prev + 1) % 5);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const sectors = [
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingBag },
    { id: 'social_boutiques', label: 'Boutiques Instagram/Facebook', icon: Store },
    { id: 'fashion', label: 'Mode & accessoires', icon: Shirt },
    { id: 'beauty', label: 'Beauté & cosmétiques', icon: Sparkle },
    { id: 'food', label: 'Restaurants & food', icon: UtensilsCrossed },
    { id: 'real_estate', label: 'Immobilier', icon: Home },
    { id: 'agency', label: 'Agences marketing', icon: Briefcase },
    { id: 'freelance', label: 'Freelancers', icon: UserCheck },
  ];

  const galleryItems = [
    {
      sector: 'fashion',
      title: 'Style timeless',
      category: 'Mode & Élégance',
      cta: 'Acheter maintenant',
      image: '/images/adora_fashion_model.jpg',
      badge: 'Instagram Feed',
      gradient: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.1) 60%, transparent 100%)',
    },
    {
      sector: 'food',
      title: 'Goût inoubliable',
      category: 'Burger Gourmet',
      cta: 'Commander maintenant',
      image: '/images/hero_lifestyle.jpg',
      badge: 'Facebook Ads',
      gradient: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.1) 60%, transparent 100%)',
    },
    {
      sector: 'beauty',
      title: 'Une peau plus éclatante',
      category: 'Cosmétique Bio',
      cta: 'Découvrir',
      image: '/images/adora_hero_perfume.jpg',
      badge: 'Instagram Story',
      gradient: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.1) 60%, transparent 100%)',
    },
    {
      sector: 'tech',
      title: 'Son pur sans limites',
      category: 'High-Tech & Audio',
      cta: 'Acheter maintenant',
      image: '/images/whey_studio_podium.jpg',
      badge: 'TikTok Ads',
      gradient: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.1) 60%, transparent 100%)',
    },
    {
      sector: 'decor',
      title: 'Votre maison votre style',
      category: 'Mobilier & Déco',
      cta: 'Découvrir',
      image: '/images/gnc_pro_whey_tub_1791150838901.jpg',
      badge: 'Catalogue Produit',
      gradient: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.1) 60%, transparent 100%)',
    },
    {
      sector: 'luxury',
      title: 'Évasion au quotidien',
      category: 'Parfumerie de Luxe',
      cta: 'Découvrir',
      image: '/images/creatine_story.jpg',
      badge: 'Story Sponsorisée',
      gradient: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.1) 60%, transparent 100%)',
    },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FFFFFF', color: '#0F172A', overflowX: 'hidden' }}>
      
      {/* =========================================================================
          SECTION 1 : NAVIGATION BAR STICKY RESPONSIVE (ADORA-32)
          ========================================================================= */}
      <header
        style={{
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          background: 'rgba(255, 255, 255, 0.94)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          transition: 'all 0.2s ease',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '74px', maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Logo Adora */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img
              src="/images/Adora_logo.png"
              alt="Adora Logo"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                objectFit: 'contain',
                background: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.2)',
              }}
            />
            <span style={{ fontSize: '1.45rem', fontWeight: '900', letterSpacing: '-0.03em', color: '#0F172A', lineHeight: 1 }}>
              Adora
            </span>
          </Link>

          {/* Links navigation desktop */}
          <nav className="landing-nav-links">
            <a href="#accueil" style={{ color: '#475569', textDecoration: 'none', fontWeight: '600', fontSize: '0.92rem' }}>Accueil</a>
            <a href="#avant-apres" style={{ color: '#475569', textDecoration: 'none', fontWeight: '600', fontSize: '0.92rem' }}>Fonctionnalités</a>
            <a href="#tarifs" style={{ color: '#475569', textDecoration: 'none', fontWeight: '600', fontSize: '0.92rem' }}>Tarifs</a>
            <a href="#temoignages" style={{ color: '#475569', textDecoration: 'none', fontWeight: '600', fontSize: '0.92rem' }}>Témoignages</a>
            <a href="#faq" style={{ color: '#475569', textDecoration: 'none', fontWeight: '600', fontSize: '0.92rem' }}>FAQ</a>
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Currency selector */}
            <div
              className="landing-currency-selector"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '0.95rem', lineHeight: 1 }}>🇹🇳</span>
              <span>TND</span>
              <ChevronDown size={13} color="#64748B" />
            </div>

            {/* Login ou Menu Compte Utilisateur */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '5px 12px 5px 6px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    color: '#0F172A',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease',
                  }}
                  title="Mon Compte"
                >
                  {user.avatarUrl ? (
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
                      background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                    }}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'M'}
                    </div>
                  )}
                  <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user.name}
                  </span>
                  <ChevronDown size={14} color="#64748B" />
                </button>

                {/* Dropdown Menu Compte */}
                {userDropdownOpen && (
                  <>
                    <div
                      onClick={() => setUserDropdownOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 110 }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '240px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                        zIndex: 120,
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>{user.name}</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', wordBreak: 'break-all' }}>{user.email}</div>
                        {workspace && (
                          <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                            <span style={{ fontSize: '0.72rem', color: '#6D28D9', fontWeight: 700 }}>
                              {workspace.name}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 800 }}>
                              ⚡ {workspace.creditsRemaining} crédits
                            </span>
                          </div>
                        )}
                      </div>

                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 8px',
                          borderRadius: '6px',
                          color: '#334155',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Tableau de bord
                      </Link>
                      <Link
                        href="/studio"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 8px',
                          borderRadius: '6px',
                          color: '#334155',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Studio de création
                      </Link>
                      <Link
                        href="/brand-kit"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 8px',
                          borderRadius: '6px',
                          color: '#334155',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Mon Brand Kit & Produits
                      </Link>
                      <Link
                        href="/checkout"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 8px',
                          borderRadius: '6px',
                          color: '#334155',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        Recharger en Dinars (TND)
                      </Link>

                      <div style={{ height: '1px', background: '#F1F5F9', margin: '2px 0' }} />

                      <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '8px',
                          borderRadius: '6px',
                          background: '#FEF2F2',
                          border: '1px solid #FEE2E2',
                          color: '#EF4444',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          width: '100%',
                        }}
                      >
                        <LogOut size={14} />
                        Se déconnecter
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                style={{
                  color: '#475569',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  padding: '6px 10px',
                }}
              >
                Connexion
              </Link>
            )}

            {/* Primary Action Button */}
            <Link
              href={user ? "/dashboard" : "/studio"}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: '0.88rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                whiteSpace: 'nowrap',
              }}
            >
              <span className="landing-nav-cta-text">{user ? "Mon Dashboard" : "Créer ma première publicité"}</span>
              <span className="landing-nav-cta-text-short">{user ? "Dashboard ➔" : "Créer ➔"}</span>
              <ArrowRight size={15} />
            </Link>

            {/* Hamburger Button Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="landing-hamburger"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '16px 20px 24px',
              background: '#FFFFFF',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            {/* Profil Mobile si connecté */}
            {user && (
              <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#7C3AED', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                      {user.name?.charAt(0) || 'M'}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>{user.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>{workspace?.name}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#EF4444', borderRadius: '6px', padding: '6px 10px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <LogOut size={13} />
                  <span>Déconnexion</span>
                </button>
              </div>
            )}

            <a
              href="#accueil"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#0F172A', textDecoration: 'none', fontWeight: '700', fontSize: '1rem', padding: '6px 0' }}
            >
              Accueil
            </a>
            <a
              href="#avant-apres"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#0F172A', textDecoration: 'none', fontWeight: '700', fontSize: '1rem', padding: '6px 0' }}
            >
              Fonctionnalités
            </a>
            <a
              href="#tarifs"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#0F172A', textDecoration: 'none', fontWeight: '700', fontSize: '1rem', padding: '6px 0' }}
            >
              Tarifs (DT)
            </a>
            <a
              href="#temoignages"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#0F172A', textDecoration: 'none', fontWeight: '700', fontSize: '1rem', padding: '6px 0' }}
            >
              Témoignages
            </a>

            {!user && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#475569', textDecoration: 'none', fontWeight: '700', fontSize: '0.95rem', padding: '6px 0' }}
              >
                Connexion
              </Link>
            )}

            <div style={{ paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
              <Link
                href={user ? "/dashboard" : "/studio"}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  textDecoration: 'none',
                }}
              >
                <span>{user ? "Accéder à mon Dashboard" : "Créer ma première publicité"}</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          SECTION 2 : HERO SECTION & SHOWCASE TRANSFORMATION (ADORA-33)
          ========================================================================= */}
      <section
        id="accueil"
        style={{
          padding: '52px 0 70px',
          background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(124, 58, 237, 0.08) 0%, rgba(99, 102, 241, 0.03) 60%, #FFFFFF 100%)',
          position: 'relative',
        }}
      >
        <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div className="landing-hero-grid">
            
            {/* Colonne Gauche : Pitch & CTA */}
            <div className="landing-hero-left">
              {/* Pill badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#F5F3FF',
                  border: '1px solid #DDD6FE',
                  color: '#7C3AED',
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  marginBottom: '18px',
                }}
              >
                <Sparkles size={15} />
                <span>AI Creative Studio</span>
              </div>

              {/* Titre Principal H1 */}
              <h1 className="landing-h1" style={{ fontSize: '3.4rem', lineHeight: '1.14', fontWeight: '900', letterSpacing: '-0.03em', color: '#0F172A', marginBottom: '18px' }}>
                Crée des publicités qui vendent.{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block',
                  }}
                >
                  Avec l'IA.
                </span>
              </h1>

              {/* Description */}
              <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: '1.65', marginBottom: '28px', maxWidth: '520px' }}>
                Transforme simplement une photo de ton produit en visuels publicitaires professionnels pour Facebook, Instagram et TikTok.
              </p>

              {/* Dual Action Buttons */}
              <div className="landing-hero-cta-group" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <Link
                  href="/studio"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '13px 26px',
                    borderRadius: '9999px',
                    background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                    color: '#FFFFFF',
                    fontWeight: '800',
                    fontSize: '0.96rem',
                    textDecoration: 'none',
                    boxShadow: '0 8px 24px rgba(124, 58, 237, 0.35)',
                  }}
                >
                  <span>Créer ma première publicité</span>
                  <ArrowRight size={17} />
                </Link>

                <a
                  href="#comment-marche"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '13px 22px',
                    borderRadius: '9999px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#1E293B',
                    fontWeight: '700',
                    fontSize: '0.96rem',
                    textDecoration: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Play size={11} fill="#475569" color="#475569" style={{ marginLeft: '1px' }} />
                  </div>
                  <span>Voir comment ça marche</span>
                </a>
              </div>

              {/* Trust Badges Bar */}
              <div className="landing-hero-trust" style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '700', color: '#475569' }}>
                  <Zap size={15} color="#7C3AED" />
                  <span>Création en quelques secondes</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '700', color: '#475569' }}>
                  <Smartphone size={15} color="#7C3AED" />
                  <span>Formats réseaux sociaux</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '700', color: '#475569' }}>
                  <span style={{ fontSize: '0.95rem' }}>🇹🇳</span>
                  <span>Pensé pour les entreprises tunisiennes</span>
                </div>
              </div>
            </div>

            {/* Colonne Droite : Showcase Visuel Hero (Instagram Post & Stories) */}
            <div className="landing-hero-showcase" style={{ position: 'relative', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
              
              {/* Carte Principale : Mockup Réseaux Sociaux Réaliste */}
              <div
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.14)',
                  border: '1px solid #E2E8F0',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {/* Onglets de Statuts : Post Instagram vs Story Instagram */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#F8FAFC',
                    padding: '8px 10px',
                    borderBottom: '1px solid #E2E8F0',
                    gap: '6px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setHeroSocialStatus('instagram')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: heroSocialStatus === 'instagram' ? '#FFFFFF' : 'transparent',
                      color: heroSocialStatus === 'instagram' ? '#E1306C' : '#64748B',
                      boxShadow: heroSocialStatus === 'instagram' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <span>📸</span>
                    <span>Post Instagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHeroSocialStatus('story')}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      background: heroSocialStatus === 'story' ? '#FFFFFF' : 'transparent',
                      color: heroSocialStatus === 'story' ? '#833AB4' : '#64748B',
                      boxShadow: heroSocialStatus === 'story' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <span>📱</span>
                    <span>Story Instagram</span>
                  </button>
                </div>

                {/* ==============================================================
                    VUE 1 : POST INSTAGRAM OFFICIEL (FEED 1:1)
                    ============================================================== */}
                {heroSocialStatus === 'instagram' && (
                  <div>
                    {/* Header Instagram Post */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(45deg, #F58529, #D92E7F, #833AB4)',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.7rem', color: '#7C3AED' }}>
                            ER
                          </div>
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F172A' }}>eauderose.tunisie</span>
                            <span style={{ color: '#0095F6', fontSize: '0.76rem' }}>✓</span>
                          </div>
                          <div style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: '600' }}>
                            Sponsorisé • Tunisie 🇹🇳
                          </div>
                        </div>
                      </div>
                      <MoreHorizontal size={18} color="#94A3B8" style={{ cursor: 'pointer' }} />
                    </div>

                    {/* Visuel Adora Instagram (image.png en vedette) */}
                    <div style={{ position: 'relative', width: '100%', overflow: 'hidden', background: '#F8FAFC' }}>
                      <img
                        src="/images/image.png"
                        alt="Publicité Eau de Rose générée par Adora"
                        style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                      />

                      {/* Badge Adora IA */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          backdropFilter: 'blur(8px)',
                          color: '#FFFFFF',
                          padding: '5px 11px',
                          borderRadius: '20px',
                          fontSize: '0.68rem',
                          fontWeight: '800',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: '1px solid rgba(255,255,255,0.25)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        }}
                      >
                        <Sparkles size={12} color="#00E5FF" />
                        <span>Généré avec Adora</span>
                      </div>
                    </div>

                    {/* Barre d'Action Instagram (Likes, Commentaires, Partages) */}
                    <div style={{ padding: '12px 16px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (isLiked) {
                                setLikesCount((c) => c - 1);
                                setIsLiked(false);
                              } else {
                                setLikesCount((c) => c + 1);
                                setIsLiked(true);
                              }
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <Heart
                              size={22}
                              color={isLiked ? '#EF4444' : '#1E293B'}
                              fill={isLiked ? '#EF4444' : 'none'}
                              style={{ transition: 'transform 0.15s ease' }}
                            />
                          </button>
                          <MessageCircle size={21} color="#1E293B" style={{ cursor: 'pointer' }} />
                          <Send size={21} color="#1E293B" style={{ cursor: 'pointer' }} />
                        </div>
                        <Bookmark size={21} color="#1E293B" style={{ cursor: 'pointer' }} />
                      </div>

                      {/* Compteur de J'aime & Preuve Sociale */}
                      <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                        Aimé par <span style={{ fontWeight: '900' }}>sarra_med</span> et <span style={{ color: '#E1306C' }}>{likesCount.toLocaleString('fr-FR')} autres personnes</span>
                      </div>

                      {/* Ticker Live des Clients Convertis en Temps Réel */}
                      <div
                        style={{
                          background: 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)',
                          border: '1px solid #A7F3D0',
                          borderRadius: '12px',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '10px',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 10px #10B981' }} />
                          <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#065F46' }}>
                            {tunisianBuyers[activeBuyerIndex].name} ({tunisianBuyers[activeBuyerIndex].city}) vient de commander !
                          </span>
                        </div>
                        <span style={{ fontSize: '0.66rem', fontWeight: '700', color: '#059669', whiteSpace: 'nowrap' }}>
                          {tunisianBuyers[activeBuyerIndex].time}
                        </span>
                      </div>

                      {/* Légende Commerciale Darija & Conversion */}
                      <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: '1.45', marginBottom: '12px' }}>
                        <span style={{ fontWeight: '800', color: '#0F172A', marginRight: '6px' }}>eauderose.tunisie</span>
                        El parfum li y5allek tbrille ! ✨ Soldé -10% avec livraison rapide partout en Tunisie (24-48h). Khlas and el livrison 🇹🇳
                      </div>

                      {/* Bouton CTA d'Achat Direct */}
                      <Link
                        href="/studio"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '11px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                          color: '#FFFFFF',
                          fontWeight: '800',
                          fontSize: '0.82rem',
                          textDecoration: 'none',
                          boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                        }}
                      >
                        <ShoppingBag size={15} />
                        <span>Commander maintenant (Soldé -10%)</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* ==============================================================
                    VUE 2 : STORY INSTAGRAM OFFICIELLE (FORMAT MOBILE 9:16)
                    ============================================================== */}
                {heroSocialStatus === 'story' && (
                  <div style={{ position: 'relative', background: '#0F172A', color: '#FFF' }}>
                    {/* Story Dynamic Island / Notch */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px 2px', fontSize: '0.68rem', fontWeight: '800', color: 'rgba(255,255,255,0.7)' }}>
                      <span>09:41</span>
                      <div style={{ width: '48px', height: '12px', borderRadius: '10px', background: '#000', margin: '0 auto' }} />
                      <span>5G 🔋</span>
                    </div>

                    {/* Barres de progression Story */}
                    <div style={{ display: 'flex', gap: '4px', padding: '6px 14px 6px' }}>
                      <div style={{ flex: 1, height: '2.5px', background: '#FFFFFF', borderRadius: '2px' }} />
                      <div style={{ flex: 1, height: '2.5px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                      <div style={{ flex: 1, height: '2.5px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                    </div>

                    {/* Header Story */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(45deg, #F58529, #D92E7F, #833AB4)', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.62rem', color: '#7C3AED' }}>
                            ER
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: '800' }}>eauderose.tunisie</div>
                          <div style={{ fontSize: '0.64rem', color: 'rgba(255,255,255,0.7)' }}>Sponsorisé</div>
                        </div>
                      </div>
                      <X size={18} color="#FFF" style={{ cursor: 'pointer' }} />
                    </div>

                    {/* Image Story avec Stickers */}
                    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
                      <img
                        src="/images/image.png"
                        alt="Story Instagram Eau de Rose Adora"
                        style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                      />

                      {/* Interactive Story Stickers */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '14px',
                          left: '14px',
                          background: '#E11D48',
                          color: '#FFF',
                          padding: '5px 11px',
                          borderRadius: '8px',
                          fontSize: '0.72rem',
                          fontWeight: '900',
                          boxShadow: '0 4px 14px rgba(225, 29, 72, 0.45)',
                        }}
                      >
                        SOLDÉ -10% 🔥
                      </div>

                      <div
                        style={{
                          position: 'absolute',
                          bottom: '16px',
                          left: '14px',
                          right: '14px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.25)',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.9rem' }}>📦</span>
                          <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#FFF' }}>
                            {tunisianBuyers[activeBuyerIndex].name} ({tunisianBuyers[activeBuyerIndex].city}) vient de convertir
                          </span>
                        </div>
                        <span style={{ fontSize: '0.68rem', color: '#34D399', fontWeight: '800' }}>
                          +38 ventes
                        </span>
                      </div>
                    </div>

                    {/* Story Swipe-Up Action Bar */}
                    <div style={{ padding: '12px 14px 16px', background: '#0F172A', textAlign: 'center' }}>
                      <Link
                        href="/studio"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '11px',
                          borderRadius: '9999px',
                          background: '#FFFFFF',
                          color: '#0F172A',
                          fontWeight: '800',
                          fontSize: '0.82rem',
                          textDecoration: 'none',
                          boxShadow: '0 4px 14px rgba(255, 255, 255, 0.2)',
                        }}
                      >
                        <span>👆 Swipe up / Acheter en promo (-10%)</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                )}

              </div>

              {/* Floating Chip : Comparatif Photo Brute ➔ Adora */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-16px',
                  left: '-20px',
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '8px 12px',
                  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  zIndex: 2,
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0, border: '1px solid #E2E8F0' }}>
                  <img src="/images/adora_hero_perfume.jpg" alt="Photo brute originale" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div>
                  <div style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: '700' }}>Photo originale sans décor</div>
                  <div style={{ fontSize: '0.74rem', color: '#10B981', fontWeight: '800' }}>➔ Boostée par Adora en 3s ✨</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 : DUAL BLOCK - AVANT/APRÈS & STEPPER (ADORA-34)
          ========================================================================= */}
      <section
        id="avant-apres"
        style={{
          padding: '70px 0',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          <div className="landing-dual-grid">
            
            {/* Bloc Gauche : Avant / Après */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  marginBottom: '14px',
                }}
              >
                💡 Avant / Après
              </div>
              
              <h2 style={{ fontSize: '2.3rem', fontWeight: '900', letterSpacing: '-0.02em', lineHeight: '1.2', marginBottom: '14px', color: '#0F172A' }}>
                Une photo. Plusieurs publicités.<br />Zéro compétence en design.
              </h2>
              
              <p style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: '1.6', marginBottom: '28px' }}>
                Télécharge une photo de ton produit et laisse Adora créer des visuels professionnels, adaptés à ton objectif et à ton audience.
              </p>

              {/* Showcase Flow Avant -> Après */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                
                {/* Photo brute "Votre photo" */}
                <div
                  style={{
                    flex: '0 0 130px',
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div style={{ width: '100%', height: '130px', borderRadius: '10px', overflow: 'hidden', background: '#F1F5F9' }}>
                    <img
                      src="/images/adora_sneakers_clean.jpg"
                      alt="Votre photo"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#64748B', textAlign: 'center', marginTop: '6px' }}>
                    Votre photo
                  </div>
                </div>

                <div style={{ color: '#94A3B8', fontWeight: '900', fontSize: '1.3rem' }}>➔</div>

                {/* 3 Déclinaisons publicitaires */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: '10px', flex: 1, minWidth: '220px' }}>
                  
                  {/* Var 1: Nouvelle collection */}
                  <div
                    style={{
                      height: '165px',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                      border: '1px solid #CBD5E1',
                    }}
                  >
                    <img
                      src="/images/adora_sneakers_clean.jpg"
                      alt="Nouvelle Collection"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: '#0F172A',
                        color: '#FFF',
                        fontSize: '0.58rem',
                        fontWeight: '800',
                        padding: '3px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      NOUVELLE COLL.
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '6px',
                        left: '6px',
                        background: '#7C3AED',
                        color: '#FFF',
                        fontSize: '0.56rem',
                        fontWeight: '800',
                        padding: '3px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      Acheter
                    </div>
                  </div>

                  {/* Var 2: -30% Offre spéciale */}
                  <div
                    style={{
                      height: '165px',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                      border: '1px solid #CBD5E1',
                    }}
                  >
                    <img
                      src="/images/adora_sneakers_clean.jpg"
                      alt="-30% Offre spéciale"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: '#E11D48',
                        color: '#FFF',
                        fontSize: '0.58rem',
                        fontWeight: '800',
                        padding: '3px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      -30% Promo
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '6px',
                        left: '6px',
                        background: '#3B82F6',
                        color: '#FFF',
                        fontSize: '0.56rem',
                        fontWeight: '800',
                        padding: '3px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      Acheter
                    </div>
                  </div>

                  {/* Var 3: Style & Confort */}
                  <div
                    style={{
                      height: '165px',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
                      border: '1px solid #CBD5E1',
                    }}
                  >
                    <img
                      src="/images/adora_sneakers_clean.jpg"
                      alt="Style & Confort"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        background: '#D97706',
                        color: '#FFF',
                        fontSize: '0.58rem',
                        fontWeight: '800',
                        padding: '3px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      Style & Confort
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '6px',
                        left: '6px',
                        background: '#059669',
                        color: '#FFF',
                        fontSize: '0.56rem',
                        fontWeight: '800',
                        padding: '3px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      Acheter
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Bloc Droit : Comment ça marche ? (Stepper) */}
            <div
              id="comment-marche"
              style={{
                background: '#FFFFFF',
                borderRadius: '24px',
                padding: '32px 28px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
              }}
            >
              <h3 style={{ fontSize: '1.7rem', fontWeight: '900', color: '#0F172A', marginBottom: '24px' }}>
                Comment ça marche ?
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', marginBottom: '28px' }}>
                
                {/* Step 01 */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#EDE9FE',
                      color: '#7C3AED',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '900',
                      fontSize: '0.9rem',
                      flexShrink: 0,
                    }}
                  >
                    01
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '3px' }}>
                      Ajoute ton produit
                    </h4>
                    <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: '1.5' }}>
                      Télécharge une photo de ton produit en quelques secondes.
                    </p>
                  </div>
                </div>

                {/* Step 02 */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#EDE9FE',
                      color: '#7C3AED',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '900',
                      fontSize: '0.9rem',
                      flexShrink: 0,
                    }}
                  >
                    02
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '3px' }}>
                      Choisis ton objectif
                    </h4>
                    <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: '1.5' }}>
                      Vente, promotion, branding, réseaux sociaux...
                    </p>
                  </div>
                </div>

                {/* Step 03 */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: '#EDE9FE',
                      color: '#7C3AED',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '900',
                      fontSize: '0.9rem',
                      flexShrink: 0,
                    }}
                  >
                    03
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '3px' }}>
                      Laisse Adora créer
                    </h4>
                    <p style={{ fontSize: '0.86rem', color: '#64748B', lineHeight: '1.5' }}>
                      Plusieurs créations prêtes à publier.
                    </p>
                  </div>
                </div>

              </div>

              {/* CTA Stepper */}
              <Link
                href="/studio"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                }}
              >
                <span>Essayer Adora gratuitement</span>
                <ArrowRight size={17} />
              </Link>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4 : SÉLECTEUR DE SECTEURS & GALERIE (ADORA-35)
          ========================================================================= */}
      <section style={{ padding: '70px 0', background: '#FFFFFF' }}>
        <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          
          <div className="landing-sectors-grid">
            
            {/* Colonne Gauche : Puces Métiers & Note */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#FEE2E2',
                  color: '#E11D48',
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  marginBottom: '14px',
                }}
              >
                <span>🇹🇳</span>
                <span>Pensé pour les entrepreneurs tunisiens</span>
              </div>

              <h2 style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.02em', lineHeight: '1.2', color: '#0F172A', marginBottom: '14px' }}>
                Une solution pour tous les secteurs
              </h2>

              <p style={{ fontSize: '1.05rem', color: '#64748B', lineHeight: '1.6', marginBottom: '28px' }}>
                Que tu sois e-commerçant, commerçant, agence ou freelance, Adora t'aide à créer des publicités qui attirent et qui convertissent.
              </p>

              {/* Grille des 8 Secteurs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '28px' }}>
                {sectors.map((sector) => {
                  const Icon = sector.icon;
                  const isActive = activeSector === sector.id;
                  return (
                    <button
                      key={sector.id}
                      onClick={() => setActiveSector(sector.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '11px 12px',
                        borderRadius: '12px',
                        border: isActive ? '1.5px solid #7C3AED' : '1px solid #E2E8F0',
                        background: isActive ? '#F5F3FF' : '#FFFFFF',
                        color: isActive ? '#7C3AED' : '#334155',
                        fontWeight: '700',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          background: isActive ? '#EDE9FE' : '#F1F5F9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isActive ? '#7C3AED' : '#64748B',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={15} />
                      </div>
                      <span>{sector.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Note de réassurance */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  color: '#475569',
                  fontSize: '0.86rem',
                  lineHeight: '1.6',
                }}
              >
                <div style={{ fontWeight: '800', color: '#7C3AED', marginBottom: '3px' }}>
                  ✓ Pas besoin de Photoshop
                </div>
                <div style={{ fontWeight: '800', color: '#4F46E5', marginBottom: '3px' }}>
                  ✓ Pas besoin d'une agence
                </div>
                <div style={{ fontWeight: '800', color: '#0F172A' }}>
                  ✓ Pas besoin d'être designer
                </div>
              </div>
            </div>

            {/* Colonne Droite : Grille Galerie Visuelle (6 cartes) */}
            <div className="landing-gallery-cards">
              {galleryItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    height: '230px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: item.gradient,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      padding: '12px',
                      color: '#FFF',
                    }}
                  >
                    <div
                      style={{
                        alignSelf: 'flex-start',
                        background: 'rgba(0, 0, 0, 0.55)',
                        backdropFilter: 'blur(6px)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.62rem',
                        fontWeight: '700',
                      }}
                    >
                      {item.badge}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '900', lineHeight: 1.2, marginBottom: '6px' }}>
                        {item.title}
                      </div>
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.95)',
                          color: '#0F172A',
                          fontSize: '0.62rem',
                          fontWeight: '800',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          display: 'inline-block',
                        }}
                      >
                        {item.cta}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5 : GRILLE DES 5 FONCTIONNALITÉS CLÉS (ADORA-36)
          ========================================================================= */}
      <section
        style={{
          padding: '70px 0',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#EDE9FE',
              color: '#7C3AED',
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: '800',
              marginBottom: '14px',
            }}
          >
            🪄 Des fonctionnalités pensées pour toi
          </div>

          <h2 style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#0F172A', marginBottom: '40px' }}>
            Tout ce qu'il te faut pour créer, publier et analyser
          </h2>

          <div className="landing-features-grid">
            
            {/* Feature 1 */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '22px 18px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#EDE9FE',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Sparkles size={19} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                Créations IA
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: '1.5' }}>
                Des visuels qui correspondent à ton image, ton secteur et ton objectif.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '22px 18px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#EEF2FF',
                  color: '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Smartphone size={19} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                Formats réseaux
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: '1.5' }}>
                Instagram, Facebook, TikTok en un clic sans outil externe.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '22px 18px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#F0FDF4',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Database size={19} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                Catalogue produits
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: '1.5' }}>
                Retrouve tes produits et génère rapidement de nouvelles créations.
              </p>
            </div>

            {/* Feature 4 */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '22px 18px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <RefreshCw size={19} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                Génération variantes
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: '1.5' }}>
                Teste plusieurs idées marketing sans recommencer de zéro.
              </p>
            </div>

            {/* Feature 5 */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '22px 18px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <BarChart3 size={19} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
                Suivi performances
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: '1.5' }}>
                Comprends ce qui fonctionne et booste tes résultats e-commerce.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 6 : GRILLE TARIFAIRE EN TND (ADORA-37)
          ========================================================================= */}
      <section id="tarifs" style={{ padding: '70px 0', background: '#FFFFFF' }}>
        <div className="container" style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
          
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#EDE9FE',
              color: '#7C3AED',
              padding: '4px 14px',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: '800',
              marginBottom: '14px',
            }}
          >
            💳 Tarifs simples et transparents
          </div>

          <h2 style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#0F172A', marginBottom: '10px' }}>
            Choisis le plan qui te correspond
          </h2>

          <p style={{ fontSize: '1.05rem', color: '#64748B', marginBottom: '28px' }}>
            Commence gratuitement. Passe à Pro quand tu es prêt.
          </p>

          {/* Toggle Mensuel / Annuel */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#F1F5F9',
              padding: '4px',
              borderRadius: '9999px',
              marginBottom: '40px',
              border: '1px solid #E2E8F0',
            }}
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '8px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: billingCycle === 'monthly' ? '#4F46E5' : 'transparent',
                color: billingCycle === 'monthly' ? '#FFFFFF' : '#64748B',
                fontWeight: '800',
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              style={{
                padding: '8px 20px',
                borderRadius: '9999px',
                border: 'none',
                background: billingCycle === 'annual' ? '#4F46E5' : 'transparent',
                color: billingCycle === 'annual' ? '#FFFFFF' : '#64748B',
                fontWeight: '800',
                fontSize: '0.86rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <span>Annuel</span>
              <span
                style={{
                  background: '#10B981',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  fontWeight: '900',
                }}
              >
                -20%
              </span>
            </button>
          </div>

          {/* 3 Cartes Tarifaires */}
          <div className="landing-pricing-grid">
            
            {/* Plan 1 : Starter */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '30px 24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>
                  Starter
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '2.8rem', fontWeight: '900', color: '#0F172A' }}>
                    {billingCycle === 'monthly' ? '19' : '15'}
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>DT</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>/mois</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#7C3AED', marginBottom: '24px' }}>
                  30 crédits / mois
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#334155' }}>
                    <Check size={16} color="#16A34A" />
                    <span>Créations IA</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#334155' }}>
                    <Check size={16} color="#16A34A" />
                    <span>Formats réseaux sociaux</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#334155' }}>
                    <Check size={16} color="#16A34A" />
                    <span>Historique des créations</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout?plan=starter"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1.5px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                Choisir Starter
              </Link>
            </div>

            {/* Plan 2 : Pro */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '30px 24px',
                border: '2px solid #7C3AED',
                boxShadow: '0 12px 32px rgba(124, 58, 237, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-13px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: '900',
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Le plus populaire
              </div>

              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>
                  Pro
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '2.8rem', fontWeight: '900', color: '#0F172A' }}>
                    {billingCycle === 'monthly' ? '49' : '39'}
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>DT</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>/mois</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#7C3AED', marginBottom: '24px' }}>
                  100 crédits / mois
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#334155' }}>
                    <Check size={16} color="#7C3AED" />
                    <span><strong>Toutes les fonctionnalités Starter</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#334155' }}>
                    <Check size={16} color="#7C3AED" />
                    <span>Analytics de vente</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#334155' }}>
                    <Check size={16} color="#7C3AED" />
                    <span>Catalogue produits complet</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout?plan=pro"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '13px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
                }}
              >
                Choisir Pro
              </Link>
            </div>

            {/* Plan 3 : Agency */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '30px 24px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F172A', marginBottom: '8px' }}>
                  Agency
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '2.8rem', fontWeight: '900', color: '#0F172A' }}>
                    {billingCycle === 'monthly' ? '99' : '79'}
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>DT</span>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>/mois</span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#7C3AED', marginBottom: '24px' }}>
                  300 crédits / mois
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#334155' }}>
                    <Check size={16} color="#16A34A" />
                    <span><strong>Toutes les fonctionnalités Pro</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#334155' }}>
                    <Check size={16} color="#16A34A" />
                    <span>Multi-utilisateurs & clients</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#334155' }}>
                    <Check size={16} color="#16A34A" />
                    <span>Support prioritaire</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout?plan=agency"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1.5px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#0F172A',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                }}
              >
                Choisir Agency
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 7 : TÉMOIGNAGES CLIENTS (ADORA-38)
          ========================================================================= */}
      <section
        id="temoignages"
        style={{
          padding: '70px 0',
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#EEF2FF',
                color: '#4F46E5',
                padding: '4px 14px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: '800',
                marginBottom: '14px',
              }}
            >
              👥 Ils nous font confiance
            </div>

            <h2 style={{ fontSize: '2.4rem', fontWeight: '900', letterSpacing: '-0.02em', color: '#0F172A' }}>
              Déjà utilisé pour créer des publicités plus rapidement.
            </h2>
          </div>

          <div className="landing-testimonials-grid">
            
            {/* Testimonial 1 */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                padding: '26px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #F43F5E, #FB7185)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                    }}
                  >
                    SB
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F172A' }}>
                      Sarra Ben Ali
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      E-commerçante • Tunis
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "Grâce à Adora, je crée mes visuels en quelques minutes, c'est simple et efficace !"
                </p>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                padding: '26px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                    }}
                  >
                    YT
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F172A' }}>
                      Youssef Trabelsi
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      Agence marketing • Tunis
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "Un outil vraiment puissant. Mes clients adorent la qualité des créations."
                </p>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                padding: '26px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #10B981, #34D399)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFF',
                      fontWeight: '800',
                      fontSize: '0.95rem',
                    }}
                  >
                    LM
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0F172A' }}>
                      Leila Mahfoudh
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      Propriétaire boutique • Sousse
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "Je n'ai aucune compétence en design et pourtant je fais des pubs pro maintenant !"
                </p>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 8 : BANNIÈRE CTA SOMBRE & FOOTER (ADORA-39)
          ========================================================================= */}
      <section style={{ padding: '50px 0 36px', background: '#FFFFFF' }}>
        <div className="container" style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 20px' }}>
          
          {/* Bannière Pre-Footer Sombre */}
          <div className="landing-cta-banner">
            <div style={{ maxWidth: '420px' }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#FFFFFF', lineHeight: '1.25' }}>
                Ta prochaine publicité peut commencer avec une seule photo.
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: '#CBD5E1', fontSize: '0.9rem', fontWeight: '700' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#A78BFA' }}>1.</span>
                <span>Ajoute ton produit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#A78BFA' }}>2.</span>
                <span>Choisis ton objectif</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#A78BFA' }}>3.</span>
                <span>Adora s'occupe du reste</span>
              </div>
            </div>

            <div>
              <Link
                href="/studio"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 28px',
                  borderRadius: '9999px',
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
                  color: '#FFFFFF',
                  fontWeight: '800',
                  fontSize: '0.96rem',
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(124, 58, 237, 0.4)',
                }}
              >
                <span>Créer ma première publicité</span>
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          {/* Footer Officiel */}
          <footer className="landing-footer">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/images/Adora_logo.png"
                alt="Adora Logo"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  objectFit: 'contain',
                  background: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              />
              <span style={{ fontWeight: '900', fontSize: '1.15rem', color: '#0F172A' }}>Adora</span>
              <span style={{ color: '#94A3B8' }}>•</span>
              <span style={{ fontWeight: '600', color: '#64748B' }}>Crée. Publie. Vends.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#475569' }}>
                <span style={{ cursor: 'pointer', fontWeight: '700' }}>Instagram</span>
                <span style={{ cursor: 'pointer', fontWeight: '700' }}>Facebook</span>
                <span style={{ cursor: 'pointer', fontWeight: '700' }}>TikTok</span>
              </div>
              <span style={{ color: '#CBD5E1' }}>|</span>
              <div style={{ fontWeight: '700', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Made with</span>
                <span style={{ color: '#E11D48' }}>❤️</span>
                <span>in Tunisia</span>
                <span>🇹🇳</span>
              </div>
            </div>
          </footer>

        </div>
      </section>

    </div>
  );
}
