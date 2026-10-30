import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import WorkspaceSelector from '@/components/WorkspaceSelector';
import PricingTable from '@/components/PricingTable';
import { getCurrentSession } from '@/lib/auth';
import { Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Tarifs & Abonnements Studio IA — MarkMosaiq',
  description: 'Choisissez le forfait adapté à votre marque e-commerce : Starter, Pro ou Advanced. Paiement sécurisé via Whop.',
};

export default async function PricingPage() {
  const headerList = await headers();
  const rawCountry =
    headerList.get('x-vercel-ip-country') ||
    headerList.get('cf-ipcountry') ||
    headerList.get('x-country-code');

  const countryCode =
    rawCountry && rawCountry.length === 2 && rawCountry !== 'XX' && rawCountry !== 'OTHERS'
      ? rawCountry.toUpperCase()
      : undefined;

  let customerEmail: string | undefined = undefined;
  try {
    const session = await getCurrentSession();
    if (session?.user?.email) {
      customerEmail = session.user.email;
    }
  } catch (err) {
    // Visiteur non connecté
  }

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
            <span className="nav-breadcrumb-slash" style={{ color: 'rgba(255, 255, 255, 0.2)' }}>/</span>
            <span className="nav-breadcrumb-subtitle" style={{ fontSize: '0.88rem', color: '#00E5FF', fontWeight: 800 }}>Tarifs & Abonnements</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <WorkspaceSelector />
            <Link
              href="/studio"
              style={{
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #00E5FF, #3B82F6)',
                padding: '8px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontWeight: 800,
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 14px rgba(0, 229, 255, 0.3)',
              }}
            >
              Studio IA ➔
            </Link>
          </div>
        </div>
      </header>

      {/* HEADER SECTION */}
      <section style={{ padding: '44px 16px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 900,
              color: '#00E5FF',
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              padding: '6px 14px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              maxWidth: '100%',
            }}
          >
            <Sparkles size={14} color="#00E5FF" style={{ flexShrink: 0 }} />
            <span>Paiement International Sécurisé par Whop</span>
          </span>

          <h1
            style={{
              fontSize: 'clamp(1.85rem, 6vw, 3.1rem)',
              fontWeight: 900,
              margin: '20px 0 14px',
              lineHeight: 1.15,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
            }}
          >
            Des Forfaits Puissants pour Propulser Vos Ventes
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.92rem, 2.5vw, 1.05rem)',
              color: '#94A3B8',
              lineHeight: 1.6,
              margin: '0 auto',
              maxWidth: '640px',
            }}
          >
            Générez des mises en scène publicitaires ultra-réalistes, des déclinaisons lifestyle et des accroches en quelques secondes. Sans engagement, annulation à tout moment.
          </p>
        </div>
      </section>

      {/* CONTENU PRINCIPAL : TABLE DE TARIFICATION AVEC WHOP */}
      <main style={{ flex: 1, padding: '0 16px 64px', maxWidth: '1240px', margin: '0 auto', width: '100%' }}>
        <PricingTable countryCode={countryCode} customerEmail={customerEmail} />
      </main>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '32px 24px',
          textAlign: 'center',
          color: '#64748B',
          fontSize: '0.8rem',
          background: '#0B0E14',
          marginTop: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <img
            src="/images/logo.png"
            alt="MarkMosaiq Logo"
            style={{ width: '28px', height: '28px', borderRadius: '7px', objectFit: 'contain', background: '#FFFFFF' }}
          />
          <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#FFFFFF', letterSpacing: '-0.02em' }}>MarkMosaiq</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
          <span style={{ fontWeight: 700, color: '#00E5FF' }}>Whop Merchant of Record (Paiements Sécurisés)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', margin: '12px 0 8px' }}>
          <Link href="/terms" style={{ color: '#94A3B8', textDecoration: 'none', fontWeight: 600 }}>
            Conditions Générales (Terms)
          </Link>
          <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>•</span>
          <Link href="/privacy" style={{ color: '#94A3B8', textDecoration: 'none', fontWeight: 600 }}>
            Confidentialité (Privacy)
          </Link>
          <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>•</span>
          <Link href="/refunds" style={{ color: '#94A3B8', textDecoration: 'none', fontWeight: 600 }}>
            Politique de Remboursement (Refunds)
          </Link>
        </div>
        <p style={{ margin: '6px 0 0' }}>© 2026 MarkMosaiq AI — Studio E-commerce Haute Définition. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
