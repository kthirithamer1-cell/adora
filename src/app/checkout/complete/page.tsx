'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

function CheckoutCompleteContent() {
  const searchParams = useSearchParams();
  const packId = searchParams.get('pack') || 'pro';
  const receiptId = searchParams.get('receipt_id') || searchParams.get('receiptId') || '';

  const packNames: Record<string, string> = {
    flash: 'Starter Découverte (20 Crédits)',
    pro: 'Pro Lancement ⚡ (50 Crédits)',
    agency_299: 'Advanced Agence B2B (120 Crédits)',
  };

  const packName = packNames[packId] || 'Forfait MarkMosaiq Pro';

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#07090E',
        color: '#F8FAFC',
        fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* NAVBAR */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(11, 14, 20, 0.85)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '70px',
            padding: '0 24px',
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <img
                src="/images/logo.png"
                alt="MarkMosaiq Logo"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  objectFit: 'contain',
                  background: '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(0, 229, 255, 0.25)',
                }}
              />
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                MarkMosaiq
              </span>
            </Link>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>/</span>
            <span style={{ fontSize: '0.88rem', color: '#00E5FF', fontWeight: 800 }}>Commande Confirmée</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link
              href="/studio"
              style={{
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #00E5FF, #3B82F6)',
                padding: '8px 18px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.82rem',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(0, 229, 255, 0.3)',
              }}
            >
              Accéder au Studio ➔
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '560px',
            width: '100%',
            background: '#0B0E14',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: '24px',
            padding: '40px 36px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 229, 255, 0.08)',
            position: 'relative',
          }}
        >
          {/* Badge Succès */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '2px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 0 24px rgba(16, 185, 129, 0.35)',
            }}
          >
            <CheckCircle2 size={38} color="#10B981" />
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 900,
              color: '#10B981',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '4px 12px',
              borderRadius: '999px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            PAIEMENT CONFIRMÉ PAR WHOP
          </span>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '14px 0 8px', letterSpacing: '-0.02em' }}>
            Abonnement Activé avec Succès !
          </h1>

          <p style={{ fontSize: '0.92rem', color: '#94A3B8', margin: '0 0 28px', lineHeight: 1.5 }}>
            Votre souscription pour <strong>{packName}</strong> a été enregistrée. Vos crédits de mise en scène produit ont été ajoutés à votre boutique.
          </p>

          {/* RÉCAPITULATIF */}
          <div
            style={{
              background: '#131823',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '28px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Forfait souscrit :</span>
              <strong style={{ fontSize: '0.85rem', color: '#FFFFFF' }}>{packName}</strong>
            </div>
            {receiptId && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Reçu Whop :</span>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontFamily: 'monospace' }}>{receiptId}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Passerelle sécurisée :</span>
              <span style={{ fontSize: '0.78rem', color: '#00E5FF', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
                <ShieldCheck size={14} color="#00E5FF" /> Whop Merchant of Record
              </span>
            </div>
          </div>

          {/* ACTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link
              href="/studio"
              style={{
                background: 'linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%)',
                color: '#07090E',
                padding: '14px 20px',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '0.95rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 18px rgba(0, 229, 255, 0.4)',
              }}
            >
              <Sparkles size={18} color="#07090E" />
              <span>Générer des visuels dans le Studio IA</span>
              <ArrowRight size={18} color="#07090E" />
            </Link>

            <Link
              href="/studio"
              style={{
                background: 'transparent',
                color: '#94A3B8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px 20px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none',
              }}
            >
              Consulter mon tableau de bord & factures
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#07090E', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement...</div>}>
      <CheckoutCompleteContent />
    </Suspense>
  );
}
