import React from 'react';
import Link from 'next/link';
import { ShieldCheck, FileText, Lock, RotateCcw, ExternalLink, HelpCircle, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import WorkspaceSelector from '@/components/WorkspaceSelector';

export interface TocItem {
  id: string;
  title: string;
}

interface LegalLayoutProps {
  currentTab: 'terms' | 'privacy' | 'refunds';
  title: string;
  subtitle: string;
  lastUpdated: string;
  toc: TocItem[];
  children: React.ReactNode;
}

export default function LegalLayout({
  currentTab,
  title,
  subtitle,
  lastUpdated,
  toc,
  children,
}: LegalLayoutProps) {
  const tabs = [
    { id: 'terms', label: 'Conditions Générales (Terms)', href: '/terms', icon: FileText },
    { id: 'privacy', label: 'Politique de Confidentialité (Privacy)', href: '/privacy', icon: Lock },
    { id: 'refunds', label: 'Politique de Remboursement (Refunds)', href: '/refunds', icon: RotateCcw },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07090E',
        color: '#F8FAFC',
        fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Background glow effects */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '900px',
          height: '420px',
          background: 'radial-gradient(ellipse at top, rgba(0, 229, 255, 0.07) 0%, rgba(124, 58, 237, 0.05) 50%, transparent 75%)',
          pointerEvents: 'none',
          filter: 'blur(70px)',
          zIndex: 0,
        }}
      />

      {/* HEADER / NAVBAR */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(11, 14, 20, 0.88)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '0 24px',
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
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
            <span style={{ fontSize: '0.88rem', color: '#00E5FF', fontWeight: 800 }}>Centre Légal & Conformité</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/pricing"
              style={{
                color: '#94A3B8',
                fontSize: '0.86rem',
                fontWeight: 700,
                textDecoration: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
              }}
            >
              Tarifs
            </Link>
            <Link
              href="/studio"
              style={{
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #00E5FF, #3B82F6)',
                padding: '8px 18px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.84rem',
                fontWeight: 800,
                boxShadow: '0 4px 14px rgba(0, 229, 255, 0.3)',
              }}
            >
              Studio IA ➔
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section style={{ padding: '50px 24px 30px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1160px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              color: '#00E5FF',
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '16px',
            }}
          >
            <ShieldCheck size={15} />
            <span>Conformité E-commerce & Whop Merchant of Record</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              marginBottom: '14px',
            }}
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: '#94A3B8',
              maxWidth: '740px',
              margin: '0 auto 16px',
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '0.82rem',
              color: '#64748B',
              fontWeight: 600,
            }}
          >
            <span>Dernière mise à jour : {lastUpdated}</span>
            <span>•</span>
            <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={13} /> Document en vigueur
            </span>
          </div>

          {/* TAB NAVIGATION BUTTONS */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '36px',
              flexWrap: 'wrap',
            }}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === currentTab;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    border: isActive
                      ? '1px solid #00E5FF'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isActive
                      ? 'rgba(0, 229, 255, 0.12)'
                      : 'rgba(11, 14, 20, 0.7)',
                    color: isActive ? '#00E5FF' : '#94A3B8',
                    boxShadow: isActive ? '0 0 20px rgba(0, 229, 255, 0.2)' : 'none',
                  }}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div
        style={{
          flex: 1,
          maxWidth: '1160px',
          width: '100%',
          margin: '0 auto',
          padding: '20px 24px 80px',
          display: 'grid',
          gridTemplateColumns: '290px 1fr',
          gap: '36px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* SIDEBAR: TABLE OF CONTENTS & QUICK CONTACT */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              position: 'sticky',
              top: '90px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Table of contents card */}
            <div
              style={{
                background: 'rgba(11, 14, 20, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div
                style={{
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#00E5FF',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <FileText size={14} />
                <span>Sommaire du document</span>
              </div>

              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {toc.map((item, index) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    style={{
                      fontSize: '0.84rem',
                      color: '#94A3B8',
                      textDecoration: 'none',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      lineHeight: 1.4,
                      transition: 'all 0.15s ease',
                      borderLeft: '2px solid transparent',
                    }}
                  >
                    <span style={{ color: 'rgba(255,255,255,0.3)', marginRight: '6px', fontSize: '0.78rem' }}>
                      {String(index + 1).padStart(2, '0')}.
                    </span>
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>

            {/* Merchant of record / Contact badge */}
            <div
              style={{
                background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(11, 14, 20, 0.9) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontWeight: 800, fontSize: '0.88rem', marginBottom: '8px' }}>
                <ShieldCheck size={18} />
                <span>Paiements Sécurisés</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
                Transactions internationales traitées par <strong>Whop Inc.</strong>, Merchant of Record officiel, garantissant conformité fiscale et protection de l’acheteur.
              </p>
            </div>

            {/* Direct support box */}
            <div
              style={{
                background: 'rgba(11, 14, 20, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF', fontWeight: 800, fontSize: '0.88rem', marginBottom: '6px' }}>
                <Mail size={16} color="#00E5FF" />
                <span>Une question juridique ?</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '12px' }}>
                Notre équipe de support et conformité vous répond sous 24h ouvrées.
              </p>
              <a
                href="mailto:support@MarkMosaiq.ai"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#00E5FF',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                }}
              >
                support@MarkMosaiq.ai ➔
              </a>
            </div>
          </div>
        </aside>

        {/* MAIN PROSE CONTENT */}
        <main
          style={{
            background: 'rgba(11, 14, 20, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '36px 40px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            minWidth: 0,
          }}
        >
          {children}
        </main>
      </div>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#0B0E14',
          padding: '36px 24px',
          color: '#64748B',
          fontSize: '0.82rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: '1160px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src="/images/logo.png"
                alt="MarkMosaiq Logo"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '7px',
                  objectFit: 'contain',
                  background: '#FFFFFF',
                }}
              />
              <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                MarkMosaiq
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
              <span style={{ color: '#94A3B8' }}>Studio d'IA E-commerce & Mises en scène publicitaires</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <Link href="/terms" style={{ color: currentTab === 'terms' ? '#00E5FF' : '#94A3B8', textDecoration: 'none', fontWeight: 700 }}>
                Conditions Générales
              </Link>
              <Link href="/privacy" style={{ color: currentTab === 'privacy' ? '#00E5FF' : '#94A3B8', textDecoration: 'none', fontWeight: 700 }}>
                Politique de Confidentialité
              </Link>
              <Link href="/refunds" style={{ color: currentTab === 'refunds' ? '#00E5FF' : '#94A3B8', textDecoration: 'none', fontWeight: 700 }}>
                Politique de Remboursement
              </Link>
              <Link href="/pricing" style={{ color: '#94A3B8', textDecoration: 'none', fontWeight: 700 }}>
                Tarifs
              </Link>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              fontSize: '0.78rem',
            }}
          >
            <p style={{ margin: 0 }}>
              © 2026 MarkMosaiq AI. Tous droits réservés. Paiements internationaux hébergés et certifiés par Whop (Merchant of Record).
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Développé pour l'E-commerce en Tunisie 🇹🇳 & à l'International</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
