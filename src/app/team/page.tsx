'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { useWorkspace } from '@/lib/WorkspaceContext';

interface MemberItem {
  userId: string;
  userEmail: string;
  userName: string;
  role: 'owner' | 'manager' | 'designer';
  joinedAt: string;
}

export default function TeamPage() {
  const { workspace, role: currentUserRole } = useWorkspace();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Formulaire d'invitation
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'designer'>('designer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    if (workspace?.id) {
      loadMembers();
    }
  }, [workspace?.id]);

  const loadMembers = async () => {
    if (!workspace?.id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/members`);
      const data = await res.json();
      if (data.success && data.data) {
        setMembers(data.data);
      }
    } catch (err) {
      console.error('Erreur chargement membres:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace?.id || !inviteEmail.trim()) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail.trim(),
          name: inviteName.trim(),
          role: inviteRole,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ text: `✓ Invitation envoyée à ${inviteEmail} avec succès !` });
        setShowInviteModal(false);
        setInviteEmail('');
        setInviteName('');
        loadMembers();
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ text: data.error || 'Erreur lors de l’invitation', error: true });
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'Erreur réseau', error: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!workspace?.id) return;
    if (!confirm(`Retirer ${userName} de l'équipe de ${workspace.name} ?`)) return;

    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/members?userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setMembers((prev) => prev.filter((m) => m.userId !== userId));
        setFeedback({ text: `✓ ${userName} a été retiré de l'équipe.` });
        setTimeout(() => setFeedback(null), 3000);
      } else {
        setFeedback({ text: data.error || 'Action impossible', error: true });
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'Erreur serveur', error: true });
    }
  };

  const roleBadges: Record<string, { label: string; color: string; bg: string }> = {
    owner: { label: 'Propriétaire (Owner)', color: '#00E5FF', bg: 'rgba(0, 229, 255, 0.15)' },
    manager: { label: 'Gestionnaire (Manager)', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
    designer: { label: 'Créatif Studio (Designer)', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' },
  };

  return (
    <AppShell activeNav="team" pageTitle="Gestion d'Équipe & Rôles Multi-Tenant">
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* En-tête de la page */}
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
                color: '#4F46E5',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                background: '#EEF2FF',
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #C7D2FE',
              }}>
                Collaboration E-commerce Multi-Rôles
              </span>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Boutique : <strong style={{ color: '#0F172A' }}>{workspace?.name}</strong>
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              Membres d'Équipe & Permissions
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>
              Attribuez les accès à vos graphistes, community managers et associés pour collaborer sur vos visuels produits.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowInviteModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                background: '#4F46E5',
                borderRadius: '8px',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
              }}
            >
              + Inviter un Collaborateur
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
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

        {/* Cartes récapitulatives des 3 Rôles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}>
          {[
            {
              role: 'Propriétaire (Owner)',
              desc: 'Contrôle complet de la boutique, gestion des crédits, facturation et accès bancaires.',
              color: '#4F46E5',
              icon: '👑',
            },
            {
              role: 'Gestionnaire (Manager)',
              desc: 'Gestion des catalogues produits, Brand Kit, validation des posts sociaux et recharges rapides.',
              color: '#D97706',
              icon: '🛡️',
            },
            {
              role: 'Créatif Studio (Designer)',
              desc: 'Génération de visuels IA 4K, détourage et retouches sans visibilité sur la facturation.',
              color: '#7C3AED',
              icon: '🎨',
            },
          ].map((r, idx) => (
            <div
              key={idx}
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '18px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{r.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: 800, color: r.color }}>{r.role}</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                {r.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Tableau des Membres */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Membres Actifs ({members.length})
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Votre rôle actuel : <strong style={{ color: '#4F46E5', textTransform: 'uppercase' }}>{currentUserRole}</strong>
            </span>
          </div>

          {isLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
              Chargement des collaborateurs...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {members.map((member) => {
                const badge = roleBadges[member.role] || roleBadges.designer;
                const isOwner = member.role === 'owner';
                return (
                  <div
                    key={member.userId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      flexWrap: 'wrap',
                      gap: '14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#EEF2FF',
                        border: '1px solid #C7D2FE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        fontWeight: 800,
                        color: '#4F46E5',
                      }}>
                        {member.userName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                          {member.userName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          {member.userEmail}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: badge.color,
                        background: badge.bg,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: `1px solid ${badge.color}40`,
                      }}>
                        {badge.label}
                      </span>

                      {!isOwner && currentUserRole === 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(member.userId, member.userName)}
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
                          Retirer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL INVITATION */}
        {showInviteModal && (
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
              maxWidth: '480px',
              padding: '28px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  Inviter un Membre d'Équipe
                </h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#64748B', fontSize: '22px', cursor: 'pointer' }}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                    Adresse Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="collaborateur@maboutique.tn"
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

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                    Nom Complet du Collaborateur
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="Ex: Syrine Trabelsi"
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

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#334155', marginBottom: '6px', fontWeight: 600 }}>
                    Rôle Attribué
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
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
                    <option value="designer">Créatif Studio (Designer) — Accès visuels IA uniquement</option>
                    <option value="manager">Gestionnaire (Manager) — Accès complet hors propriété</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    style={{
                      flex: 1,
                      padding: '11px',
                      background: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      color: '#64748B',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      flex: 2,
                      padding: '11px',
                      background: '#4F46E5',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSubmitting ? 'Envoi...' : 'Envoyer l\'Invitation'}
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
