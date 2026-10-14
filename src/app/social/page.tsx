'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { SocialAccount, ScheduledPost } from '@/lib/social';

export default function SocialHubPage() {
  const { workspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'calendar' | 'feed-grid' | 'accounts'>('calendar');
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Formulaire de programmation
  const [selectedImage, setSelectedImage] = useState('/images/bottle_nutrex.png');
  const [platform, setPlatform] = useState<'instagram' | 'facebook' | 'both'>('both');
  const [postType, setPostType] = useState<'feed' | 'story'>('feed');
  const [scheduledDate, setScheduledDate] = useState('2026-10-09T20:30');
  const [caption, setCaption] = useState(
    `🔥 Arrivage exclusif chez NutriStore Tunisie !\n\nQualité 100% originale certifiée. Quantités très limitées !\n\n🚚 Livraison express 24-48h sur toute la Tunisie (24 gouvernorats)\n💰 Khlas and el livrison (Paiement à la livraison)\n\n📲 Commandez vite par DM ou WhatsApp au +216 98 123 456 !`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  // Heures d'affluence e-commerce tunisien recommandées
  const tunisianPeakHours = [
    { label: 'Pause Déjeuner (13h30)', time: '13:30' },
    { label: 'Sortie Bureaux (18h00)', time: '18:00' },
    { label: 'Prime Time Soirée (20h30 - Meilleur ROI)', time: '20:30' },
    { label: 'Late Night Scroll (22h15)', time: '22:15' },
  ];

  // Images disponibles pour planification
  const sampleVisuals = [
    { label: 'Nutrex Podium Studio', url: '/images/bottle_nutrex.png' },
    { label: 'Story Créatine Promo', url: '/images/creatine_story.jpg' },
    { label: 'Pot GNC Pro Whey', url: '/images/gnc_pro_whey_tub_1791150838901.jpg' },
    { label: 'Mode Vestiaire Tunis', url: '/images/hero_lifestyle.jpg' },
  ];

  useEffect(() => {
    loadSocialData();
  }, [workspace?.id]);

  const loadSocialData = async () => {
    setIsLoading(true);
    try {
      const [accRes, postRes] = await Promise.all([
        fetch('/api/social/accounts'),
        fetch('/api/social/posts'),
      ]);
      const accData = await accRes.json();
      const postData = await postRes.json();

      if (accData.success) setAccounts(accData.data || []);
      if (postData.success) setPosts(postData.data || []);
    } catch (err) {
      console.error('Erreur chargement social hub:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAccount = async (accountPlatform: 'instagram' | 'facebook') => {
    try {
      const res = await fetch('/api/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: accountPlatform }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAccounts(data.data);
        setFeedback({ text: `✓ Connexion ${accountPlatform.toUpperCase()} mise à jour !` });
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err) {
      console.error('Erreur connexion compte:', err);
    }
  };

  const handleSchedulePost = async (e: React.FormEvent, publishImmediately = false) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const endpoint = publishImmediately ? '/api/social/publish-now' : '/api/social/posts';
    const payload = publishImmediately
      ? { platform, imageUrl: selectedImage, caption, postType }
      : { platform, imageUrl: selectedImage, caption, postType, scheduledFor: new Date(scheduledDate).toISOString() };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          text: publishImmediately
            ? '🚀 Publication réussie en direct sur Instagram / Facebook !'
            : '✓ Post planifié avec succès dans le calendrier !',
        });
        setShowScheduleModal(false);
        loadSocialData();
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ text: data.error || 'Erreur lors de la programmation', error: true });
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'Erreur serveur', error: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Supprimer cette publication planifiée ?')) return;
    try {
      const res = await fetch(`/api/social/posts?id=${postId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setFeedback({ text: 'Publication retirée du calendrier.' });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err) {
      console.error('Erreur suppression post:', err);
    }
  };

  // Simuler 9 cases pour la grille Instagram (visuels récents + mock)
  const instagramGridSlots = [
    ...posts.filter((p) => p.postType === 'feed'),
    { id: 'mock_1', imageUrl: '/images/whey_studio_podium.jpg', caption: 'Studio 4K' },
    { id: 'mock_2', imageUrl: '/images/hero_lifestyle.jpg', caption: 'Lifestyle Gym' },
    { id: 'mock_3', imageUrl: '/images/creatine_story.jpg', caption: 'Creatine Boost' },
    { id: 'mock_4', imageUrl: '/images/bottle_nutrex.png', caption: 'IsoFit Pure' },
    { id: 'mock_5', imageUrl: '/images/gnc_pro_whey_tub_1791150838901.jpg', caption: 'GNC Whey' },
    { id: 'mock_6', imageUrl: '/images/Adora_logo.png', caption: 'Adora Official' },
  ].slice(0, 9);

  return (
    <AppShell activeNav="social" pageTitle="Calendrier Social Media Hub">
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
        
        {/* En-tête du Hub */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#FF5722',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: 'rgba(255, 87, 34, 0.1)',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #FED7AA',
                background: '#FFF7ED',
                color: '#EA580C',
              }}>
                Meta Graph API v20.0
              </span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Diffusion multi-plateforme : Instagram Pro & Facebook Pages
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Hub Social Media & Calendrier E-commerce
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>
              Planifiez vos lancements de visuels IA aux heures de pointe tunisiennes et prévisualisez votre feed Instagram en 9 cases.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowScheduleModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                background: '#4F46E5',
                borderRadius: '8px',
                border: 'none',
                color: '#FFF',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              }}
            >
              Programmer un Post
            </button>
            <Link
              href="/studio"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 18px',
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                color: '#0F172A',
                fontSize: '13px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Créer un Nouveau Visuel
            </Link>
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div style={{
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: 700,
            background: feedback.error ? '#FEF2F2' : '#ECFDF5',
            border: `1px solid ${feedback.error ? '#FECACA' : '#A7F3D0'}`,
            color: feedback.error ? '#DC2626' : '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback(null)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}
            >
              ×
            </button>
          </div>
        )}

        {/* Barre d'onglets */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: '#FFFFFF',
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          marginBottom: '28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          {[
            { id: 'calendar', label: `Calendrier de Publication (${posts.length} posts)` },
            { id: 'feed-grid', label: 'Simulateur Grille Instagram (9 Cases)' },
            { id: 'accounts', label: `Comptes Connectés (${accounts.filter((a) => a.isConnected).length}/${accounts.length})` },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isActive ? '#EEF2FF' : 'transparent',
                  color: isActive ? '#4F46E5' : '#64748B',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  borderBottom: isActive ? '2px solid #4F46E5' : '2px solid transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* CONTENU ONGLET 1 : CALENDRIER & POSTS PLANIFIÉS */}
        {activeTab === 'calendar' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'start' }}>
            
            {/* Liste des publications chronologiques */}
            <div>
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    File d'Attente des Publications
                  </h3>
                  <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>
                    ● Synchronisation automatique Meta active
                  </span>
                </div>

                {isLoading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    Chargement des publications...
                  </div>
                ) : posts.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed #E2E8F0', borderRadius: '10px' }}>
                    <p style={{ color: '#64748B', marginBottom: '14px' }}>Aucune publication planifiée pour le moment.</p>
                    <button
                      onClick={() => setShowScheduleModal(true)}
                      style={{
                        padding: '10px 18px',
                        background: '#4F46E5',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#FFF',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Planifier une première publication
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        style={{
                          display: 'flex',
                          gap: '18px',
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '16px',
                          alignItems: 'center',
                        }}
                      >
                        <img
                          src={post.imageUrl}
                          alt="Thumbnail"
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '8px',
                            objectFit: 'contain',
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                          }}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: post.status === 'published' ? '#ECFDF5' : '#EEF2FF',
                              color: post.status === 'published' ? '#059669' : '#4F46E5',
                              border: `1px solid ${post.status === 'published' ? '#A7F3D0' : '#C7D2FE'}`,
                            }}>
                              {post.status === 'published' ? '✓ Publié' : '⏳ Planifié'}
                            </span>
                            <span style={{ fontSize: '12px', color: '#64748B' }}>
                              Format : <strong style={{ color: '#0F172A' }}>{post.postType.toUpperCase()}</strong>
                            </span>
                            <span style={{ fontSize: '12px', color: '#64748B' }}>
                              Plateforme : <strong style={{ color: '#0F172A' }}>{post.platform.toUpperCase()}</strong>
                            </span>
                          </div>

                          <p style={{
                            margin: '0 0 6px 0',
                            fontSize: '13px',
                            color: '#334155',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {post.caption}
                          </p>

                          <div style={{ fontSize: '12px', color: '#64748B' }}>
                            Diffusion prévue le : <span style={{ color: '#EA580C', fontWeight: 700 }}>
                              {new Date(post.scheduledFor).toLocaleString('fr-FR', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {post.status === 'published' && post.publishedUrl ? (
                            <a
                              href={post.publishedUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                padding: '6px 12px',
                                background: '#ECFDF5',
                                border: '1px solid #A7F3D0',
                                borderRadius: '6px',
                                color: '#059669',
                                fontSize: '12px',
                                fontWeight: 700,
                                textDecoration: 'none',
                                textAlign: 'center',
                              }}
                            >
                              Voir sur Instagram ↗
                            </a>
                          ) : (
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              style={{
                                padding: '6px 12px',
                                background: '#FEF2F2',
                                border: '1px solid #FECACA',
                                borderRadius: '6px',
                                color: '#DC2626',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Barre latérale : Horaires d'or Tunisie & Recommandations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}>
                <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', margin: '0 0 10px 0' }}>
                  Heures d'Or E-Commerce Tunisie
                </h4>
                <p style={{ fontSize: '12px', color: '#64748B', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                  Sur le marché tunisien, les pics d'engagement et de conversion en DM s'observent à ces créneaux précis :
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tunisianPeakHours.map((slot, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#0F172A', fontWeight: 600 }}>{slot.label}</span>
                      <span style={{ fontSize: '12px', color: '#EA580C', fontWeight: 800 }}>{slot.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: '#EEF2FF',
                borderRadius: '14px',
                border: '1px solid #C7D2FE',
                padding: '20px',
              }}>
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#4F46E5', margin: '0 0 8px 0' }}>
                  Conseil de Conversion Darija
                </h4>
                <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Terminez toujours vos légendes par : <em>"Abathna message sur WhatsApp pour commander !"</em>. En Tunisie, plus de 75% des ventes se concluent directement en messagerie instantanée.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CONTENU ONGLET 2 : SIMULATEUR 9-POST INSTAGRAM FEED */}
        {activeTab === 'feed-grid' && (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '30px',
            maxWidth: '720px',
            margin: '0 auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px 0' }}>
                Simulateur de Feed Instagram 9 Cases
              </h3>
              <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>
                Visualisez la disposition esthétique et l'harmonie des couleurs de votre boutique avant toute diffusion.
              </p>
            </div>

            {/* Grille 3x3 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              background: '#F8FAFC',
              padding: '8px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
            }}>
              {instagramGridSlots.map((slot, idx) => (
                <div
                  key={idx}
                  style={{
                    aspectRatio: '1/1',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '6px',
                    background: '#FFFFFF',
                  }}
                >
                  <img
                    src={slot.imageUrl}
                    alt={`Post ${idx}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.4)',
                    opacity: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFF',
                    fontSize: '12px',
                    fontWeight: 800,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                  >
                    Post #{idx + 1}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                onClick={() => setShowScheduleModal(true)}
                style={{
                  padding: '12px 24px',
                  background: '#4F46E5',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#FFF',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                }}
              >
                + Ajouter une Publication à la Grille
              </button>
            </div>
          </div>
        )}

        {/* CONTENU ONGLET 3 : COMPTES CONNECTÉS */}
        {activeTab === 'accounts' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '28px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
                Connexions Meta API & Pages E-commerce
              </h3>
              <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px' }}>
                Connectez vos pages officielles pour activer la publication automatique et le tracking des commentaires en Tunisie.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        background: acc.platform === 'instagram' ? 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)' : '#1877F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        color: '#FFF',
                      }}>
                        {acc.platform === 'instagram' ? 'IG' : 'FB'}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                            {acc.accountName}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: acc.isConnected ? '#ECFDF5' : '#FFF7ED',
                            color: acc.isConnected ? '#059669' : '#C2410C',
                            border: `1px solid ${acc.isConnected ? '#A7F3D0' : '#FED7AA'}`,
                          }}>
                            {acc.isConnected ? 'Connecté' : 'Déconnecté'}
                          </span>
                        </div>
                        <span style={{ fontSize: '13px', color: '#64748B' }}>{acc.username}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleAccount(acc.platform)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: acc.isConnected ? '#FEF2F2' : '#4F46E5',
                        border: acc.isConnected ? '1px solid #FECACA' : 'none',
                        color: acc.isConnected ? '#DC2626' : '#FFFFFF',
                      }}
                    >
                      {acc.isConnected ? 'Déconnecter' : 'Connecter le Compte'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL PROGRAMMATION DE POST */}
        {showScheduleModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              width: '100%',
              maxWidth: '560px',
              padding: '28px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Programmer une Publication Meta
                </h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '22px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={(e) => handleSchedulePost(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Sélection de l'image */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                    Visuel à Publier
                  </label>
                  <select
                    value={selectedImage}
                    onChange={(e) => setSelectedImage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '13px',
                    }}
                  >
                    {sampleVisuals.map((v, idx) => (
                      <option key={idx} value={v.url}>{v.label}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                      Plateforme
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '13px',
                      }}
                    >
                      <option value="both">Instagram & Facebook</option>
                      <option value="instagram">Instagram Uniquement</option>
                      <option value="facebook">Facebook Uniquement</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                      Format
                    </label>
                    <select
                      value={postType}
                      onChange={(e) => setPostType(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        color: '#0F172A',
                        fontSize: '13px',
                      }}
                    >
                      <option value="feed">Post Feed (1:1)</option>
                      <option value="story">Story Éphémère (9:16)</option>
                    </select>
                  </div>
                </div>

                {/* Date et Heure */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                    Date & Heure de Publication (Heure de Tunis)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '13px',
                    }}
                  />
                </div>

                {/* Légende */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                    Légende & Accroche Commerciale Darija
                  </label>
                  <textarea
                    rows={4}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#0F172A',
                      fontSize: '13px',
                      resize: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={(e) => handleSchedulePost(e, true)}
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#EEF2FF',
                      border: '1px solid #C7D2FE',
                      borderRadius: '8px',
                      color: '#4F46E5',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Publier Maintenant
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: '#4F46E5',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFF',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                    }}
                  >
                    {isSubmitting ? 'Programmation...' : 'Planifier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
