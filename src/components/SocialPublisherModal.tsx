'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/lib/WorkspaceContext';
import { SocialAccount, ScheduledPost } from '@/lib/social';

interface SocialPublisherModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  defaultCaptionDarija?: string;
  defaultCaptionFr?: string;
  productName?: string;
}

export default function SocialPublisherModal({
  isOpen,
  onClose,
  imageUrl,
  defaultCaptionDarija = '',
  defaultCaptionFr = '',
  productName = 'Produit',
}: SocialPublisherModalProps) {
  const { workspace } = useWorkspace();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [platform, setPlatform] = useState<'instagram' | 'facebook' | 'both'>('instagram');
  const [caption, setCaption] = useState(defaultCaptionDarija || defaultCaptionFr);
  const [mode, setMode] = useState<'now' | 'schedule'>('now');
  const [scheduleDateTime, setScheduleDateTime] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSocialData();
      if (defaultCaptionDarija) {
        setCaption(defaultCaptionDarija);
      }
      // Heure idéale en Tunisie : aujourd'hui à 19:30
      const now = new Date();
      now.setHours(19, 30, 0, 0);
      setScheduleDateTime(now.toISOString().slice(0, 16));
    }
  }, [isOpen, workspace?.id]);

  const loadSocialData = async () => {
    try {
      const [accRes, postRes] = await fetchParallel();
      if (accRes) setAccounts(accRes);
      if (postRes) setScheduledPosts(postRes);
    } catch (err) {
      console.error('Erreur social:', err);
    }
  };

  const fetchParallel = async () => {
    const r1 = await fetch('/api/social/accounts').then((r) => r.json());
    const r2 = await fetch('/api/social/posts').then((r) => r.json());
    return [r1.data, r2.data];
  };

  const handlePublishNow = async () => {
    setIsPublishing(true);
    setMsg(null);
    try {
      const res = await fetch('/api/social/publish-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          imageUrl,
          caption,
          postType: 'feed',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: `🎉 Visuel publié en direct sur ${platform.toUpperCase()} !` });
        loadSocialData();
      } else {
        setMsg({ text: data.error || 'Erreur lors de la publication', error: true });
      }
    } catch (err: any) {
      setMsg({ text: err.message, error: true });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSchedule = async () => {
    setIsPublishing(true);
    setMsg(null);
    try {
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          imageUrl,
          caption,
          scheduledFor: new Date(scheduleDateTime).toISOString(),
          postType: 'feed',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg({ text: '📅 Publication programmée avec succès dans le calendrier !' });
        loadSocialData();
      } else {
        setMsg({ text: data.error || 'Erreur lors de la programmation', error: true });
      }
    } catch (err: any) {
      setMsg({ text: err.message, error: true });
    } finally {
      setIsPublishing(false);
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
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        maxWidth: '740px',
        width: '100%',
        padding: '28px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
        color: '#0F172A',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4F46E5', background: '#EEF2FF', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              Meta Graph API · Instagram & Facebook
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '6px 0 2px', color: '#0F172A' }}>
              Publier sur les Réseaux Sociaux 🚀
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
              Publication directe en 1 clic avec texte Darija et badges tunisiens
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '1.4rem', cursor: 'pointer', padding: '4px 8px' }}
          >
            ✕
          </button>
        </div>

        {msg && (
          <div style={{
            background: msg.error ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${msg.error ? '#FECDD3' : '#BBF7D0'}`,
            color: msg.error ? '#991B1B' : '#166534',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '18px',
          }}>
            {msg.text}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Aperçu du visuel */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Visuel à poster</div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', background: '#F8FAFC', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={imageUrl} alt="Aperçu post" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '6px', textAlign: 'center' }}>
              {productName}
            </div>
          </div>

          {/* Formulaire de publication */}
          <div>
            {/* Choix du canal */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#475569', marginBottom: '6px' }}>
                Canaux connectés :
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setPlatform('instagram')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: platform === 'instagram' ? '#FFF1F2' : '#F8FAFC',
                    border: `1.5px solid ${platform === 'instagram' ? '#F43F5E' : '#E2E8F0'}`,
                    color: platform === 'instagram' ? '#E11D48' : '#64748B',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                  }}
                >
                  📸 Instagram
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('facebook')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: platform === 'facebook' ? '#EFF6FF' : '#F8FAFC',
                    border: `1.5px solid ${platform === 'facebook' ? '#3B82F6' : '#E2E8F0'}`,
                    color: platform === 'facebook' ? '#1D4ED8' : '#64748B',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                  }}
                >
                  👥 Facebook
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('both')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    background: platform === 'both' ? '#EEF2FF' : '#F8FAFC',
                    border: `1.5px solid ${platform === 'both' ? '#4F46E5' : '#E2E8F0'}`,
                    color: platform === 'both' ? '#4F46E5' : '#64748B',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                  }}
                >
                  ⚡ Les Deux
                </button>
              </div>
            </div>

            {/* Légende */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: '#475569' }}>Légende du post :</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {defaultCaptionDarija && (
                    <button
                      type="button"
                      onClick={() => setCaption(defaultCaptionDarija)}
                      style={{ background: '#FFF7ED', color: '#EA580C', border: '1px solid #FED7AA', borderRadius: '4px', padding: '2px 6px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      🇹🇳 Darija
                    </button>
                  )}
                  {defaultCaptionFr && (
                    <button
                      type="button"
                      onClick={() => setCaption(defaultCaptionFr)}
                      style={{ background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE', borderRadius: '4px', padding: '2px 6px', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      🇫🇷 Français
                    </button>
                  )}
                </div>
              </div>
              <textarea
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#0F172A',
                  fontSize: '0.82rem',
                  lineHeight: '1.5',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Mode Immédiat ou Planifié */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => setMode('now')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    background: mode === 'now' ? '#EEF2FF' : '#F8FAFC',
                    border: `1px solid ${mode === 'now' ? '#C7D2FE' : '#E2E8F0'}`,
                    color: mode === 'now' ? '#4F46E5' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  ⚡ Direct (Maintenant)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('schedule')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    background: mode === 'schedule' ? '#EEF2FF' : '#F8FAFC',
                    border: `1px solid ${mode === 'schedule' ? '#C7D2FE' : '#E2E8F0'}`,
                    color: mode === 'schedule' ? '#4F46E5' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                  }}
                >
                  📅 Planifier l’heure
                </button>
              </div>

              {mode === 'schedule' && (
                <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#475569', marginBottom: '4px' }}>
                    Date & Heure de publication (Heure de Tunis) :
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleDateTime}
                    onChange={(e) => setScheduleDateTime(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      color: '#0F172A',
                      fontSize: '0.85rem',
                    }}
                  />
                  <div style={{ fontSize: '0.7rem', color: '#16A34A', marginTop: '4px' }}>
                    💡 Conseil Tunisie : 18h30 - 21h00 est le créneau à plus fort engagement Instagram à Tunis & Sousse.
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{ flex: 1, background: '#F8FAFC', border: '1px solid #CBD5E1', color: '#475569', borderRadius: '8px', padding: '10px', fontWeight: 700, cursor: 'pointer' }}
              >
                Annuler
              </button>
              {mode === 'now' ? (
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handlePublishNow}
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #4F46E5, #3B82F6)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  {isPublishing ? 'Publication en cours…' : '🚀 Publier Immédiatement'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handleSchedule}
                  style={{
                    flex: 2,
                    background: 'linear-gradient(135deg, #EA580C, #C2410C)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)',
                  }}
                >
                  {isPublishing ? 'Enregistrement…' : '📅 Planifier ce Post'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Historique rapide des posts programmés */}
        {scheduledPosts.length > 0 && (
          <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px', marginTop: '16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              Publications Récentes & En Attente ({scheduledPosts.length}) :
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {scheduledPosts.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    fontSize: '0.78rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{p.platform === 'both' ? '📸👥' : p.platform === 'instagram' ? '📸' : '👥'}</span>
                    <span style={{ color: '#0F172A', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.caption.slice(0, 45)}…
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: p.status === 'published' ? '#16A34A' : '#D97706',
                    background: p.status === 'published' ? '#DCFCE7' : '#FEF3C7',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}>
                    {p.status === 'published' ? 'PUBLIÉ ✓' : 'PLANIFIÉ ⏳'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
