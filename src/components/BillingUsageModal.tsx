'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { WorkspaceUsage } from '@/lib/billing';
import CheckoutModal from '@/components/CheckoutModal';

interface BillingUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BillingUsageModal({ isOpen, onClose }: BillingUsageModalProps) {
  const { workspace, refreshSession } = useWorkspace();
  const [usage, setUsage] = useState<WorkspaceUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackForCheckout, setSelectedPackForCheckout] = useState<{
    id: string;
    name: string;
    price: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadUsage();
    }
  }, [isOpen, workspace?.id]);

  const loadUsage = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing/usage');
      const data = await res.json();
      if (data.success && data.data) {
        setUsage(data.data);
      }
    } catch (err) {
      console.error('Erreur chargement usage:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div
        className="responsive-modal-card"
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          maxWidth: '720px',
          width: '100%',
          padding: '28px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
          color: '#0F172A',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EA580C', background: '#FFF7ED', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Solde & Facturation Studio
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '6px 0 2px', color: '#0F172A' }}>
              Consommation & Forfaits — {workspace?.name}
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Gérez votre solde d'images, recharges de crédits et forfaits Studio 4K sécurisés
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '1.4rem', cursor: 'pointer', padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>

        {isLoading || !usage ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Chargement…</div>
        ) : (
          <div>
            {/* KPI Cards */}
            <div className="responsive-3col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#9A3412', textTransform: 'uppercase', fontWeight: 700 }}>Crédits Disponibles</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EA580C', marginTop: '4px' }}>
                  ⚡ {usage.creditsRemaining}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Prêts à être générés</div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Visuels Consommés</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#4F46E5', marginTop: '4px' }}>
                  {usage.creditsUsed}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Rendus 4K haute fidélité</div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>Packs Exportés (.ZIP)</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#10B981', marginTop: '4px' }}>
                  {usage.totalPacksExported}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>Archives complètes prêtes</div>
              </div>
            </div>

            {/* Recharges Rapides en USD */}
            <div style={{ marginBottom: '26px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#334155', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ⚡ Forfaits & Recharges Studio 4K
              </h4>
              <div className="responsive-3col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {/* Pack Starter $19 */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>Starter Package</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', margin: '4px 0' }}>20 Crédits Studio 4K</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4F46E5', margin: '6px 0' }}>$19</div>
                  </div>
                  <button
                    onClick={() => setSelectedPackForCheckout({ id: 'flash', name: 'Starter Package (20 Crédits)', price: 19, count: 20 })}
                    style={{ width: '100%', background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '8px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 10px rgba(79, 70, 229, 0.2)' }}
                  >
                    Activer $19
                  </button>
                </div>

                {/* Pack Pro $49 */}
                <div style={{ background: '#FFF7ED', border: '1.5px solid #EA580C', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-10px', right: '12px', background: '#EA580C', color: '#FFF', fontSize: '0.65rem', fontWeight: 900, padding: '2px 8px', borderRadius: '4px' }}>
                    POPULAIRE ⚡
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>Pro Launch Pack</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', margin: '4px 0' }}>50 Crédits Studio 4K</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#EA580C', margin: '6px 0' }}>$49</div>
                  </div>
                  <button
                    onClick={() => setSelectedPackForCheckout({ id: 'pro', name: 'Pro Launch Pack (50 Crédits)', price: 49, count: 50 })}
                    style={{ width: '100%', background: 'linear-gradient(135deg, #EA580C, #C2410C)', color: '#FFF', border: 'none', borderRadius: '8px', padding: '8px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 10px rgba(234, 88, 12, 0.2)' }}
                  >
                    Activer $49
                  </button>
                </div>

                {/* Pack Agence $99 */}
                <div style={{ background: '#FAF5FF', border: '1px solid #E9D5FF', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>Advanced Agency</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', margin: '4px 0' }}>120 Crédits + White-label</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#7E22CE', margin: '6px 0' }}>$99</div>
                  </div>
                  <button
                    onClick={() => setSelectedPackForCheckout({ id: 'agency_299', name: 'Advanced Agency (120 Crédits)', price: 99, count: 120 })}
                    style={{ width: '100%', background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#FFF', border: 'none', borderRadius: '8px', padding: '8px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 10px rgba(139, 92, 246, 0.2)' }}
                  >
                    Activer $99
                  </button>
                </div>
              </div>
            </div>

            {/* Historique des Achats & Factures */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                📄 Factures & Achats Récents
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {usage.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.82rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 800, color: '#4F46E5' }}>{tx.invoiceNumber}</span>
                      <span style={{ color: '#0F172A', fontWeight: 600 }}>{tx.packName}</span>
                      <span style={{ color: '#64748B' }}>
                        via {tx.gateway === 'b2b_invoice' ? 'Facture B2B' : tx.gateway.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 800, color: '#EA580C' }}>{tx.amountTND} DT</span>
                      <span style={{ color: '#15803D', fontSize: '0.75rem', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        + {tx.creditsAdded} crédits
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', padding: '10px 20px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
          >
            Fermer
          </button>
        </div>

        {/* Modal de paiement sécurisé Whop */}
        {selectedPackForCheckout && (
          <CheckoutModal
            isOpen={true}
            onClose={() => {
              setSelectedPackForCheckout(null);
              loadUsage();
              refreshSession();
            }}
            packId={selectedPackForCheckout.id}
            packName={selectedPackForCheckout.name}
            priceUSD={selectedPackForCheckout.price}
            visualsCount={selectedPackForCheckout.count}
          />
        )}
      </div>
    </div>
  );
}
