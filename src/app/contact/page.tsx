import React from 'react';
import Link from 'next/link';
import { Mail, MapPin, Building2, Phone, ShieldCheck, Clock, ArrowRight, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Contact Us — MarkMosaiq Technologies Ltd.',
  description:
    'Get in touch with MarkMosaiq Technologies Ltd. Reach out to our Dublin, Ireland headquarters for enterprise inquiries, creator support, and partnership opportunities.',
};

export default function ContactPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#07090E',
        color: '#FFFFFF',
        fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif",
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(7, 9, 14, 0.85)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img src="/images/logo.png" alt="MarkMosaiq" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.02em' }}>MarkMosaiq</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}>Home</Link>
            <Link href="/pricing" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 600 }}>Pricing</Link>
            <Link
              href="/studio"
              style={{
                background: 'linear-gradient(135deg, #00E5FF, #38BDF8)',
                color: '#07090E',
                fontWeight: 800,
                fontSize: '0.85rem',
                padding: '8px 18px',
                borderRadius: '9999px',
                textDecoration: 'none',
              }}
            >
              Launch Studio ➔
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '1100px', margin: '0 auto', padding: '60px 24px', width: '100%' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(0, 229, 255, 0.1)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              color: '#00E5FF',
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '16px',
            }}
          >
            <Building2 size={14} />
            <span>Official Corporate Headquarters</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 14px' }}>
            Contact <span style={{ background: 'linear-gradient(135deg, #00E5FF, #A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MarkMosaiq</span>
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Have questions about our AI product photography studio, bespoke retail integrations, or enterprise volume pricing? Our Dublin team is here to assist you.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {/* Card 1: Head Office Address */}
          <div
            style={{
              background: '#0B0E14',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(0, 229, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00E5FF',
              }}
            >
              <MapPin size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '6px 0 0' }}>Registered Office</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              <strong>MarkMosaiq Technologies Ltd.</strong><br />
              The Chase, Carmanhall Road<br />
              Sandyford Business Park<br />
              Dublin 18, D18 Y3X2<br />
              Ireland
            </p>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 'auto', paddingTop: '10px' }}>
              Company registered in Ireland • EU Member State
            </div>
          </div>

          {/* Card 2: Email & Support */}
          <div
            style={{
              background: '#0B0E14',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#A855F7',
              }}
            >
              <Mail size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '6px 0 0' }}>Email Contacts</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              <strong>General & Merchant Support:</strong><br />
              <a href="mailto:support@markmosaiq.ai" style={{ color: '#00E5FF', textDecoration: 'none' }}>support@markmosaiq.ai</a>
            </p>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.6, margin: '6px 0 0' }}>
              <strong>Privacy, GDPR & Legal:</strong><br />
              <a href="mailto:privacy@markmosaiq.ai" style={{ color: '#A855F7', textDecoration: 'none' }}>privacy@markmosaiq.ai</a>
            </p>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 'auto', paddingTop: '10px' }}>
              Average response time: &lt; 24 hours on business days
            </div>
          </div>

          {/* Card 3: Merchant of Record & Billing */}
          <div
            style={{
              background: '#0B0E14',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '6px 0 0' }}>Billing & Tax Inquiries</h3>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
              All international card transactions and EU VAT remittance (23% Irish standard rate) are processed via our certified Merchant of Record:
            </p>
            <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.88rem', marginTop: '4px' }}>
              Whop Inc. (Merchant of Record)
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 'auto', paddingTop: '10px' }}>
              Tax receipts, VAT reclaim IDs & commercial invoices generated automatically
            </div>
          </div>
        </div>

        {/* Reassurance Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 6px' }}>Ready to elevate your product catalog?</h3>
            <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.92rem' }}>
              Start for free with 5 complimentary 4K studio credits. No credit card required.
            </p>
          </div>
          <Link
            href="/signup?pack=free"
            style={{
              background: 'linear-gradient(135deg, #00E5FF, #38BDF8)',
              color: '#07090E',
              fontWeight: 900,
              padding: '12px 28px',
              borderRadius: '9999px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px rgba(0, 229, 255, 0.35)',
            }}
          >
            <span>Start Free Trial</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: '#05070B', padding: '24px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
            © 2026 MarkMosaiq Technologies Ltd. Dublin, Ireland. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '0.84rem' }}>
            <Link href="/terms" style={{ color: '#94A3B8', textDecoration: 'none' }}>Terms of Service</Link>
            <Link href="/privacy" style={{ color: '#94A3B8', textDecoration: 'none' }}>Privacy Policy (GDPR)</Link>
            <Link href="/contact" style={{ color: '#00E5FF', textDecoration: 'none', fontWeight: 700 }}>Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
