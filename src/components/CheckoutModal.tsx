'use client';

import React, { useState, useEffect } from 'react';
import { PaymentGateway } from '@/lib/payment';
import { usePaddle } from '@/lib/usePaddle';
import { PADDLE_PLANS } from '@/lib/paddle';
import { Sparkles, Check, Crown, Zap, Building2, ArrowLeft, ArrowRight, ShieldCheck, X, CreditCard, Smartphone, FileText, Globe } from 'lucide-react';

export interface PlanOffer {
  id: string;
  name: string;
  subtitle: string;
  priceTND: number;
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
    name: 'Pack Flash Découverte',
    subtitle: 'Pour tester et lancer 1 produit rapidement',
    priceTND: 29,
    visualsCount: 10,
    period: 'Paiement unique',
    accentColor: '#00E5FF',
    badge: 'Idéal Test',
    features: [
      '10 Visuels 4K Haute Définition',
      'Formats Feed 1:1 & Stories 9:16',
      'Accroches en Darija tunisien prêtes à poster',
      'Badge Livraison 24 Gouvernorats inclus',
      'Téléchargement sans filigrane',
    ],
  },
  {
    id: 'pro',
    name: 'Pack Lancement Pro ⚡',
    subtitle: 'Le pack le plus populaire pour dominer Instagram & Facebook',
    priceTND: 59,
    visualsCount: 20,
    period: 'Paiement unique',
    popular: true,
    accentColor: '#FF5722',
    badge: 'RECOMMANDÉ',
    features: [
      '20 Visuels complets Feed, Stories & Pubs Ads',
      'Décors multiples & déclinaisons de styles',
      'Légendes Darija vendeur & Facebook Ads',
      'Bibliothèque de 5 badges tunisiens vectoriels SVG',
      'Archive ZIP complète avec textes marketing',
      'Support prioritaire WhatsApp 7j/7',
    ],
  },
  {
    id: 'agency_299',
    name: 'Abonnement Agence B2B 🏆',
    subtitle: 'Pour les agences digitales, marques & multi-boutiques',
    priceTND: 299,
    visualsCount: 100,
    period: 'par mois',
    accentColor: '#A855F7',
    badge: 'Proforma B2B',
    features: [
      '100 Crédits / jusqu\'à 400 Visuels 4K mensuels',
      'Mode Marque Blanche totale (Zéro mention Adora)',
      'Gestionnaire multi-workspaces illimité',
      'Facture proforma déductible (RIB BIAT + TVA 19%)',
      'Accompagnement DA dédié & export sur-mesure',
      'Support prioritaire 24/7 sur WhatsApp',
    ],
  },
];

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  packId?: string;
  packName?: string;
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
  priceTND,
  visualsCount,
  initialPlanId = 'pro',
  initialStep,
}: CheckoutModalProps) {
  // Sélection du plan par défaut
  const [selectedPlanId, setSelectedPlanId] = useState<string>(packId || initialPlanId || 'pro');

  // Étape du modal : 'offers' (choisir le pack) ou 'payment' (payer)
  const [step, setStep] = useState<'offers' | 'payment'>('offers');

  // Initialisation du checkout Paddle
  const { isReady: isPaddleReady, openCheckout } = usePaddle();

  // Coordonnées client
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Synchronisation lors de l'ouverture
  useEffect(() => {
    if (isOpen) {
      if (initialStep) {
        setStep(initialStep);
      } else if (packId && priceTND) {
        setStep('payment');
        setSelectedPlanId(packId);
      } else {
        setStep('offers');
        setSelectedPlanId(initialPlanId || 'pro');
      }
      setError(null);
    }
  }, [isOpen, packId, priceTND, initialStep, initialPlanId]);

  if (!isOpen) return null;

  // Calcul du plan actif
  const currentPlan = AVAILABLE_PLANS.find((p) => p.id === selectedPlanId) || AVAILABLE_PLANS[1];
  const finalPrice = priceTND !== undefined && packId === selectedPlanId ? priceTND : currentPlan.priceTND;
  const finalName = packName && packId === selectedPlanId ? packName : currentPlan.name;
  const finalVisualsCount = visualsCount !== undefined && packId === selectedPlanId ? visualsCount : currentPlan.visualsCount;
  const paddlePlan = PADDLE_PLANS[currentPlan.id] || PADDLE_PLANS['pro'];

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Déclenche l'overlay sécurisé Paddle Billing (Apple Pay, Google Pay, Cartes internationales)
      openCheckout({
        packId: currentPlan.id,
        customerName: customerName.trim() || 'Client E-commerce',
        customerEmail: customerEmail.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l’ouverture du paiement Paddle.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(7, 9, 14, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '20px',
          maxWidth: step === 'offers' ? '920px' : '540px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '28px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          color: '#0F172A',
          position: 'relative',
          transition: 'max-width 0.3s ease',
        }}
      >
        {/* Bouton Fermer (Croix) */}
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

        {/* =========================================================================
            ÉTAPE 1 : CHOIX DE L'OFFRE (step === 'offers')
            ========================================================================= */}
        {step === 'offers' && (
          <div>
            {/* Header des Offres */}
            <div style={{ textAlign: 'center', marginBottom: '28px', maxWidth: '640px', margin: '0 auto 28px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#F5F3FF',
                  border: '1px solid #DDD6FE',
                  color: '#7C3AED',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  marginBottom: '10px',
                }}
              >
                <Sparkles size={14} />
                <span>OFFRES & PACKS CLÉ EN MAIN EN DINARS (TND)</span>
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                Choisissez l'offre adaptée à votre boutique
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                Des visuels publicitaires 4K haute conversion avec accroches en Darija et badges livraison inclus.
              </p>
            </div>

            {/* Grille des 4 Packs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
                      border: `2px solid ${isSelected ? '#7C3AED' : plan.popular ? '#DDD6FE' : '#E2E8F0'}`,
                      borderRadius: '16px',
                      padding: '20px 16px',
                      background: isSelected ? '#FAF5FF' : plan.popular ? '#FFFFFF' : '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      position: 'relative',
                      boxShadow: isSelected
                        ? '0 8px 24px rgba(124, 58, 237, 0.15)'
                        : plan.popular
                        ? '0 4px 16px rgba(0, 0, 0, 0.05)'
                        : 'none',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'scale(1.02)' : 'none',
                    }}
                  >
                    {/* Badge Haut (ex: RECOMMANDÉ) */}
                    {plan.badge && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '-11px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: plan.popular ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : '#0F172A',
                          color: '#FFFFFF',
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          padding: '2px 10px',
                          borderRadius: '12px',
                          letterSpacing: '0.04em',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      >
                        {plan.badge}
                      </div>
                    )}

                    {/* Titre & Sous-titre */}
                    <div style={{ marginBottom: '12px', textAlign: 'center' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A', margin: '0 0 4px' }}>
                        {plan.name}
                      </h3>
                      <p style={{ fontSize: '0.72rem', color: '#64748B', margin: 0, minHeight: '32px', lineHeight: 1.35 }}>
                        {plan.subtitle}
                      </p>
                    </div>

                    {/* Prix en Dinars */}
                    <div style={{ textAlign: 'center', margin: '8px 0 16px', padding: '12px 0', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                        {plan.priceTND} <span style={{ fontSize: '1rem', color: '#7C3AED' }}>DT</span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '4px' }}>{plan.period}</div>
                    </div>

                    {/* Liste des fonctionnalités */}
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      {plan.features.map((feat, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.74rem', color: '#475569', lineHeight: 1.3 }}>
                          <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: '1px' }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Bouton de sélection unitaire */}
                    <button
                      type="button"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: isSelected ? 'none' : '1px solid #CBD5E1',
                        background: isSelected ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : '#FFFFFF',
                        color: isSelected ? '#FFFFFF' : '#0F172A',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
                      }}
                    >
                      {isSelected ? '✓ Pack Sélectionné' : `Choisir ce pack`}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Barre de confirmation vers le paiement */}
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
                <ShieldCheck size={20} color="#059669" />
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Paiement sécurisé opéré par <strong>Flouci</strong> (Certifié Banque Centrale de Tunisie) & virement B2B BIAT.
                </span>
              </div>

              <button
                type="button"
                onClick={() => setStep('payment')}
                style={{
                  background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 28px',
                  fontWeight: 900,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(124, 58, 237, 0.35)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <span>Passer au paiement ({currentPlan.priceTND} DT)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            ÉTAPE 2 : PAIEMENT SÉCURISÉ FLOUCI & B2B (step === 'payment')
            ========================================================================= */}
        {step === 'payment' && (
          <div>
            {/* Header avec bouton retour */}
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
                    color: '#7C3AED',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: 0,
                    marginBottom: '8px',
                  }}
                >
                  <ArrowLeft size={14} />
                  <span>Changer d'offre</span>
                </button>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', margin: '0 0 2px' }}>
                  Finaliser votre commande
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Pack : <strong>{finalName}</strong> ({finalVisualsCount} visuels prêts à l'emploi)
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#7C3AED', lineHeight: 1 }}>
                  {finalPrice} DT
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>TTC en Dinars</div>
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
                  fontSize: '0.82rem',
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitPayment}>
              {/* Choix du mode de règlement Paddle */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Paiement sécurisé opéré par <strong>Paddle Billing (Merchant of Record Mondial)</strong> :
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {/* Option 1 : Cartes Internationales */}
                  <div
                    style={{
                      background: '#F0FDF4',
                      border: '2px solid #10B981',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      color: '#047857',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CreditCard size={18} color="#059669" />
                        <strong style={{ fontSize: '0.86rem', color: '#0F172A' }}>Cartes Bancaires</strong>
                      </div>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#059669', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                        3D-SECURE 2.0
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600 }}>
                      💳 Visa, Mastercard & Amex
                    </div>
                  </div>

                  {/* Option 2 : Apple Pay & Google Pay */}
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      color: '#334155',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={18} color="#7C3AED" />
                        <strong style={{ fontSize: '0.86rem', color: '#0F172A' }}>Apple & Google Pay</strong>
                      </div>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#7C3AED', background: '#F3E8FF', padding: '2px 6px', borderRadius: '4px' }}>
                        1-CLIC
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                      ⚡ Règlement instantané sans saisie
                    </div>
                  </div>
                </div>
              </div>

              {/* BANNIÈRE DE SÉCURITÉ PADDLE MERCHANT OF RECORD */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <ShieldCheck size={26} color="#7C3AED" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: 1.45 }}>
                  <strong style={{ color: '#0F172A', display: 'block', marginBottom: '2px' }}>
                    Facturation Internationale Sécurisée par Paddle (MoR)
                  </strong>
                  Vos transactions sont traitées avec le plus haut niveau de conformité (PCI-DSS Niveau 1, 3D-Secure 2.0). Une facture conforme avec TVA déductible vous est automatiquement envoyée par email.
                  <span style={{ display: 'block', marginTop: '4px', fontSize: '0.72rem', color: '#7C3AED', fontWeight: 700 }}>
                    🔒 Vos informations bancaires sont chiffrées de bout en bout et jamais stockées sur nos serveurs.
                  </span>
                </div>
              </div>

              {/* Formulaire Coordonnées Client */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Thamer Kthiri"
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '9px 12px',
                      color: '#0F172A',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Email pour facture & reçu *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="thamer@boutique.tn"
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      padding: '9px 12px',
                      color: '#0F172A',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Actions de paiement */}
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
                    padding: '12px',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                  }}
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    fontWeight: 900,
                    fontSize: '0.92rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                    transition: 'all 0.2s',
                  }}
                >
                  {isLoading
                    ? 'Ouverture de Paddle…'
                    : `🛡️ Payer via Paddle (${finalPrice} DT / ~$${paddlePlan.priceUSD} USD) ➔`}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
