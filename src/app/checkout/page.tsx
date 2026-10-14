'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import WorkspaceSelector from '@/components/WorkspaceSelector';
import { usePaddle } from '@/lib/usePaddle';
import { PADDLE_PLANS } from '@/lib/paddle';
import { ShieldCheck, CreditCard, Lock, ArrowLeft, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

const PACK_OPTIONS = [
  {
    id: 'flash',
    name: 'Starter Découverte',
    priceTND: 59,
    visualsCount: 10,
    tag: 'DÉMARRAGE',
    color: '#00E5FF',
    features: [
      '10 Visuels 4K (Feed 1:1 & Stories 9:16)',
      'Accroches commerciales en Darija tunisien',
      'Badges "Livraison 24 Gouvernorats"',
      'Export haute définition sans filigrane',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Lancement ⚡',
    priceTND: 149,
    visualsCount: 30,
    tag: 'LE PLUS POPULAIRE',
    color: '#FF5722',
    features: [
      '30 Visuels complets (Feed, Stories, Pubs Facebook)',
      'Déclinaisons Lifestyle & Décors immersifs',
      'Accroches urgence Darija & Textes sponsorisés Ads',
      'Exportation en archive ZIP structurée',
      'Assistance & révision IA automatique',
    ],
  },
  {
    id: 'agency_299',
    name: 'Advanced Agence B2B',
    priceTND: 299,
    visualsCount: 100,
    tag: 'OFFRE AGENCES & MARQUES',
    color: '#A855F7',
    features: [
      '100 Crédits / jusqu\'à 400 Visuels 4K multi-produits',
      'Mode Marque Blanche (Zero branding Adora)',
      'Gestion multi-marques clients illimitée',
      'Facturation B2B conforme (TVA 19% + RIB BIAT)',
      'Support prioritaire dédié 7j/7 sur WhatsApp',
    ],
  },
];

function CheckoutContent() {
  const searchParams = useSearchParams();
  const initialPackId = searchParams.get('pack') || 'pro';

  const [selectedPackId, setSelectedPackId] = useState<string>(initialPackId);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [governorate, setGovernorate] = useState('Tunis');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isReady: isPaddleReady, openCheckout } = usePaddle();

  const selectedPack = PACK_OPTIONS.find((p) => p.id === selectedPackId) || PACK_OPTIONS[1];
  const paddlePlan = PADDLE_PLANS[selectedPack.id] || PADDLE_PLANS['pro'];

  useEffect(() => {
    const packParam = searchParams.get('pack');
    if (packParam && PACK_OPTIONS.some((p) => p.id === packParam)) {
      setSelectedPackId(packParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      openCheckout({
        packId: selectedPack.id,
        customerName: customerName.trim() || 'Client E-commerce',
        customerEmail: customerEmail.trim() || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l’ouverture du paiement sécurisé');
    } finally {
      setIsLoading(false);
    }
  };

  const TUNISIAN_GOVERNORATES = [
    'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan',
    'Bizerte', 'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse',
    'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid',
    'Gabès', 'Médenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kébili',
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC', color: '#0F172A' }}>
      {/* NAVBAR */}
      <header style={{ borderBottom: '1px solid #E2E8F0', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px', padding: '0 16px', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <img
                src="/images/Adora_logo.png"
                alt="Adora Logo"
                style={{ width: '36px', height: '36px', borderRadius: '10px', objectFit: 'contain', background: '#FFFFFF', boxShadow: '0 2px 8px rgba(79, 70, 229, 0.15)' }}
              />
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>ADORA</span>
            </Link>
            <span className="nav-breadcrumb-slash" style={{ color: '#CBD5E1' }}>/</span>
            <span className="nav-breadcrumb-subtitle" style={{ fontSize: '0.88rem', color: '#4F46E5', fontWeight: 800 }}>Paiement Sécurisé International</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <WorkspaceSelector />
            <Link href="/studio" style={{ color: '#475569', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
              Studio IA ➔
            </Link>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ flex: 1, padding: '40px 16px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div>
          <Link
            href="/studio"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', marginBottom: '20px' }}
          >
            <ArrowLeft size={16} /> Retour au Studio
          </Link>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '6px', color: '#0F172A' }}>
            Finaliser Votre Commande de Visuels
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '32px' }}>
            Débloquez vos crédits instantanément avec notre passerelle internationale certifiée <strong>Paddle Billing</strong>.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', alignItems: 'start' }}>
            {/* COLONNE GAUCHE : CHOIX DU PACK */}
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', color: '#0F172A' }}>
                1. Choisissez Votre Forfait
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {PACK_OPTIONS.map((p) => {
                  const isSelected = p.id === selectedPackId;
                  const planPaddle = PADDLE_PLANS[p.id] || PADDLE_PLANS['pro'];
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPackId(p.id)}
                      style={{
                        background: isSelected ? '#FFFFFF' : '#F8FAFC',
                        border: isSelected ? `2px solid ${p.color}` : '1px solid #E2E8F0',
                        borderRadius: '14px',
                        padding: '18px 20px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? `0 8px 24px -4px ${p.color}30` : 'none',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 900, color: p.color, background: `${p.color}15`, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {p.tag}
                          </span>
                          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '6px 0 2px', color: '#0F172A' }}>
                            {p.name}
                          </h3>
                          <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                            {p.visualsCount} Visuels Haute Définition
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0F172A' }}>
                            {p.priceTND} DT
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>~${planPaddle.priceUSD} USD TTC</div>
                        </div>
                      </div>

                      <ul style={{ margin: '10px 0 0', paddingLeft: '18px', fontSize: '0.8rem', color: '#475569', lineHeight: '1.6' }}>
                        {p.features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Rassurance */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <ShieldCheck size={18} color="#059669" />
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F172A' }}>Garantie Qualité E-commerce Adora</div>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: '1.5', margin: 0 }}>
                  Tous nos visuels sont calibrés aux dimensions exactes Instagram (1080x1080) et Stories (1080x1920) avec respect des zones d'interaction et détourage net de vos articles.
                </p>
              </div>
            </div>

            {/* COLONNE DROITE : FORMULAIRE & PASSERELLE PADDLE */}
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.06)',
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px', color: '#0F172A' }}>
                2. Mode de Paiement & Coordonnées
              </h2>

              {error && (
                <div style={{ background: 'rgba(225, 29, 72, 0.15)', border: '1px solid #E11D48', color: '#991B1B', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Passerelles Paddle */}
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                    Moyens de paiement acceptés par <strong>Paddle (Merchant of Record)</strong> :
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {/* Option 1: Cartes Internationales */}
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
                          <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>Cartes Bancaires</strong>
                        </div>
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#059669', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                          3D-SECURE 2.0
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 600 }}>
                        💳 Visa, Mastercard & Amex
                      </div>
                    </div>

                    {/* Option 2: Apple Pay & Google Pay */}
                    <div
                      style={{
                        background: '#F8FAFC',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '14px 14px',
                        color: '#334155',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Zap size={20} color="#7C3AED" />
                          <strong style={{ fontSize: '0.88rem', color: '#0F172A' }}>Apple & Google Pay</strong>
                        </div>
                        <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#7C3AED', background: '#F3E8FF', padding: '2px 6px', borderRadius: '4px' }}>
                          1-CLIC
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                        ⚡ Règlement instantané sur mobile
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bannière de Sécurité Paddle MoR */}
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <Lock size={18} color="#7C3AED" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.45 }}>
                    <strong style={{ color: '#0F172A', display: 'block', marginBottom: '2px' }}>
                      Paiement Sécurisé International par Paddle Billing (Merchant of Record)
                    </strong>
                    Vos transactions sont cryptées et protégées par les normes les plus strictes de sécurité bancaire (PCI-DSS Niveau 1). Vous recevrez une facture officielle avec TVA déductible par email.
                    <span style={{ display: 'block', marginTop: '4px', fontSize: '0.72rem', color: '#7C3AED', fontWeight: 700 }}>
                      🔒 Aucune coordonnée bancaire ne transite par nos serveurs.
                    </span>
                  </div>
                </div>

                {/* Formulaire Client */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Nom & Prénom *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Mohamed Ben Salah"
                      style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Email (Facture & Reçu) *</label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="mohamed@boutique.tn"
                      style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Téléphone Tunisien</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ex: 98 123 456"
                      style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '4px' }}>Gouvernorat (Tunisie)</label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      style={{ width: '100%', background: '#FFFFFF', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '9px 12px', color: '#0F172A', fontSize: '0.85rem' }}
                    >
                      {TUNISIAN_GOVERNORATES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Récapitulatif Prix */}
                <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: '#64748B' }}>
                    <span>Forfait sélectionné :</span>
                    <span style={{ color: '#0F172A', fontWeight: 700 }}>{selectedPack.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: '#64748B' }}>
                    <span>Nombre de visuels :</span>
                    <span style={{ color: '#0F172A', fontWeight: 700 }}>{selectedPack.visualsCount} crédits débloqués</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: '#64748B' }}>
                    <span>Passerelle certifiée :</span>
                    <span style={{ color: '#7C3AED', fontWeight: 700 }}>Paddle Billing (MoR Mondial)</span>
                  </div>
                  <div style={{ borderTop: '1px solid #E2E8F0', margin: '8px 0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>Total à régler :</span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.6rem', fontWeight: 900, color: selectedPack.color }}>
                        {selectedPack.priceTND} DT
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748B', display: 'block' }}>
                        (~${paddlePlan.priceUSD} USD TTC)
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                    color: '#FFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px',
                    fontWeight: 900,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px -4px rgba(124, 58, 237, 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isLoading
                    ? 'Ouverture de Paddle…'
                    : `🛡️ Payer via Paddle (${selectedPack.priceTND} DT / ~$${paddlePlan.priceUSD} USD) ➔`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER OFFICIEL */}
      <footer style={{ borderTop: '1px solid #E2E8F0', padding: '32px 24px', textAlign: 'center', color: '#64748B', fontSize: '0.8rem', background: '#FFFFFF', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
          <img
            src="/images/Adora_logo.png"
            alt="Adora Logo"
            style={{ width: '28px', height: '28px', borderRadius: '7px', objectFit: 'contain', background: '#FFFFFF', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)' }}
          />
          <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#0F172A', letterSpacing: '-0.02em' }}>ADORA</span>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <span style={{ fontWeight: 700, color: '#7C3AED' }}>Paiement Sécurisé International (Paddle MoR)</span>
        </div>
        <p>© 2026 ADORA AI — Studio E-commerce Haute Définition en Tunisie. Tous droits réservés.</p>
      </footer>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chargement…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
