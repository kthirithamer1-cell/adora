'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import AuthRedirectScreen from '@/components/AuthRedirectScreen';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { WorkspaceUsage } from '@/lib/billing';
import CheckoutModal from '@/components/CheckoutModal';
import SocialPublisherModal from '@/components/SocialPublisherModal';
import {
  Sparkles,
  Package,
  Scissors,
  Share2,
  Download,
  ArrowRight,
  Zap,
  Camera,
  Layers,
  ShieldCheck,
  MessageCircle,
  Plus,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { workspace, user, isLoading: isAuthLoading } = useWorkspace();
  const [usage, setUsage] = useState<WorkspaceUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace('/login?redirect=/dashboard');
    }
  }, [isAuthLoading, user, router]);
  const [selectedPackForCheckout, setSelectedPackForCheckout] = useState<{
    id: string;
    name: string;
    price: number;
    count: number;
  } | null>(null);
  const [selectedVisualForSocial, setSelectedVisualForSocial] = useState<string | null>(null);

  useEffect(() => {
    loadUsage();
  }, [workspace?.id]);

  const loadUsage = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing/usage');
      const data = await res.json();
      if (data.success && data.data) {
        setUsage(data.data);
      }
    } catch (err) {
      console.error('Erreur chargement dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const recentVisuals = [
    {
      id: 'vis_1',
      title: 'Nutrex IsoFit — Studio Podium',
      imageUrl: '/images/whey_studio_podium.jpg',
      format: 'Post 1:1',
      date: 'Aujourd’hui',
      category: 'Studio Podium',
    },
    {
      id: 'vis_2',
      title: 'Nutrex Whey — Lifestyle Gym Salle',
      imageUrl: '/images/hero_lifestyle.jpg',
      format: 'Post 1:1',
      date: 'Hier',
      category: 'Ambiance Réelle',
    },
    {
      id: 'vis_3',
      title: 'Creapure Micronized — Story Promo',
      imageUrl: '/images/creatine_story.jpg',
      format: 'Story 9:16',
      date: 'Il y a 2 jours',
      category: 'Story Plein Écran',
    },
    {
      id: 'vis_4',
      title: 'GNC Pro Performance — Publicité',
      imageUrl: '/images/gnc_pro_whey_tub_1791150838901.jpg',
      format: 'Post 1:1',
      date: 'Il y a 3 jours',
      category: 'Publicité Facebook',
    },
  ];

  if (!user) {
    return <AuthRedirectScreen />;
  }

  return (
    <AppShell activeNav="dashboard" pageTitle="Accueil Boutique">
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* 1. BANNIÈRE DE BIENVENUE SIMPLE & SOLDE CLAIR */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '24px 28px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#EEF2FF', padding: '4px 10px', borderRadius: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase' }}>
                🇹🇳 E-Commerce Tunisie
              </span>
              <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                • Boutique : <strong style={{ color: '#0F172A' }}>{workspace?.name || 'Ma Boutique'}</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '0 0 6px', color: '#0F172A', letterSpacing: '-0.02em' }}>
              Marhba bik 👋 {user?.name ? `, ${user.name}` : ''}
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem', margin: 0, lineHeight: 1.4 }}>
              Créez des photos professionnelles pour vos produits et vendez plus sur Facebook & Instagram.
            </p>
          </div>

          {/* Solde d'images en évidence */}
          <div
            style={{
              background: '#FFF7ED',
              border: '1px solid #FFEDD5',
              borderRadius: '12px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase' }}>
                Photos disponibles
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#EA580C', lineHeight: 1.1 }}>
                {workspace?.creditsRemaining || 0} <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>crédits</span>
              </div>
            </div>
            <button
              onClick={() => setSelectedPackForCheckout({ id: 'flash', name: 'Starter Package (20 Crédits)', price: 19, count: 20 })}
              style={{
                background: '#EA580C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
              }}
            >
              <Plus size={14} />
              <span>Recharger</span>
            </button>
          </div>
        </div>

        {/* 2. GUIDE SIMPLE EN 3 ÉTAPES (COMMENT ÇA MARCHE) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
            borderRadius: '16px',
            padding: '28px',
            color: '#FFFFFF',
            marginBottom: '28px',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Simple & Rapide
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '4px 0 6px', color: '#FFFFFF' }}>
              Comment créer vos photos en 3 étapes ?
            </h2>
            <p style={{ color: '#CBD5E1', fontSize: '0.86rem', margin: 0 }}>
              Aucune compétence en photo ni en graphisme n'est nécessaire.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {/* Étape 1 */}
            <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '18px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Camera size={20} color="#FFFFFF" />
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>
                1. Importez votre produit
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.4 }}>
                Prenez une photo de votre article avec votre téléphone, sur n'importe quel fond.
              </div>
            </div>

            {/* Étape 2 */}
            <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '18px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Sparkles size={20} color="#FFFFFF" />
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>
                2. Choisissez un décor
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.4 }}>
                Podium studio luxe, marbre, salon moderne ou nature tunisienne.
              </div>
            </div>

            {/* Étape 3 */}
            <div style={{ background: 'rgba(255, 255, 255, 0.07)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', padding: '18px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Download size={20} color="#FFFFFF" />
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '4px' }}>
                3. Téléchargez & Vendez
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94A3B8', lineHeight: 1.4 }}>
                Votre photo HD est prête avec un texte en Darija pour vos commandes en message privé.
              </div>
            </div>
          </div>

          {/* GROS BOUTON CTA PRINCIPAL */}
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/studio"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%)',
                color: '#07090E',
                fontWeight: 900,
                fontSize: '1rem',
                padding: '14px 28px',
                borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(0, 229, 255, 0.35)',
                transition: 'transform 0.15s ease',
              }}
            >
              <Sparkles size={18} />
              <span>Créer une Photo Maintenant (En 30 secondes)</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* 3. TROIS ACTIONS RAPIDES (LES BESOINS CLÉS) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {/* Action 1 : Studio Photo */}
          <Link
            href="/studio"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '20px',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Sparkles size={20} color="#4F46E5" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px', color: '#0F172A' }}>
                Studio Photo avec Décor
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                Posez votre produit dans un décor élégant et réaliste pour attirer l'attention des clients.
              </p>
            </div>
            <div style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 800, color: '#4F46E5', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Ouvrir le studio</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Action 2 : Détourage */}
          <Link
            href="/cutout"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '20px',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Scissors size={20} color="#059669" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px', color: '#0F172A' }}>
                Enlever le Fond (Détourage)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                Supprimez le fond de vos photos pour obtenir votre produit isolé sur fond transparent ou blanc.
              </p>
            </div>
            <div style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Détourer une photo</span>
              <ArrowRight size={14} />
            </div>
          </Link>

          {/* Action 3 : Packs Clé en Main */}
          <Link
            href="/studio"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '20px',
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Layers size={20} color="#D97706" />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 6px', color: '#0F172A' }}>
                Pack Vente (20 Visuels)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                Générez 20 visuels complets (Posts + Stories) avec textes en Darija prêts pour votre campagne.
              </p>
            </div>
            <div style={{ marginTop: '16px', fontSize: '0.82rem', fontWeight: 800, color: '#D97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Créer un pack complet</span>
              <ArrowRight size={14} />
            </div>
          </Link>
        </div>

        {/* 4. MES DERNIÈRES PHOTOS (GALERIE SIMPLE & TÉLÉCHARGEMENT DIRECT) */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>
                Vos Dernières Photos Créées
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.82rem', margin: 0 }}>
                Téléchargez vos images ou copiez le texte en Darija pour publier sur Instagram & Facebook.
              </p>
            </div>
            <Link
              href="/brand-kit"
              style={{
                color: '#4F46E5',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Voir tout</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {recentVisuals.map((vis) => (
              <div
                key={vis.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                }}
              >
                <div style={{ height: '190px', position: 'relative', background: '#F1F5F9' }}>
                  <img src={vis.imageUrl} alt={vis.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: '#FFF',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {vis.format}
                  </span>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '8px',
                      background: '#4F46E5',
                      color: '#FFFFFF',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    {vis.category}
                  </span>
                </div>

                <div style={{ padding: '14px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {vis.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>{vis.date}</div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button
                      onClick={() => setSelectedVisualForSocial(vis.imageUrl)}
                      style={{
                        flex: 1,
                        background: '#EEF2FF',
                        border: '1px solid #C7D2FE',
                        color: '#4F46E5',
                        borderRadius: '8px',
                        padding: '8px',
                        fontWeight: 700,
                        fontSize: '0.76rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Share2 size={13} />
                      <span>Texte Darija</span>
                    </button>
                    <a
                      href={vis.imageUrl}
                      download
                      style={{
                        background: '#0F172A',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <Download size={13} />
                      <span>HD</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. RECHARGE EXPRESS & ASSISTANCE LOCALE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px', marginBottom: '24px' }}>
          {/* Recharger en Dinars */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '14px',
              padding: '22px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Zap size={18} color="#EA580C" />
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                Recharger vos photos Studio 4K
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '0 0 16px', lineHeight: 1.4 }}>
              Sans engagement. Paiement sécurisé international par Carte Bancaire via Whop MoR.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setSelectedPackForCheckout({ id: 'flash', name: 'Starter (20 Crédits)', price: 19, count: 20 })}
                style={{
                  flex: 1,
                  background: '#FFF7ED',
                  border: '1px solid #FED7AA',
                  color: '#C2410C',
                  borderRadius: '10px',
                  padding: '12px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                <div>Pack 20 Photos</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, marginTop: '2px' }}>$19</div>
              </button>

              <button
                onClick={() => setSelectedPackForCheckout({ id: 'pro', name: 'Pack Pro (50 Crédits)', price: 49, count: 50 })}
                style={{
                  flex: 1,
                  background: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                }}
              >
                <div>Pack 50 Photos</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, marginTop: '2px' }}>$49</div>
              </button>
            </div>
          </div>

          {/* Assistance WhatsApp locale */}
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '14px',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <MessageCircle size={18} color="#16A34A" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#166534' }}>
                  Besoin d'aide ou d'un conseil ?
                </h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#15803D', margin: 0, lineHeight: 1.4 }}>
                Une question sur vos photos de produits ? Notre équipe tunisienne vous répond directement sur WhatsApp pour vous aider.
              </p>
            </div>

            <div style={{ marginTop: '16px' }}>
              <a
                href="https://wa.me/21650000000?text=Bonjour%20MarkMosaiq,%20j'ai%20besoin%20d'aide%20pour%20mes%20photos%20de%20produits"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#16A34A',
                  color: '#FFFFFF',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  textDecoration: 'none',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
                }}
              >
                <MessageCircle size={15} />
                <span>Discuter sur WhatsApp (+216)</span>
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL PAIEMENT SI DÉCLENCHÉ */}
      {selectedPackForCheckout && (
        <CheckoutModal
          isOpen={true}
          onClose={() => {
            setSelectedPackForCheckout(null);
            loadUsage();
          }}
          packId={selectedPackForCheckout.id}
          packName={selectedPackForCheckout.name}
          priceUSD={selectedPackForCheckout.price}
          visualsCount={selectedPackForCheckout.count}
        />
      )}

      {/* MODAL SOCIAL SI DÉCLENCHÉ */}
      {selectedVisualForSocial && (
        <SocialPublisherModal
          isOpen={true}
          onClose={() => setSelectedVisualForSocial(null)}
          imageUrl={selectedVisualForSocial}
          productName="Visuel Sélectionné"
          defaultCaptionDarija="🔥 Nouveauté disponible en stock ! Livraison 24-48h sur toute la Tunisie. Khlas fel livraison garanti."
        />
      )}
    </AppShell>
  );
}
