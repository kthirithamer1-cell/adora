'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { useLanguage } from '@/lib/LanguageContext';
import { PACKS, PACK_IDS, PackId, Cycle, Currency, formatPrice } from '@/config/packs';
import { normalizeCheckoutParams, buildCheckoutUrl } from '@/lib/checkout/params';
import { buildLoginUrl } from '@/lib/security/redirect';
import WhopCheckout from './WhopCheckout';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowLeft,
  LogIn,
  Loader2,
  Building2,
} from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { currentWorkspace, currentUser, isLoading: isAuthLoading } = useWorkspace();
  const { locale, setLocale } = useLanguage();
  const isFr = locale === 'fr';

  // 1. Normalization of query parameters per MM-102
  const normResult = normalizeCheckoutParams(searchParams, { country: null, annualEnabled: false });
  const initialPack: PackId = normResult.ok ? normResult.value.pack : 'pro';
  const initialCycle: Cycle = normResult.ok ? normResult.value.cycle : 'monthly';
  const initialCurrency: Currency = normResult.ok ? normResult.value.currency : 'USD';

  const [selectedPackId, setSelectedPackId] = useState<PackId>(initialPack);
  const [selectedCycle, setSelectedCycle] = useState<Cycle>(initialCycle);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(initialCurrency);

  const sessionId = searchParams.get('session');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGuest = !isAuthLoading && !currentUser;

  useEffect(() => {
    const norm = normalizeCheckoutParams(searchParams, { country: null, annualEnabled: false });
    if (norm.ok) {
      setSelectedPackId(norm.value.pack);
      setSelectedCycle(norm.value.cycle);
      setSelectedCurrency(norm.value.currency);
    }
  }, [searchParams]);

  const selectedPack = PACKS[selectedPackId] || PACKS.pro;
  const currentCheckoutUrl = buildCheckoutUrl({
    pack: selectedPackId,
    cycle: selectedCycle,
    currency: selectedCurrency,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If guest, redirect to login preserving returnTo checkout URL (MM-107)
    if (isGuest) {
      window.location.href = buildLoginUrl(currentCheckoutUrl);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/checkout/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: selectedPackId,
          cycle: selectedCycle,
          currency: 'USD',
          returnTo: '/studio',
        }),
      });

      const data = await res.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.code === 'ALREADY_SUBSCRIBED') {
        setError(
          isFr
            ? `Votre espace possède déjà un forfait ${selectedPack.name} actif.`
            : `Your workspace already has an active ${selectedPack.name} plan.`
        );
      } else if (data.code === 'UNAUTHENTICATED') {
        window.location.href = buildLoginUrl(currentCheckoutUrl);
      } else {
        throw new Error(
          data.error ||
            (isFr ? 'Erreur lors de la redirection vers Whop.' : 'Error redirecting to Whop checkout.')
        );
      }
    } catch (err: any) {
      setError(
        err.message ||
          (isFr
            ? 'Erreur lors de l’ouverture du paiement sécurisé Whop.'
            : 'Error opening secure Whop checkout.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const packColorMap: Record<PackId, string> = {
    free: '#10B981',
    flash: '#00E5FF',
    pro: '#7C3AED',
    agency_299: '#A855F7',
  };

  const packBadgeMap: Record<PackId, string> = isFr
    ? {
        free: 'GRATUIT',
        flash: 'STARTER LAUNCH',
        pro: 'PLUS POPULAIRE ⚡',
        agency_299: 'AGENCE & SCALE 🏆',
      }
    : {
        free: 'FREE TIER',
        flash: 'STARTER LAUNCH',
        pro: 'MOST POPULAR ⚡',
        agency_299: 'AGENCY & SCALE 🏆',
      };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', color: '#0F172A' }}>
      {/* DISTRACTION-FREE SECURE CHECKOUT HEADER */}
      <header style={{ borderBottom: '1px solid #E2E8F0', background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', padding: '0 20px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <img
                src="/images/logo.png"
                alt="MarkMosaiq Logo"
                style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'contain', background: '#FFFFFF', boxShadow: '0 2px 8px rgba(79, 70, 229, 0.15)' }}
              />
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>MarkMosaiq</span>
            </Link>
            <span className="nav-breadcrumb-slash" style={{ color: '#CBD5E1' }}>/</span>
            <span className="nav-breadcrumb-subtitle" style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>
              {isFr ? 'Passerelle Sécurisée' : 'Secure Checkout'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Language Switcher Pill */}
            <div style={{ display: 'inline-flex', background: '#F1F5F9', borderRadius: '999px', padding: '2px', border: '1px solid #E2E8F0' }}>
              <button
                type="button"
                onClick={() => setLocale('en')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: !isFr ? '#FFFFFF' : 'transparent',
                  color: !isFr ? '#0F172A' : '#64748B',
                  boxShadow: !isFr ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale('fr')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: isFr ? '#FFFFFF' : 'transparent',
                  color: isFr ? '#0F172A' : '#64748B',
                  boxShadow: isFr ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                FR
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '6px 12px', borderRadius: '20px' }}>
              <ShieldCheck size={16} color="#059669" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#065F46', whiteSpace: 'nowrap' }}>
                SSL 256-bit
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ flex: 1, padding: '36px 16px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div>
          <Link
            href="/studio"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', marginBottom: '20px' }}
          >
            <ArrowLeft size={16} /> {isFr ? 'Retour au Studio' : 'Back to Studio'}
          </Link>

          {/* GUEST BANNER (MM-107 AC1 & AC3) */}
          {isGuest && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(236, 72, 153, 0.06) 100%)',
              border: '1.5px solid #C7D2FE',
              borderRadius: '16px',
              padding: '18px 24px',
              marginBottom: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4F46E5',
                  flexShrink: 0,
                }}>
                  <LogIn size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                    {isFr ? 'Vous avez déjà un compte MarkMosaiq ?' : 'Already have a MarkMosaiq account?'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                    {isFr
                      ? 'Connectez-vous pour finaliser votre commande et rattacher vos crédits à votre espace existant.'
                      : 'Sign in to complete your order and attach your credits to your existing workspace.'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
                <Link
                  href={buildLoginUrl(currentCheckoutUrl)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    background: '#4F46E5',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '13px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  <span>{isFr ? 'Se connecter' : 'Sign In'}</span>
                  <span>➔</span>
                </Link>
                <Link
                  href={`/signup?redirect=${encodeURIComponent(currentCheckoutUrl)}&pack=${selectedPackId}&cycle=${selectedCycle}&currency=${selectedCurrency}`}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '13px',
                    textDecoration: 'none',
                  }}
                >
                  {isFr ? 'Créer un compte en 1 min' : 'Create an account in 1 min'}
                </Link>
              </div>
            </div>
          )}

          {/* AUTHENTICATED USER BANNER */}
          {currentUser && currentWorkspace && (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '14px 20px',
              marginBottom: '26px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#EEF2FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4F46E5',
                }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {isFr ? 'Espace de travail actif' : 'Active Workspace'}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                    {currentWorkspace.name}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>
                  {isFr ? 'Connecté en tant que' : 'Signed in as'}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>{currentUser.email}</span>
              </div>
            </div>
          )}

          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '6px', color: '#0F172A' }}>
            {isFr ? 'Finaliser Votre Commande de Visuels' : 'Complete Your Studio Plan Order'}
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.92rem', marginBottom: '28px' }}>
            {isFr ? (
              <>
                Activez vos crédits instantanément avec notre passerelle internationale certifiée{' '}
                <strong>Whop Commerce (Merchant of Record)</strong>.
              </>
            ) : (
              <>
                Activate your studio credits instantly via our certified international gateway{' '}
                <strong>Whop Commerce (Merchant of Record)</strong>.
              </>
            )}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '28px', alignItems: 'start' }}>
            {/* LEFT COLUMN: PLAN SELECTION (MM-102) */}
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', color: '#0F172A' }}>
                {isFr ? '1. Choisissez Votre Forfait' : '1. Choose Your Plan'}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {PACK_IDS.map((id) => {
                  const p = PACKS[id];
                  const isSelected = p.id === selectedPackId;
                  const priceMinor = p.priceMinor[selectedCycle][selectedCurrency];
                  const formatted = formatPrice(priceMinor, selectedCurrency);
                  const color = packColorMap[id];
                  const badge = packBadgeMap[id];
                  const featuresList = isFr ? p.featuresFr : p.features;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPackId(p.id)}
                      style={{
                        background: isSelected ? '#FFFFFF' : '#F8FAFC',
                        border: isSelected ? `2px solid ${color}` : '1px solid #E2E8F0',
                        borderRadius: '14px',
                        padding: '18px 20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? `0 8px 24px -4px ${color}30` : 'none',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 900, color, background: `${color}15`, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {badge}
                          </span>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '6px 0 2px', color: '#0F172A' }}>
                            {p.name}
                          </h3>
                          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                            {p.creditsPerMonth} {isFr ? 'Crédits Studio 4K / mois' : 'Studio 4K Credits / month'}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0F172A' }}>
                            {formatted}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Whop MoR Protection</div>
                        </div>
                      </div>

                      <ul style={{ margin: '10px 0 0', paddingLeft: '18px', fontSize: '0.8rem', color: '#475569', lineHeight: '1.6' }}>
                        {featuresList.slice(0, 3).map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Quality Guarantee */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <ShieldCheck size={18} color="#059669" />
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F172A' }}>
                    {isFr ? 'Garantie Qualité E-commerce MarkMosaiq' : 'MarkMosaiq E-Commerce Quality Guarantee'}
                  </div>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                  {isFr
                    ? "Tous nos visuels sont calibrés aux dimensions exactes Instagram (1080x1080) et Stories (1080x1920) avec respect des zones d'interaction et détourage physique net de vos articles."
                    : 'All visuals are calibrated to exact Instagram Feed (1080×1080) and Stories (1080×1920) dimensions with safe-zone compliance and pixel-accurate product preservation.'}
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: SUMMARY & SECURE CHECKOUT */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.06)',
            }}>
              {sessionId ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {isFr ? '2. Paiement Sécurisé Whop' : '2. Secure Whop Checkout'}
                    </h2>
                    <Link
                      href={currentCheckoutUrl}
                      style={{ fontSize: '0.8rem', color: '#64748B', textDecoration: 'none', fontWeight: 600 }}
                    >
                      {isFr ? '← Modifier ma commande' : '← Edit my order'}
                    </Link>
                  </div>
                  <WhopCheckout sessionId={sessionId} />
                </div>
              ) : (
                <>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', color: '#0F172A' }}>
                    {isFr ? '2. Récapitulatif & Paiement Sécurisé' : '2. Order Summary & Secure Payment'}
                  </h2>

                  {error && (
                    <div style={{ background: 'rgba(225, 29, 72, 0.15)', border: '1px solid #E11D48', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Whop Payment Methods */}
                    <div style={{ marginBottom: '18px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                        {isFr ? (
                          <>Paiement sécurisé via <strong>Whop Commerce (Merchant of Record)</strong> :</>
                        ) : (
                          <>Secure payment via <strong>Whop Commerce (Merchant of Record)</strong>:</>
                        )}
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div
                          style={{
                            background: '#F0FDF4',
                            border: '2px solid #10B981',
                            borderRadius: '12px',
                            padding: '14px 14px',
                            color: '#047857',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <CreditCard size={20} color="#059669" />
                              <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>
                                {isFr ? 'Cartes Bancaires' : 'Credit / Debit Cards'}
                              </strong>
                            </div>
                            <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#059669', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                              3D-SECURE 2.0
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: '#475569' }}>
                            Visa, Mastercard, Amex, Apple Pay & Google Pay.
                          </p>
                        </div>

                        <div
                          style={{
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            padding: '14px 14px',
                            color: '#64748B',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <Lock size={18} color="#6366F1" />
                            <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>
                              {isFr ? 'Protection Acheteur' : 'Buyer Protection'}
                            </strong>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748B' }}>
                            {isFr
                              ? 'Facture TVA officielle & conformité PCI-DSS Niveau 1.'
                              : 'Official VAT invoice & PCI-DSS Level 1 compliance.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: '#64748B' }}>
                        <span>{isFr ? 'Forfait sélectionné :' : 'Selected plan:'}</span>
                        <span style={{ color: '#0F172A', fontWeight: 700 }}>{selectedPack.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: '#64748B' }}>
                        <span>{isFr ? 'Crédits Studio 4K inclus :' : 'Included Studio 4K credits:'}</span>
                        <span style={{ color: '#0F172A', fontWeight: 700 }}>
                          {selectedPack.creditsPerMonth} {isFr ? 'crédits / mois' : 'credits / month'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: '#64748B' }}>
                        <span>{isFr ? 'Passerelle Certifiée :' : 'Certified Gateway:'}</span>
                        <span style={{ color: '#4F46E5', fontWeight: 700 }}>Whop (Merchant of Record Global)</span>
                      </div>
                      <div style={{ borderTop: '1px solid #E2E8F0', margin: '10px 0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                          {isFr ? 'Total à régler :' : 'Total due:'}
                        </span>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '1.65rem', fontWeight: 900, color: packColorMap[selectedPackId] }}>
                            {formatPrice(selectedPack.priceMinor[selectedCycle][selectedCurrency], selectedCurrency)}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>
                            {isFr ? '(TVA et conformité MoR incluses)' : '(Taxes & MoR compliance included)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 35%, #EC4899 70%, #F97316 100%)',
                        color: '#FFF',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '15px',
                        fontWeight: 900,
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 8px 24px -4px rgba(99, 102, 241, 0.4)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>{isFr ? 'Initialisation du paiement Whop…' : 'Initializing Whop checkout…'}</span>
                        </>
                      ) : isGuest ? (
                        <>
                          <LogIn size={18} />
                          <span>{isFr ? 'Se connecter pour payer via Whop ➔' : 'Sign in to pay via Whop ➔'}</span>
                        </>
                      ) : (
                        <>
                          <Lock size={18} />
                          <span>
                            {isFr ? 'Payer via Whop' : 'Pay via Whop'} (
                            {formatPrice(selectedPack.priceMinor[selectedCycle][selectedCurrency], selectedCurrency)}) ➔
                          </span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 600 }}>Loading your secure checkout…</p>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
