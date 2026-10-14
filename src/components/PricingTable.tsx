'use client';

import React, { useState, useEffect } from 'react';
import { TIERS, Tier } from '@/config/tiers';
import { getPaddleInstance, PaddlePricePreviewParams } from '@/lib/paddle-sdk';
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight, Loader2, Globe } from 'lucide-react';

interface PricingTableProps {
  countryCode?: string;
  customerEmail?: string;
}

export default function PricingTable({ countryCode, customerEmail }: PricingTableProps) {
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [loadingPrices, setLoadingPrices] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribingTier, setSubscribingTier] = useState<string | null>(null);

  // Fetch Paddle localized prices via Paddle.PricePreview()
  useEffect(() => {
    let isCancelled = false;

    async function loadLocalizedPrices() {
      setLoadingPrices(true);
      setError(null);

      try {
        const paddle = await getPaddleInstance();

        // Construit les items avec les price IDs correspondants au cycle sélectionné
        const items = TIERS.map((tier) => ({
          priceId: tier.priceId[billingCycle],
          quantity: 1,
        }));

        // Si countryCode est détecté côté serveur (code ISO 2 lettres), on le passe.
        // Tarification demandée en Dollar USD ($)
        const params: PaddlePricePreviewParams = {
          items,
          currencyCode: 'USD',
        };
        if (countryCode && countryCode.length === 2 && countryCode !== 'OTHERS') {
          params.address = { countryCode: countryCode.toUpperCase() };
        }

        const previewResponse = await paddle.PricePreview(params);

        if (isCancelled) return;

        const lineItems = previewResponse?.data?.details?.lineItems || [];
        const mappedPrices: Record<string, string> = {};

        TIERS.forEach((tier) => {
          const expectedPriceId = tier.priceId[billingCycle];
          const matchedItem = lineItems.find(
            (item: any) => item.price?.id === expectedPriceId || item.priceId === expectedPriceId
          );

          if (matchedItem?.formattedTotals?.total) {
            // Affiche STRICTEMENT le total formaté par Paddle — aucun recalcul, aucun formattage
            mappedPrices[tier.name] = matchedItem.formattedTotals.total;
          } else {
            // Tarif officiel configuré : $19 (Starter), $49 (Pro), $100 (Advanced)
            mappedPrices[tier.name] = tier.priceUSD[billingCycle];
          }
        });

        setPrices(mappedPrices);
      } catch (err: any) {
        if (!isCancelled) {
          console.error('[Paddle PricePreview Error]:', err);
          setError(
            err.message || 'Impossible de charger les prix localisés. Vous pouvez continuer vers le checkout sécurisé.'
          );
        }
      } finally {
        if (!isCancelled) {
          setLoadingPrices(false);
        }
      }
    }

    loadLocalizedPrices();

    return () => {
      isCancelled = true;
    };
  }, [billingCycle, countryCode]);

  // Ouverture du checkout Paddle en overlay one-page
  const handleSubscribe = async (tier: Tier) => {
    try {
      setSubscribingTier(tier.name);
      const paddle = await getPaddleInstance();
      const selectedPriceId = tier.priceId[billingCycle];

      paddle.Checkout.open({
        items: [{ priceId: selectedPriceId, quantity: 1 }],
        customer: customerEmail ? { email: customerEmail } : undefined,
        settings: {
          displayMode: 'overlay',
          variant: 'one-page',
          theme: 'dark',
          locale: 'fr',
          successUrl: `${window.location.origin}/welcome`,
        },
      });
    } catch (checkoutErr: any) {
      console.error('[Paddle Checkout Error]:', checkoutErr);
      alert(checkoutErr.message || 'Erreur lors de l’ouverture du checkout Paddle.');
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
        {/* Badge pays détecté */}
        {countryCode && countryCode.length === 2 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#00E5FF',
              background: 'rgba(0, 229, 255, 0.08)',
              border: '1px solid rgba(0, 229, 255, 0.25)',
              padding: '4px 14px',
              borderRadius: '999px',
            }}
          >
            <Globe size={13} color="#00E5FF" />
            <span>Tarifs automatiques pour votre pays ({countryCode})</span>
          </div>
        )}

        {/* Toggle Facturation */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: '#131823',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '999px',
            padding: '4px',
            position: 'relative',
          }}
        >
          <button
            type="button"
            onClick={() => setBillingCycle('month')}
            style={{
              background: billingCycle === 'month' ? 'linear-gradient(135deg, #00E5FF, #3B82F6)' : 'transparent',
              color: billingCycle === 'month' ? '#07090E' : '#94A3B8',
              border: 'none',
              borderRadius: '999px',
              padding: '8px 20px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Mensuel
          </button>

          <button
            type="button"
            onClick={() => setBillingCycle('year')}
            style={{
              background: billingCycle === 'year' ? 'linear-gradient(135deg, #00E5FF, #3B82F6)' : 'transparent',
              color: billingCycle === 'year' ? '#07090E' : '#94A3B8',
              border: 'none',
              borderRadius: '999px',
              padding: '8px 20px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>Annuel</span>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 900,
                color: billingCycle === 'year' ? '#07090E' : '#10B981',
                background: billingCycle === 'year' ? 'rgba(7, 9, 14, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                padding: '2px 6px',
                borderRadius: '6px',
              }}
            >
              ÉCONOMIE 20%
            </span>
          </button>
        </div>
      </div>

      {/* MESSAGE D'ERREUR ÉVENTUEL */}
      {error && (
        <div
          style={{
            maxWidth: '680px',
            margin: '0 auto 24px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '12px 18px',
            color: '#FCA5A5',
            fontSize: '0.84rem',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {/* GRILLE DES 3 TIERS (STARTER, PRO, ADVANCED) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          maxWidth: '1160px',
          margin: '0 auto',
          alignItems: 'stretch',
        }}
      >
        {TIERS.map((tier) => {
          const isHighlighted = tier.highlight;
          const displayPrice = prices[tier.name];

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

              {/* ZONE DE PRIX LOCALISÉ DEPUIS PADDLE */}
              <div
                style={{
                  marginBottom: '28px',
                  paddingBottom: '24px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {loadingPrices ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '48px' }}>
                    <Loader2 size={20} color="#00E5FF" className="animate-spin" />
                    <span style={{ fontSize: '0.86rem', color: '#64748B' }}>Calcul du prix localisé…</span>
                  </div>
                ) : (
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
                      {displayPrice || '—'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '6px' }}>
                      facturé {billingCycle === 'month' ? 'par mois' : 'par an'} via Paddle
                    </div>
                  </div>
                )}
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

              {/* BOUTON SUBSCRIBE -> PADDLE CHECKOUT OVERLAY ONE-PAGE */}
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
                    <span>Ouverture de Paddle…</span>
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

      {/* RASSURANCE PADDLE CHECKOUT */}
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
          <ShieldCheck size={16} color="#10B981" /> Paiement sécurisé Paddle (MoR)
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
