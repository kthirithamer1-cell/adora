'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Zap,
  Palette,
  Store,
  Loader2,
} from 'lucide-react';

interface OrderDetails {
  id: string;
  status: 'PAID' | 'FAILED' | 'CANCELED' | 'PENDING_PAYMENT' | 'CREATED';
  pack: string;
  packName: string;
  credits: number;
  cycle: string;
  currency: string;
  amountMinor: number;
}

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const returnTo = searchParams.get('returnTo');

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    const fetchOrderStatus = async () => {
      try {
        const res = await fetch(`/api/checkout/orders/status?order_id=${encodeURIComponent(orderId)}`);
        const data = await res.json();
        if (data.success && data.order) {
          setOrder(data.order);
        } else {
          setError(data.error || 'Impossible de vérifier l’état de la commande.');
        }
      } catch (err: any) {
        setError(err.message || 'Erreur de connexion.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderStatus();
  }, [orderId]);

  useEffect(() => {
    if (order?.status === 'PAID' && returnTo === '/studio') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = '/studio';
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [order?.status, returnTo]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8FAFC',
        fontFamily: 'Outfit, sans-serif',
      }}>
        <Loader2 size={42} className="animate-spin" color="#6366F1" />
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginTop: '16px' }}>
          Vérification de votre paiement sécurisé Whop…
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B' }}>
          Attribution de vos crédits Studio 4K en cours.
        </p>
      </div>
    );
  }

  const isSuccess = order?.status === 'PAID' || !orderId;
  const isFailed = order?.status === 'FAILED' || order?.status === 'CANCELED';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      fontFamily: 'Outfit, sans-serif',
      color: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 16px',
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #E2E8F0',
        padding: '36px 32px',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)',
        textAlign: 'center',
      }}>
        {isSuccess ? (
          <>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            }}>
              <CheckCircle2 size={40} />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '4px 14px',
              borderRadius: '20px',
              color: '#065F46',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '12px',
            }}>
              <Sparkles size={14} color="#10B981" />
              Paiement Confirmé & Sécurisé
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
              Félicitations ! Vos crédits sont débloqués
            </h1>

            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', margin: '0 0 24px' }}>
              Votre abonnement au <strong>{order?.packName || 'Pack Pro'}</strong> est actif. Vos{' '}
              <strong>{order?.credits || 30} crédits Studio 4K</strong> ont été crédités sur votre espace.
            </p>

            {/* Récapitulatif commande */}
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '16px 20px',
              textAlign: 'left',
              marginBottom: '26px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Forfait activé :</span>
                <span style={{ fontWeight: 800, color: '#0F172A' }}>{order?.packName || 'Pro Lancement ⚡'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Crédits Studio 4K :</span>
                <span style={{ fontWeight: 800, color: '#10B981' }}>+{order?.credits || 30} crédits disponibles</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#64748B' }}>Identifiant commande :</span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>
                  {order?.id || orderId || 'COMMANDE_CONFIRMEE'}
                </span>
              </div>
            </div>

            {/* Boutons d'action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {returnTo === '/studio' ? (
                <>
                  <Link
                    href="/studio"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#FFFFFF',
                      borderRadius: '12px',
                      fontWeight: 900,
                      fontSize: '15px',
                      textDecoration: 'none',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    <Sparkles size={18} />
                    <span>Retourner au Studio IA ({countdown}s) ➔</span>
                  </Link>

                  <Link
                    href="/onboarding"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      color: '#334155',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '14px',
                      textDecoration: 'none',
                    }}
                  >
                    <Palette size={16} />
                    <span>Configurer mon Brand Kit & Boutique</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/onboarding"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '14px',
                      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 40%, #EC4899 100%)',
                      color: '#FFFFFF',
                      borderRadius: '12px',
                      fontWeight: 900,
                      fontSize: '15px',
                      textDecoration: 'none',
                      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                    }}
                  >
                    <Palette size={18} />
                    <span>Personnaliser mon Brand Kit & Boutique ➔</span>
                  </Link>

                  <Link
                    href="/studio"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      background: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      color: '#334155',
                      borderRadius: '12px',
                      fontWeight: 700,
                      fontSize: '14px',
                      textDecoration: 'none',
                    }}
                  >
                    <span>Accéder directement au Studio IA</span>
                  </Link>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DC2626',
              margin: '0 auto 20px',
            }}>
              <XCircle size={40} />
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
              Paiement Non Finalisé
            </h1>

            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', margin: '0 0 24px' }}>
              {error || 'La transaction n’a pas pu aboutir ou a été interrompue. Aucun montant n’a été débité.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                href={`/checkout?pack=${order?.pack || 'pro'}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  fontWeight: 900,
                  fontSize: '15px',
                  textDecoration: 'none',
                }}
              >
                <RefreshCw size={17} />
                <span>Réessayer le paiement sécurisé ➔</span>
              </Link>

              <Link
                href="/studio"
                style={{
                  padding: '12px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                Retourner au Studio
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={36} className="animate-spin" color="#6366F1" />
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
