'use client';

import React, { useState } from 'react';
import { TIERS, Tier } from '@/config/tiers';
import { PACKS, formatPrice, PackId } from '@/config/packs';
import { buildCheckoutUrl } from '@/lib/checkout/params';
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

interface PricingTableProps {
  countryCode?: string;
  customerEmail?: string;
}

export default function PricingTable({ countryCode, customerEmail }: PricingTableProps) {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [subscribingTier, setSubscribingTier] = useState<string | null>(null);

  // Redirection vers le checkout canonique
  const handleSubscribe = async (tier: Tier) => {
    try {
      setSubscribingTier(tier.name);
      const packMap: Record<string, PackId> = {
        Starter: 'flash',
        Pro: 'pro',
        Advanced: 'agency_299',
      };
      const packId: PackId = packMap[tier.name] || 'pro';
      const cycle = billingCycle === 'year' ? 'annual' : 'monthly';
      const currency = 'USD';

      // Enregistre l'intention dans le cookie signé mm_intent
      try {
        await fetch('/api/checkout/intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pack: packId, cycle, currency }),
        });
      } catch {
        // Continue even if pre-fetch fails
      }

      window.location.href = buildCheckoutUrl({ pack: packId, cycle, currency });
    } catch (checkoutErr: any) {
      console.error('[Checkout Error]:', checkoutErr);
      alert(checkoutErr.message || 'Erreur lors de la redirection vers le paiement.');
    } finally {
      setSubscribingTier(null);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* LOCALISATION & TOGGLE MENSUEL / ANNUEL */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#0E131F',
            borderRadius: '999px',
            padding: '4px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => setBillingCycle('month')}
            style={{
              padding: '10px 18px',
              borderRadius: '999px',
              fontSize: '0.84rem',
              fontWeight: 800,
              background: billingCycle === 'month' ? 'linear-gradient(135deg, #00E5FF, #3B82F6)' : 'transparent',
              color: billingCycle === 'month' ? '#07090E' : '#94A3B8',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Facturation Mensuelle
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('year')}
            style={{
              padding: '10px 18px',
              borderRadius: '999px',
              fontSize: '0.84rem',
              fontWeight: 800,
              background: billingCycle === 'year' ? 'linear-gradient(135deg, #00E5FF, #3B82F6)' : 'transparent',
              color: billingCycle === 'year' ? '#07090E' : '#94A3B8',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>Facturation Annuelle</span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 900,
                color: '#10B981',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              ÉCONOMIE 20%
            </span>
          </button>
        </div>
      </div>

      {/* GRILLE DES 3 TIERS (STARTER, PRO, ADVANCED) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '24px',
          maxWidth: '1160px',
          margin: '0 auto',
          alignItems: 'stretch',
        }}
      >
        {TIERS.map((tier) => {
          const isHighlighted = tier.highlight;
          const displayPrice = tier.priceUSD[billingCycle];

          return (
            <div
              key={tier.name}
              style={{
                background: isHighlighted ? '#0E131F' : '#0B0E14',
                border: isHighlighted
                  ? '2px solid #00E5FF'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: isHighlighted
                  ? '0 20px 50px rgba(0, 229, 255, 0.15), 0 0 20px rgba(0, 229, 255, 0.1)'
                  : '0 10px 30px rgba(0, 0, 0, 0.4)',
                transform: isHighlighted ? 'translateY(-6px)' : 'none',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Badge Forfait */}
              {tier.badge && (
                <div style={{ marginBottom: '12px' }}>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 900,
                      color: isHighlighted ? '#07090E' : '#00E5FF',
                      background: isHighlighted ? '#00E5FF' : 'rgba(0, 229, 255, 0.12)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {tier.badge}
                  </span>
                </div>
              )}

              <h3
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 900,
                  margin: '0 0 8px',
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                }}
              >
                {tier.name}
              </h3>

              <p
                style={{
                  fontSize: '0.86rem',
                  color: '#94A3B8',
                  minHeight: '42px',
                  margin: '0 0 24px',
                  lineHeight: 1.45,
                }}
              >
                {tier.description}
              </p>

              {/* ZONE DE PRIX */}
              <div
                style={{
                  marginBottom: '28px',
                  paddingBottom: '24px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '2.4rem',
                      fontWeight: 900,
                      color: isHighlighted ? '#00E5FF' : '#FFFFFF',
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {displayPrice}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px' }}>
                    facturé {billingCycle === 'month' ? 'par mois' : 'par an'} via Whop MoR
                  </div>
                </div>
              </div>

              {/* LISTE DES FONCTIONNALITÉS */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  flex: 1,
                }}
              >
                {tier.features.map((feat, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontSize: '0.84rem',
                      color: '#E2E8F0',
                      lineHeight: 1.4,
                    }}
                  >
                    <Check
                      size={16}
                      color={isHighlighted ? '#00E5FF' : '#10B981'}
                      style={{ flexShrink: 0, marginTop: '2px' }}
                    />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* BOUTON SUBSCRIBE */}
              <button
                type="button"
                onClick={() => handleSubscribe(tier)}
                disabled={subscribingTier === tier.name}
                style={{
                  width: '100%',
                  background: isHighlighted
                    ? 'linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%)'
                    : 'linear-gradient(135deg, #1E293B, #0F172A)',
                  color: isHighlighted ? '#07090E' : '#FFFFFF',
                  border: isHighlighted ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '0.92rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: isHighlighted ? '0 6px 20px rgba(0, 229, 255, 0.4)' : 'none',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {subscribingTier === tier.name ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Redirection vers Whop…</span>
                  </>
                ) : (
                  <>
                    <span>S’abonner à {tier.name}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* RASSURANCE WHOP CHECKOUT */}
      <div
        style={{
          marginTop: '48px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '18px',
          flexWrap: 'wrap',
          color: '#64748B',
          fontSize: '0.8rem',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={16} color="#10B981" /> Paiement sécurisé Whop (Merchant of Record)
        </span>
        <span>•</span>
        <span>Cartes Bancaires Internationales (Visa, Mastercard, Amex)</span>
        <span>•</span>
        <span>Apple Pay & Google Pay</span>
        <span>•</span>
        <span>Annulation simple en 1 clic</span>
      </div>
    </div>
  );
}
