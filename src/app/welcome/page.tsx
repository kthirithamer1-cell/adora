'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap, Layers } from 'lucide-react';
import WorkspaceSelector from '@/components/WorkspaceSelector';

export default function WelcomePage() {
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
            <span style={{ fontSize: '0.88rem', color: '#00E5FF', fontWeight: 800 }}>Bienvenue</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <WorkspaceSelector />
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
              Studio IA ➔
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENU BIENVENUE */}
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
            maxWidth: '580px',
            width: '100%',
            background: '#0B0E14',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: '24px',
            padding: '44px 36px',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 229, 255, 0.1)',
            position: 'relative',
          }}
        >
          {/* Badge Succès */}
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '2px solid #10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 0 28px rgba(16, 185, 129, 0.4)',
            }}
          >
            <CheckCircle2 size={40} color="#10B981" />
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 900,
              color: '#10B981',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              padding: '4px 14px',
              borderRadius: '999px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            SOUSCRIPTION ACTIVÉE
          </span>

          <h1 style={{ fontSize: '2.1rem', fontWeight: 900, margin: '16px 0 10px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Bienvenue dans MarkMosaiq Studio !
          </h1>

          <p style={{ fontSize: '0.94rem', color: '#94A3B8', margin: '0 0 30px', lineHeight: 1.55 }}>
            Votre abonnement a été activé avec succès via <strong>Whop Checkout</strong>. Vos crédits de mise en scène produit sont prêts à être utilisés.
          </p>

          {/* RASSURANCE & AVANTAGES */}
          <div
            style={{
              background: '#131823',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '20px 24px',
              marginBottom: '32px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={18} color="#00E5FF" />
              <span style={{ fontSize: '0.86rem', color: '#E2E8F0', fontWeight: 700 }}>
                Crédits immédiatement disponibles sur votre boutique
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={18} color="#A855F7" />
              <span style={{ fontSize: '0.86rem', color: '#E2E8F0', fontWeight: 700 }}>
                Détourage HD & Génération multi-formats Feed 1:1 & Stories 9:16
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={18} color="#10B981" />
              <span style={{ fontSize: '0.86rem', color: '#E2E8F0', fontWeight: 700 }}>
                Facture officielle envoyée par e-mail avec gestion automatique de la TVA
              </span>
            </div>
          </div>

          {/* BOUTONS D'ACTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link
              href="/studio"
              style={{
                background: 'linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%)',
                color: '#07090E',
                padding: '14px 22px',
                borderRadius: '12px',
                fontWeight: 900,
                fontSize: '0.96rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 20px rgba(0, 229, 255, 0.4)',
              }}
            >
              <Sparkles size={18} color="#07090E" />
              <span>Lancer le Studio IA</span>
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
                fontSize: '0.86rem',
                textDecoration: 'none',
              }}
            >
              Accéder au Tableau de Bord
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
