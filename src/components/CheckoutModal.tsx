'use client';

import React, { useState, useEffect } from 'react';
import { WHOP_PLANS, formatCheckoutUrl } from '@/lib/whop';
import { Sparkles, Check, Zap, ArrowLeft, ArrowRight, ShieldCheck, X, CreditCard, Lock } from 'lucide-react';

export interface PlanOffer {
  id: string;
  name: string;
  subtitle: string;
  priceUSD: number;
  visualsCount: number;
  period: string;
  popular?: boolean;
  accentColor: string;
  badge?: string;
  features: string[];
}

export const AVAILABLE_PLANS: PlanOffer[] = [
  {
    id: 'flash',
    name: 'Starter Package',
    subtitle: 'Test and launch your hero product with 4K AI staging',
    priceUSD: 19,
    visualsCount: 20,
    period: 'One-time payment',
    accentColor: '#6366F1',
    badge: 'Fast Test',
    features: [
      '20 Commercial 4K Staged Visuals',
      'Feed (1:1) & Story (9:16) aspect ratios',
      'High-converting marketing ad captions',
      'Physical contact shadows & specular reflections',
      'Full commercial license & zero watermark',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Launch Pack ⚡',
    subtitle: 'The #1 choice for scaling brands on Meta & TikTok Ads',
    priceUSD: 49,
    visualsCount: 50,
    period: 'One-time payment',
    popular: true,
    accentColor: '#EC4899',
    badge: 'MOST POPULAR',
    features: [
      '50 Commercial 4K Staged Visuals',
      'All social formats (1:1, 9:16, 4:5, 16:9)',
      'Multi-angle staging & luxury pedestal styles',
      'Full Brand Kit integration with transparent watermark',
      'ZIP Archive bundle with ad copy ready to deploy',
      'Priority 24/7 Creator Support',
    ],
  },
  {
    id: 'agency_299',
    name: 'Advanced Agency 🏆',
    subtitle: 'For e-commerce agencies, operators & multi-store brands',
    priceUSD: 99,
    visualsCount: 120,
    period: 'per month',
    accentColor: '#F97316',
    badge: 'SCALE & B2B',
    features: [
      '120 Commercial 4K Credits / up to 480 Visuals',
      '100% White-Label Mode (Zero MarkMosaiq branding)',
      'Unlimited workspace team members',
      'Custom prompt injection & dedicated Art Director',
      'Automated batch catalog staging',
      'Dedicated VIP account manager',
    ],
  },
];

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  packId?: string;
  packName?: string;
  priceUSD?: number;
  priceTND?: number;
  visualsCount?: number;
  initialPlanId?: string;
  initialStep?: 'offers' | 'payment';
}

export default function CheckoutModal({
  isOpen,
  onClose,
  packId,
  packName,
  priceUSD,
  visualsCount,
  initialPlanId = 'pro',
  initialStep,
}: CheckoutModalProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(packId || initialPlanId || 'pro');
  const [step, setStep] = useState<'offers' | 'payment'>('offers');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialStep) {
        setStep(initialStep);
      } else if (packId) {
        setStep('payment');
        setSelectedPlanId(packId);
      } else {
        setStep('offers');
        setSelectedPlanId(initialPlanId || 'pro');
      }
      setError(null);
    }
  }, [isOpen, packId, initialStep, initialPlanId]);

  if (!isOpen) return null;

  const currentPlan = AVAILABLE_PLANS.find((p) => p.id === selectedPlanId) || AVAILABLE_PLANS[1];
  const whopPlan = WHOP_PLANS[currentPlan.id] || WHOP_PLANS['pro'];
  const finalPrice = priceUSD !== undefined && packId === selectedPlanId ? priceUSD : currentPlan.priceUSD;
  const finalName = packName && packId === selectedPlanId ? packName : currentPlan.name;
  const finalVisualsCount = visualsCount !== undefined && packId === selectedPlanId ? visualsCount : currentPlan.visualsCount;

  const handleLaunchWhopCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Appeler l'API officielle de création de commande (Crée la session Whop avec suivi workspace & webhook)
      const res = await fetch('/api/checkout/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packId: selectedPlanId,
          cycle: 'monthly',
          currency: 'USD',
          returnTo: '/studio',
        }),
      });

      const data = await res.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.code === 'ALREADY_SUBSCRIBED') {
        setError(`Votre espace dispose déjà d'un forfait ${currentPlan.name} actif.`);
        setIsLoading(false);
        return;
      }

      if (data.code === 'UNAUTHENTICATED') {
        window.location.href = `/checkout?pack=${selectedPlanId}`;
        return;
      }

      // 2. Fallback garanti vers la page de paiement officielle du plan Whop (jamais la home whop.com)
      const directUrl = whopPlan.checkoutUrl || formatCheckoutUrl(undefined, whopPlan.planId);
      if (directUrl) {
        window.location.href = directUrl;
        return;
      }

      throw new Error(data.error || 'Impossible d’ouvrir la session de paiement Whop.');
    } catch (err: any) {
      const directUrl = whopPlan.checkoutUrl || formatCheckoutUrl(undefined, whopPlan.planId);
      if (directUrl) {
        window.location.href = directUrl;
      } else {
        window.location.href = `/checkout?pack=${selectedPlanId}`;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
        fontFamily: 'Outfit, sans-serif',
      }}
    >
      <div
        className="responsive-modal-card"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          maxWidth: step === 'offers' ? '920px' : '520px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '30px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          color: '#0F172A',
          position: 'relative',
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            transition: 'all 0.2s',
          }}
        >
          <X size={18} />
        </button>

        {/* STEP 1: SELECT PLAN */}
        {step === 'offers' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '28px', maxWidth: '640px', margin: '0 auto 28px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  color: '#4F46E5',
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 800,
                  marginBottom: '10px',
                }}
              >
                <Sparkles size={14} />
                <span>WHOP MERCHANT OF RECORD • WORLDWIDE ACCESS</span>
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Unlock Commercial 4K Studio Credits
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Zero contracts, instant credit activation, and complete commercial rights for Meta, TikTok & Amazon Ads.
              </p>
            </div>

            {/* Plan Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '28px',
              }}
            >
              {AVAILABLE_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    style={{
                      border: `2px solid ${isSelected ? '#6366F1' : plan.popular ? '#C7D2FE' : '#E2E8F0'}`,
                      borderRadius: '16px',
                      padding: '22px 18px',
                      background: isSelected ? '#FAF5FF' : '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: isSelected
                        ? '0 8px 24px rgba(99, 102, 241, 0.18)'
                        : plan.popular
                          ? '0 4px 16px rgba(0, 0, 0, 0.05)'
                          : 'none',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'scale(1.02)' : 'none',
                    }}
                  >
                    {plan.badge && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-11px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: plan.popular
                            ? 'linear-gradient(135deg, #6366F1, #EC4899)'
                            : '#0F172A',
                          color: '#FFFFFF',
                          fontSize: '11px',
                          fontWeight: 900,
                          padding: '3px 12px',
                          borderRadius: '12px',
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      >
                        {plan.badge}
                      </div>
                    )}

                    <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px' }}>
                        {plan.name}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: 0, minHeight: '32px', lineHeight: 1.35 }}>
                        {plan.subtitle}
                      </p>
                    </div>

                    <div style={{ textAlign: 'center', margin: '8px 0 16px', padding: '12px 0', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '32px', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                        ${plan.priceUSD} <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 700 }}>USD</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>{plan.period}</div>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      {plan.features.map((feat, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: '#475569', lineHeight: 1.3 }}>
                          <Check size={14} color="#6366F1" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: isSelected ? 'none' : '1px solid #CBD5E1',
                        background: isSelected ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#0F172A',
                        fontWeight: 800,
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.25)' : 'none',
                      }}
                    >
                      {isSelected ? '✓ Selected Plan' : 'Select Plan'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Bottom confirmation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '20px',
                borderTop: '1px solid #E2E8F0',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} color="#10B981" />
                <span style={{ fontSize: '13px', color: '#64748B' }}>
                  Secure worldwide checkout powered by <strong>Whop Merchant of Record</strong>.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep('payment')}
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 35%, #EC4899 70%, #F97316 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '13px 26px',
                  fontWeight: 900,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                }}
              >
                <span>Continue to Checkout (${currentPlan.priceUSD} USD)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: WHOP CHECKOUT CONFIRMATION */}
        {step === 'payment' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <button
                  type="button"
                  onClick={() => setStep('offers')}
                  style={{
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#6366F1',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                    marginBottom: '8px',
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Choose Another Plan</span>
                </button>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '0 0 2px' }}>
                  Finalize {finalName}
                </h3>
                <span style={{ fontSize: '13px', color: '#64748B' }}>
                  Includes <strong>{finalVisualsCount} 4K AI Commercial Visuals</strong>
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '26px', fontWeight: 900, color: '#4F46E5', lineHeight: 1 }}>
                  ${finalPrice} USD
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>Whop Protected</div>
              </div>
            </div>

            {error && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECDD3',
                  color: '#991B1B',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLaunchWhopCheckout}>
              {/* Payment Methods Info */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Accepted Global Payment Methods :
                </label>
                <div className="responsive-2col-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '1.5px solid #10B981',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      color: '#047857',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <CreditCard size={18} color="#059669" />
                      <strong style={{ fontSize: '13px', color: '#0F172A' }}>Cards Worldwide</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#047857', fontWeight: 600 }}>
                      Visa, Mastercard, Amex, Discover
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      color: '#334155',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Zap size={18} color="#6366F1" />
                      <strong style={{ fontSize: '13px', color: '#0F172A' }}>Apple & Google Pay</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                      1-Tap Express Mobile Checkout
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Banner */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <Lock size={20} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.45 }}>
                  <strong style={{ color: '#0F172A', display: 'block', marginBottom: '2px' }}>
                    Whop Merchant of Record Guarantee
                  </strong>
                  Your purchase is processed on Whop's secure PCI-DSS Level 1 servers. Your MarkMosaiq credits are unlocked instantly upon confirmation.
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setStep('offers')}
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    borderRadius: '10px',
                    padding: '13px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 35%, #EC4899 70%, #F97316 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '13px',
                    fontWeight: 900,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                  }}
                >
                  {isLoading ? 'Opening Whop...' : `🛡️ Pay $${finalPrice} USD on Whop ➔`}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
